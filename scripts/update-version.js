import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const versionJsonPath = join(__dirname, '..', 'static', 'version.json');

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
