#!/usr/bin/env node
/**
 * Anomaly Detector for Autonomy Stack v2
 *
 * Detects 4 anomaly types:
 *   - repetition: Same error fingerprint appears 3+ times
 *   - time_over_baseline: Command took >2x baseline duration
 *   - churn: Same file edited 5+ times in session
 *   - scope_drift: Files touched outside planned scope
 *
 * Usage:
 *   node anomaly-detector.js [--session=YYYY-MM-DD]
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, 'logs');
const BASELINES_FILE = path.join(LOGS_DIR, 'baselines.json');
const LOOP_RECOVERY_PATH = 'DevFramework/JustInTimeAgentRules/AgentLoopRecovery.md';

const THRESHOLDS = {
	repetition: 3,
	timeMultiplier: 2,
	churn: 5
};

function getSessionFile(sessionDate) {
	if (sessionDate) {
		return path.join(LOGS_DIR, `session-${sessionDate}.jsonl`);
	}
	const today = new Date().toISOString().split('T')[0];
	return path.join(LOGS_DIR, `session-${today}.jsonl`);
}

function loadBaselines() {
	if (fs.existsSync(BASELINES_FILE)) {
		try {
			return JSON.parse(fs.readFileSync(BASELINES_FILE, 'utf8'));
		} catch {
			return {};
		}
	}
	return {};
}

function readSessionLog(sessionFile) {
	if (!fs.existsSync(sessionFile)) {
		return [];
	}

	const content = fs.readFileSync(sessionFile, 'utf8');
	const lines = content.trim().split('\n').filter(Boolean);

	return lines
		.map((line) => {
			try {
				return JSON.parse(line);
			} catch {
				return null;
			}
		})
		.filter(Boolean);
}

function detectRepetition(events) {
	const fingerprints = {};

	for (const event of events) {
		if (event.kind === 'error_fingerprint') {
			fingerprints[event.fingerprint] = (fingerprints[event.fingerprint] || 0) + 1;
		}
	}

	const anomalies = [];
	for (const [fingerprint, count] of Object.entries(fingerprints)) {
		if (count >= THRESHOLDS.repetition) {
			anomalies.push({
				type: 'repetition',
				fingerprint,
				count,
				message: `Error fingerprint ${fingerprint} appeared ${count} times`
			});
		}
	}

	return anomalies;
}

function detectTimeOverBaseline(events, baselines) {
	const anomalies = [];

	const commandDurations = {};
	for (const event of events) {
		if (event.kind === 'command_end' && event.duration) {
			const cmd = event.command;
			if (!commandDurations[cmd]) {
				commandDurations[cmd] = [];
			}
			commandDurations[cmd].push(event.duration);
		}
	}

	for (const [command, durations] of Object.entries(commandDurations)) {
		const baseline = baselines[command];
		if (baseline) {
			for (const duration of durations) {
				if (duration > baseline * THRESHOLDS.timeMultiplier) {
					anomalies.push({
						type: 'time_over_baseline',
						command,
						duration,
						baseline,
						multiplier: (duration / baseline).toFixed(2),
						message: `Command "${command}" took ${duration}ms (baseline: ${baseline}ms, ${(duration / baseline).toFixed(1)}x slower)`
					});
				}
			}
		}
	}

	return anomalies;
}

function detectChurn(events) {
	const fileEdits = {};

	for (const event of events) {
		if (event.kind === 'event' && event.type === 'file_edit') {
			const file = event.file || event.message;
			if (file) {
				fileEdits[file] = (fileEdits[file] || 0) + 1;
			}
		}
	}

	const anomalies = [];
	for (const [file, count] of Object.entries(fileEdits)) {
		if (count >= THRESHOLDS.churn) {
			anomalies.push({
				type: 'churn',
				file,
				count,
				message: `File "${file}" edited ${count} times in this session`
			});
		}
	}

	return anomalies;
}

function detectScopeDrift(events) {
	let plannedFiles = new Set();
	const touchedFiles = new Set();

	for (const event of events) {
		if (event.plannedFiles) {
			for (const file of event.plannedFiles) {
				plannedFiles.add(file);
			}
		}
		if (event.kind === 'event' && event.type === 'file_edit' && event.file) {
			touchedFiles.add(event.file);
		}
	}

	if (plannedFiles.size === 0) {
		return [];
	}

	const anomalies = [];
	for (const file of touchedFiles) {
		if (!plannedFiles.has(file)) {
			anomalies.push({
				type: 'scope_drift',
				file,
				message: `File "${file}" was edited but not in planned scope`
			});
		}
	}

	return anomalies;
}

function parseArgs(args) {
	const result = {};
	for (const arg of args) {
		if (arg.startsWith('--')) {
			const [key, ...valueParts] = arg.slice(2).split('=');
			result[key] = valueParts.join('=') || true;
		}
	}
	return result;
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	const sessionFile = getSessionFile(args.session);

	if (!fs.existsSync(sessionFile)) {
		console.log(
			JSON.stringify(
				{
					status: 'no_events',
					message: `No session log found at ${path.basename(sessionFile)}`,
					anomalies: []
				},
				null,
				2
			)
		);
		return;
	}

	const events = readSessionLog(sessionFile);

	if (events.length === 0) {
		console.log(
			JSON.stringify(
				{
					status: 'no_events',
					message: 'Session log is empty',
					anomalies: []
				},
				null,
				2
			)
		);
		return;
	}

	const baselines = loadBaselines();

	const allAnomalies = [
		...detectRepetition(events),
		...detectTimeOverBaseline(events, baselines),
		...detectChurn(events),
		...detectScopeDrift(events)
	];

	const result = {
		status: allAnomalies.length > 0 ? 'anomalies_detected' : 'clean',
		sessionFile: path.basename(sessionFile),
		eventCount: events.length,
		anomalies: allAnomalies
	};

	if (allAnomalies.length > 0) {
		result.recommendation = `Follow loop recovery protocol: ${LOOP_RECOVERY_PATH}`;
	}

	console.log(JSON.stringify(result, null, 2));
}

main();
