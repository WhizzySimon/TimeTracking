/**
 * Date utility functions for TimeTracker
 *
 * Spec refs:
 * - ui-logic-spec-v1.md Section 2 (Navigation date display)
 * - ui-logic-spec-v1.md Section 4 (Week calculations)
 *
 * All functions use local time, not UTC.
 * ISO week: Monday is first day of week.
 */

export type Weekday =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday';

/**
 * Format a Date to string
 * @param date - Date to format
 * @param format - 'DE' for DD.MM.YYYY, 'ISO' for YYYY-MM-DD
 */
export function formatDate(date: Date, format: 'DE' | 'ISO' = 'DE'): string {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();

	if (format === 'ISO') {
		return `${year}-${month}-${day}`;
	}
	return `${day}.${month}.${year}`;
}

/**
 * Parse a date string to Date
 * Accepts DD.MM.YYYY or YYYY-MM-DD
 */
export function parseDate(str: string): Date | null {
	// Try DD.MM.YYYY
	const deMatch = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
	if (deMatch) {
		const [, day, month, year] = deMatch;
		const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		if (!isNaN(date.getTime())) {
			return date;
		}
	}

	// Try YYYY-MM-DD
	const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (isoMatch) {
		const [, year, month, day] = isoMatch;
		const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		if (!isNaN(date.getTime())) {
			return date;
		}
	}

	return null;
}

/**
 * Get the start (Monday) and end (Sunday) of the ISO week containing the given date
 */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);

	// Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
	const dayOfWeek = d.getDay();

	// Convert to ISO day (Monday = 0, Sunday = 6)
	const isoDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	// Calculate Monday (start of week)
	const start = new Date(d);
	start.setDate(d.getDate() - isoDay);

	// Calculate Sunday (end of week)
	const end = new Date(start);
	end.setDate(start.getDate() + 6);

	return { start, end };
}

/**
 * Get the weekday name for a date
 */
export function getDayOfWeek(date: Date): Weekday {
	const days: Weekday[] = [
		'sunday',
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday'
	];
	return days[date.getDay()];
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

/**
 * Check if a date is in the current ISO week
 */
export function isCurrentWeek(date: Date): boolean {
	const today = new Date();
	const todayBounds = getWeekBounds(today);
	const dateBounds = getWeekBounds(date);

	return todayBounds.start.getTime() === dateBounds.start.getTime();
}

/**
 * Get ISO week number for a date
 * ISO 8601: Week 1 is the week containing the first Thursday of the year
 */
export function getWeekNumber(date: Date): number {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);

	// Set to nearest Thursday (current date + 4 - current day number, making Sunday = 7)
	d.setDate(d.getDate() + 4 - (d.getDay() || 7));

	// Get first day of year
	const yearStart = new Date(d.getFullYear(), 0, 1);

	// Calculate full weeks to nearest Thursday
	const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

	return weekNo;
}

/**
 * Add days to a date (returns new Date)
 */
export function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Get all dates in a week (Monday to Sunday)
 */
export function getWeekDates(date: Date): Date[] {
	const { start } = getWeekBounds(date);
	const dates: Date[] = [];

	for (let i = 0; i < 7; i++) {
		dates.push(addDays(start, i));
	}

	return dates;
}

/**
 * Format a date as short weekday + date (e.g., "Mo 18.03")
 */
export function formatShortDate(date: Date): string {
	const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');

	return `${weekdays[date.getDay()]} ${day}.${month}`;
}

/**
 * Get start of day (00:00:00.000)
 */
export function startOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}

/**
 * Get end of day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
	const result = new Date(date);
	result.setHours(23, 59, 59, 999);
	return result;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

/**
 * Format time as HH:mm
 */
export function formatTime(date: Date): string {
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}`;
}

/**
 * Parse time string (HH:mm) and apply to a date
 */
export function parseTime(timeStr: string, baseDate: Date): Date | null {
	const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return null;

	const hours = parseInt(match[1]);
	const minutes = parseInt(match[2]);

	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
		return null;
	}

	const result = new Date(baseDate);
	result.setHours(hours, minutes, 0, 0);
	return result;
}
