/**
 * PWA Installability Check Script
 * Run with: node scripts/check-pwa.js
 *
 * Checks:
 * 1. Manifest exists and has required fields
 * 2. Icons exist and have correct sizes
 * 3. Service worker exists and has fetch handler
 * 4. Build output contains all required files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let hasErrors = false;
let hasWarnings = false;

function log(status, message) {
	const icons = { pass: '✅', fail: '❌', warn: '⚠️', info: 'ℹ️' };
	console.log(`${icons[status]} ${message}`);
	if (status === 'fail') hasErrors = true;
	if (status === 'warn') hasWarnings = true;
}

function checkManifest() {
	console.log('\n📋 Checking manifest.webmanifest...\n');

	const manifestPath = path.join(ROOT, 'static', 'manifest.webmanifest');

	if (!fs.existsSync(manifestPath)) {
		log('fail', 'manifest.webmanifest not found in static/');
		return null;
	}
	log('pass', 'manifest.webmanifest exists');

	let manifest;
	try {
		const content = fs.readFileSync(manifestPath, 'utf-8');
		manifest = JSON.parse(content);
	} catch (e) {
		log('fail', `manifest.webmanifest is not valid JSON: ${e.message}`);
		return null;
	}
	log('pass', 'manifest.webmanifest is valid JSON');

	// Required fields for installability
	const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
	for (const field of required) {
		if (manifest[field]) {
			log('pass', `"${field}" is present`);
		} else {
			log('fail', `"${field}" is MISSING (required for installability)`);
		}
	}

	// Recommended fields
	const recommended = ['scope', 'background_color', 'theme_color'];
	for (const field of recommended) {
		if (manifest[field]) {
			log('pass', `"${field}" is present`);
		} else {
			log('warn', `"${field}" is missing (recommended)`);
		}
	}

	// Check display value
	if (manifest.display && !['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)) {
		log(
			'fail',
			`"display" must be "standalone", "fullscreen", or "minimal-ui" (got "${manifest.display}")`
		);
	}

	// Check start_url and scope consistency
	if (manifest.start_url && manifest.scope) {
		if (!manifest.start_url.startsWith(manifest.scope)) {
			log('fail', `start_url "${manifest.start_url}" must be within scope "${manifest.scope}"`);
		}
	}

	return manifest;
}

function checkIcons(manifest) {
	console.log('\n🖼️  Checking icons...\n');

	if (!manifest || !manifest.icons || !Array.isArray(manifest.icons)) {
		log('fail', 'No icons array in manifest');
		return;
	}

	const requiredSizes = ['192x192', '512x512'];
	const foundSizes = new Set();

	for (const icon of manifest.icons) {
		const iconPath = path.join(ROOT, 'static', icon.src.replace(/^\//, ''));

		if (!fs.existsSync(iconPath)) {
			log('fail', `Icon not found: ${icon.src}`);
			continue;
		}

		// Check file is actually a PNG (magic bytes)
		const buffer = fs.readFileSync(iconPath);
		const isPng =
			buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

		if (!isPng) {
			log('fail', `${icon.src} is not a valid PNG file`);
			continue;
		}

		// Extract dimensions from PNG IHDR chunk (bytes 16-23)
		// PNG structure: signature (8) + IHDR length (4) + "IHDR" (4) + width (4) + height (4)
		const width = buffer.readUInt32BE(16);
		const height = buffer.readUInt32BE(20);
		const actualSize = `${width}x${height}`;

		if (icon.sizes !== actualSize) {
			log('fail', `${icon.src} declares size ${icon.sizes} but actual size is ${actualSize}`);
		} else {
			log('pass', `${icon.src} exists and is ${actualSize}`);
			foundSizes.add(icon.sizes);
		}
	}

	for (const size of requiredSizes) {
		if (!foundSizes.has(size)) {
			log('fail', `Missing required icon size: ${size}`);
		}
	}
}

function checkServiceWorker() {
	console.log('\n⚙️  Checking service worker...\n');

	const swPath = path.join(ROOT, 'static', 'sw.js');

	if (!fs.existsSync(swPath)) {
		log('fail', 'sw.js not found in static/');
		return;
	}
	log('pass', 'sw.js exists');

	const content = fs.readFileSync(swPath, 'utf-8');

	// Check for fetch handler
	if (
		content.includes("addEventListener('fetch'") ||
		content.includes('addEventListener("fetch"')
	) {
		log('pass', 'Service worker has fetch event listener');
	} else {
		log('fail', 'Service worker MISSING fetch event listener (required for installability)');
	}

	// Check for install handler
	if (
		content.includes("addEventListener('install'") ||
		content.includes('addEventListener("install"')
	) {
		log('pass', 'Service worker has install event listener');
	} else {
		log('warn', 'Service worker missing install event listener');
	}

	// Check for activate handler
	if (
		content.includes("addEventListener('activate'") ||
		content.includes('addEventListener("activate"')
	) {
		log('pass', 'Service worker has activate event listener');
	} else {
		log('warn', 'Service worker missing activate event listener');
	}

	// Check for respondWith in fetch handler
	if (content.includes('respondWith')) {
		log('pass', 'Service worker fetch handler uses respondWith');
	} else {
		log('fail', 'Service worker fetch handler must call respondWith');
	}
}

function checkAppHtml() {
	console.log('\n📄 Checking app.html...\n');

	const htmlPath = path.join(ROOT, 'src', 'app.html');

	if (!fs.existsSync(htmlPath)) {
		log('fail', 'src/app.html not found');
		return;
	}

	const content = fs.readFileSync(htmlPath, 'utf-8');

	if (content.includes('rel="manifest"') && content.includes('manifest.webmanifest')) {
		log('pass', 'Manifest is linked in app.html');
	} else {
		log('fail', 'Manifest link missing in app.html');
	}

	if (content.includes('theme-color')) {
		log('pass', 'theme-color meta tag present');
	} else {
		log('warn', 'theme-color meta tag missing');
	}

	if (content.includes('apple-touch-icon')) {
		log('pass', 'apple-touch-icon link present');
	} else {
		log('warn', 'apple-touch-icon link missing (needed for iOS)');
	}
}

function checkBuildOutput() {
	console.log('\n📦 Checking build output...\n');

	const buildDir = path.join(ROOT, 'build');

	if (!fs.existsSync(buildDir)) {
		log('info', 'Build directory not found (run npm run build first)');
		return;
	}

	const requiredFiles = [
		'manifest.webmanifest',
		'sw.js',
		'icons/icon-192-2025-12-23.png',
		'icons/icon-512-2025-12-23.png',
		'200.html'
	];

	for (const file of requiredFiles) {
		const filePath = path.join(buildDir, file);
		if (fs.existsSync(filePath)) {
			log('pass', `build/${file} exists`);
		} else {
			log('fail', `build/${file} MISSING`);
		}
	}
}

function checkNetlifyConfig() {
	console.log('\n🌐 Checking Netlify configuration...\n');

	const tomlPath = path.join(ROOT, 'netlify.toml');

	if (!fs.existsSync(tomlPath)) {
		log('warn', 'netlify.toml not found (headers may not be optimal)');
		return;
	}
	log('pass', 'netlify.toml exists');

	const content = fs.readFileSync(tomlPath, 'utf-8');

	if (content.includes('manifest.webmanifest') && content.includes('application/manifest+json')) {
		log('pass', 'Manifest Content-Type header configured');
	} else {
		log('warn', 'Manifest Content-Type header not configured');
	}

	if (content.includes('sw.js') && content.includes('Cache-Control')) {
		log('pass', 'Service Worker Cache-Control header configured');
	} else {
		log('warn', 'Service Worker Cache-Control header not configured');
	}
}

// Run all checks
console.log('═══════════════════════════════════════════════════════════');
console.log('  PWA Installability Check for TimeTracker');
console.log('═══════════════════════════════════════════════════════════');

const manifest = checkManifest();
checkIcons(manifest);
checkServiceWorker();
checkAppHtml();
checkBuildOutput();
checkNetlifyConfig();

console.log('\n═══════════════════════════════════════════════════════════');
if (hasErrors) {
	console.log('❌ FAILED: Fix the errors above before deploying');
	process.exit(1);
} else if (hasWarnings) {
	console.log('⚠️  PASSED with warnings: PWA should be installable');
	process.exit(0);
} else {
	console.log('✅ PASSED: All PWA requirements met');
	process.exit(0);
}
