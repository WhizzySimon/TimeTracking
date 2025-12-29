#!/usr/bin/env node
/**
 * Learning Extractor for Autonomy Stack v2
 *
 * Analyzes evidence bundles and anomaly history to propose candidate principles.
 * Appends proposals to Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/LEARNINGS-INBOX.md
 *
 * Usage:
 *   node learning-extractor.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, '..', '..', 'Docs', 'Devlog', 'Evidence');
const LEARNINGS_INBOX = path.join(__dirname, '..', '..', 'Docs', 'Devlog', 'LEARNINGS-INBOX.md');
const LOGS_DIR = path.join(__dirname, 'logs');

function readEvidenceBundles() {
	if (!fs.existsSync(EVIDENCE_DIR)) {
		return [];
	}

	const files = fs.readdirSync(EVIDENCE_DIR).filter((f) => f.endsWith('.md'));
	return files.map((f) => {
		const content = fs.readFileSync(path.join(EVIDENCE_DIR, f), 'utf8');
		return { file: f, content };
	});
}

function readRecentSessions(days = 7) {
	if (!fs.existsSync(LOGS_DIR)) {
		return [];
	}

	const files = fs
		.readdirSync(LOGS_DIR)
		.filter((f) => f.startsWith('session-') && f.endsWith('.jsonl'));
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - days);

	const sessions = [];
	for (const file of files) {
		const dateStr = file.replace('session-', '').replace('.jsonl', '');
		const date = new Date(dateStr);
		if (date >= cutoff) {
			const content = fs.readFileSync(path.join(LOGS_DIR, file), 'utf8');
			const events = content
				.trim()
				.split('\n')
				.filter(Boolean)
				.map((line) => {
					try {
						return JSON.parse(line);
					} catch {
						return null;
					}
				})
				.filter(Boolean);
			sessions.push({ file, date: dateStr, events });
		}
	}

	return sessions;
}

function analyzePatterns(sessions) {
	const patterns = [];

	const errorCounts = {};

	for (const session of sessions) {
		for (const event of session.events) {
			if (event.kind === 'error_fingerprint') {
				errorCounts[event.fingerprint] = (errorCounts[event.fingerprint] || 0) + 1;
			}
		}
	}

	for (const [fingerprint, count] of Object.entries(errorCounts)) {
		if (count >= 3) {
			patterns.push({
				type: 'recurring_error',
				fingerprint,
				count,
				suggestion: `Error ${fingerprint} occurred ${count} times across sessions. Consider documenting the root cause and fix.`
			});
		}
	}

	const commandFailures = {};
	for (const session of sessions) {
		for (const event of session.events) {
			if (event.kind === 'command_end' && event.exitCode !== 0) {
				commandFailures[event.command] = (commandFailures[event.command] || 0) + 1;
			}
		}
	}

	for (const [command, count] of Object.entries(commandFailures)) {
		if (count >= 3) {
			patterns.push({
				type: 'flaky_command',
				command,
				count,
				suggestion: `Command "${command}" failed ${count} times. Consider investigating reliability.`
			});
		}
	}

	return patterns;
}

function generateProposal(pattern) {
	const today = new Date().toISOString().split('T')[0];

	let feedback = '';
	switch (pattern.type) {
		case 'recurring_error':
			feedback = `PATTERN: Error fingerprint ${pattern.fingerprint} appeared ${pattern.count}+ times across sessions. Root cause analysis recommended.`;
			break;
		case 'flaky_command':
			feedback = `PATTERN: Command "${pattern.command}" failed ${pattern.count}+ times. Reliability investigation recommended.`;
			break;
		default:
			feedback = pattern.suggestion;
	}

	return `| ${today} | learning-extractor | ${feedback} | Pending |`;
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
	const dryRun = args['dry-run'] || false;

	console.log('Analyzing recent sessions and evidence bundles...');

	const sessions = readRecentSessions(7);
	const bundles = readEvidenceBundles();

	console.log(`Found ${sessions.length} recent sessions, ${bundles.length} evidence bundles`);

	if (sessions.length === 0) {
		console.log('No recent sessions to analyze.');
		return;
	}

	const patterns = analyzePatterns(sessions);

	if (patterns.length === 0) {
		console.log('No patterns detected that warrant new learnings.');
		return;
	}

	console.log(`\nDetected ${patterns.length} patterns:`);

	const proposals = patterns.map((p) => generateProposal(p, null));

	for (const proposal of proposals) {
		console.log(`  - ${proposal}`);
	}

	if (dryRun) {
		console.log('\n[DRY RUN] Would append to LEARNINGS-INBOX.md');
		return;
	}

	if (!fs.existsSync(LEARNINGS_INBOX)) {
		console.error(`Error: ${LEARNINGS_INBOX} not found`);
		process.exit(1);
	}

	const currentContent = fs.readFileSync(LEARNINGS_INBOX, 'utf8');

	const tableMarker = '| Date       | Context';
	const tableIndex = currentContent.indexOf(tableMarker);

	if (tableIndex === -1) {
		console.error('Error: Could not find table in LEARNINGS-INBOX.md');
		process.exit(1);
	}

	const headerEnd = currentContent.indexOf('\n', currentContent.indexOf('\n', tableIndex) + 1);
	const insertPoint = currentContent.indexOf('\n', headerEnd) + 1;

	const newRows = proposals.join('\n') + '\n';
	const newContent =
		currentContent.slice(0, insertPoint) + newRows + currentContent.slice(insertPoint);

	fs.writeFileSync(LEARNINGS_INBOX, newContent, 'utf8');
	console.log(`\nAppended ${proposals.length} proposals to LEARNINGS-INBOX.md`);
}

main();
