/**
 * Theme Store - Manages app theme selection
 *
 * Provides:
 * - Theme persistence in localStorage (offline-first)
 * - Reactive theme state
 * - Apply theme to document on change
 *
 * Usage:
 * - Import { theme, setTheme, initTheme } from '$lib/stores/theme'
 * - Call initTheme() on app startup
 * - Use setTheme('cool') or setTheme('warm') to change theme
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeValue = 'cool' | 'warm';

const THEME_STORAGE_KEY = 'timetracker-theme';
const DEFAULT_THEME: ThemeValue = 'cool';

/** Current theme store */
export const theme = writable<ThemeValue>(DEFAULT_THEME);

/**
 * Apply theme to document element.
 * Sets data-theme attribute on <html>.
 */
function applyTheme(themeValue: ThemeValue): void {
	if (!browser) return;
	document.documentElement.setAttribute('data-theme', themeValue);
}

/**
 * Load theme from localStorage.
 * Returns default if not set or invalid.
 */
function loadTheme(): ThemeValue {
	if (!browser) return DEFAULT_THEME;

	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === 'cool' || stored === 'warm') {
		return stored;
	}
	return DEFAULT_THEME;
}

/**
 * Save theme to localStorage.
 */
function saveTheme(themeValue: ThemeValue): void {
	if (!browser) return;
	localStorage.setItem(THEME_STORAGE_KEY, themeValue);
}

/**
 * Set theme and persist to localStorage.
 * Applies immediately to document.
 */
export function setTheme(themeValue: ThemeValue): void {
	theme.set(themeValue);
	saveTheme(themeValue);
	applyTheme(themeValue);
}

/**
 * Initialize theme on app startup.
 * Loads from localStorage and applies to document.
 * Call this once in +layout.svelte onMount.
 */
export function initTheme(): void {
	const savedTheme = loadTheme();
	theme.set(savedTheme);
	applyTheme(savedTheme);
}

/**
 * Get current theme value (non-reactive).
 * Useful for one-time reads.
 */
export function getCurrentTheme(): ThemeValue {
	return loadTheme();
}
