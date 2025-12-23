/**
 * Setup Git hooks for the project
 * Run with: node scripts/setup-hooks.js
 */

import { copyFileSync, chmodSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const hooksDir = join(projectRoot, '.git', 'hooks');
const sourceHook = join(__dirname, 'pre-commit');
const targetHook = join(hooksDir, 'pre-commit');

if (!existsSync(hooksDir)) {
	console.error('Error: .git/hooks directory not found. Is this a git repository?');
	process.exit(1);
}

if (!existsSync(sourceHook)) {
	console.error('Error: scripts/pre-commit not found.');
	process.exit(1);
}

copyFileSync(sourceHook, targetHook);

// Make executable on Unix systems (no-op on Windows, but git bash will use it)
try {
	chmodSync(targetHook, 0o755);
} catch {
	// Ignore chmod errors on Windows
}

console.log('Git pre-commit hook installed successfully.');
console.log('Version will now auto-increment on every commit.');
