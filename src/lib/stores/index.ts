/**
 * Svelte stores for TimeTracker global state.
 * Provides reactive state management for the app.
 * Spec refs: Plan section 3.1 (UI State Model)
 */

import { writable, derived } from 'svelte/store';
import type {
	Category,
	TimeEntry,
	WorkTimeModel,
	SyncStatus,
	WeekBounds,
	Employer,
	DayType
} from '$lib/types';

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

/** All employers (Arbeitgeber) */
export const employers = writable<Employer[]>([]);

/** All day types (affects Soll calculation) */
export const dayTypes = writable<DayType[]>([]);

/** Currently selected employer ID (null = show all employers) */
export const selectedEmployerId = writable<string | null>(null);

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
 * All running entries (tasks with no end time), sorted by createdAt ascending (oldest first).
 * Used for warning banner per running-task-banner spec TT-FR-104
 */
export const runningEntries = derived<typeof timeEntries, TimeEntry[]>(
	timeEntries,
	($timeEntries) =>
		$timeEntries.filter((entry) => entry.endTime === null).sort((a, b) => a.createdAt - b.createdAt)
);

/**
 * Oldest running entry (task with no end time).
 * Used for warning banner per running-task-banner spec TT-FR-104
 */
export const runningEntry = derived<typeof runningEntries, TimeEntry | null>(
	runningEntries,
	($runningEntries) => $runningEntries[0] ?? null
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

// ============================================================================
// Employer-Filtered Derived Stores (AG-FR-030, AG-FR-040)
// ============================================================================

/**
 * Filter helper: returns true if item should be visible for the selected employer.
 * STRICT MODE (AG-FR-060): No null/undefined fallback.
 * - If selectedEmployerId is null (Alle): show all items
 * - If selectedEmployerId is set: show ONLY items where employerId === selectedId
 */
function matchesEmployerFilter(
	itemEmployerId: string | null | undefined,
	selectedId: string | null
): boolean {
	if (selectedId === null) return true;
	return itemEmployerId === selectedId;
}

/**
 * Time entries filtered by selected employer.
 * Items with employerId === null are visible in all employers.
 */
export const filteredEntries = derived<
	[typeof timeEntries, typeof selectedEmployerId],
	TimeEntry[]
>([timeEntries, selectedEmployerId], ([$timeEntries, $selectedEmployerId]) =>
	$timeEntries.filter((entry) => matchesEmployerFilter(entry.employerId, $selectedEmployerId))
);

/**
 * Categories filtered by selected employer.
 * Items with employerId === null are visible in all employers.
 */
export const filteredCategories = derived<
	[typeof categories, typeof selectedEmployerId],
	Category[]
>([categories, selectedEmployerId], ([$categories, $selectedEmployerId]) =>
	$categories.filter((category) => matchesEmployerFilter(category.employerId, $selectedEmployerId))
);

/**
 * Work time models filtered by selected employer.
 * STRICT: Only shows models where employerId === selectedId.
 */
export const filteredModels = derived<
	[typeof workTimeModels, typeof selectedEmployerId],
	WorkTimeModel[]
>([workTimeModels, selectedEmployerId], ([$workTimeModels, $selectedEmployerId]) =>
	$workTimeModels.filter((model) => matchesEmployerFilter(model.employerId, $selectedEmployerId))
);

/**
 * Day types filtered by selected employer.
 * STRICT: Only shows dayTypes where employerId === selectedId.
 */
export const filteredDayTypes = derived<[typeof dayTypes, typeof selectedEmployerId], DayType[]>(
	[dayTypes, selectedEmployerId],
	([$dayTypes, $selectedEmployerId]) =>
		$dayTypes.filter((dayType) => matchesEmployerFilter(dayType.employerId, $selectedEmployerId))
);

/**
 * Active employers only (not soft-deleted).
 */
export const activeEmployers = derived<typeof employers, Employer[]>(employers, ($employers) =>
	$employers.filter((employer) => employer.isActive)
);

/**
 * Active work time model filtered by selected employer.
 * Returns the latest model where validFrom <= currentDate and matches employer filter.
 */
export const filteredActiveWorkTimeModel = derived<
	[typeof filteredModels, typeof currentDate],
	WorkTimeModel | null
>([filteredModels, currentDate], ([$filteredModels, $currentDate]) => {
	const dateStr = $currentDate.toISOString().split('T')[0];
	const validModels = $filteredModels
		.filter((model) => model.validFrom <= dateStr)
		.sort((a, b) => b.validFrom.localeCompare(a.validFrom));
	return validModels[0] ?? null;
});

/**
 * Running entries filtered by selected employer.
 */
export const filteredRunningEntries = derived<typeof filteredEntries, TimeEntry[]>(
	filteredEntries,
	($filteredEntries) =>
		$filteredEntries
			.filter((entry) => entry.endTime === null)
			.sort((a, b) => a.createdAt - b.createdAt)
);

/**
 * Oldest running entry for selected employer.
 */
export const filteredRunningEntry = derived<typeof filteredRunningEntries, TimeEntry | null>(
	filteredRunningEntries,
	($filteredRunningEntries) => $filteredRunningEntries[0] ?? null
);
