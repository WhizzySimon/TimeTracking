/**
 * Theme Store - Manages app theme and shape selection
 *
 * Provides:
 * - Color theme: Cool (blue) or Warm (orange)
 * - Shape style: Sharp (angular) or Soft (rounded)
 * - Persistence in localStorage (offline-first)
 * - Reactive state for both settings
 * - Apply to document on change
 *
 * Usage:
 * - Import { theme, shape, setTheme, setShape, initTheme } from '$lib/stores/theme'
 * - Call initTheme() on app startup
 * - Use setTheme('cool'/'warm') and setShape('sharp'/'soft') to change
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeValue = 'cool' | 'warm';
export type ShapeValue = 'sharp' | 'soft';

const THEME_STORAGE_KEY = 'timetracker-theme';
const SHAPE_STORAGE_KEY = 'timetracker-shape';
const DEFAULT_THEME: ThemeValue = 'cool';
const DEFAULT_SHAPE: ShapeValue = 'soft';

/** Current color theme store */
export const theme = writable<ThemeValue>(DEFAULT_THEME);

/** Current shape style store */
export const shape = writable<ShapeValue>(DEFAULT_SHAPE);

/**
 * Apply theme to document element.
 * Sets data-theme attribute on <html>.
 */
function applyTheme(themeValue: ThemeValue): void {
	if (!browser) return;
	document.documentElement.setAttribute('data-theme', themeValue);
}

/**
 * Apply shape style to document element.
 * Sets data-shape attribute on <html>.
 */
function applyShape(shapeValue: ShapeValue): void {
	if (!browser) return;
	document.documentElement.setAttribute('data-shape', shapeValue);
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
 * Load shape from localStorage.
 * Returns default if not set or invalid.
 */
function loadShape(): ShapeValue {
	if (!browser) return DEFAULT_SHAPE;

	const stored = localStorage.getItem(SHAPE_STORAGE_KEY);
	if (stored === 'sharp' || stored === 'soft') {
		return stored;
	}
	return DEFAULT_SHAPE;
}

/**
 * Save theme to localStorage.
 */
function saveTheme(themeValue: ThemeValue): void {
	if (!browser) return;
	localStorage.setItem(THEME_STORAGE_KEY, themeValue);
}

/**
 * Save shape to localStorage.
 */
function saveShape(shapeValue: ShapeValue): void {
	if (!browser) return;
	localStorage.setItem(SHAPE_STORAGE_KEY, shapeValue);
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
 * Set shape and persist to localStorage.
 * Applies immediately to document.
 */
export function setShape(shapeValue: ShapeValue): void {
	shape.set(shapeValue);
	saveShape(shapeValue);
	applyShape(shapeValue);
}

/**
 * Initialize theme and shape on app startup.
 * Loads from localStorage and applies to document.
 * Call this once in +layout.svelte onMount.
 */
export function initTheme(): void {
	const savedTheme = loadTheme();
	const savedShape = loadShape();
	theme.set(savedTheme);
	shape.set(savedShape);
	applyTheme(savedTheme);
	applyShape(savedShape);
}

/**
 * Get current theme value (non-reactive).
 */
export function getCurrentTheme(): ThemeValue {
	return loadTheme();
}

/**
 * Get current shape value (non-reactive).
 */
export function getCurrentShape(): ShapeValue {
	return loadShape();
}
