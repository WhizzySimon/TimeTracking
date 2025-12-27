import { writeFileSync, readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const versionJsonPath = join(__dirname, '..', '..', 'static', 'version.json');
const swTemplatePath = join(__dirname, '..', '..', 'static', 'sw.template.js');
const swJsPath = join(__dirname, '..', '..', 'static', 'sw.js');

function getVersion() {
	// Use git describe to get version from tags
	// Output format: v1.0.0-5-g78e087e (tag-commits-hash)
	// If exactly on tag: v1.0.0
	try {
		const describe = execSync('git describe --tags --long', {
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'pipe']
		}).trim();

		// Parse: v1.0.0-5-g78e087e
		const match = describe.match(/^v?(\d+\.\d+\.\d+)-(\d+)-g([a-f0-9]+)$/);
		if (match) {
			const [, semver, commits, hash] = match;
			return {
				version: `${semver}.${commits}`,
				hash: hash
			};
		}

		// Exactly on tag: v1.0.0
		const tagMatch = describe.match(/^v?(\d+\.\d+\.\d+)$/);
		if (tagMatch) {
			return {
				version: `${tagMatch[1]}.0`,
				hash: execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
			};
		}
	} catch {
		// No tags exist yet - fall back to commit count
	}

	// Fallback: use commit count with base version
	try {
		const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
		const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
		return {
			version: `1.0.0.${commitCount}`,
			hash: hash
		};
	} catch {
		return { version: '1.0.0.0', hash: 'dev' };
	}
}

const { version: fullVersion, hash: commitHash } = getVersion();

const versionInfo = {
	version: fullVersion,
	commit: commitHash,
	buildTime: new Date().toISOString()
};

writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 2) + '\n');

console.log(`Updated version.json: v${versionInfo.version} @ ${versionInfo.buildTime}`);

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
