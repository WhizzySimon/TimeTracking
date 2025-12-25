import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const versionJsonPath = join(__dirname, '..', '..', 'static', 'version.json');
const swTemplatePath = join(__dirname, '..', '..', 'static', 'sw.template.js');
const swJsPath = join(__dirname, '..', '..', 'static', 'sw.js');

// Base version (major.minor.patch)
const BASE_VERSION = '1.0.0';

// Read current build number from existing version.json
let buildNumber = 1;
if (existsSync(versionJsonPath)) {
	try {
		const existing = JSON.parse(readFileSync(versionJsonPath, 'utf-8'));
		if (existing.version) {
			const parts = existing.version.split('.');
			if (parts.length === 4) {
				buildNumber = parseInt(parts[3], 10) + 1;
			}
		}
	} catch {
		// If parsing fails, start at 1
	}
}

const fullVersion = `${BASE_VERSION}.${buildNumber}`;

const versionInfo = {
	version: fullVersion,
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
