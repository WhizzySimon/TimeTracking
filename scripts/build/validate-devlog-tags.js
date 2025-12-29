#!/usr/bin/env node

/**
 * Devlog Tag Validator
 *
 * Checks:
 * 1. Every DL-*.md has "## Tags" section with comma-separated tags (no brackets)
 *    Format: tags: a, b, c
 * 2. Each DL has 3-7 tags
 * 3. Each tag exists in TAGS.md (aliases auto-mapped to canonical)
 *
 * Exit code 1 on any violation
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');
const devlogDir = join(projectRoot, 'Docs', 'DevFramework', 'FrameworkSelfImprovementLogs');

let hasErrors = false;

function error(msg) {
	console.error(`[ERROR] ${msg}`);
	hasErrors = true;
}

function success(msg) {
	console.log(`[OK] ${msg}`);
}

function extractTagsFromTagsMd() {
	const tagsPath = join(projectRoot, 'Docs', 'DevFramework', 'Archive', 'SSD Analysis', 'TAGS.md');
	const content = readFileSync(tagsPath, 'utf-8');
	const tags = new Set();
	const aliasMap = new Map();

	// Extract all tags from markdown tables (backticked in first column)
	const tagPattern = /\|\s*`([a-z0-9-]+)`\s*\|/g;
	let match;
	while ((match = tagPattern.exec(content)) !== null) {
		tags.add(match[1]);
	}

	// Extract aliases and map them to canonical tags
	const aliasSection = content.match(
		/## Aliases[\s\S]*?\n\|[^\n]+\n\|[-\s|]+\n([\s\S]*?)(?=\n---|\n## |$)/
	);
	if (aliasSection) {
		const aliasLines = aliasSection[1].split('\n').filter((l) => l.includes('|'));
		for (const line of aliasLines) {
			const cols = line.split('|').map((c) => c.trim());
			if (cols.length >= 3) {
				const alias = cols[1].replace(/`/g, '').trim();
				const canonical = cols[2].replace(/`/g, '').split('(')[0].trim();
				if (alias && canonical) {
					aliasMap.set(alias, canonical);
					tags.add(alias); // Accept alias as valid input
				}
			}
		}
	}

	return { tags, aliasMap };
}

function validateDevlogFile(filePath, validTags) {
	const fileName = filePath.split(/[/\\]/).pop();
	const content = readFileSync(filePath, 'utf-8');

	// Match format: ## Tags\n\ntags: a, b, c  OR  - tags: a, b, c
	const tagsMatch = content.match(/## Tags\s*\n+[-*]?\s*tags:\s*([^\n]+)/);
	if (!tagsMatch) {
		error(`${fileName}: Missing "## Tags" section or invalid format`);
		return;
	}

	let tagsStr = tagsMatch[1].trim();
	// Remove brackets if present (legacy format)
	if (tagsStr.startsWith('[') && tagsStr.includes(']')) {
		error(`${fileName}: Tags should NOT use brackets. Use format: tags: a, b, c`);
		return;
	}

	const tags = tagsStr
		.split(',')
		.map((t) => t.trim().toLowerCase())
		.filter((t) => t);

	if (tags.length < 3) {
		error(`${fileName}: Has ${tags.length} tags, minimum is 3`);
	}
	if (tags.length > 7) {
		error(`${fileName}: Has ${tags.length} tags, maximum is 7`);
	}

	for (const tag of tags) {
		if (!validTags.has(tag)) {
			error(`${fileName}: Unknown tag "${tag}" not in TAGS.md`);
		}
	}
}

function main() {
	console.log('Validating devlog tags...\n');

	const { tags: validTags } = extractTagsFromTagsMd();
	console.log(`Found ${validTags.size} valid tags in TAGS.md\n`);

	const devlogFiles = readdirSync(devlogDir).filter(
		(f) => f.startsWith('DL-') && f.endsWith('.md')
	);

	console.log(`Checking ${devlogFiles.length} devlog files...\n`);

	for (const file of devlogFiles) {
		validateDevlogFile(join(devlogDir, file), validTags);
	}

	if (hasErrors) {
		console.log('\n[FAILED] Validation FAILED - see errors above');
		process.exit(1);
	} else {
		success('All devlog tags are valid!');
		process.exit(0);
	}
}

main();
