#!/usr/bin/env node

/**
 * Anomaly Detector for Autonomy Stack v2
 *
 * Reads the current session log and detects:
 * - repetition: same error_fingerprint >= 3 times
 * - time_over_baseline: command duration > 2x rolling median
 * - churn: same file modified > N times (default 5)
 * - scope_drift: files touched outside planned list
 *
 * Usage:
 *   node scripts/ai/anomaly-detector.js [--session=<file>] [--churn-threshold=5]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGS_DIR = path.join(__dirname, 'logs');
const BASELINES_FILE = path.join(LOGS_DIR, 'baselines.json');
const ZOOM_OUT_PATH = 'Docs/AI/ZOOM_OUT.md';

// Default thresholds
const REPETITION_THRESHOLD = 3;
const TIME_MULTIPLIER = 2.0;
const DEFAULT_CHURN_THRESHOLD = 5;

/**
 * Parse command line arguments
 */
function parseArgs(args) {
	const result = {};
	for (const arg of args) {
		if (arg.startsWith('--')) {
			const [key, ...valueParts] = arg.slice(2).split('=');
			result[key] = valueParts.join('=') || 'true';
		}
	}
	return result;
}

/**
 * Get the most recent session log file
 */
function getLatestSessionLog() {
	if (!fs.existsSync(LOGS_DIR)) {
		return null;
	}

	const files = fs.readdirSync(LOGS_DIR).filter((f) => f.startsWith('session-') && f.endsWith('.jsonl'));

	if (files.length === 0) {
		return null;
	}

	files.sort().reverse();
	return path.join(LOGS_DIR, files[0]);
}

/**
 * Read and parse JSONL file
 */
function readJsonl(filePath) {
	if (!fs.existsSync(filePath)) {
		return [];
	}

	const content = fs.readFileSync(filePath, 'utf8');
	const lines = content.split('\n').filter((line) => line.trim());

	const events = [];
	for (const line of lines) {
		try {
			events.push(JSON.parse(line));
		} catch (e) {
			console.error(`Warning: Skipping malformed line: ${line.slice(0, 50)}...`);
		}
	}

	return events;
}

/**
 * Load baselines from file
 */
function loadBaselines() {
	if (!fs.existsSync(BASELINES_FILE)) {
		return {};
	}

	try {
		return JSON.parse(fs.readFileSync(BASELINES_FILE, 'utf8'));
	} catch (e) {
		return {};
	}
}

/**
 * Calculate median of array
 */
