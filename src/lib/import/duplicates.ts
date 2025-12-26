/**
 * Duplicate Detection Module
 * Spec ref: Docs/Specs/ai-import.md Section 9
 */

import type { TimeEntryCandidate, CandidateFlag } from './types';

export async function generateFingerprint(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateEntryFingerprint(entry: {
	date: string;
	startTime: string;
	endTime: string;
	description: string;
}): string {
	const normalized = `${entry.date}|${entry.startTime}|${entry.endTime}|${entry.description.toLowerCase().trim()}`;
	return normalized;
}

export function checkBatchDuplicates(candidates: TimeEntryCandidate[]): TimeEntryCandidate[] {
	const seen = new Map<string, number>();

	return candidates.map((candidate, index) => {
		if (!candidate.date || !candidate.startTime || !candidate.endTime) {
			return candidate;
		}

		const fingerprint = generateEntryFingerprint({
			date: candidate.date,
			startTime: candidate.startTime,
			endTime: candidate.endTime,
			description: candidate.note || ''
		});

		const existingIndex = seen.get(fingerprint);
		if (existingIndex !== undefined) {
			const flags: CandidateFlag[] = [...candidate.flags];
			if (!flags.includes('duplicate_suspect')) {
				flags.push('duplicate_suspect');
			}
			return { ...candidate, flags };
		}

		seen.set(fingerprint, index);
		return candidate;
	});
}

export function getDateRange(
	candidates: TimeEntryCandidate[]
): { min: string; max: string } | null {
	const dates = candidates
		.filter((c) => c.date)
		.map((c) => c.date!)
		.sort();
	if (dates.length === 0) return null;
	return { min: dates[0], max: dates[dates.length - 1] };
}
