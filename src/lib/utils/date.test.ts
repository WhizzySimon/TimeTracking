/**
 * Unit tests for date utility functions
 */

import { describe, it, expect } from 'vitest';
import {
	formatDate,
	parseDate,
	getWeekBounds,
	getDayOfWeek,
	isToday,
	isCurrentWeek,
	getWeekNumber,
	addDays,
	getWeekDates,
	formatShortDate,
	startOfDay,
	endOfDay,
	isSameDay,
	formatTime,
	parseTime
} from './date';

describe('formatDate', () => {
	it('formats date in German format (DD.MM.YYYY)', () => {
		const date = new Date(2025, 2, 18); // March 18, 2025
		expect(formatDate(date, 'DE')).toBe('18.03.2025');
	});

	it('formats date in ISO format (YYYY-MM-DD)', () => {
		const date = new Date(2025, 2, 18);
		expect(formatDate(date, 'ISO')).toBe('2025-03-18');
	});

	it('defaults to German format', () => {
		const date = new Date(2025, 0, 5); // January 5, 2025
		expect(formatDate(date)).toBe('05.01.2025');
	});
});

describe('parseDate', () => {
	it('parses German format (DD.MM.YYYY)', () => {
		const result = parseDate('18.03.2025');
		expect(result).not.toBeNull();
		expect(result!.getDate()).toBe(18);
		expect(result!.getMonth()).toBe(2); // March = 2
		expect(result!.getFullYear()).toBe(2025);
	});

	it('parses ISO format (YYYY-MM-DD)', () => {
		const result = parseDate('2025-03-18');
		expect(result).not.toBeNull();
		expect(result!.getDate()).toBe(18);
		expect(result!.getMonth()).toBe(2);
		expect(result!.getFullYear()).toBe(2025);
	});

	it('returns null for invalid format', () => {
		expect(parseDate('invalid')).toBeNull();
		expect(parseDate('2025/03/18')).toBeNull();
		expect(parseDate('18-03-2025')).toBeNull();
	});
});

describe('getWeekBounds', () => {
	it('returns Monday to Sunday for a Wednesday', () => {
		const wednesday = new Date(2025, 2, 19); // Wednesday, March 19, 2025
		const { start, end } = getWeekBounds(wednesday);

		expect(start.getDay()).toBe(1); // Monday
		expect(start.getDate()).toBe(17);
		expect(end.getDay()).toBe(0); // Sunday
		expect(end.getDate()).toBe(23);
	});

	it('returns same week for Monday', () => {
		const monday = new Date(2025, 2, 17); // Monday, March 17, 2025
		const { start, end } = getWeekBounds(monday);

		expect(start.getDate()).toBe(17);
		expect(end.getDate()).toBe(23);
	});

	it('returns same week for Sunday', () => {
		const sunday = new Date(2025, 2, 23); // Sunday, March 23, 2025
		const { start, end } = getWeekBounds(sunday);

		expect(start.getDate()).toBe(17);
		expect(end.getDate()).toBe(23);
	});
});

describe('getDayOfWeek', () => {
	it('returns correct weekday names', () => {
		expect(getDayOfWeek(new Date(2025, 2, 17))).toBe('monday');
		expect(getDayOfWeek(new Date(2025, 2, 18))).toBe('tuesday');
		expect(getDayOfWeek(new Date(2025, 2, 19))).toBe('wednesday');
		expect(getDayOfWeek(new Date(2025, 2, 20))).toBe('thursday');
		expect(getDayOfWeek(new Date(2025, 2, 21))).toBe('friday');
		expect(getDayOfWeek(new Date(2025, 2, 22))).toBe('saturday');
		expect(getDayOfWeek(new Date(2025, 2, 23))).toBe('sunday');
	});
});

describe('isToday', () => {
	it('returns true for today', () => {
		expect(isToday(new Date())).toBe(true);
	});

	it('returns false for yesterday', () => {
		const yesterday = addDays(new Date(), -1);
		expect(isToday(yesterday)).toBe(false);
	});

	it('returns false for tomorrow', () => {
		const tomorrow = addDays(new Date(), 1);
		expect(isToday(tomorrow)).toBe(false);
	});
});

