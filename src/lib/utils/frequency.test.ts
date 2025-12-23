/**
 * Unit tests for frequency utilities.
 * Spec refs: TT-FR-001 to TT-FR-005, TT-IG-001 to TT-IG-004
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
	getCategoryFrequency,
	getTopCategories,
	sortCategoriesByFrequency,
	getTimeSlot,
	getSmartTopCategories
} from './frequency';
import type { Category, TimeEntry } from '$lib/types';

// Mock current date for consistent tests
const MOCK_NOW = new Date('2025-12-23T12:00:00Z');

describe('getCategoryFrequency', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(MOCK_NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns empty map for empty entries', () => {
		const result = getCategoryFrequency([]);
		expect(result.size).toBe(0);
	});

	it('counts entries per category', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-1', '2025-12-20'),
			createEntry('cat-1', '2025-12-21'),
			createEntry('cat-2', '2025-12-22')
		];

		const result = getCategoryFrequency(entries);

		expect(result.get('cat-1')).toBe(2);
		expect(result.get('cat-2')).toBe(1);
	});

	it('excludes entries older than specified days', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-1', '2025-12-20'), // Within 30 days
			createEntry('cat-1', '2025-11-01'), // Older than 30 days
			createEntry('cat-2', '2025-10-01') // Much older
		];

		const result = getCategoryFrequency(entries, 30);

		expect(result.get('cat-1')).toBe(1);
		expect(result.has('cat-2')).toBe(false);
	});

	it('excludes system categories', () => {
		const entries: TimeEntry[] = [
			createEntry('system-pause', '2025-12-20'),
			createEntry('system-urlaub', '2025-12-21'),
			createEntry('system-krank', '2025-12-22'),
			createEntry('system-feiertag', '2025-12-23'),
			createEntry('user-cat', '2025-12-20')
		];

		const result = getCategoryFrequency(entries);

		expect(result.has('system-pause')).toBe(false);
		expect(result.has('system-urlaub')).toBe(false);
		expect(result.has('system-krank')).toBe(false);
		expect(result.has('system-feiertag')).toBe(false);
		expect(result.get('user-cat')).toBe(1);
	});

	it('respects custom days parameter', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-1', '2025-12-22'), // Within 7 days
			createEntry('cat-1', '2025-12-10') // Older than 7 days
		];

		const result = getCategoryFrequency(entries, 7);

		expect(result.get('cat-1')).toBe(1);
	});
});

describe('getTopCategories', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(MOCK_NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const categories: Category[] = [
		createCategory('cat-a', 'Alpha', 'user'),
		createCategory('cat-b', 'Beta', 'user'),
		createCategory('cat-c', 'Charlie', 'user'),
		createCategory('cat-d', 'Delta', 'user'),
		createCategory('cat-e', 'Echo', 'user'),
		createCategory('cat-f', 'Foxtrot', 'user'),
		createCategory('system-pause', 'Pause', 'system'),
		createCategory('system-urlaub', 'Urlaub', 'system')
	];

	it('returns empty array for no entries', () => {
		const result = getTopCategories(5, [], categories);
		expect(result).toEqual([]);
	});

	it('returns top N categories by frequency', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-a', '2025-12-20'),
			createEntry('cat-b', '2025-12-20'),
			createEntry('cat-b', '2025-12-21'),
			createEntry('cat-c', '2025-12-20'),
			createEntry('cat-c', '2025-12-21'),
			createEntry('cat-c', '2025-12-22')
		];

		const result = getTopCategories(2, entries, categories);

		expect(result.length).toBe(2);
		expect(result[0].id).toBe('cat-c'); // 3 entries
		expect(result[1].id).toBe('cat-b'); // 2 entries
	});

	it('returns fewer than N if not enough categories used', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-a', '2025-12-20'),
			createEntry('cat-b', '2025-12-21')
		];

		const result = getTopCategories(5, entries, categories);

		expect(result.length).toBe(2);
	});

	it('excludes system categories from results', () => {
		const entries: TimeEntry[] = [
			createEntry('system-pause', '2025-12-20'),
			createEntry('system-pause', '2025-12-21'),
			createEntry('system-pause', '2025-12-22'),
			createEntry('cat-a', '2025-12-20')
		];

		const result = getTopCategories(5, entries, categories);

		expect(result.length).toBe(1);
		expect(result[0].id).toBe('cat-a');
	});

	it('uses alphabetical order as tiebreaker', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-c', '2025-12-20'), // Charlie
			createEntry('cat-a', '2025-12-20'), // Alpha
			createEntry('cat-b', '2025-12-20') // Beta
		];

		const result = getTopCategories(3, entries, categories);

		// All have count=1, should be sorted alphabetically
		expect(result[0].name).toBe('Alpha');
		expect(result[1].name).toBe('Beta');
		expect(result[2].name).toBe('Charlie');
	});

	it('combines frequency and alphabetical sorting correctly', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-c', '2025-12-20'),
			createEntry('cat-c', '2025-12-21'), // Charlie: 2
			createEntry('cat-a', '2025-12-20'), // Alpha: 1
			createEntry('cat-b', '2025-12-20') // Beta: 1
		];

		const result = getTopCategories(3, entries, categories);

		expect(result[0].name).toBe('Charlie'); // Highest count
		expect(result[1].name).toBe('Alpha'); // Tied, alphabetically first
		expect(result[2].name).toBe('Beta'); // Tied, alphabetically second
	});

	it('only includes categories that exist in the categories array', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-a', '2025-12-20'),
			createEntry('deleted-cat', '2025-12-20') // Category no longer exists
		];

		const result = getTopCategories(5, entries, categories);

		expect(result.length).toBe(1);
		expect(result[0].id).toBe('cat-a');
	});
});

describe('sortCategoriesByFrequency', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(MOCK_NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const categories: Category[] = [
		createCategory('cat-a', 'Alpha', 'user'),
		createCategory('cat-b', 'Beta', 'user'),
		createCategory('cat-c', 'Charlie', 'user'),
		createCategory('system-pause', 'Pause', 'system'),
		createCategory('system-urlaub', 'Urlaub', 'system')
	];

	it('places user categories before system categories', () => {
		const entries: TimeEntry[] = [createEntry('cat-a', '2025-12-20')];

		const result = sortCategoriesByFrequency(categories, entries);

		// User categories first
		const userCats = result.filter((c) => c.type === 'user');
		const systemCats = result.filter((c) => c.type === 'system');

		expect(result.indexOf(userCats[0])).toBeLessThan(result.indexOf(systemCats[0]));
	});

	it('sorts user categories by frequency', () => {
		const entries: TimeEntry[] = [
			createEntry('cat-c', '2025-12-20'),
			createEntry('cat-c', '2025-12-21'),
			createEntry('cat-a', '2025-12-20')
		];

		const result = sortCategoriesByFrequency(categories, entries);
		const userCats = result.filter((c) => c.type === 'user');

		expect(userCats[0].id).toBe('cat-c'); // 2 entries
		expect(userCats[1].id).toBe('cat-a'); // 1 entry
		expect(userCats[2].id).toBe('cat-b'); // 0 entries
	});

	it('places unused categories at the end of user categories', () => {
		const entries: TimeEntry[] = [createEntry('cat-a', '2025-12-20')];

		const result = sortCategoriesByFrequency(categories, entries);
		const userCats = result.filter((c) => c.type === 'user');

		expect(userCats[0].id).toBe('cat-a'); // Used
		// Unused categories sorted alphabetically
		expect(userCats[1].name).toBe('Beta');
		expect(userCats[2].name).toBe('Charlie');
	});

	it('sorts system categories alphabetically', () => {
		const result = sortCategoriesByFrequency(categories, []);
		const systemCats = result.filter((c) => c.type === 'system');

		expect(systemCats[0].name).toBe('Pause');
		expect(systemCats[1].name).toBe('Urlaub');
	});

	it('returns all categories even with no entries', () => {
		const result = sortCategoriesByFrequency(categories, []);

		expect(result.length).toBe(categories.length);
	});
});

describe('getTimeSlot', () => {
	it('returns correct slot for each 2-hour period', () => {
		expect(getTimeSlot(0)).toBe(0); // 00:00-02:00
		expect(getTimeSlot(1)).toBe(0);
		expect(getTimeSlot(2)).toBe(1); // 02:00-04:00
		expect(getTimeSlot(3)).toBe(1);
		expect(getTimeSlot(8)).toBe(4); // 08:00-10:00
		expect(getTimeSlot(9)).toBe(4);
		expect(getTimeSlot(10)).toBe(5); // 10:00-12:00
		expect(getTimeSlot(12)).toBe(6); // 12:00-14:00
		expect(getTimeSlot(22)).toBe(11); // 22:00-24:00
		expect(getTimeSlot(23)).toBe(11);
	});
});

describe('getSmartTopCategories', () => {
	const categories: Category[] = [
		createCategory('cat-a', 'Alpha', 'user'),
		createCategory('cat-b', 'Beta', 'user'),
		createCategory('cat-c', 'Charlie', 'user'),
		createCategory('cat-d', 'Delta', 'user'),
		createCategory('cat-e', 'Echo', 'user'),
		createCategory('system-pause', 'Pause', 'system')
	];

	it('returns empty array for no entries', () => {
		const now = new Date('2025-12-23T09:00:00');
		const result = getSmartTopCategories(5, [], categories, now);
		expect(result).toEqual([]);
	});

	it('prioritizes context matches over total frequency', () => {
		// Tuesday 09:15 - slot 4 (08:00-10:00), weekday 2
		const now = new Date('2025-12-23T09:15:00'); // Tuesday

		const entries: TimeEntry[] = [
			// cat-a: 1 context match (Tuesday 09:00), 2 total
			createEntryWithTime('cat-a', '2025-12-23', '09:00'), // Context match!
			createEntryWithTime('cat-a', '2025-12-20', '14:00'), // Different day/time

			// cat-b: 0 context matches, 5 total (higher frequency but no context)
			createEntryWithTime('cat-b', '2025-12-22', '09:00'), // Monday, not Tuesday
			createEntryWithTime('cat-b', '2025-12-21', '09:00'),
			createEntryWithTime('cat-b', '2025-12-20', '09:00'),
			createEntryWithTime('cat-b', '2025-12-19', '09:00'),
			createEntryWithTime('cat-b', '2025-12-18', '09:00')
		];

		const result = getSmartTopCategories(2, entries, categories, now);

		// cat-a should be first (1 context match = 1000 + 2 = 1002)
		// cat-b should be second (0 context matches = 0 + 5 = 5)
		expect(result[0].id).toBe('cat-a');
		expect(result[1].id).toBe('cat-b');
	});

	it('falls back to total frequency when no context matches', () => {
		// Monday 14:00 - slot 7, weekday 1
		const now = new Date('2025-12-22T14:00:00'); // Monday

		const entries: TimeEntry[] = [
			// All entries are on different days/times (no context matches)
			createEntryWithTime('cat-c', '2025-12-21', '09:00'), // Sunday
			createEntryWithTime('cat-c', '2025-12-21', '10:00'),
			createEntryWithTime('cat-c', '2025-12-21', '11:00'), // 3 total

			createEntryWithTime('cat-a', '2025-12-20', '09:00'), // Saturday
			createEntryWithTime('cat-a', '2025-12-20', '10:00') // 2 total
		];

		const result = getSmartTopCategories(2, entries, categories, now);

		// No context matches, so sort by total frequency
		expect(result[0].id).toBe('cat-c'); // 3 entries
		expect(result[1].id).toBe('cat-a'); // 2 entries
	});

	it('uses alphabetical tiebreaker for equal scores', () => {
		const now = new Date('2025-12-23T09:00:00'); // Tuesday

		const entries: TimeEntry[] = [
			// All same context (Tuesday 09:00), 1 entry each
			createEntryWithTime('cat-c', '2025-12-23', '09:00'), // Charlie
			createEntryWithTime('cat-a', '2025-12-23', '09:00'), // Alpha
			createEntryWithTime('cat-b', '2025-12-23', '09:00') // Beta
		];

		const result = getSmartTopCategories(3, entries, categories, now);

		// All have score 1001 (1 context match + 1 total), alphabetical order
		expect(result[0].name).toBe('Alpha');
		expect(result[1].name).toBe('Beta');
		expect(result[2].name).toBe('Charlie');
	});

	it('excludes system categories', () => {
		const now = new Date('2025-12-23T09:00:00');

		const entries: TimeEntry[] = [
			createEntryWithTime('system-pause', '2025-12-23', '09:00'),
			createEntryWithTime('system-pause', '2025-12-23', '09:30'),
			createEntryWithTime('cat-a', '2025-12-23', '09:00')
		];

		const result = getSmartTopCategories(5, entries, categories, now);

		expect(result.length).toBe(1);
		expect(result[0].id).toBe('cat-a');
	});

	it('excludes entries older than max lookback period (365 days)', () => {
		const now = new Date('2025-12-23T09:00:00');

		// Create enough recent entries so adaptive lookback doesn't need to extend
		const entries: TimeEntry[] = [];
		// Add 25 days of entries for cat-a (more than MIN_DAYS_WITH_ENTRIES=20)
		for (let i = 0; i < 25; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			entries.push(createEntryWithTime('cat-a', date.toISOString().split('T')[0], '09:00'));
		}
		// Add entry older than 365 days for cat-b
		entries.push(createEntryWithTime('cat-b', '2024-01-01', '09:00'));

		const result = getSmartTopCategories(5, entries, categories, now);

		// cat-b should be excluded (older than max lookback)
		expect(result.length).toBe(1);
		expect(result[0].id).toBe('cat-a');
	});

	it('returns at most N categories', () => {
		const now = new Date('2025-12-23T09:00:00');

		const entries: TimeEntry[] = [
			createEntryWithTime('cat-a', '2025-12-23', '09:00'),
			createEntryWithTime('cat-b', '2025-12-23', '09:00'),
			createEntryWithTime('cat-c', '2025-12-23', '09:00'),
			createEntryWithTime('cat-d', '2025-12-23', '09:00'),
			createEntryWithTime('cat-e', '2025-12-23', '09:00')
		];

		const result = getSmartTopCategories(3, entries, categories, now);

		expect(result.length).toBe(3);
	});

	it('handles Sunday correctly (weekday 0)', () => {
		// Sunday 10:30 - slot 5 (10:00-12:00), weekday 0
		const now = new Date('2025-12-21T10:30:00'); // Sunday

		const entries: TimeEntry[] = [
			// Context match: Sunday 10:xx
			createEntryWithTime('cat-a', '2025-12-21', '10:00'), // Sunday slot 5
			createEntryWithTime('cat-a', '2025-12-14', '10:30'), // Previous Sunday slot 5

			// No context match
			createEntryWithTime('cat-b', '2025-12-20', '10:00') // Saturday
		];

		const result = getSmartTopCategories(2, entries, categories, now);

		// cat-a: 2 context matches = 2000 + 2 = 2002
		// cat-b: 0 context matches = 0 + 1 = 1
		expect(result[0].id).toBe('cat-a');
		expect(result[1].id).toBe('cat-b');
	});

	it('matches time slots correctly across different hours', () => {
		// 09:15 is in slot 4 (08:00-10:00)
		const now = new Date('2025-12-23T09:15:00'); // Tuesday

		const entries: TimeEntry[] = [
			createEntryWithTime('cat-a', '2025-12-23', '08:00'), // Same slot (4)
			createEntryWithTime('cat-a', '2025-12-23', '09:59'), // Same slot (4)
			createEntryWithTime('cat-b', '2025-12-23', '10:00'), // Different slot (5)
			createEntryWithTime('cat-b', '2025-12-23', '07:59') // Different slot (3)
		];

		const result = getSmartTopCategories(2, entries, categories, now);

		// cat-a: 2 context matches = 2000 + 2 = 2002
		// cat-b: 0 context matches = 0 + 2 = 2
		expect(result[0].id).toBe('cat-a');
		expect(result[1].id).toBe('cat-b');
	});
});

// Helper functions to create test data
function createEntry(categoryId: string, date: string): TimeEntry {
	return {
		id: `entry-${Math.random().toString(36).slice(2)}`,
		date,
		categoryId,
		startTime: '09:00',
		endTime: '10:00',
		description: null,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
}

function createEntryWithTime(categoryId: string, date: string, startTime: string): TimeEntry {
	return {
		id: `entry-${Math.random().toString(36).slice(2)}`,
		date,
		categoryId,
		startTime,
		endTime: '10:00',
		description: null,
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
}

function createCategory(id: string, name: string, type: 'system' | 'user'): Category {
	return {
		id,
		name,
		type,
		countsAsWorkTime: type === 'user',
		createdAt: Date.now()
	};
}
