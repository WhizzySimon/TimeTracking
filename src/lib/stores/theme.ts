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

/** Available color themes - add new themes here */
export const THEME_OPTIONS = [
	{ value: 'cool', label: 'Cool' },
	{ value: 'warm', label: 'Warm' }
] as const;

export type ThemeValue = (typeof THEME_OPTIONS)[number]['value'];
export type ShapeValue = 'sharp' | 'soft';
export type CategorySortValue = 'frequency' | 'alphabetical';

const THEME_STORAGE_KEY = 'timetracker-theme';
const SHAPE_STORAGE_KEY = 'timetracker-shape';
const CATEGORY_SORT_STORAGE_KEY = 'timetracker-category-sort';
const DEFAULT_THEME: ThemeValue = 'cool';
const DEFAULT_SHAPE: ShapeValue = 'sharp';
const DEFAULT_CATEGORY_SORT: CategorySortValue = 'frequency';

/** Current color theme store */
export const theme = writable<ThemeValue>(DEFAULT_THEME);

/** Current shape style store */
export const shape = writable<ShapeValue>(DEFAULT_SHAPE);

/** Current category sort order store (TT-FR-008) */
export const categorySort = writable<CategorySortValue>(DEFAULT_CATEGORY_SORT);

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
	const validThemes = THEME_OPTIONS.map((t) => t.value) as readonly string[];
	if (stored && validThemes.includes(stored)) {
		return stored as ThemeValue;
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
 * Load category sort order from localStorage.
 * Returns default if not set or invalid.
 */
function loadCategorySort(): CategorySortValue {
	if (!browser) return DEFAULT_CATEGORY_SORT;

	const stored = localStorage.getItem(CATEGORY_SORT_STORAGE_KEY);
	if (stored === 'frequency' || stored === 'alphabetical') {
		return stored;
	}
	return DEFAULT_CATEGORY_SORT;
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
 * Save category sort order to localStorage.
 */
function saveCategorySort(sortValue: CategorySortValue): void {
	if (!browser) return;
	localStorage.setItem(CATEGORY_SORT_STORAGE_KEY, sortValue);
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
 * Set category sort order and persist to localStorage.
 * TT-FR-008: Toggle between alphabetical and frequency sorting.
 */
export function setCategorySort(sortValue: CategorySortValue): void {
	categorySort.set(sortValue);
	saveCategorySort(sortValue);
}

/**
 * Initialize theme, shape, and category sort on app startup.
 * Loads from localStorage and applies to document.
 * Call this once in +layout.svelte onMount.
 */
export function initTheme(): void {
	const savedTheme = loadTheme();
	const savedShape = loadShape();
	const savedCategorySort = loadCategorySort();
	theme.set(savedTheme);
	shape.set(savedShape);
	categorySort.set(savedCategorySort);
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
