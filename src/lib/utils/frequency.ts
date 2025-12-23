/**
 * Frequency utilities for Quick-Start UX.
 * Calculates category usage frequency for sorting and Quick-Start buttons.
 * Spec refs: TT-FR-001 to TT-FR-005, TT-IG-001 to TT-IG-004
 */

import type { Category, TimeEntry } from '$lib/types';

/** System category IDs to exclude from frequency calculations */
const SYSTEM_CATEGORY_IDS = ['system-pause', 'system-urlaub', 'system-krank', 'system-feiertag'];

/**
 * Calculate category usage frequency from time entries.
 * Only counts entries from the specified number of days.
 * Excludes system categories.
 *
 * @param entries - All time entries to analyze
 * @param days - Number of days to look back (default: 30)
 * @returns Map of categoryId to usage count
 */
export function getCategoryFrequency(entries: TimeEntry[], days: number = 30): Map<string, number> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - days);
	cutoffDate.setHours(0, 0, 0, 0);
	const cutoffStr = cutoffDate.toISOString().split('T')[0];

	const frequency = new Map<string, number>();

	for (const entry of entries) {
		// Skip entries older than cutoff
		if (entry.date < cutoffStr) {
			continue;
		}

		// Skip system categories
		if (SYSTEM_CATEGORY_IDS.includes(entry.categoryId)) {
			continue;
		}

		const count = frequency.get(entry.categoryId) || 0;
		frequency.set(entry.categoryId, count + 1);
	}

	return frequency;
}

/**
 * Get top N categories sorted by frequency.
 * Excludes system categories.
 * Uses alphabetical order as tiebreaker for equal counts.
 *
 * @param n - Number of top categories to return
 * @param entries - All time entries to analyze
 * @param categories - All available categories (for name lookup)
 * @param days - Number of days to look back (default: 30)
 * @returns Array of categories sorted by frequency (most used first)
 */
export function getTopCategories(
	n: number,
	entries: TimeEntry[],
	categories: Category[],
	days: number = 30
): Category[] {
	const frequency = getCategoryFrequency(entries, days);

	// Filter to only user categories that have been used
	const userCategories = categories.filter((cat) => cat.type === 'user' && frequency.has(cat.id));

	// Sort by frequency (descending), then alphabetically (ascending) as tiebreaker
	userCategories.sort((a, b) => {
		const countA = frequency.get(a.id) || 0;
		const countB = frequency.get(b.id) || 0;

		if (countB !== countA) {
			return countB - countA; // Higher count first
		}

		// Tiebreaker: alphabetical by name
		return a.name.localeCompare(b.name, 'de');
	});

	return userCategories.slice(0, n);
}

/**
 * Sort categories by frequency for dropdown display.
 * System categories are excluded from frequency sorting and placed at the end.
 * Unused categories (count=0) appear after used categories, sorted alphabetically.
 *
 * @param categories - All available categories
 * @param entries - All time entries to analyze
 * @param days - Number of days to look back (default: 30)
 * @returns Array of all categories sorted by frequency
 */
export function sortCategoriesByFrequency(
	categories: Category[],
	entries: TimeEntry[],
	days: number = 30
): Category[] {
	const frequency = getCategoryFrequency(entries, days);

	// Separate system and user categories
	const systemCategories = categories.filter((cat) => cat.type === 'system');
	const userCategories = categories.filter((cat) => cat.type === 'user');

	// Sort user categories by frequency, then alphabetically
	userCategories.sort((a, b) => {
		const countA = frequency.get(a.id) || 0;
		const countB = frequency.get(b.id) || 0;

		if (countB !== countA) {
			return countB - countA; // Higher count first
		}

		// Tiebreaker: alphabetical by name
		return a.name.localeCompare(b.name, 'de');
	});

	// User categories first (sorted by frequency), then system categories (sorted alphabetically)
	systemCategories.sort((a, b) => a.name.localeCompare(b.name, 'de'));

	return [...userCategories, ...systemCategories];
}