describe('isCurrentWeek', () => {
	it('returns true for today', () => {
		expect(isCurrentWeek(new Date())).toBe(true);
	});

	it('returns false for date 2 weeks ago', () => {
		const twoWeeksAgo = addDays(new Date(), -14);
		expect(isCurrentWeek(twoWeeksAgo)).toBe(false);
	});
});

describe('getWeekNumber', () => {
	it('returns correct ISO week number', () => {
		// Week 1 of 2025 starts on Monday, December 30, 2024
		expect(getWeekNumber(new Date(2025, 0, 1))).toBe(1); // Jan 1, 2025 is week 1
		expect(getWeekNumber(new Date(2025, 0, 6))).toBe(2); // Jan 6, 2025 is week 2
	});
});

describe('addDays', () => {
	it('adds positive days', () => {
		const date = new Date(2025, 2, 18);
		const result = addDays(date, 5);
		expect(result.getDate()).toBe(23);
	});

	it('subtracts with negative days', () => {
		const date = new Date(2025, 2, 18);
		const result = addDays(date, -5);
		expect(result.getDate()).toBe(13);
	});

	it('does not mutate original date', () => {
		const date = new Date(2025, 2, 18);
		addDays(date, 5);
		expect(date.getDate()).toBe(18);
	});
});

describe('getWeekDates', () => {
	it('returns 7 dates starting from Monday', () => {
		const date = new Date(2025, 2, 19); // Wednesday
		const dates = getWeekDates(date);

		expect(dates).toHaveLength(7);
		expect(dates[0].getDay()).toBe(1); // Monday
		expect(dates[6].getDay()).toBe(0); // Sunday
	});
});

describe('formatShortDate', () => {
	it('formats as weekday + date', () => {
		const monday = new Date(2025, 2, 17);
		expect(formatShortDate(monday)).toBe('Mo 17.03');

		const friday = new Date(2025, 2, 21);
		expect(formatShortDate(friday)).toBe('Fr 21.03');
	});
});

describe('startOfDay', () => {
	it('sets time to 00:00:00.000', () => {
		const date = new Date(2025, 2, 18, 14, 30, 45, 123);
		const result = startOfDay(date);

		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
		expect(result.getMilliseconds()).toBe(0);
	});
});

describe('endOfDay', () => {
	it('sets time to 23:59:59.999', () => {
		const date = new Date(2025, 2, 18, 14, 30, 45, 123);
		const result = endOfDay(date);

		expect(result.getHours()).toBe(23);
		expect(result.getMinutes()).toBe(59);
		expect(result.getSeconds()).toBe(59);
		expect(result.getMilliseconds()).toBe(999);
	});
});

describe('isSameDay', () => {
	it('returns true for same day different times', () => {
		const date1 = new Date(2025, 2, 18, 10, 0);
		const date2 = new Date(2025, 2, 18, 22, 30);
		expect(isSameDay(date1, date2)).toBe(true);
	});

	it('returns false for different days', () => {
		const date1 = new Date(2025, 2, 18);
		const date2 = new Date(2025, 2, 19);
		expect(isSameDay(date1, date2)).toBe(false);
	});
});

describe('formatTime', () => {
	it('formats time as HH:mm', () => {
		const date = new Date(2025, 2, 18, 9, 5);
		expect(formatTime(date)).toBe('09:05');

		const date2 = new Date(2025, 2, 18, 14, 30);
		expect(formatTime(date2)).toBe('14:30');
	});
});

describe('parseTime', () => {
	it('parses valid time string', () => {
		const baseDate = new Date(2025, 2, 18);
		const result = parseTime('14:30', baseDate);

		expect(result).not.toBeNull();
		expect(result!.getHours()).toBe(14);
		expect(result!.getMinutes()).toBe(30);
		expect(result!.getDate()).toBe(18);
	});

	it('parses single-digit hour', () => {
		const baseDate = new Date(2025, 2, 18);
		const result = parseTime('9:05', baseDate);

		expect(result).not.toBeNull();
		expect(result!.getHours()).toBe(9);
		expect(result!.getMinutes()).toBe(5);
	});

	it('returns null for invalid format', () => {
		const baseDate = new Date(2025, 2, 18);
		expect(parseTime('invalid', baseDate)).toBeNull();
		expect(parseTime('25:00', baseDate)).toBeNull();
		expect(parseTime('12:60', baseDate)).toBeNull();
	});
});
