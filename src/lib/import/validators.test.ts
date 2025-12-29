/**
 * Unit tests for validators module
 * Spec ref: Docs/Features/Specs/ai-import.md Section 9
 */

import { describe, it, expect } from 'vitest';
import { validateCandidates, isImportable, countImportable } from './validators';
import type { TimeEntryCandidate } from './types';
import type { Category } from '$lib/types';

function createCandidate(overrides: Partial<TimeEntryCandidate> = {}): TimeEntryCandidate {
	return {
		id: 'test-1',
		date: '2024-01-15',
		startTime: '09:00',
		endTime: '12:00',
		durationMinutes: 180,
		categoryGuess: 'Meeting',
		categoryId: null,
		note: 'Test note',
		sourceRef: 'test:1',
		confidence: 0.8,
		flags: [],
		selected: true,
		edited: false,
		...overrides
	};
}

function createCategory(name: string): Category {
	return {
		id: `cat-${name}`,
		name,
		type: 'user',
		countsAsWorkTime: true,
		createdAt: Date.now()
	};
}

describe('validateCandidates', () => {
	it('returns valid candidates unchanged', () => {
		const candidates = [createCandidate()];
		const categories = [createCategory('Meeting')];

		const result = validateCandidates(candidates, categories);

		expect(result.candidates[0].flags).not.toContain('missing_date');
		expect(result.candidates[0].flags).not.toContain('missing_duration');
	});

	it('flags missing date as hard block', () => {
		const candidates = [createCandidate({ date: null })];
		const categories = [createCategory('Meeting')];

		const result = validateCandidates(candidates, categories);

		expect(result.candidates[0].flags).toContain('missing_date');
	});

	it('flags missing duration as hard block', () => {
		const candidates = [createCandidate({ durationMinutes: null, startTime: null, endTime: null })];
		const categories = [createCategory('Meeting')];

		const result = validateCandidates(candidates, categories);

		expect(result.candidates[0].flags).toContain('missing_duration');
	});

	it('flags unknown category', () => {
		const candidates = [createCandidate({ categoryGuess: 'Unknown' })];
		const categories = [createCategory('Meeting')];

		const result = validateCandidates(candidates, categories);

		expect(result.candidates[0].flags).toContain('unknown_category');
	});

	it('does not flag known category', () => {
		const candidates = [createCandidate({ categoryGuess: 'Meeting' })];
		const categories = [createCategory('Meeting')];

		const result = validateCandidates(candidates, categories);

		expect(result.candidates[0].flags).not.toContain('unknown_category');
	});

	it('flags extreme duration (>12h)', () => {
		const candidates = [createCandidate({ durationMinutes: 800 })];
		const categories = [createCategory('Meeting')];

		const result = validateCandidates(candidates, categories);

		expect(result.candidates[0].flags).toContain('extreme_duration');
	});

	it('generates issues from flags', () => {
		const candidates = [
			createCandidate({ date: null }),
			createCandidate({ id: 'test-2', durationMinutes: null, startTime: null, endTime: null })
		];
		const categories: Category[] = [];

		const result = validateCandidates(candidates, categories);

		expect(result.issues.length).toBeGreaterThan(0);
		expect(result.issues.some((i) => i.type === 'missing_date')).toBe(true);
		expect(result.issues.some((i) => i.type === 'missing_duration')).toBe(true);
	});
});

describe('isImportable', () => {
	it('returns true for valid candidate', () => {
		const candidate = createCandidate();
		expect(isImportable(candidate)).toBe(true);
	});

	it('returns false for hard blocked candidate', () => {
		const candidate = createCandidate({ flags: ['hard_block'] });
		expect(isImportable(candidate)).toBe(false);
	});
});

describe('countImportable', () => {
	it('counts only selected importable candidates', () => {
		const candidates = [
			createCandidate({ selected: true }),
			createCandidate({ id: 'test-2', selected: false }),
			createCandidate({ id: 'test-3', selected: true, flags: ['hard_block'] })
		];

		expect(countImportable(candidates)).toBe(1);
	});
});
