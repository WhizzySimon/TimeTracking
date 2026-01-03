/**
 * Color Scheme Store
 * 
 * Manages the app's color scheme with 3 options:
 * 1. Current (Styleguide labeled) - #2526a9 / #37bdf6
 * 2. Icon-based (Originally requested) - #374CA7 / #37BDF6
 * 3. Displayed (What actually shows) - #2330A3 / #66BDF1
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ColorSchemeName = 'current' | 'icon' | 'displayed';

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

// Define the 3 color schemes
// Based on user's table:
// - Style Guide displayed (angezeigt): Primary #2330A3, Secondary #66BDF1
// - Style Guide labeled: Primary #2526a9, Secondary #37bdf6
// - Icon (Original): Primary #374CA7, Secondary #37BDF6
export const COLOR_SCHEMES: Record<ColorSchemeName, ColorScheme> = {
	current: generateScheme('current', 'Style Guide angezeigt', '#2330A3', '#66BDF1'),
	icon: generateScheme('icon', 'Icon-Farben (Original)', '#374CA7', '#37BDF6'),
	displayed: generateScheme('displayed', 'Style Guide labeled', '#2526a9', '#37bdf6')
};

// Get initial scheme from localStorage or default to 'current'
function getInitialScheme(): ColorSchemeName {
	if (browser) {
		const stored = localStorage.getItem('tt-color-scheme');
		if (stored && stored in COLOR_SCHEMES) {
			return stored as ColorSchemeName;
		}
	}
	return 'current';
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
// This triggers CSS rules in tt-design-system-v2.css
function applyScheme(schemeName: ColorSchemeName) {
	if (!browser) return;
	document.documentElement.setAttribute('data-color-scheme', schemeName);
}

export const colorScheme = createColorSchemeStore();
