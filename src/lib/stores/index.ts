/**
 * Svelte stores for TimeTracker global state.
 * Provides reactive state management for the app.
 * Spec refs: Plan section 3.1 (UI State Model)
 */

import { writable, derived } from 'svelte/store';
import type { Category, TimeEntry, WorkTimeModel, SyncStatus, WeekBounds } from '$lib/types';

/**
 * Get ISO week bounds (Monday to Sunday) for a given date.
 */
function getWeekBounds(date: Date): WeekBounds {
	const d = new Date(date);
	const day = d.getDay();
	// Adjust to Monday (day 0 = Sunday, so we need special handling)
	const diffToMonday = day === 0 ? -6 : 1 - day;
	const monday = new Date(d);
	monday.setDate(d.getDate() + diffToMonday);
	monday.setHours(0, 0, 0, 0);

	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	sunday.setHours(23, 59, 59, 999);

	return { start: monday, end: sunday };
}

// ============================================================================
// Global Writable Stores
// ============================================================================

/** All categories (system + user) */
export const categories = writable<Category[]>([]);

/** All time entries (filtered per view as needed) */
export const timeEntries = writable<TimeEntry[]>([]);

/** All work time models */
export const workTimeModels = writable<WorkTimeModel[]>([]);

/** Current sync status for outbox indicator */
export const syncStatus = writable<SyncStatus>('synced');

/** Network connectivity status */
export const isOnline = writable<boolean>(true);

/** Cloud sync in progress flag */
export const syncInProgress = writable<boolean>(false);

/** Currently selected date for Day tab */
export const currentDate = writable<Date>(new Date());

// ============================================================================
// Derived Stores
// ============================================================================

/** Current week bounds derived from currentDate */
export const currentWeek = derived<typeof currentDate, WeekBounds>(currentDate, ($currentDate) =>
	getWeekBounds($currentDate)
);

/**
 * Running entry (task with no end time).
 * Used for warning banner per ui-logic-spec-v1 section 3.1
 */
export const runningEntry = derived<typeof timeEntries, TimeEntry | null>(
	timeEntries,
	($timeEntries) => $timeEntries.find((entry) => entry.endTime === null) ?? null
);

/**
 * Time entries for the currently selected date.
 * Sorted newest first (by startTime descending).
 */
export const activeDayEntries = derived<[typeof timeEntries, typeof currentDate], TimeEntry[]>(
	[timeEntries, currentDate],
	([$timeEntries, $currentDate]) => {
		const dateStr = $currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
		return $timeEntries
			.filter((entry) => entry.date === dateStr)
			.sort((a, b) => b.startTime.localeCompare(a.startTime));
	}
);

/**
 * Time entries for the current week.
 */
export const activeWeekEntries = derived<[typeof timeEntries, typeof currentWeek], TimeEntry[]>(
	[timeEntries, currentWeek],
	([$timeEntries, $currentWeek]) => {
		const startStr = $currentWeek.start.toISOString().split('T')[0];
		const endStr = $currentWeek.end.toISOString().split('T')[0];
		return $timeEntries.filter((entry) => entry.date >= startStr && entry.date <= endStr);
	}
);

/**
 * Active work time model for the current date.
 * Returns the latest model where validFrom <= currentDate.
 */
export const activeWorkTimeModel = derived<
	[typeof workTimeModels, typeof currentDate],
	WorkTimeModel | null
>([workTimeModels, currentDate], ([$workTimeModels, $currentDate]) => {
	const dateStr = $currentDate.toISOString().split('T')[0];
	const validModels = $workTimeModels
		.filter((model) => model.validFrom <= dateStr)
		.sort((a, b) => b.validFrom.localeCompare(a.validFrom));
	return validModels[0] ?? null;
});
