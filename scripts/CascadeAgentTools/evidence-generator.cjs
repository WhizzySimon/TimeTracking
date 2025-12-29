#!/usr/bin/env node
/**
 * Evidence Generator for Autonomy Stack v2
 *
 * Generates Markdown evidence bundles for completed tasks.
 *
 * Usage:
 *   node evidence-generator.js --task=D5.1 --box=infra-build
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, 'logs');
const EVIDENCE_DIR = path.join(__dirname, '..', '..', 'Docs', 'Devlog', 'Evidence');

function getSessionFile(sessionDate) {
	if (sessionDate) {
		return path.join(LOGS_DIR, `session-${sessionDate}.jsonl`);
	}
	const today = new Date().toISOString().split('T')[0];
	return path.join(LOGS_DIR, `session-${today}.jsonl`);
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

function extractChangedFiles(events) {
	const files = new Set();
	for (const event of events) {
		if (event.kind === 'event' && event.type === 'file_edit' && event.file) {
			files.add(event.file);
		}
	}
	return Array.from(files);
}

function extractCommands(events) {
	const commands = [];
	for (const event of events) {
		if (event.kind === 'command_end') {
			commands.push({
				command: event.command,
				exitCode: event.exitCode,
				duration: event.duration
			});
		}
	}
	return commands;
}

function extractErrors(events) {
	const errors = [];
	for (const event of events) {
		if (event.kind === 'error_fingerprint') {
			errors.push({
				fingerprint: event.fingerprint,
				message: event.originalMessage
			});
		}
	}
	return errors;
}

function generateEvidence(taskId, boxType, events, sessionDate) {
	const changedFiles = extractChangedFiles(events);
	const commands = extractCommands(events);
	const errors = extractErrors(events);

	const gaps = [];
	if (changedFiles.length === 0) {
		gaps.push('No file edits logged (consider using `log-event --type=file_edit --file=...`)');
	}
	if (commands.length === 0) {
		gaps.push('No command executions logged');
	}

	const now = new Date().toISOString();

	let content = `# Evidence Bundle: ${taskId}

**Generated:** ${now}  
**Box Type:** ${boxType}  
**Session:** ${sessionDate}

---

## Acceptance Criteria

<!-- Fill in from task definition -->

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Changed Files

`;

	if (changedFiles.length > 0) {
		for (const file of changedFiles) {
			content += `- \`${file}\`\n`;
		}
	} else {
		content += `*No file edits logged in telemetry*\n`;
	}

	content += `
---

## Commands Run

`;

	if (commands.length > 0) {
		content += `| Command | Exit Code | Duration |\n`;
		content += `| ------- | --------- | -------- |\n`;
		for (const cmd of commands) {
			const duration = cmd.duration ? `${cmd.duration}ms` : 'N/A';
			const exitCode = cmd.exitCode !== null ? cmd.exitCode : 'N/A';
			content += `| \`${cmd.command}\` | ${exitCode} | ${duration} |\n`;
		}
	} else {
		content += `*No commands logged in telemetry*\n`;
	}

	content += `
---

## Errors Encountered

`;

	if (errors.length > 0) {
		for (const err of errors) {
			content += `- **${err.fingerprint}:** ${err.message}\n`;
		}
	} else {
		content += `*No errors logged*\n`;
	}

	content += `
---

## Gaps

`;

	if (gaps.length > 0) {
		for (const gap of gaps) {
			content += `- ${gap}\n`;
		}
	} else {
		content += `*None detected*\n`;
	}

	content += `
---

## Links

- **Task Definition:** \`Docs/Tasks/*.md\` (search for ${taskId})
- **Box Checklist:** \`Docs/DevFramework/TaskQualityAssurance/boxes/${boxType}.md\`
- **Session Log:** \`scripts/ai/logs/session-${sessionDate}.jsonl\`
`;

	return content;
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

	if (!args.task) {
		console.error('Error: --task is required');
		console.error('Usage: evidence-generator.js --task=D5.1 --box=infra-build');
		process.exit(1);
	}

	if (!args.box) {
		console.error('Error: --box is required');
		console.error('Usage: evidence-generator.js --task=D5.1 --box=infra-build');
		process.exit(1);
	}

	const sessionDate = args.session || new Date().toISOString().split('T')[0];
	const sessionFile = getSessionFile(sessionDate);
	const events = readSessionLog(sessionFile);

	const evidence = generateEvidence(args.task, args.box, events, sessionDate);

	if (!fs.existsSync(EVIDENCE_DIR)) {
		fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
	}

	let outputFile = path.join(EVIDENCE_DIR, `${args.task}.md`);

	if (fs.existsSync(outputFile)) {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		outputFile = path.join(EVIDENCE_DIR, `${args.task}-${timestamp}.md`);
	}

	fs.writeFileSync(outputFile, evidence, 'utf8');
	console.log(`Evidence bundle generated: ${outputFile}`);
}

main();
