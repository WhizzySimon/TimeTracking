#!/usr/bin/env node
/**
 * Bump Version Script for TimeTracker
 *
 * Creates a new version tag, which resets the build number.
 *
 * Usage:
 *   node scripts/bump-version.js [major|minor|patch]
 *
 * Examples:
 *   node scripts/bump-version.js patch   # 1.0.0 → 1.0.1
 *   node scripts/bump-version.js minor   # 1.0.1 → 1.1.0
 *   node scripts/bump-version.js major   # 1.1.0 → 2.0.0
 *
 * What it does:
 *   1. Gets current version from latest git tag
 *   2. Bumps the specified part (major/minor/patch)
 *   3. Creates annotated git tag
 *   4. Pushes tag to remote
 *
 * After this, the next build will show X.Y.Z.0 (build number reset)
 */

import { execSync } from 'child_process';
import { createInterface } from 'readline';

function exec(cmd) {
	try {
		return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
	} catch {
		return null;
	}
}

function getCurrentVersion() {
	// Get latest version tag
	const describe = exec('git describe --tags --abbrev=0');
	if (describe && /^v?\d+\.\d+\.\d+$/.test(describe)) {
		return describe.replace(/^v/, '');
	}
	return '1.0.0';
}

function bumpVersion(current, part) {
	const [major, minor, patch] = current.split('.').map(Number);

	switch (part) {
		case 'major':
			return `${major + 1}.0.0`;
		case 'minor':
			return `${major}.${minor + 1}.0`;
		case 'patch':
			return `${major}.${minor}.${patch + 1}`;
		default:
			throw new Error(`Invalid bump type: ${part}. Use major, minor, or patch.`);
	}
}

async function prompt(question) {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim().toLowerCase());
		});
	});
}

async function main() {
	console.log('\n=== TimeTracker Version Bump ===\n');

	// Check for clean working tree
	const status = exec('git status --porcelain');
	if (status) {
		console.error('ERROR: Working tree not clean. Commit or discard changes first.');
		process.exit(1);
	}

	// Get current version
	const currentVersion = getCurrentVersion();
	console.log(`Current version: ${currentVersion}`);

	// Get bump type from argument or prompt
	let bumpType = process.argv[2];
	if (!bumpType) {
		console.log('\nBump types:');
		console.log('  major - Breaking changes (1.0.0 → 2.0.0)');
		console.log('  minor - New features (1.0.0 → 1.1.0)');
		console.log('  patch - Bug fixes (1.0.0 → 1.0.1)');
		bumpType = await prompt('\nEnter bump type (major/minor/patch): ');
	}

	if (!['major', 'minor', 'patch'].includes(bumpType)) {
		console.error(`ERROR: Invalid bump type "${bumpType}". Use major, minor, or patch.`);
		process.exit(1);
	}

	// Calculate new version
	const newVersion = bumpVersion(currentVersion, bumpType);
	const tag = `v${newVersion}`;

	console.log(`\nNew version: ${newVersion}`);
	console.log(`Tag to create: ${tag}`);

	// Check if tag already exists
	const existingTag = exec(`git tag -l "${tag}"`);
	if (existingTag) {
		console.error(`ERROR: Tag ${tag} already exists.`);
		process.exit(1);
	}

	// Confirm
	const confirm = await prompt(`\nCreate tag ${tag}? (y/n): `);
	if (confirm !== 'y' && confirm !== 'yes') {
		console.log('Aborted.');
		process.exit(0);
	}

	// Create tag
	console.log(`\nCreating tag ${tag}...`);
	try {
		execSync(`git tag -a ${tag} -m "Version ${newVersion}"`, { stdio: 'inherit' });
	} catch {
		console.error('ERROR: Failed to create tag.');
		process.exit(1);
	}

	// Push tag
	console.log(`Pushing tag to remote...`);
	try {
		execSync(`git push origin ${tag}`, { stdio: 'inherit' });
	} catch {
		console.error('ERROR: Failed to push tag. You may need to push manually.');
		process.exit(1);
	}

	console.log(`\n=== Version bump complete! ===`);
	console.log(`\nNew version: ${newVersion}`);
	console.log(`Next build will be: ${newVersion}.0`);
	console.log(`Subsequent builds: ${newVersion}.1, ${newVersion}.2, etc.`);
}

main().catch((error) => {
	console.error('Unexpected error:', error);
	process.exit(1);
});
