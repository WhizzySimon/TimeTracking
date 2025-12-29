#!/usr/bin/env node

/**
 * Naming Convention Validator
 *
 * Checks code for naming convention violations per code-quality.md:
 * 1. Banned abbreviations (cfg, msg, err, tmp, etc.)
 * 2. Boolean variables missing is/has/can/should/will prefix
 * 3. Generic names (data, temp, flag, info, item, stuff)
 *
 * Exit code 1 on any error-level violation
 * Exit code 0 on warnings only or clean
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

const BANNED_ABBREVIATIONS = new Set([
	'cfg',
	'msg',
	'tmp',
	'btn',
	'arr',
	'fn',
	'cb',
	'ctx',
	'util',
	'utils',
	'misc',
	'opts',
	'attr',
	'elem',
	'el',
	'ptr',
	'buf',
	'cnt',
	'dst',
	'dest',
	'cpy',
	'chk',
	'hdlr',
	'mgr',
	'svc'
]);

const GENERIC_NAMES = new Set([
	'temp',
	'flag',
	'stuff',
	'thing',
	'foo',
	'bar',
	'baz',
	'xxx',
	'yyy',
	'zzz'
]);

const BOOLEAN_PREFIXES = ['is', 'has', 'can', 'should', 'will', 'was', 'did', 'does', 'are'];

let errorCount = 0;
let warningCount = 0;

function logError(file, line, message) {
	console.error(`[ERROR] ${file}:${line} - ${message}`);
	errorCount++;
}

function logWarning(file, line, message) {
	console.warn(`[WARN] ${file}:${line} - ${message}`);
	warningCount++;
}

function extractIdentifiers(content, filePath) {
	const identifiers = [];
	const lines = content.split('\n');
	const extension = extname(filePath);

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const line = lines[lineNum];

		// Skip comments
		if (
			line.trim().startsWith('//') ||
			line.trim().startsWith('*') ||
			line.trim().startsWith('/*')
		) {
			continue;
		}

		// Variable declarations: const/let/var name
		const varMatches = line.matchAll(/\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
		for (const match of varMatches) {
			identifiers.push({ name: match[1], line: lineNum + 1, type: 'variable' });
		}

		// Function declarations: function name(
		const funcMatches = line.matchAll(/\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
		for (const match of funcMatches) {
			identifiers.push({ name: match[1], line: lineNum + 1, type: 'function' });
		}

		// Arrow functions: const name = ( or const name = async (
		const arrowMatches = line.matchAll(
			/\b(?:const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/g
		);
		for (const match of arrowMatches) {
			identifiers.push({ name: match[1], line: lineNum + 1, type: 'function' });
		}

		// Arrow functions: const name = async? (...) =>
		const arrowMatches2 = line.matchAll(
			/\b(?:const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?[^=]*=>/g
		);
		for (const match of arrowMatches2) {
			if (!identifiers.find((id) => id.name === match[1] && id.line === lineNum + 1)) {
				identifiers.push({ name: match[1], line: lineNum + 1, type: 'function' });
			}
		}

		// Svelte: let name = $state() - reactive state (likely boolean if named with pattern)
		if (extension === '.svelte') {
			const stateMatches = line.matchAll(/\blet\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\$state\s*\(/g);
			for (const match of stateMatches) {
				identifiers.push({ name: match[1], line: lineNum + 1, type: 'state' });
			}
		}
	}

	return identifiers;
}

function isBooleanName(name) {
	const lowerName = name.toLowerCase();

	// Only flag if the name IS the boolean indicator (not contains it)
	// e.g., "loading" should be "isLoading", but "loadingState" is fine
	const exactBooleanNames = new Set([
		'enabled',
		'disabled',
		'active',
		'inactive',
		'visible',
		'hidden',
		'open',
		'closed',
		'loading',
		'loaded',
		'checked',
		'expanded',
		'collapsed',
		'running',
		'stopped',
		'paused',
		'complete',
		'done',
		'finished',
		'ready',
		'empty',
		'full'
	]);

	return exactBooleanNames.has(lowerName);
}

function hasBooleanPrefix(name) {
	return BOOLEAN_PREFIXES.some((prefix) => {
		if (name.startsWith(prefix)) {
			const rest = name.slice(prefix.length);
			// Check if next char is uppercase (camelCase) e.g., isOpen, hasItems
			return (
				rest.length > 0 && rest[0] === rest[0].toUpperCase() && rest[0] !== rest[0].toLowerCase()
			);
		}
		return false;
	});
}

function checkIdentifier(identifier, filePath) {
	const { name, line, type } = identifier;
	const lowerName = name.toLowerCase();
	const relativePath = filePath.replace(projectRoot, '').replace(/\\/g, '/');

	// Skip very short names (handled by ESLint id-length)
	if (name.length < 3) return;

	// Skip ALL_CAPS constants
	if (name === name.toUpperCase() && name.includes('_')) return;

	// Skip __filename, __dirname
	if (name.startsWith('__')) return;

	// Check for banned abbreviations (as whole word or camelCase part)
	for (const abbr of BANNED_ABBREVIATIONS) {
		if (lowerName === abbr) {
			logError(relativePath, line, `Banned abbreviation "${name}" - use full word instead`);
			break;
		}
		// Check if abbreviation is a camelCase segment (e.g., getUserCfg)
		const camelPattern = new RegExp(
			`[a-z]${abbr.charAt(0).toUpperCase()}${abbr.slice(1)}(?:[A-Z]|$)`
		);
		if (camelPattern.test(name)) {
			logWarning(
				relativePath,
				line,
				`Abbreviation "${abbr}" in "${name}" - consider using full word`
			);
		}
	}

	// Check for generic names (only as exact match for variables)
	if (type === 'variable' && GENERIC_NAMES.has(lowerName)) {
		logWarning(relativePath, line, `Generic name "${name}" - use more descriptive name`);
	}

	// Check boolean naming
	if (isBooleanName(name) && !hasBooleanPrefix(name)) {
		logWarning(
			relativePath,
			line,
			`Boolean "${name}" should have is/has/can/should prefix (e.g., is${name.charAt(0).toUpperCase()}${name.slice(1)})`
		);
	}
}

function validateFile(filePath) {
	const content = readFileSync(filePath, 'utf-8');
	const identifiers = extractIdentifiers(content, filePath);

	for (const identifier of identifiers) {
		checkIdentifier(identifier, filePath);
	}
}

function walkDirectory(dir, extensions) {
	const files = [];
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);

		// Skip node_modules, .git, build output
		if (
			entry === 'node_modules' ||
			entry === '.git' ||
			entry === '.svelte-kit' ||
			entry === 'build' ||
			entry === 'dist'
		) {
			continue;
		}

		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			files.push(...walkDirectory(fullPath, extensions));
		} else if (extensions.includes(extname(entry))) {
			files.push(fullPath);
		}
	}

	return files;
}

function main() {
	console.log('Validating naming conventions...\n');

	const srcDir = join(projectRoot, 'src');
	const scriptsDir = join(projectRoot, 'scripts');

	const extensions = ['.ts', '.js', '.svelte'];

	const srcFiles = walkDirectory(srcDir, extensions);
	const scriptFiles = walkDirectory(scriptsDir, extensions);
	const allFiles = [...srcFiles, ...scriptFiles];

	console.log(`Checking ${allFiles.length} files...\n`);

	for (const file of allFiles) {
		validateFile(file);
	}

	console.log('');

	if (errorCount > 0) {
		console.log(`[FAILED] ${errorCount} error(s), ${warningCount} warning(s)`);
		process.exit(1);
	} else if (warningCount > 0) {
		console.log(`[PASSED with warnings] ${warningCount} warning(s)`);
		process.exit(0);
	} else {
		console.log('[OK] All naming conventions passed!');
		process.exit(0);
	}
}

main();
