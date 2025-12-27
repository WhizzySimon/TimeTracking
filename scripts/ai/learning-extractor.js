#!/usr/bin/env node

/**
 * Learning Extractor for Autonomy Stack v2
 *
 * Reads recent evidence bundles and anomalies, proposes candidate principles,
 * and appends to LEARNINGS-INBOX.md.
 *
 * Usage:
 *   node scripts/ai/learning-extractor.js [--days=7]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVIDENCE_DIR = path.resolve(__dirname, '../../Docs/Devlog/Evidence');
const LEARNINGS_INBOX = path.resolve(__dirname, '../../Docs/Devlog/LEARNINGS-INBOX.md');
const LOGS_DIR = path.join(__dirname, 'logs');

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
 * Get evidence files from last N days
 */
function getRecentEvidenceFiles(days) {
	if (!fs.existsSync(EVIDENCE_DIR)) {
		return [];
	}

	const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
	const files = fs.readdirSync(EVIDENCE_DIR).filter((f) => f.endsWith('.md') && f !== '.gitkeep');

	return files
		.map((f) => ({
			name: f,
			path: path.join(EVIDENCE_DIR, f),
			mtime: fs.statSync(path.join(EVIDENCE_DIR, f)).mtime.getTime()
		}))
		.filter((f) => f.mtime > cutoff)
		.sort((a, b) => b.mtime - a.mtime);
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
			// Skip malformed lines
		}
	}

	return events;
}

/**
 * Get session logs from last N days
 */
function getRecentSessionLogs(days) {
	if (!fs.existsSync(LOGS_DIR)) {
		return [];
	}

	const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
	const files = fs.readdirSync(LOGS_DIR).filter((f) => f.startsWith('session-') && f.endsWith('.jsonl'));

	return files
		.map((f) => ({
			name: f,
			path: path.join(LOGS_DIR, f),
			mtime: fs.statSync(path.join(LOGS_DIR, f)).mtime.getTime()
		}))
		.filter((f) => f.mtime > cutoff);
}

/**
 * Extract anomalies from session logs
 */
function extractAnomalies(sessionLogs) {
	const anomalies = {
		repetitions: {},
		churn: {},
		errors: []
	};

	for (const log of sessionLogs) {
		const events = readJsonl(log.path);

		// Count error fingerprints
		for (const event of events) {
			if (event.error_fingerprint) {
				anomalies.repetitions[event.error_fingerprint] =
					(anomalies.repetitions[event.error_fingerprint] || 0) + 1;

				if (event.message) {
					anomalies.errors.push({
						fingerprint: event.error_fingerprint,
						message: event.message.slice(0, 100),
						session: log.name
					});
				}
			}

			// Count file edits
			if (event.file && (event.event_type === 'edit' || event.event_type === 'error')) {
				anomalies.churn[event.file] = (anomalies.churn[event.file] || 0) + 1;
			}
		}
	}

	return anomalies;
}

/**
 * Generate candidate principles from anomalies
 */
function generateCandidatePrinciples(anomalies, evidenceFiles) {
	const candidates = [];
	const today = new Date().toISOString().slice(0, 10);

	// Principle from repeated errors
	const repeatedErrors = Object.entries(anomalies.repetitions).filter(([_, count]) => count >= 3);

	for (const [fp, count] of repeatedErrors) {
		const errorInfo = anomalies.errors.find((e) => e.fingerprint === fp);
		const message = errorInfo ? errorInfo.message : 'Unknown error';

		candidates.push({
			date: today,
			context: `Repeated error (${count}x)`,
			feedback: `PATTERN: Error "${message}" occurred ${count} times. Consider adding validation or guard to prevent this error class.`,
			evidence: `Fingerprint: ${fp}, Sessions: ${errorInfo?.session || 'multiple'}`,
			counterPattern: 'Ignoring repeated errors leads to wasted debugging time.',
			generalization: 'When same error occurs 3+ times, add defensive code or improve error message.'
		});
	}

	// Principle from high churn files
	const highChurnFiles = Object.entries(anomalies.churn).filter(([_, count]) => count >= 5);

	for (const [file, count] of highChurnFiles) {
		candidates.push({
			date: today,
			context: `High churn file (${count} edits)`,
			feedback: `PATTERN: File "${path.basename(file)}" was edited ${count} times. May indicate unclear requirements or complex logic.`,
			evidence: `File: ${file}`,
			counterPattern: 'Editing same file many times without progress suggests need to step back.',
			generalization: 'Before 5th edit to same file, use ZOOM_OUT protocol to reassess approach.'
		});
	}

	// Add evidence file count as context
	if (evidenceFiles.length > 0) {
		candidates.push({
			date: today,
			context: 'Evidence collection',
			feedback: `INFO: ${evidenceFiles.length} evidence bundles generated in review period.`,
			evidence: evidenceFiles.map((f) => f.name).join(', '),
			counterPattern: 'N/A',
			generalization: 'Regular evidence generation helps track progress and identify patterns.'
		});
	}

	return candidates;
}

