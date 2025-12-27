#!/usr/bin/env node

/**
 * Evidence Bundle Generator for Autonomy Stack v2
 *
 * Generates a Markdown evidence bundle for a completed task.
 *
 * Usage:
 *   node scripts/ai/evidence-generator.js --task=D5.1 --box=infra-build [--session=<file>]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGS_DIR = path.join(__dirname, 'logs');
const EVIDENCE_DIR = path.resolve(__dirname, '../../Docs/Devlog/Evidence');

// Ensure evidence directory exists
if (!fs.existsSync(EVIDENCE_DIR)) {
	fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

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
			// Skip malformed lines
		}
	}

	return events;
}

/**
 * Extract unique files from events
 */
function extractFiles(events) {
	const files = new Set();
	for (const event of events) {
		if (event.file) {
			files.add(event.file);
		}
	}
	return [...files];
}

/**
 * Extract commands from events
 */
function extractCommands(events) {
	const commands = [];
	const commandStarts = {};

	for (const event of events) {
		if (event.event_type === 'command_start' && event.command) {
			commandStarts[event.command] = event;
		} else if (event.event_type === 'command_end' && event.command) {
			commands.push({
				command: event.command,
				exit_code: event.exit_code,
				duration_ms: event.duration_ms,
				status: event.exit_code === 0 ? 'PASS' : 'FAIL'
			});
		}
	}

	return commands;
}

/**
 * Extract errors from events
 */
function extractErrors(events) {
	const errors = [];
	for (const event of events) {
		if (event.event_type === 'error') {
			errors.push({
				message: event.message,
				fingerprint: event.error_fingerprint,
				file: event.file
			});
		}
	}
	return errors;
}

/**
 * Generate evidence bundle markdown
 */
function generateEvidence(taskId, box, events, gaps, links) {
	const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
	const files = extractFiles(events);
	const commands = extractCommands(events);
	const errors = extractErrors(events);

	let md = `# Evidence Bundle: ${taskId}

**Generated:** ${timestamp}  
**Box Type:** ${box}

---

## Acceptance Criteria

<!-- Fill in the acceptance criteria from the task definition -->

- [ ] AC-001: (copy from task)
- [ ] AC-002: (copy from task)

---

## Changed Files

`;

	if (files.length > 0) {
		for (const file of files) {
			md += `- \`${file}\`\n`;
		}
	} else {
		md += `- (no files recorded in telemetry)\n`;
	}

	md += `
---

## Commands Run

| Command | Exit Code | Duration | Status |
|---------|-----------|----------|--------|
`;

	if (commands.length > 0) {
		for (const cmd of commands) {
			const duration = cmd.duration_ms ? `${cmd.duration_ms}ms` : '-';
			md += `| \`${cmd.command}\` | ${cmd.exit_code} | ${duration} | ${cmd.status} |\n`;
		}
	} else {
		md += `| (no commands recorded) | - | - | - |\n`;
	}

	md += `
---

## Errors Encountered

`;

	if (errors.length > 0) {
		for (const err of errors) {
			md += `- **${err.fingerprint || 'no-fp'}**: ${err.message}\n`;
			if (err.file) {
				md += `  - File: \`${err.file}\`\n`;
			}
		}
	} else {
		md += `- (no errors recorded)\n`;
	}

	md += `
---

## What Was NOT Tested

${gaps || '- (fill in manually: what coverage gaps exist?)'}

---

## Links / References

${links || '- Spec: `Docs/Specs/<feature>.md`\n- Plan: `Docs/Plans/<feature>.md`\n- Task: `Docs/Tasks/<feature>.md`'}

---

## Notes

<!-- Add any additional observations or context -->

`;

	return md;
}

/**
 * Show help message
 */
function showHelp() {
	console.log(`
Evidence Bundle Generator for Autonomy Stack v2

Usage:
  node scripts/ai/evidence-generator.js --task=<id> --box=<type> [options]

Required:
  --task=<id>       Task identifier (e.g., D5.1, A2.3)
  --box=<type>      Box type (feature, bugfix, refactor, infra-build, research-decision, ui-ux)

Optional:
  --session=<file>  Specific session log file (default: latest)
  --gaps=<text>     What was not tested
  --links=<text>    Reference links

Example:
  node scripts/ai/evidence-generator.js --task=D5.1 --box=infra-build
`);
}

// Main execution
const args = parseArgs(process.argv.slice(2));

if (args.help || !args.task || !args.box) {
	showHelp();
	process.exit(args.help ? 0 : 1);
}

const taskId = args.task;
const box = args.box;
const gaps = args.gaps;
const links = args.links;

// Get session log
let sessionLogPath = args.session;
if (!sessionLogPath) {
	sessionLogPath = getLatestSessionLog();
}

let events = [];
if (sessionLogPath && fs.existsSync(sessionLogPath)) {
	events = readJsonl(sessionLogPath);
	console.log(`Read ${events.length} events from ${path.basename(sessionLogPath)}`);
} else {
	console.log('No session log found. Generating template-only evidence bundle.');
}

// Generate evidence
const evidence = generateEvidence(taskId, box, events, gaps, links);

// Write to file
const filename = `${taskId.replace(/\./g, '-')}-${new Date().toISOString().slice(0, 10)}.md`;
const outputPath = path.join(EVIDENCE_DIR, filename);

// Check for existing file
let finalPath = outputPath;
if (fs.existsSync(outputPath)) {
	const timestamp = Date.now();
	finalPath = path.join(EVIDENCE_DIR, `${taskId.replace(/\./g, '-')}-${timestamp}.md`);
}

fs.writeFileSync(finalPath, evidence, 'utf8');
console.log(`Evidence bundle created: ${path.relative(process.cwd(), finalPath)}`);
