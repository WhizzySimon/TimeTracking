#!/usr/bin/env node
/**
 * Release script for TimeTracker
 *
 * Usage:
 *   node scripts/release.js [version]
 *
 * Examples:
 *   node scripts/release.js 1.0.0
 *   node scripts/release.js 1.1.0
 *
 * What it does:
 *   1. Validates you're on dev branch with clean working tree
 *   2. Pulls latest from dev and main
 *   3. Merges dev into main (fast-forward)
 *   4. Creates git tag (v1.0.0)
 *   5. Pushes main and tags to GitHub
 *   6. Creates GitHub release using gh CLI
 *   7. Switches back to dev branch
 *
 * Prerequisites:
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
			resolve(answer.trim());
		});
	});
}

function validateVersion(version) {
	const semverRegex = /^\d+\.\d+\.\d+$/;
	if (!semverRegex.test(version)) {
		console.error(`ERROR: Invalid version format "${version}". Expected: X.Y.Z (e.g., 1.0.0)`);
		process.exit(1);
	}
	return version;
}

async function main() {
	console.log('\n=== TimeTracker Release Script ===\n');

	// Get version from argument or prompt
	let version = process.argv[2];
	if (!version) {
		const latestTag = exec('git describe --tags --abbrev=0 2>/dev/null || echo "none"', {
			ignoreError: true
		});
		console.log(`Latest release: ${latestTag || 'none'}`);
		version = await prompt('Enter new version (e.g., 1.0.0): ');
	}
	version = validateVersion(version);
	const tag = `v${version}`;

	console.log(`\nPreparing release: ${tag}\n`);

	// Step 1: Validate current state
	console.log('[ 1 / 7 ] Validating current state...');
	const currentBranch = exec('git branch --show-current');
	if (currentBranch !== 'dev') {
		console.error(`  ERROR: Must be on dev branch. Currently on: ${currentBranch}`);
		process.exit(1);
	}

	const status = exec('git status --porcelain');
	if (status) {
		console.error('  ERROR: Working tree not clean. Commit or stash changes first.');
		console.error(`  ${status}`);
		process.exit(1);
	}

	const existingTag = exec(`git tag -l "${tag}"`, { ignoreError: true });
	if (existingTag) {
		console.error(`  ERROR: Tag ${tag} already exists.`);
		process.exit(1);
	}
	console.log('  OK.');

	// Step 2: Pull latest
	console.log('[ 2 / 7 ] Pulling latest from remote...');
	exec('git fetch origin');
	exec('git pull origin dev');
	console.log('  OK.');

	// Step 3: Switch to main and merge
	console.log('[ 3 / 7 ] Merging dev into main...');
	exec('git checkout main');
	exec('git pull origin main');
	exec('git merge dev --ff-only');
	console.log('  OK.');

	// Step 4: Create tag
	console.log(`[ 4 / 7 ] Creating tag ${tag}...`);
	exec(`git tag -a ${tag} -m "Release ${tag}"`);
	console.log('  OK.');

	// Step 5: Push to GitHub
	console.log('[ 5 / 7 ] Pushing main and tags to GitHub...');
	execLive('git push origin main');
	execLive('git push origin --tags');
	console.log('  OK.');

	// Step 6: Create GitHub release
	console.log('[ 6 / 7 ] Creating GitHub release...');
	const ghCheck = exec('gh --version', { ignoreError: true });
	if (!ghCheck) {
		console.log('  WARNING: GitHub CLI (gh) not found. Skipping release creation.');
		console.log('  Install gh: https://cli.github.com/');
		console.log(`  Manual: https://github.com/WhizzySimon/TimeTracking/releases/new?tag=${tag}`);
	} else {
		execLive(`gh release create ${tag} --title "Release ${tag}" --generate-notes`);
		console.log('  OK.');
	}

	// Step 7: Switch back to dev
	console.log('[ 7 / 7 ] Switching back to dev branch...');
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
