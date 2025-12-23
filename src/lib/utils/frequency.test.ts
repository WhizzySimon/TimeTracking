/**
 * Unit tests for frequency utilities.
 * Spec refs: TT-FR-001 to TT-FR-005, TT-IG-001 to TT-IG-004
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getCategoryFrequency, getTopCategories, sortCategoriesByFrequency } from './frequency';
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

function createCategory(id: string, name: string, type: 'system' | 'user'): Category {
	return {
		id,
		name,
		type,
		countsAsWorkTime: type === 'user',
		createdAt: Date.now()
	};
}
