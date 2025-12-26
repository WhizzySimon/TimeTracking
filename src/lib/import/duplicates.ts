/**
 * Duplicate detection module for AI Import
 * Spec ref: Docs/Specs/ai-import.md Section 9 (Duplicate Detection)
 */

import type { TimeEntryCandidate } from './types';
import type { TimeEntry } from '$lib/types';

function normalizeText(text: string): string {
	return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function sha256(message: string): Promise<string> {
	const msgBuffer = new TextEncoder().encode(message);
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function generateFingerprint(candidate: TimeEntryCandidate): Promise<string> {
	const normalized = [
		candidate.date || '',
		candidate.startTime || '',
		candidate.endTime || '',
		candidate.durationMinutes?.toString() || '',
		normalizeText(candidate.note || ''),
		candidate.categoryId || ''
	].join('|');
	return sha256(normalized);
}

export async function generateEntryFingerprint(entry: TimeEntry): Promise<string> {
	const normalized = [
		entry.date || '',
		entry.startTime || '',
		entry.endTime || '',
		'',
		normalizeText(entry.description || ''),
		entry.categoryId || ''
	].join('|');
	return sha256(normalized);
}

export interface DuplicateCheckResult {
	candidateId: string;
	isDuplicate: boolean;
	matchedEntryId?: string;
	matchedCandidateId?: string;
}

export async function checkDuplicatesWithinBatch(
	candidates: TimeEntryCandidate[]
): Promise<Map<string, string>> {
	const duplicates = new Map<string, string>();
	const fingerprints = new Map<string, string>();

	for (const candidate of candidates) {
		const fp = await generateFingerprint(candidate);
		const existing = fingerprints.get(fp);
		if (existing) {
			duplicates.set(candidate.id, existing);
		} else {
			fingerprints.set(fp, candidate.id);
		}
	}

	return duplicates;
}

export async function checkDuplicatesAgainstEntries(
	candidates: TimeEntryCandidate[],
	existingEntries: TimeEntry[]
): Promise<Map<string, string>> {
	const duplicates = new Map<string, string>();

	const entryFingerprints = new Map<string, string>();
	for (const entry of existingEntries) {
		const fp = await generateEntryFingerprint(entry);
		entryFingerprints.set(fp, entry.id);
	}

	for (const candidate of candidates) {
		const fp = await generateFingerprint(candidate);
		const matchedEntryId = entryFingerprints.get(fp);
		if (matchedEntryId) {
			duplicates.set(candidate.id, matchedEntryId);
		}
	}

	return duplicates;
}

export async function markDuplicates(
	candidates: TimeEntryCandidate[],
	existingEntries: TimeEntry[]
): Promise<TimeEntryCandidate[]> {
	const batchDuplicates = await checkDuplicatesWithinBatch(candidates);
	const entryDuplicates = await checkDuplicatesAgainstEntries(candidates, existingEntries);

	return candidates.map((c) => {
		const isDuplicate = batchDuplicates.has(c.id) || entryDuplicates.has(c.id);
		if (isDuplicate && !c.flags.includes('duplicate_suspect')) {
			return { ...c, flags: [...c.flags, 'duplicate_suspect'] as typeof c.flags };
		}
		return c;
	});
}

export function getDateRange(
	candidates: TimeEntryCandidate[]
): { min: string; max: string } | null {
	const dates = candidates.map((c) => c.date).filter((d): d is string => d !== null);
	if (dates.length === 0) return null;
	dates.sort();
	return { min: dates[0], max: dates[dates.length - 1] };
}

export function expandDateRange(
	range: { min: string; max: string },
	daysBefore: number,
	daysAfter: number
): { min: string; max: string } {
	const minDate = new Date(range.min);
	const maxDate = new Date(range.max);
	minDate.setDate(minDate.getDate() - daysBefore);
	maxDate.setDate(maxDate.getDate() + daysAfter);
	return {
		min: minDate.toISOString().split('T')[0],
		max: maxDate.toISOString().split('T')[0]
	};
}
