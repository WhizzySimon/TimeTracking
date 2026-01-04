/**
 * Color Scheme Store
 *
 * Manages the app's color scheme using generic identifiers (scheme-1, scheme-2, etc.)
 * This allows UI display names/labels to change independently without breaking the system.
 *
 * Current schemes:
 * - scheme-1: Original (#374CA7) - #374CA7 / #37BDF6
 * - scheme-2: Mittel (#2330A3) - #2330A3 / #66BDF1
 * - scheme-3: Kräftig (#2526a9) - #2526a9 / #37bdf6
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ColorSchemeName = 'scheme-1' | 'scheme-2' | 'scheme-3';

export interface ColorScheme {
	name: ColorSchemeName;
	label: string;
	primary: string;
	secondary: string;
	// Derived primary colors
	primary50: string;
	primary100: string;
	primary200: string;
	primary300: string;
	primaryDarker: string;
	primaryDarkest: string;
	primaryFaded: string;
	primaryPressed: string;
	// Derived secondary/accent colors
	accent50: string;
	accent100: string;
	accent200: string;
	accentDarker: string;
	accentDarkest: string;
	accentFaded: string;
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: { r: 0, g: 0, b: 0 };
}

// Helper to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
}

// Helper to lighten a color
function lighten(hex: string, amount: number): string {
	const { r, g, b } = hexToRgb(hex);
	return rgbToHex(
		Math.min(255, r + (255 - r) * amount),
		Math.min(255, g + (255 - g) * amount),
		Math.min(255, b + (255 - b) * amount)
	);
}

// Helper to darken a color
function darken(hex: string, amount: number): string {
	const { r, g, b } = hexToRgb(hex);
	return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

// Generate a full color scheme from primary and secondary base colors
function generateScheme(
	name: ColorSchemeName,
	label: string,
	primary: string,
	secondary: string
): ColorScheme {
	const { r: pr, g: pg, b: pb } = hexToRgb(primary);

	return {
		name,
		label,
		primary,
		secondary,
		// Primary variants
		primary50: lighten(primary, 0.9),
		primary100: lighten(primary, 0.75),
		primary200: lighten(primary, 0.55),
		primary300: lighten(primary, 0.35),
		primaryDarker: darken(primary, 0.2),
		primaryDarkest: darken(primary, 0.4),
		primaryFaded: `rgba(${pr}, ${pg}, ${pb}, 0.1)`,
		primaryPressed: lighten(primary, 0.25),
		// Secondary/accent variants
		accent50: lighten(secondary, 0.9),
		accent100: lighten(secondary, 0.7),
		accent200: lighten(secondary, 0.45),
		accentDarker: darken(secondary, 0.15),
		accentDarkest: darken(secondary, 0.35),
		accentFaded: `rgba(${hexToRgb(secondary).r}, ${hexToRgb(secondary).g}, ${hexToRgb(secondary).b}, 0.1)`
	};
}

// Define the 3 color schemes with generic identifiers
// Labels can be changed in UI without breaking the system
export const COLOR_SCHEMES: Record<ColorSchemeName, ColorScheme> = {
	'scheme-1': generateScheme('scheme-1', 'Original (#374CA7)', '#374CA7', '#37BDF6'),
	'scheme-2': generateScheme('scheme-2', 'Mittel (#2330A3)', '#2330A3', '#66BDF1'),
	'scheme-3': generateScheme('scheme-3', 'Kräftig (#2526a9)', '#2526a9', '#37bdf6')
};

// Get initial scheme from localStorage or default to 'current'
function getInitialScheme(): ColorSchemeName {
	if (browser) {
		const stored = localStorage.getItem('tt-color-scheme');
		if (stored && stored in COLOR_SCHEMES) {
			return stored as ColorSchemeName;
		}
	}
	return 'scheme-2'; // Default to Mittel
}

// Create the store
function createColorSchemeStore() {
	const { subscribe, set } = writable<ColorSchemeName>(getInitialScheme());

	return {
		subscribe,
		set: (scheme: ColorSchemeName) => {
			if (browser) {
				localStorage.setItem('tt-color-scheme', scheme);
			}
			set(scheme);
			applyScheme(scheme);
		},
		init: () => {
			const scheme = getInitialScheme();
			applyScheme(scheme);
		}
	};
}

// Apply color scheme via data attribute on <html>
// This triggers CSS rules in tt-design-system.css
function applyScheme(schemeName: ColorSchemeName) {
	if (!browser) return;
	document.documentElement.setAttribute('data-color-scheme', schemeName);
}

export const colorScheme = createColorSchemeStore();
