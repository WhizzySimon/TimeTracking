/**
 * Unit tests for calculation utility functions
 *
 * Spec refs:
 * - ui-logic-spec-v1.md Section 10 (Berechnungslogik)
 */

import { describe, it, expect } from 'vitest';
import {
	calculateDuration,
	calculateIst,
	calculateSoll,
	calculateSaldo,
	formatHours,
	calculateWeeklyTotal
} from './calculations';
import type { Category, TimeEntry, WorkTimeModel } from '$lib/types';

describe('calculateDuration', () => {
	it('calculates duration between two times', () => {
		expect(calculateDuration('08:00', '12:00')).toBe(4);
		expect(calculateDuration('09:30', '17:00')).toBe(7.5);
		expect(calculateDuration('08:00', '08:30')).toBe(0.5);
	});

	it('returns 0 for null end time (running task)', () => {
		expect(calculateDuration('08:00', null)).toBe(0);
	});

	it('returns 0 for invalid time formats', () => {
		expect(calculateDuration('invalid', '12:00')).toBe(0);
		expect(calculateDuration('08:00', 'invalid')).toBe(0);
		expect(calculateDuration('25:00', '12:00')).toBe(0);
		expect(calculateDuration('08:00', '12:60')).toBe(0);
	});

	it('returns 0 when end is before start', () => {
		expect(calculateDuration('12:00', '08:00')).toBe(0);
	});

	it('handles same start and end time', () => {
		expect(calculateDuration('08:00', '08:00')).toBe(0);
	});

	it('handles single-digit hours', () => {
		expect(calculateDuration('8:00', '9:30')).toBe(1.5);
	});
});

describe('calculateIst', () => {
	const workCategory: Category = {
		id: 'work-1',
		name: 'Development',
		type: 'user',
		countsAsWorkTime: true,
		createdAt: Date.now()
	};

	const pauseCategory: Category = {
		id: 'pause-1',
		name: 'Pause',
		type: 'system',
		countsAsWorkTime: false,
		createdAt: Date.now()
	};

	const categories = [workCategory, pauseCategory];

	it('sums work time entries only', () => {
		const entries: TimeEntry[] = [
			{
				id: '1',
				date: '2025-01-15',
				categoryId: 'work-1',
				startTime: '08:00',
				endTime: '12:00',
				description: null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			},
			{
				id: '2',
				date: '2025-01-15',
				categoryId: 'work-1',
				startTime: '13:00',
				endTime: '17:00',
				description: null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			}
		];

		expect(calculateIst(entries, categories)).toBe(8);
	});

	it('excludes non-work categories', () => {
		const entries: TimeEntry[] = [
			{
				id: '1',
				date: '2025-01-15',
				categoryId: 'work-1',
				startTime: '08:00',
				endTime: '12:00',
				description: null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			},
			{
				id: '2',
				date: '2025-01-15',
				categoryId: 'pause-1',
				startTime: '12:00',
				endTime: '13:00',
				description: null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			}
		];

		expect(calculateIst(entries, categories)).toBe(4);
	});

	it('excludes running tasks (null end time)', () => {
		const entries: TimeEntry[] = [
			{
				id: '1',
				date: '2025-01-15',
				categoryId: 'work-1',
				startTime: '08:00',
				endTime: '12:00',
				description: null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			},
			{
				id: '2',
				date: '2025-01-15',
				categoryId: 'work-1',
				startTime: '13:00',
				endTime: null,
				description: null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			}
		];

		expect(calculateIst(entries, categories)).toBe(4);
	});

	it('returns 0 for empty entries', () => {
		expect(calculateIst([], categories)).toBe(0);
	});

	it('handles unknown category gracefully', () => {
		const entries: TimeEntry[] = [
			{
				id: '1',
				date: '2025-01-15',
				categoryId: 'unknown-category',
				startTime: '08:00',
				endTime: '12:00',
				description: null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			}
		];

		expect(calculateIst(entries, categories)).toBe(0);
	});
});

