/**
 * Settings Store - Manages app preferences
 *
 * Provides:
 * - Category sort order preference
 * - Persistence in localStorage (offline-first)
 *
 * NOTE: Color theming is currently disabled while migrating to tt-design-system.
 * Future theming will be handled via CSS variables in the new design system.
 *
 * Usage:
 * - Import { categorySort, setCategorySort, initTheme } from '$lib/stores/theme'
 * - Call initTheme() on app startup
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type CategorySortValue = 'frequency' | 'alphabetical';

const CATEGORY_SORT_STORAGE_KEY = 'timetracker-category-sort';
const DEFAULT_CATEGORY_SORT: CategorySortValue = 'frequency';

/** Current category sort order store (TT-FR-008) */
export const categorySort = writable<CategorySortValue>(DEFAULT_CATEGORY_SORT);

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
 * Save category sort order to localStorage.
 */
function saveCategorySort(sortValue: CategorySortValue): void {
	if (!browser) return;
	localStorage.setItem(CATEGORY_SORT_STORAGE_KEY, sortValue);
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
 * Initialize settings on app startup.
 * Loads from localStorage.
 * Call this once in +layout.svelte onMount.
 */
export function initTheme(): void {
	const savedCategorySort = loadCategorySort();
	categorySort.set(savedCategorySort);

	// Always apply 'cool' theme (hardcoded until new design system is complete)
	if (browser) {
		document.documentElement.setAttribute('data-theme', 'cool');
	}
}
