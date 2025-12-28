#!/usr/bin/env node
/**
 * Telemetry CLI for Autonomy Stack v2
 *
 * Commands:
 *   log-event        Log a custom event
 *   start-command    Log command start
 *   end-command      Log command end with result
 *   fingerprint-error Get stable hash for error message
 *
 * Usage:
 *   node telemetry.js log-event --type=test --message="hello"
 *   node telemetry.js start-command --command="npm run verify"
 *   node telemetry.js end-command --command="npm run verify" --exit-code=0 --duration=5000
 *   node telemetry.js fingerprint-error "Error message here"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LOGS_DIR = path.join(__dirname, 'logs');
const SESSION_PREFIX = 'session-';

function getSessionFile() {
	const today = new Date().toISOString().split('T')[0];
	return path.join(LOGS_DIR, `${SESSION_PREFIX}${today}.jsonl`);
}

function ensureLogsDir() {
	if (!fs.existsSync(LOGS_DIR)) {
		fs.mkdirSync(LOGS_DIR, { recursive: true });
	}
}

function appendEvent(event) {
	ensureLogsDir();
	const sessionFile = getSessionFile();
	const line = JSON.stringify(event) + '\n';
	fs.appendFileSync(sessionFile, line, 'utf8');
	return sessionFile;
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

function logEvent(args) {
	const parsed = parseArgs(args);
	if (!parsed.type) {
		console.error('Error: --type is required');
		process.exit(1);
	}

	const event = {
		timestamp: new Date().toISOString(),
		kind: 'event',
		type: parsed.type,
		message: parsed.message || '',
		box: parsed.box || null,
		task: parsed.task || null,
		plannedFiles: parsed['planned-files'] ? parsed['planned-files'].split(',') : null
	};

	const file = appendEvent(event);
	console.log(`Logged event to ${path.basename(file)}`);
}

function startCommand(args) {
	const parsed = parseArgs(args);
	if (!parsed.command) {
		console.error('Error: --command is required');
		process.exit(1);
	}

	const event = {
		timestamp: new Date().toISOString(),
		kind: 'command_start',
		command: parsed.command,
		cwd: parsed.cwd || process.cwd()
	};

	const file = appendEvent(event);
	console.log(`Logged command start to ${path.basename(file)}`);
}

function endCommand(args) {
	const parsed = parseArgs(args);
	if (!parsed.command) {
		console.error('Error: --command is required');
		process.exit(1);
	}

	const event = {
		timestamp: new Date().toISOString(),
		kind: 'command_end',
		command: parsed.command,
		exitCode: parsed['exit-code'] !== undefined ? parseInt(parsed['exit-code'], 10) : null,
		duration: parsed.duration !== undefined ? parseInt(parsed.duration, 10) : null,
		error: parsed.error || null
	};

	const file = appendEvent(event);
	console.log(`Logged command end to ${path.basename(file)}`);
}

function fingerprintError(args) {
	const errorMessage = args.filter((a) => !a.startsWith('--')).join(' ');
	if (!errorMessage) {
		console.error('Error: Error message is required');
		console.error('Usage: telemetry.js fingerprint-error "Error message here"');
		process.exit(1);
	}

	const normalized = errorMessage
		.replace(/\d+/g, 'N')
		.replace(/0x[a-fA-F0-9]+/g, 'ADDR')
		.replace(/at .+:\d+:\d+/g, 'at LOCATION')
		.trim();

	const hash = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12);

	console.log(hash);

	const event = {
		timestamp: new Date().toISOString(),
		kind: 'error_fingerprint',
		fingerprint: hash,
		originalMessage: errorMessage,
		normalizedMessage: normalized
	};

	appendEvent(event);
}

function showHelp() {
	console.log(`
Telemetry CLI for Autonomy Stack v2

Commands:
  log-event         Log a custom event
    --type          Event type (required)
    --message       Event message
    --box           Task box type
    --task          Task ID
    --planned-files Comma-separated list of planned files

  start-command     Log command start
    --command       Command being run (required)
    --cwd           Working directory

  end-command       Log command end
    --command       Command that ran (required)
    --exit-code     Exit code
    --duration      Duration in milliseconds
    --error         Error message if failed

  fingerprint-error Get stable hash for error message
    <message>       Error message to fingerprint

Examples:
  node telemetry.js log-event --type=test --message="hello"
  node telemetry.js start-command --command="npm run verify"
  node telemetry.js end-command --command="npm run verify" --exit-code=0 --duration=5000
  node telemetry.js fingerprint-error "TypeError: Cannot read property 'x' of undefined"
`);
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
	case 'log-event':
		logEvent(args);
		break;
	case 'start-command':
		startCommand(args);
		break;
	case 'end-command':
		endCommand(args);
		break;
	case 'fingerprint-error':
		fingerprintError(args);
		break;
	case '--help':
	case '-h':
	case undefined:
		showHelp();
		break;
	default:
		console.error(`Unknown command: ${command}`);
		showHelp();
		process.exit(1);
}
