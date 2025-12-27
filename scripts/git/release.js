#!/usr/bin/env node
/**
 * Release script for TimeTracker
 *
 * Usage:
 *   node scripts/git/release.js
 *
 * What it does:
 *   1. Validates you're on dev branch with clean working tree
 *   2. Gets the latest version tag from dev
 *   3. Pulls latest from dev and main
 *   4. Merges dev into main (fast-forward)
 *   5. Pushes main and tags to GitHub
 *   6. Creates GitHub release using gh CLI
 *   7. Switches back to dev branch
 *
 * Prerequisites:
 *   - Run `node scripts/git/bump-version.js` first to create a version tag
 *   - GitHub CLI (gh) installed and authenticated
 *   - Clean working tree
 *   - On dev branch
 */

import { execSync } from 'child_process';
import { createInterface } from 'readline';

function exec(cmd, options = {}) {
	console.log(`  $ ${cmd}`);
	try {
		return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe', ...options }).trim();
	} catch (error) {
		if (options.ignoreError) return '';
		console.error(`  ERROR: ${error.message}`);
		if (error.stderr) console.error(`  ${error.stderr}`);
		process.exit(1);
	}
}

function execLive(cmd) {
	console.log(`  $ ${cmd}`);
	try {
		execSync(cmd, { stdio: 'inherit' });
	} catch {
		console.error(`  ERROR: Command failed`);
		process.exit(1);
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

function getLatestTag() {
	try {
		const tag = execSync('git describe --tags --abbrev=0', {
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'pipe']
		}).trim();
		if (/^v?\d+\.\d+\.\d+$/.test(tag)) {
			return tag.startsWith('v') ? tag : `v${tag}`;
		}
	} catch {
		// No tags found
	}
	return null;
}

async function main() {
	console.log('\n=== TimeTracker Release Script ===\n');

	// Get latest version tag
	const tag = getLatestTag();
	if (!tag) {
		console.error('ERROR: No version tag found.');
		console.error('Run `node scripts/git/bump-version.js` first to create a version tag.');
		process.exit(1);
	}

	const version = tag.replace(/^v/, '');
	console.log(`Releasing version: ${version} (tag: ${tag})\n`);

	// Step 1: Validate current state
	console.log('[ 1 / 6 ] Validating current state...');
	const currentBranch = exec('git branch --show-current');
	if (currentBranch !== 'dev') {
		console.error(`  ERROR: Must be on dev branch. Currently on: ${currentBranch}`);
		process.exit(1);
	}

	const status = exec('git status --porcelain');
	if (status) {
		console.error('  ERROR: Working tree not clean. Commit or discard changes first.');
		console.error(`  ${status}`);
		process.exit(1);
	}
	console.log('  OK.');

	// Confirm release
	const confirm = await prompt(`Release ${tag} to production? (y/n): `);
	if (confirm !== 'y' && confirm !== 'yes') {
		console.log('Aborted.');
		process.exit(0);
	}

	// Step 2: Pull latest
	console.log('[ 2 / 6 ] Pulling latest from remote...');
	exec('git fetch origin');
	exec('git pull origin dev');
	console.log('  OK.');

	// Step 3: Switch to main and merge
	console.log('[ 3 / 6 ] Merging dev into main...');
	exec('git checkout main');
	exec('git pull origin main');
	exec('git merge dev --ff-only');
	console.log('  OK.');

	// Step 4: Push to GitHub
	console.log('[ 4 / 6 ] Pushing main and tags to GitHub...');
	execLive('git push origin main');
	execLive('git push origin --tags');
	console.log('  OK.');

	// Step 5: Create GitHub release
	console.log('[ 5 / 6 ] Creating GitHub release...');
	const ghCheck = exec('gh --version', { ignoreError: true });
	if (!ghCheck) {
		console.log('  WARNING: GitHub CLI (gh) not found. Skipping release creation.');
		console.log('  Install gh: https://cli.github.com/');
		console.log(`  Manual: https://github.com/WhizzySimon/TimeTracking/releases/new?tag=${tag}`);
	} else {
		execLive(`gh release create ${tag} --title "Release ${tag}" --generate-notes`);
		console.log('  OK.');
	}

	// Step 6: Switch back to dev
	console.log('[ 6 / 6 ] Switching back to dev branch...');
	exec('git checkout dev');
	console.log('  OK.');

	console.log(`\n=== Release ${tag} complete! ===\n`);
	console.log('Next steps:');
	console.log('  - Netlify will auto-deploy main to production');
	console.log(`  - View release: https://github.com/WhizzySimon/TimeTracking/releases/tag/${tag}`);
	console.log('');
}

main().catch((error) => {
	console.error('Unexpected error:', error);
	process.exit(1);
});
