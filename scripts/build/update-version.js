import { writeFileSync, readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const versionJsonPath = join(__dirname, '..', '..', 'static', 'version.json');
const swTemplatePath = join(__dirname, '..', '..', 'static', 'sw.template.js');
const swJsPath = join(__dirname, '..', '..', 'static', 'sw.js');

function getCommitHash() {
	// Netlify provides COMMIT_REF environment variable
	if (process.env.COMMIT_REF) {
		return process.env.COMMIT_REF.substring(0, 7);
	}
	// Fallback: get from git locally
	try {
		return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
	} catch {
		return 'dev';
	}
}

const commitHash = getCommitHash();

const versionInfo = {
	version: commitHash,
	buildTime: new Date().toISOString()
};

writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 2) + '\n');

console.log(`Updated version.json: ${versionInfo.version} @ ${versionInfo.buildTime}`);

// Generate sw.js from template with BUILD_ID so browser detects new service worker
const BUILD_ID_MARKER = /^\/\/ __BUILD_ID__ = ".*"$/m;
const newBuildIdLine = `// __BUILD_ID__ = "${versionInfo.version}-${versionInfo.buildTime}"`;

if (!existsSync(swTemplatePath)) {
	throw new Error('sw.template.js not found. Expected at: ' + swTemplatePath);
}

const swTemplateContent = readFileSync(swTemplatePath, 'utf-8');

if (!BUILD_ID_MARKER.test(swTemplateContent)) {
	throw new Error(
		'sw.template.js is missing the BUILD_ID marker. Expected line: // __BUILD_ID__ = "..."'
	);
}

const swContent = swTemplateContent.replace(BUILD_ID_MARKER, newBuildIdLine);
writeFileSync(swJsPath, swContent);
console.log(`Generated sw.js with BUILD_ID: ${versionInfo.version}-${versionInfo.buildTime}`);
