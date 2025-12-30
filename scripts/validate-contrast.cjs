#!/usr/bin/env node
/**
 * Contrast Ratio Validation Script
 *
 * Validates that all color combinations in theme.css meet WCAG AA standards (4.5:1 for text).
 * Spec: ui-improvements.md UI-FR-021, UI-IG-004
 */

const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(rgb) {
	const { r, g, b } = rgb;
	const [rs, gs, bs] = [r, g, b].map((c) => {
		c = c / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
function getContrastRatio(color1, color2) {
	const lum1 = getLuminance(hexToRgb(color1));
	const lum2 = getLuminance(hexToRgb(color2));
	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);
	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract color values from CSS custom properties
 */
function extractColors(cssContent) {
	const colors = {};
	const regex = /--([a-z-]+):\s*#([0-9a-f]{6})/gi;
	let match;

	while ((match = regex.exec(cssContent)) !== null) {
		colors[match[1]] = `#${match[2]}`;
	}

	return colors;
}

/**
 * Validate contrast ratios
 */
function validateContrasts() {
	const themePath = join(__dirname, '..', 'src', 'lib', 'styles', 'theme.css');
	const cssContent = readFileSync(themePath, 'utf-8');
	const colors = extractColors(cssContent);

	console.log('🎨 Validating contrast ratios...\n');

	// Define text/background pairs to check
	const pairs = [
		{ fg: 'text', bg: 'bg', name: 'Body text on background' },
		{ fg: 'text', bg: 'surface', name: 'Text on surface' },
		{ fg: 'btn-primary-text', bg: 'btn-primary-bg', name: 'Primary button text' },
		{ fg: 'input-text', bg: 'input-bg', name: 'Input text' },
		{ fg: 'accent', bg: 'bg', name: 'Accent on background' },
		{ fg: 'accent', bg: 'surface', name: 'Accent on surface' }
	];

	let allPass = true;
	const results = [];

	for (const pair of pairs) {
		const fgColor = colors[pair.fg];
		const bgColor = colors[pair.bg];

		if (!fgColor || !bgColor) {
			console.log(`⚠️  Missing color: ${pair.fg} or ${pair.bg}`);
			continue;
		}

		const ratio = getContrastRatio(fgColor, bgColor);
		const passes = ratio >= 4.5;

		results.push({
			name: pair.name,
			fg: fgColor,
			bg: bgColor,
			ratio: ratio.toFixed(2),
			passes
		});

		if (!passes) {
			allPass = false;
		}
	}

	// Print results
	console.log('Contrast Ratio Results:');
	console.log('─'.repeat(80));
	console.log(
		`${'Pair'.padEnd(35)} ${'Foreground'.padEnd(10)} ${'Background'.padEnd(10)} ${'Ratio'.padEnd(8)} Status`
	);
	console.log('─'.repeat(80));

	for (const result of results) {
		const status = result.passes ? '✅ PASS' : '❌ FAIL';
		console.log(
			`${result.name.padEnd(35)} ${result.fg.padEnd(10)} ${result.bg.padEnd(10)} ${result.ratio.padEnd(8)} ${status}`
		);
	}

	console.log('─'.repeat(80));
	console.log(
		`\nWCAG AA Standard: 4.5:1 minimum for normal text\nResult: ${allPass ? '✅ All checks passed' : '❌ Some checks failed'}\n`
	);

	process.exit(allPass ? 0 : 1);
}

validateContrasts();
