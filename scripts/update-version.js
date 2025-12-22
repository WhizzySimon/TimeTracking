import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const versionInfo = {
	version: packageJson.version,
	buildTime: new Date().toISOString()
};

writeFileSync(
	join(__dirname, '..', 'static', 'version.json'),
	JSON.stringify(versionInfo, null, 2) + '\n'
);

console.log(`Updated version.json: v${versionInfo.version} @ ${versionInfo.buildTime}`);
