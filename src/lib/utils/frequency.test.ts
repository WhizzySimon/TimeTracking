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

	// Helper to create baseline entries (20+ days) so algorithm returns results
	function createBaselineEntries(now: Date, categoryId: string = 'cat-e'): TimeEntry[] {
		const entries: TimeEntry[] = [];
		for (let i = 0; i < 25; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			entries.push(createEntryWithTime(categoryId, date.toISOString().split('T')[0], '12:00'));
		}
		return entries;
	}

	it('returns empty array for no entries', () => {
		const now = new Date('2025-12-23T09:00:00');
		const result = getSmartTopCategories(5, [], categories, now);
		expect(result).toEqual([]);
	});

	it('returns empty array when less than 20 days with entries', () => {
		const now = new Date('2025-12-23T09:00:00');
		// Only 5 days of entries - not enough for meaningful suggestions
		const entries: TimeEntry[] = [];
		for (let i = 0; i < 5; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			entries.push(createEntryWithTime('cat-a', date.toISOString().split('T')[0], '09:00'));
		}
		const result = getSmartTopCategories(5, entries, categories, now);
		expect(result).toEqual([]);
	});

	it('prioritizes context matches over total frequency', () => {
		// Tuesday 09:15 - slot 4 (08:00-10:00), weekday 2
		const now = new Date('2025-12-23T09:15:00'); // Tuesday

		// Create 25 days of entries for cat-a and cat-b
		const entries: TimeEntry[] = [];
		for (let i = 0; i < 25; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			// cat-a gets context matches on Tuesdays at 09:xx
			if (date.getDay() === 2) {
				entries.push(createEntryWithTime('cat-a', dateStr, '09:00')); // Context match!
			} else {
				entries.push(createEntryWithTime('cat-a', dateStr, '14:00')); // No context
			}
			// cat-b gets more entries but never at Tuesday 09:xx
			entries.push(createEntryWithTime('cat-b', dateStr, '15:00'));
			entries.push(createEntryWithTime('cat-b', dateStr, '16:00'));
		}

		const result = getSmartTopCategories(2, entries, categories, now);

		// cat-a should be first (has context matches on Tuesdays 09:xx)
		// cat-b should be second (more total entries but no context matches)
		expect(result[0].id).toBe('cat-a');
		expect(result[1].id).toBe('cat-b');
	});

	it('falls back to total frequency when no context matches', () => {
		// Monday 14:00 - slot 7, weekday 1
		const now = new Date('2025-12-22T14:00:00'); // Monday

		// Create 25 days of entries - none at Monday 14:xx (no context matches)
		const entries: TimeEntry[] = [];
		for (let i = 0; i < 25; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			// cat-c gets 3 entries per day (highest frequency)
			entries.push(createEntryWithTime('cat-c', dateStr, '09:00'));
			entries.push(createEntryWithTime('cat-c', dateStr, '10:00'));
			entries.push(createEntryWithTime('cat-c', dateStr, '11:00'));
			// cat-a gets 2 entries per day
			entries.push(createEntryWithTime('cat-a', dateStr, '09:00'));
			entries.push(createEntryWithTime('cat-a', dateStr, '10:00'));
		}

		const result = getSmartTopCategories(2, entries, categories, now);

		// No context matches for Monday 14:xx, so sort by total frequency
		expect(result[0].id).toBe('cat-c'); // More entries
		expect(result[1].id).toBe('cat-a'); // Fewer entries
	});

	it('uses alphabetical tiebreaker for equal scores', () => {
		const now = new Date('2025-12-23T09:00:00'); // Tuesday

		// Create 25 days of entries spread across cat-a, cat-b, cat-c
		const entries: TimeEntry[] = [];
		for (let i = 0; i < 25; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			// Each category gets entries on different days
			if (i % 3 === 0) entries.push(createEntryWithTime('cat-a', dateStr, '09:00'));
			if (i % 3 === 1) entries.push(createEntryWithTime('cat-b', dateStr, '09:00'));
			if (i % 3 === 2) entries.push(createEntryWithTime('cat-c', dateStr, '09:00'));
		}

		const result = getSmartTopCategories(3, entries, categories, now);

		// All have similar scores, alphabetical order as tiebreaker
		expect(result.length).toBe(3);
		expect(result[0].name).toBe('Alpha');
		expect(result[1].name).toBe('Beta');
		expect(result[2].name).toBe('Charlie');
	});

	it('excludes system categories', () => {
		const now = new Date('2025-12-23T09:00:00');

		// Start with baseline entries for cat-a
		const entries: TimeEntry[] = createBaselineEntries(now, 'cat-a');

		// Add system category entries
		entries.push(createEntryWithTime('system-pause', '2025-12-23', '09:00'));
		entries.push(createEntryWithTime('system-pause', '2025-12-23', '09:30'));

		const result = getSmartTopCategories(5, entries, categories, now);

		// Only cat-a should be returned, system-pause excluded
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

		// Create entries for 5 categories across 25 days
		const entries: TimeEntry[] = [];
		const cats = ['cat-a', 'cat-b', 'cat-c', 'cat-d', 'cat-e'];
		for (let i = 0; i < 25; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			// Each day has entries for all categories
			for (const cat of cats) {
				entries.push(createEntryWithTime(cat, dateStr, '09:00'));
			}
		}

		const result = getSmartTopCategories(3, entries, categories, now);

		expect(result.length).toBe(3);
	});

	it('handles Sunday correctly (weekday 0)', () => {
		// Sunday 10:30 - slot 5 (10:00-12:00), weekday 0
		const now = new Date('2025-12-21T10:30:00'); // Sunday

		// Create 25 days of entries
		const entries: TimeEntry[] = [];
		for (let i = 0; i < 25; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			// cat-a gets context matches on Sundays at 10:xx
			if (date.getDay() === 0) {
				entries.push(createEntryWithTime('cat-a', dateStr, '10:00')); // Context match!
			}
			// cat-b gets entries but never on Sunday 10:xx
			entries.push(createEntryWithTime('cat-b', dateStr, '15:00'));
		}

		const result = getSmartTopCategories(2, entries, categories, now);

		// cat-a: has context matches on Sundays 10:xx
		// cat-b: no context matches
		expect(result[0].id).toBe('cat-a');
		expect(result[1].id).toBe('cat-b');
	});

	it('matches time slots correctly across different hours', () => {
		// 09:15 is in slot 4 (08:00-10:00)
		const now = new Date('2025-12-23T09:15:00'); // Tuesday

		// Create 25 days of entries
		const entries: TimeEntry[] = [];
		for (let i = 0; i < 25; i++) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			// cat-a gets context matches on Tuesdays at 08:xx-09:xx (slot 4)
			if (date.getDay() === 2) {
				entries.push(createEntryWithTime('cat-a', dateStr, '08:00')); // Same slot (4)
				entries.push(createEntryWithTime('cat-a', dateStr, '09:59')); // Same slot (4)
			}
			// cat-b gets entries but at different slots
			entries.push(createEntryWithTime('cat-b', dateStr, '10:00')); // Different slot (5)
			entries.push(createEntryWithTime('cat-b', dateStr, '07:59')); // Different slot (3)
		}

		const result = getSmartTopCategories(2, entries, categories, now);

		// cat-a: has context matches in slot 4 on Tuesdays
		// cat-b: no context matches (different slots)
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