describe('calculateSoll', () => {
	const model: WorkTimeModel = {
		id: 'model-1',
		name: 'Standard 40h',
		validFrom: '2025-01-01',
		monday: 8,
		tuesday: 8,
		wednesday: 8,
		thursday: 8,
		friday: 8,
		saturday: null,
		sunday: null,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};

	it('returns model hours for arbeitstag', () => {
		// Monday, January 13, 2025
		const monday = new Date(2025, 0, 13);
		expect(calculateSoll(monday, 'arbeitstag', model)).toBe(8);

		// Friday, January 17, 2025
		const friday = new Date(2025, 0, 17);
		expect(calculateSoll(friday, 'arbeitstag', model)).toBe(8);
	});

	it('returns 0 for inactive days in model', () => {
		// Saturday, January 18, 2025
		const saturday = new Date(2025, 0, 18);
		expect(calculateSoll(saturday, 'arbeitstag', model)).toBe(0);

		// Sunday, January 19, 2025
		const sunday = new Date(2025, 0, 19);
		expect(calculateSoll(sunday, 'arbeitstag', model)).toBe(0);
	});

	it('returns 0 for non-arbeitstag day types', () => {
		const monday = new Date(2025, 0, 13);
		expect(calculateSoll(monday, 'urlaub', model)).toBe(0);
		expect(calculateSoll(monday, 'krank', model)).toBe(0);
		expect(calculateSoll(monday, 'feiertag', model)).toBe(0);
	});

	it('returns 0 when no model provided', () => {
		const monday = new Date(2025, 0, 13);
		expect(calculateSoll(monday, 'arbeitstag', null)).toBe(0);
	});

	it('handles part-time model', () => {
		const partTimeModel: WorkTimeModel = {
			id: 'model-2',
			name: 'Part-time 12h',
			validFrom: '2025-01-01',
			monday: 4,
			tuesday: 4,
			wednesday: 4,
			thursday: null,
			friday: null,
			saturday: null,
			sunday: null,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		const monday = new Date(2025, 0, 13);
		expect(calculateSoll(monday, 'arbeitstag', partTimeModel)).toBe(4);

		const thursday = new Date(2025, 0, 16);
		expect(calculateSoll(thursday, 'arbeitstag', partTimeModel)).toBe(0);
	});
});

describe('calculateSaldo', () => {
	it('calculates positive saldo (overtime)', () => {
		expect(calculateSaldo(10, 8)).toBe(2);
	});

	it('calculates negative saldo (undertime)', () => {
		expect(calculateSaldo(6, 8)).toBe(-2);
	});

	it('calculates zero saldo (exact)', () => {
		expect(calculateSaldo(8, 8)).toBe(0);
	});

	it('handles decimal values', () => {
		expect(calculateSaldo(8.5, 8)).toBe(0.5);
		expect(calculateSaldo(7.5, 8)).toBe(-0.5);
	});
});

describe('formatHours', () => {
	it('formats hours with German decimal separator', () => {
		expect(formatHours(8)).toBe('8,0');
		expect(formatHours(8.5)).toBe('8,5');
		expect(formatHours(0)).toBe('0,0');
	});

	it('rounds to one decimal place', () => {
		expect(formatHours(8.25)).toBe('8,3');
		expect(formatHours(8.24)).toBe('8,2');
		expect(formatHours(8.15)).toBe('8,2');
	});

	it('formats negative values with proper minus sign', () => {
		expect(formatHours(-4)).toBe('−4,0');
		expect(formatHours(-2.5)).toBe('−2,5');
	});

	it('includes sign when requested', () => {
		expect(formatHours(4, true)).toBe('+4,0');
		expect(formatHours(-4, true)).toBe('−4,0');
		expect(formatHours(0, true)).toBe('0,0');
	});
});

describe('calculateWeeklyTotal', () => {
	it('sums all active days', () => {
		const model: WorkTimeModel = {
			id: 'model-1',
			name: 'Standard 40h',
			validFrom: '2025-01-01',
			monday: 8,
			tuesday: 8,
			wednesday: 8,
			thursday: 8,
			friday: 8,
			saturday: null,
			sunday: null,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		expect(calculateWeeklyTotal(model)).toBe(40);
	});

	it('handles part-time models', () => {
		const model: WorkTimeModel = {
			id: 'model-2',
			name: 'Part-time 12h',
			validFrom: '2025-01-01',
			monday: 4,
			tuesday: 4,
			wednesday: 4,
			thursday: null,
			friday: null,
			saturday: null,
			sunday: null,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		expect(calculateWeeklyTotal(model)).toBe(12);
	});

	it('handles model with all days inactive', () => {
		const model: WorkTimeModel = {
			id: 'model-3',
			name: 'All inactive',
			validFrom: '2025-01-01',
			monday: null,
			tuesday: null,
			wednesday: null,
			thursday: null,
			friday: null,
			saturday: null,
			sunday: null,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		expect(calculateWeeklyTotal(model)).toBe(0);
	});

	it('handles weekend work', () => {
		const model: WorkTimeModel = {
			id: 'model-4',
			name: 'Weekend 48h',
			validFrom: '2025-01-01',
			monday: 8,
			tuesday: 8,
			wednesday: 8,
			thursday: 8,
			friday: 8,
			saturday: 4,
			sunday: 4,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		expect(calculateWeeklyTotal(model)).toBe(48);
	});
});
