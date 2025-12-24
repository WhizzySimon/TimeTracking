/**
 * Frequency utilities for Quick-Start UX.
 * Calculates category usage frequency for sorting and Quick-Start buttons.
 * Spec refs: TT-FR-001 to TT-FR-005, TT-IG-001 to TT-IG-004
 */

import type { Category, TimeEntry } from '$lib/types';

/** System category IDs to exclude from frequency calculations */
const SYSTEM_CATEGORY_IDS = ['system-pause', 'system-urlaub', 'system-krank', 'system-feiertag'];

/** Smart Suggestions constants */
const SLOT_HOURS = 2; // 2-hour time slots (12 per day)
const CONTEXT_MULTIPLIER = 1000; // Context matches dominate over total frequency

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

/**
 * Get the time slot index for a given hour.
 * Uses 2-hour slots (0-11).
 *
 * @param hours - Hour of the day (0-23)
 * @returns Slot index (0-11)
 */
export function getTimeSlot(hours: number): number {
	return Math.floor(hours / SLOT_HOURS);
}

/**
 * Get top N categories using smart context-aware suggestions.
 * Prioritizes categories used at the same weekday and time slot.
 * Falls back to total frequency if no context matches.
 *
 * Algorithm:
 * 1. Find entries with adaptive lookback (extends until enough data found)
 * 2. For each category, calculate:
 *    - contextMatches: entries with same weekday AND same 2h time slot
 *    - totalFrequency: total entries in lookback period
 * 3. Score = contextMatches * 1000 + totalFrequency
 * 4. Sort by score descending, alphabetical tiebreaker
 *
 * Adaptive lookback:
 * - Starts at 30 days, extends by 30 days up to 365 days max
 * - Stops extending when at least 20 days with entries are found
 *
 * @param n - Number of top categories to return
 * @param entries - All time entries to analyze
 * @param categories - All available categories
 * @param now - Current date/time (for testing, defaults to new Date())
 * @param initialDays - Initial number of days to look back (default: 30)
 * @returns Array of categories sorted by smart score (most relevant first)
 */
export function getSmartTopCategories(
	n: number,
	entries: TimeEntry[],
	categories: Category[],
	now: Date = new Date(),
	initialDays: number = 30
): Category[] {
	const MIN_DAYS_WITH_ENTRIES = 20; // Target: at least 20 days with entries
	const MAX_LOOKBACK_DAYS = 3650; // Look back up to 10 years to find enough data
	const LOOKBACK_INCREMENT = 90; // Extend by 90 days each iteration (faster for old data)

	// 1. Find entries with adaptive lookback
	let days = initialDays;
	let recentEntries: TimeEntry[] = [];
	let daysWithEntries = 0;

	while (days <= MAX_LOOKBACK_DAYS) {
		const cutoffDate = new Date(now);
		cutoffDate.setDate(cutoffDate.getDate() - days);
		cutoffDate.setHours(0, 0, 0, 0);
		const cutoffStr = cutoffDate.toISOString().split('T')[0];

		recentEntries = entries.filter(
			(e) => e.date >= cutoffStr && !SYSTEM_CATEGORY_IDS.includes(e.categoryId)
		);

		// Count unique days with entries
		const uniqueDays = new Set(recentEntries.map((e) => e.date));
		daysWithEntries = uniqueDays.size;

		// Stop if we have enough data or reached max lookback
		if (daysWithEntries >= MIN_DAYS_WITH_ENTRIES || days >= MAX_LOOKBACK_DAYS) {
			break;
		}

		days += LOOKBACK_INCREMENT;
	}

	// If not enough data (less than MIN_DAYS_WITH_ENTRIES), return empty
	// This ensures we only show suggestions when we have statistically meaningful data
	if (daysWithEntries < MIN_DAYS_WITH_ENTRIES) {
		return [];
	}

	// 2. Get current context
	const currentWeekday = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
	const currentSlot = getTimeSlot(now.getHours()); // 0-11

	// 3. Calculate scores for each category
	const scores = new Map<string, { score: number; name: string }>();

	for (const category of categories) {
		if (category.type === 'system') continue;

		const categoryEntries = recentEntries.filter((e) => e.categoryId === category.id);
		const totalFrequency = categoryEntries.length;

		if (totalFrequency === 0) continue;

		// Count context matches: same weekday AND same time slot
		const contextMatches = categoryEntries.filter((e) => {
			// Parse entry date to get weekday
			const [year, month, day] = e.date.split('-').map(Number);
			const entryDate = new Date(year, month - 1, day);
			const entryWeekday = entryDate.getDay();

			// Parse start time to get slot
			const [hours] = e.startTime.split(':').map(Number);
			const entrySlot = getTimeSlot(hours);

			return entryWeekday === currentWeekday && entrySlot === currentSlot;
		}).length;

		// Context-first scoring: context matches dominate
		const score = contextMatches * CONTEXT_MULTIPLIER + totalFrequency;

		scores.set(category.id, { score, name: category.name });
	}

	// 4. Sort by score descending, alphabetical tiebreaker
	const sortedIds = [...scores.entries()]
		.sort((a, b) => {
			const scoreDiff = b[1].score - a[1].score;
			if (scoreDiff !== 0) return scoreDiff;
			return a[1].name.localeCompare(b[1].name, 'de');
		})
		.slice(0, n)
		.map(([id]) => id);

	// 5. Return categories in sorted order
	return sortedIds
		.map((id) => categories.find((c) => c.id === id))
		.filter((c): c is Category => c !== undefined);
}