function median(values) {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Detect repetition anomaly (same error fingerprint >= threshold)
 */
function detectRepetition(events) {
	const fingerprints = {};

	for (const event of events) {
		if (event.error_fingerprint) {
			fingerprints[event.error_fingerprint] = (fingerprints[event.error_fingerprint] || 0) + 1;
		}
	}

	const anomalies = [];
	for (const [fp, count] of Object.entries(fingerprints)) {
		if (count >= REPETITION_THRESHOLD) {
			anomalies.push({
				type: 'repetition',
				severity: count >= 5 ? 'critical' : 'warning',
				details: {
					fingerprint: fp,
					count: count
				},
				recommendation: `Same error occurred ${count} times. Follow ZOOM_OUT protocol.`,
				zoom_out_ref: ZOOM_OUT_PATH
			});
		}
	}

	return anomalies;
}

/**
 * Detect time_over_baseline anomaly (duration > 2x median)
 */
function detectTimeOverBaseline(events, baselines) {
	const anomalies = [];

	for (const event of events) {
		if (event.event_type === 'command_end' && event.duration_ms && event.command) {
			const box = event.box || 'unknown';
			const key = `${box}:${event.command}`;
			const baseline = baselines[key];

			if (baseline && baseline.median > 0) {
				const threshold = baseline.median * TIME_MULTIPLIER;
				if (event.duration_ms > threshold) {
					anomalies.push({
						type: 'time_over_baseline',
						severity: event.duration_ms > baseline.median * 4 ? 'critical' : 'warning',
						details: {
							command: event.command,
							expected_ms: Math.round(baseline.median),
							actual_ms: event.duration_ms,
							multiplier: (event.duration_ms / baseline.median).toFixed(1)
						},
						recommendation: `Command took ${(event.duration_ms / baseline.median).toFixed(1)}x longer than usual. Check for issues.`,
						zoom_out_ref: ZOOM_OUT_PATH
					});
				}
			}
		}
	}

	return anomalies;
}

/**
 * Detect churn anomaly (same file modified > threshold times)
 */
function detectChurn(events, threshold) {
	const fileCounts = {};

	for (const event of events) {
		if (event.file && (event.event_type === 'edit' || event.event_type === 'error')) {
			fileCounts[event.file] = (fileCounts[event.file] || 0) + 1;
		}
	}

	const anomalies = [];
	for (const [file, count] of Object.entries(fileCounts)) {
		if (count > threshold) {
			anomalies.push({
				type: 'churn',
				severity: count > threshold * 2 ? 'critical' : 'warning',
				details: {
					file: file,
					count: count,
					threshold: threshold
				},
				recommendation: `File modified ${count} times in session. Consider stepping back to understand the problem.`,
				zoom_out_ref: ZOOM_OUT_PATH
			});
		}
	}

	return anomalies;
}

/**
 * Detect scope_drift anomaly (files touched outside planned list)
 */
function detectScopeDrift(events) {
	// Find plan_created event with planned_files
	let plannedFiles = null;
	for (const event of events) {
		if (event.event_type === 'plan_created' && event.planned_files) {
			plannedFiles = new Set(event.planned_files);
			break;
		}
	}

	if (!plannedFiles) {
		return []; // No plan defined, skip scope drift check
	}

	// Find all files touched
	const touchedFiles = new Set();
	for (const event of events) {
		if (event.file) {
			touchedFiles.add(event.file);
		}
	}

	// Find unplanned files
	const unplannedFiles = [...touchedFiles].filter((f) => !plannedFiles.has(f));

	if (unplannedFiles.length > 0) {
		return [
			{
				type: 'scope_drift',
				severity: unplannedFiles.length > 3 ? 'critical' : 'warning',
				details: {
					planned_count: plannedFiles.size,
					unplanned_files: unplannedFiles
				},
				recommendation: `${unplannedFiles.length} files touched outside planned scope. Verify this is intentional.`,
				zoom_out_ref: ZOOM_OUT_PATH
			}
		];
	}

	return [];
}

/**
 * Update baselines with new data from session
 */
function updateBaselines(events, baselines) {
	const MAX_SAMPLES = 20; // Rolling window

	for (const event of events) {
		if (event.event_type === 'command_end' && event.duration_ms && event.command) {
			const box = event.box || 'unknown';
			const key = `${box}:${event.command}`;

			if (!baselines[key]) {
				baselines[key] = { samples: [], median: 0 };
			}

			baselines[key].samples.push(event.duration_ms);

			// Keep only last N samples
			if (baselines[key].samples.length > MAX_SAMPLES) {
				baselines[key].samples = baselines[key].samples.slice(-MAX_SAMPLES);
			}

			// Recalculate median
			baselines[key].median = median(baselines[key].samples);
		}
	}

	return baselines;
}

/**
 * Save baselines to file
 */
function saveBaselines(baselines) {
	fs.writeFileSync(BASELINES_FILE, JSON.stringify(baselines, null, 2), 'utf8');
}

// Main execution
const args = parseArgs(process.argv.slice(2));
const churnThreshold = parseInt(args['churn-threshold'] || DEFAULT_CHURN_THRESHOLD, 10);

// Get session log
let sessionLogPath = args.session;
if (!sessionLogPath) {
	sessionLogPath = getLatestSessionLog();
}

if (!sessionLogPath || !fs.existsSync(sessionLogPath)) {
	console.log('No session log found. No anomalies to detect.');
	process.exit(0);
}

// Read events
const events = readJsonl(sessionLogPath);

if (events.length === 0) {
	console.log('Session log is empty. No anomalies to detect.');
	process.exit(0);
}

console.log(`Analyzing: ${path.basename(sessionLogPath)} (${events.length} events)`);
console.log('');

// Load baselines
const baselines = loadBaselines();

// Run detectors
const anomalies = [
	...detectRepetition(events),
	...detectTimeOverBaseline(events, baselines),
	...detectChurn(events, churnThreshold),
	...detectScopeDrift(events)
];

// Update and save baselines
const updatedBaselines = updateBaselines(events, baselines);
saveBaselines(updatedBaselines);

// Output results
if (anomalies.length === 0) {
	console.log('✅ No anomalies detected.');
} else {
	console.log(`⚠️  ${anomalies.length} anomaly/anomalies detected:\n`);

	for (const anomaly of anomalies) {
		const icon = anomaly.severity === 'critical' ? '🔴' : '🟡';
		console.log(`${icon} ${anomaly.type.toUpperCase()}`);
		console.log(`   Severity: ${anomaly.severity}`);
		console.log(`   Details: ${JSON.stringify(anomaly.details)}`);
		console.log(`   Recommendation: ${anomaly.recommendation}`);
		console.log(`   Protocol: ${anomaly.zoom_out_ref}`);
		console.log('');
	}

	// Output JSON for programmatic use
	console.log('--- JSON Output ---');
	console.log(JSON.stringify(anomalies, null, 2));
}
