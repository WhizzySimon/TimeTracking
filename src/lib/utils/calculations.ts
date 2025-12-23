/**
 * Calculation utility functions for TimeTracker
 *
 * Spec refs:
 * - ui-logic-spec-v1.md Section 10 (Berechnungslogik)
 *
 * Ist-Zeit: Sum of entries where category.countsAsWorkTime === true
 * Soll-Zeit: model[weekday] if dayType === 'arbeitstag', else 0
 * Saldo: Ist - Soll
 */

import type { Category, DayTypeValue, TimeEntry, WorkTimeModel } from '$lib/types';
import { getDayOfWeek, type Weekday } from './date';

/**
 * Calculate duration between two times in hours (decimal)
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format (null for running tasks)
 * @returns Duration in hours (decimal), or 0 if endTime is null
 */
export function calculateDuration(startTime: string, endTime: string | null): number {
	if (endTime === null) {
		return 0;
	}

	const startMinutes = parseTimeToMinutes(startTime);
	const endMinutes = parseTimeToMinutes(endTime);

	if (startMinutes === null || endMinutes === null) {
		return 0;
	}

	// Handle case where end is before start (invalid)
	if (endMinutes < startMinutes) {
		return 0;
	}

	const durationMinutes = endMinutes - startMinutes;
	return durationMinutes / 60;
}

/**
 * Parse HH:mm time string to minutes since midnight
 */
function parseTimeToMinutes(timeStr: string): number | null {
	const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return null;

	const hours = parseInt(match[1]);
	const minutes = parseInt(match[2]);

	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
		return null;
	}

	return hours * 60 + minutes;
}

/**
 * Calculate Ist (actual work time) from time entries
 * Only counts entries where the category has countsAsWorkTime === true
 *
 * @param entries - Time entries to sum
 * @param categories - All categories (to look up countsAsWorkTime)
 * @returns Total work hours (decimal)
 */
export function calculateIst(entries: TimeEntry[], categories: Category[]): number {
	const categoryMap = new Map(categories.map((c) => [c.id, c]));

	let totalHours = 0;

	for (const entry of entries) {
		// Skip running tasks (no end time)
		if (entry.endTime === null) {
			continue;
		}

		const category = categoryMap.get(entry.categoryId);

		// Only count if category exists and countsAsWorkTime is true
		if (category?.countsAsWorkTime) {
			totalHours += calculateDuration(entry.startTime, entry.endTime);
		}
	}

	return totalHours;
}

/**
 * Calculate Soll (target work time) for a specific date
 *
 * Rules (from ui-logic-spec-v1.md Section 10):
 * - If dayType === 'arbeitstag': Soll = model[weekday]
 * - Otherwise: Soll = 0
 *
 * @param date - The date to calculate Soll for
 * @param dayType - The day type (arbeitstag, urlaub, krank, feiertag)
 * @param model - The active work time model (or null if none)
 * @returns Target hours for the day
 */
export function calculateSoll(
	date: Date,
	dayType: DayTypeValue,
	model: WorkTimeModel | null
): number {
	// Non-work days have Soll = 0
	if (dayType !== 'arbeitstag') {
		return 0;
	}

	// No model means Soll = 0
	if (model === null) {
		return 0;
	}

	const weekday = getDayOfWeek(date);
	const hours = getModelHoursForWeekday(model, weekday);

	// null means day is inactive in model
	return hours ?? 0;
}

/**
 * Get hours from work time model for a specific weekday
 */
function getModelHoursForWeekday(model: WorkTimeModel, weekday: Weekday): number | null {
	switch (weekday) {
		case 'monday':
			return model.monday;
		case 'tuesday':
			return model.tuesday;
		case 'wednesday':
			return model.wednesday;
		case 'thursday':
			return model.thursday;
		case 'friday':
			return model.friday;
		case 'saturday':
			return model.saturday;
		case 'sunday':
			return model.sunday;
	}
}

/**
 * Check if a weekday is marked as a workday in the model.
 * Uses the explicit isWorkday flag if set, otherwise falls back to hours > 0 for backwards compatibility.
 */
export function isWeekdayWorkday(model: WorkTimeModel, weekday: Weekday): boolean {
	switch (weekday) {
		case 'monday':
			return model.mondayIsWorkday ?? (model.monday !== null && model.monday > 0);
		case 'tuesday':
			return model.tuesdayIsWorkday ?? (model.tuesday !== null && model.tuesday > 0);
		case 'wednesday':
			return model.wednesdayIsWorkday ?? (model.wednesday !== null && model.wednesday > 0);
		case 'thursday':
			return model.thursdayIsWorkday ?? (model.thursday !== null && model.thursday > 0);
		case 'friday':
			return model.fridayIsWorkday ?? (model.friday !== null && model.friday > 0);
		case 'saturday':
			return model.saturdayIsWorkday ?? (model.saturday !== null && model.saturday > 0);
		case 'sunday':
			return model.sundayIsWorkday ?? (model.sunday !== null && model.sunday > 0);
	}
}

/**
 * Count active workdays in a work time model
 */
export function countWorkdays(model: WorkTimeModel): number {
	const weekdays: Weekday[] = [
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday',
		'sunday'
	];
	return weekdays.filter((day) => isWeekdayWorkday(model, day)).length;
}

/**
 * Calculate Saldo (balance)
 * Saldo = Ist - Soll
 *
 * @param ist - Actual hours worked
 * @param soll - Target hours
 * @returns Balance (positive = overtime, negative = undertime)
 */
export function calculateSaldo(ist: number, soll: number): number {
	return ist - soll;
}

/**
 * Format hours as German string with comma decimal separator
 * Example: 8.5 -> "8,5"
 *
 * @param hours - Hours as decimal number
 * @param includeSign - Whether to include + sign for positive values
 * @returns Formatted string like "8,5" or "+8,5" or "−8,5"
 */
export function formatHours(hours: number, includeSign: boolean = false): string {
	// Round to 1 decimal place
	const rounded = Math.round(hours * 10) / 10;

	// Format with German decimal separator (comma)
	const formatted = rounded.toFixed(1).replace('.', ',');

	// Add sign if requested
	if (includeSign) {
		if (rounded > 0) {
			return `+${formatted}`;
		} else if (rounded < 0) {
			// Use proper minus sign (−) instead of hyphen (-)
			return `−${Math.abs(rounded).toFixed(1).replace('.', ',')}`;
		}
	}

	// For negative numbers without explicit sign request, still use proper minus
	if (rounded < 0) {
		return `−${Math.abs(rounded).toFixed(1).replace('.', ',')}`;
	}

	return formatted;
}

/**
 * Calculate weekly totals from a work time model
 * @param model - Work time model
 * @returns Sum of all active days' hours
 */
export function calculateWeeklyTotal(model: WorkTimeModel): number {
	const days: (number | null)[] = [
		model.monday,
		model.tuesday,
		model.wednesday,
		model.thursday,
		model.friday,
		model.saturday,
		model.sunday
	];

	return days.reduce<number>((sum, hours) => sum + (hours ?? 0), 0);
}
