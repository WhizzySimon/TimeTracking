/**
 * Unit tests for duplicates module
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 9
 */

import { describe, it, expect } from 'vitest';
import { checkBatchDuplicates, generateEntryFingerprint, getDateRange } from './duplicates';
import type { TimeEntryCandidate } from './types';

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

describe('generateEntryFingerprint', () => {
	it('generates consistent fingerprint', () => {
		const entry = { date: '2024-01-15', startTime: '09:00', endTime: '12:00', description: 'Test' };
		const fp1 = generateEntryFingerprint(entry);
		const fp2 = generateEntryFingerprint(entry);
		expect(fp1).toBe(fp2);
	});

	it('generates different fingerprints for different entries', () => {
		const entry1 = {
			date: '2024-01-15',
			startTime: '09:00',
			endTime: '12:00',
			description: 'Test'
		};
		const entry2 = {
			date: '2024-01-16',
			startTime: '09:00',
			endTime: '12:00',
			description: 'Test'
		};
		expect(generateEntryFingerprint(entry1)).not.toBe(generateEntryFingerprint(entry2));
	});

	it('normalizes description case', () => {
		const entry1 = {
			date: '2024-01-15',
			startTime: '09:00',
			endTime: '12:00',
			description: 'TEST'
		};
		const entry2 = {
			date: '2024-01-15',
			startTime: '09:00',
			endTime: '12:00',
			description: 'test'
		};
		expect(generateEntryFingerprint(entry1)).toBe(generateEntryFingerprint(entry2));
	});
});

describe('checkBatchDuplicates', () => {
	it('flags duplicate entries', () => {
		const candidates = [
			createCandidate({ id: 'test-1', note: 'Same note' }),
			createCandidate({ id: 'test-2', note: 'Same note' })
		];

		const result = checkBatchDuplicates(candidates);

		expect(result[0].flags).not.toContain('duplicate_suspect');
		expect(result[1].flags).toContain('duplicate_suspect');
	});

	it('does not flag unique entries', () => {
		const candidates = [
			createCandidate({ id: 'test-1', startTime: '09:00', endTime: '10:00' }),
			createCandidate({ id: 'test-2', startTime: '10:00', endTime: '11:00' })
		];

		const result = checkBatchDuplicates(candidates);

		expect(result[0].flags).not.toContain('duplicate_suspect');
		expect(result[1].flags).not.toContain('duplicate_suspect');
	});

	it('skips entries without complete time data', () => {
		const candidates = [
			createCandidate({ id: 'test-1', startTime: null }),
			createCandidate({ id: 'test-2', startTime: null })
		];

		const result = checkBatchDuplicates(candidates);

		expect(result[0].flags).not.toContain('duplicate_suspect');
		expect(result[1].flags).not.toContain('duplicate_suspect');
	});
});

describe('getDateRange', () => {
	it('returns min and max dates', () => {
		const candidates = [
			createCandidate({ date: '2024-01-15' }),
			createCandidate({ id: 'test-2', date: '2024-01-10' }),
			createCandidate({ id: 'test-3', date: '2024-01-20' })
		];

		const result = getDateRange(candidates);

		expect(result).toEqual({ min: '2024-01-10', max: '2024-01-20' });
	});

	it('returns null for empty candidates', () => {
		expect(getDateRange([])).toBeNull();
	});

	it('returns null when no candidates have dates', () => {
		const candidates = [createCandidate({ date: null })];
		expect(getDateRange(candidates)).toBeNull();
	});
});