/**
 * Format candidate as LEARNINGS-INBOX row
 */
function formatAsInboxRow(candidate) {
	return `| ${candidate.date} | ${candidate.context} | ${candidate.feedback} | Pending |`;
}

/**
 * Append candidates to LEARNINGS-INBOX.md
 */
function appendToInbox(candidates) {
	if (!fs.existsSync(LEARNINGS_INBOX)) {
		console.error(`LEARNINGS-INBOX.md not found at ${LEARNINGS_INBOX}`);
		return false;
	}

	const content = fs.readFileSync(LEARNINGS_INBOX, 'utf8');

	// Find the table in "Pending Review" section
	const lines = content.split('\n');
	let insertIndex = -1;

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].includes('| Date') && lines[i].includes('| Context')) {
			// Found header, skip header and separator
			insertIndex = i + 2;
			break;
		}
	}

	if (insertIndex === -1) {
		console.error('Could not find table in LEARNINGS-INBOX.md');
		return false;
	}

	// Insert new rows
	const newRows = candidates.map(formatAsInboxRow);
	lines.splice(insertIndex, 0, ...newRows);

	fs.writeFileSync(LEARNINGS_INBOX, lines.join('\n'), 'utf8');
	return true;
}

/**
 * Show help message
 */
function showHelp() {
	console.log(`
Learning Extractor for Autonomy Stack v2

Analyzes recent evidence bundles and session logs to propose candidate principles.

Usage:
  node scripts/ai/learning-extractor.js [--days=7]

Options:
  --days=<n>    Look back N days (default: 7)
  --dry-run     Show candidates without writing to LEARNINGS-INBOX.md

Example:
  node scripts/ai/learning-extractor.js --days=14
`);
}

// Main execution
const args = parseArgs(process.argv.slice(2));

if (args.help) {
	showHelp();
	process.exit(0);
}

const days = parseInt(args.days || '7', 10);
const dryRun = args['dry-run'] === 'true';

console.log(`Analyzing last ${days} days...`);
console.log('');

// Get recent data
const evidenceFiles = getRecentEvidenceFiles(days);
const sessionLogs = getRecentSessionLogs(days);

console.log(`Found ${evidenceFiles.length} evidence bundles`);
console.log(`Found ${sessionLogs.length} session logs`);
console.log('');

// Extract anomalies
const anomalies = extractAnomalies(sessionLogs);

// Generate candidates
const candidates = generateCandidatePrinciples(anomalies, evidenceFiles);

if (candidates.length === 0) {
	console.log('No candidate principles identified.');
	process.exit(0);
}

console.log(`Generated ${candidates.length} candidate principle(s):\n`);

for (const candidate of candidates) {
	console.log(`📝 ${candidate.context}`);
	console.log(`   ${candidate.feedback}`);
	console.log(`   Evidence: ${candidate.evidence}`);
	console.log(`   Generalization: ${candidate.generalization}`);
	console.log('');
}

if (dryRun) {
	console.log('(Dry run - not writing to LEARNINGS-INBOX.md)');
} else {
	const success = appendToInbox(candidates);
	if (success) {
		console.log(`✅ Appended ${candidates.length} entries to LEARNINGS-INBOX.md`);
	} else {
		console.log('❌ Failed to append to LEARNINGS-INBOX.md');
		process.exit(1);
	}
}
