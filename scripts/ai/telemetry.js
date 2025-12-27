#!/usr/bin/env node

/**
 * Telemetry CLI for Autonomy Stack v2
 *
 * Commands:
 *   log-event           Log a custom telemetry event
 *   start-command       Log command start
 *   end-command         Log command end with result
 *   fingerprint-error   Get stable hash for error text
 *
 * Usage:
 *   node scripts/ai/telemetry.js log-event --type=custom --message="hello"
 *   node scripts/ai/telemetry.js start-command --command="npm run verify"
 *   node scripts/ai/telemetry.js end-command --command="npm run verify" --exit-code=0 --duration=5000
 *   node scripts/ai/telemetry.js fingerprint-error "Error at line 5"
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGS_DIR = path.join(__dirname, 'logs');
const SESSION_FILE_PREFIX = 'session-';

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
	fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Get or create current session log file
 */
function getSessionLogPath() {
	// Look for existing session file from today
	const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const files = fs.readdirSync(LOGS_DIR).filter((f) => f.startsWith(SESSION_FILE_PREFIX) && f.includes(today));

	if (files.length > 0) {
		// Use most recent session from today
		files.sort().reverse();
		return path.join(LOGS_DIR, files[0]);
	}

	// Create new session file
	const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
	const sessionFile = `${SESSION_FILE_PREFIX}${timestamp}.jsonl`;
	return path.join(LOGS_DIR, sessionFile);
}

/**
 * Write event to session log (append)
 */
function logEvent(event) {
	const logPath = getSessionLogPath();
	const line = JSON.stringify(event) + '\n';
	fs.appendFileSync(logPath, line, 'utf8');
	return logPath;
}

/**
 * Create timestamp in ISO 8601 format
 */
function timestamp() {
	return new Date().toISOString();
}

/**
 * Normalize error text for fingerprinting
 */
function normalizeError(errorText) {
	return errorText
		.trim()
		.toLowerCase()
		.replace(/:\d+:\d+/g, ':X:X') // Remove line:col
		.replace(/line \d+/gi, 'line X') // Remove "line N"
		.replace(/column \d+/gi, 'column X') // Remove "column N"
		.replace(/at position \d+/gi, 'at position X') // Remove position numbers
		.replace(/\s+/g, ' '); // Collapse whitespace
}

/**
 * Generate stable fingerprint for error
 */
function fingerprintError(errorText) {
	const normalized = normalizeError(errorText);
	return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 8);
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
	const result = { _: [] };
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg.startsWith('--')) {
			const [key, ...valueParts] = arg.slice(2).split('=');
			const value = valueParts.join('=') || 'true';
			// Handle array values (comma-separated)
			if (key === 'planned-files' && value !== 'true') {
				result[key] = value.split(',').map((f) => f.trim());
			} else {
				result[key] = value;
			}
		} else {
			result._.push(arg);
		}
	}
	return result;
}

/**
 * Show help message
 */
function showHelp() {
	console.log(`
Telemetry CLI for Autonomy Stack v2

Commands:
  log-event           Log a custom telemetry event
  start-command       Log command start
  end-command         Log command end with result
  fingerprint-error   Get stable hash for error text

Usage:
  node scripts/ai/telemetry.js log-event --type=<type> --message=<msg> [--box=<box>] [--file=<file>]
  node scripts/ai/telemetry.js start-command --command=<cmd> [--box=<box>]
  node scripts/ai/telemetry.js end-command --command=<cmd> --exit-code=<code> --duration=<ms> [--box=<box>]
  node scripts/ai/telemetry.js fingerprint-error "<error text>"

Event Types:
  task_start, task_end, plan_created, edit, error, custom

Box Types:
  feature, bugfix, refactor, infra-build, research-decision, ui-ux

Examples:
  node scripts/ai/telemetry.js log-event --type=task_start --box=bugfix --message="Fix sync error"
  node scripts/ai/telemetry.js log-event --type=plan_created --box=feature --message="Multi-AG" --planned-files="a.ts,b.ts"
  node scripts/ai/telemetry.js start-command --command="npm run verify"
  node scripts/ai/telemetry.js end-command --command="npm run verify" --exit-code=0 --duration=5000
  node scripts/ai/telemetry.js fingerprint-error "TypeError: Cannot read property 'x' of undefined"
`);
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];
const parsed = parseArgs(args.slice(1));

if (!command || command === '--help' || command === '-h') {
	showHelp();
	process.exit(0);
}

switch (command) {
	case 'log-event': {
		const eventType = parsed.type || 'custom';
		const message = parsed.message || '';
		const box = parsed.box;
		const file = parsed.file;
		const plannedFiles = parsed['planned-files'];

		if (!message) {
			console.error('Error: --message is required');
			process.exit(1);
		}

		const event = {
			ts: timestamp(),
			event_type: eventType,
			message
		};

		if (box) event.box = box;
		if (file) event.file = file;
		if (plannedFiles) event.planned_files = plannedFiles;

		const logPath = logEvent(event);
		console.log(`Logged: ${eventType} -> ${path.basename(logPath)}`);
		break;
	}

	case 'start-command': {
		const cmd = parsed.command;
		const box = parsed.box;

		if (!cmd) {
			console.error('Error: --command is required');
			process.exit(1);
		}

		const event = {
			ts: timestamp(),
			event_type: 'command_start',
			message: `Starting: ${cmd}`,
			command: cmd
		};

		if (box) event.box = box;

		const logPath = logEvent(event);
		console.log(`Logged: command_start -> ${path.basename(logPath)}`);
		break;
	}

	case 'end-command': {
		const cmd = parsed.command;
		const exitCode = parseInt(parsed['exit-code'] || '0', 10);
		const duration = parseInt(parsed.duration || '0', 10);
		const box = parsed.box;

		if (!cmd) {
			console.error('Error: --command is required');
			process.exit(1);
		}

		const event = {
			ts: timestamp(),
			event_type: 'command_end',
			message: `Finished: ${cmd} (exit ${exitCode}, ${duration}ms)`,
			command: cmd,
			exit_code: exitCode,
			duration_ms: duration
		};

		if (box) event.box = box;

		const logPath = logEvent(event);
		console.log(`Logged: command_end -> ${path.basename(logPath)}`);
		break;
	}

	case 'fingerprint-error': {
		const errorText = parsed._.join(' ') || parsed.message || '';

		if (!errorText) {
			console.error('Error: error text is required');
			console.error('Usage: node scripts/ai/telemetry.js fingerprint-error "Error message"');
			process.exit(1);
		}

		const fp = fingerprintError(errorText);
		console.log(fp);

		// Also log the error event
		const event = {
			ts: timestamp(),
			event_type: 'error',
			message: errorText.slice(0, 200), // Truncate long errors
			error_fingerprint: fp
		};

		if (parsed.box) event.box = parsed.box;
		if (parsed.file) event.file = parsed.file;

		logEvent(event);
		break;
	}

	default:
		console.error(`Unknown command: ${command}`);
		showHelp();
		process.exit(1);
}
