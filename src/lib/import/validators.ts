/**
 * Validation module for AI Import
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 9 (Guardrails / Validations)
 */

import type { TimeEntryCandidate, CandidateFlag, ImportIssue, IssueType } from './types';
import type { Category } from '$lib/types';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MIN_DURATION = 1;
const MAX_DURATION = 960;
const EXTREME_DURATION = 720;

function isValidTime(time: string | null): boolean {
	if (!time) return false;
	return TIME_REGEX.test(time);
}

function isValidDate(date: string | null): boolean {
	if (!date) return false;
	if (!DATE_REGEX.test(date)) return false;
	const parsed = new Date(date);
	return !isNaN(parsed.getTime());
}

function calculateDurationFromTimes(start: string, end: string): number | null {
	if (!isValidTime(start) || !isValidTime(end)) return null;
	const [sh, sm] = start.split(':').map(Number);
	const [eh, em] = end.split(':').map(Number);
	const startMins = sh * 60 + sm;
	const endMins = eh * 60 + em;
	if (endMins <= startMins) return null;
	return endMins - startMins;
}

function hasDuration(candidate: TimeEntryCandidate): boolean {
	if (candidate.durationMinutes && candidate.durationMinutes > 0) return true;
	if (candidate.startTime && candidate.endTime) {
		const calc = calculateDurationFromTimes(candidate.startTime, candidate.endTime);
		return calc !== null && calc > 0;
	}
	return false;
}

function getEffectiveDuration(candidate: TimeEntryCandidate): number | null {
	if (candidate.durationMinutes) return candidate.durationMinutes;
	if (candidate.startTime && candidate.endTime) {
		return calculateDurationFromTimes(candidate.startTime, candidate.endTime);
	}
	return null;
}

function timeRangesOverlap(a: TimeEntryCandidate, b: TimeEntryCandidate): boolean {
	if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) return false;
	if (a.date !== b.date) return false;
	const [as, ae] = [a.startTime, a.endTime];
	const [bs, be] = [b.startTime, b.endTime];
	return as < be && bs < ae;
}

export interface ValidationResult {
	candidates: TimeEntryCandidate[];
	issues: ImportIssue[];
}

export function validateCandidate(candidate: TimeEntryCandidate): CandidateFlag[] {
	const flags: CandidateFlag[] = [];

	if (!isValidDate(candidate.date)) {
		flags.push('missing_date', 'hard_block');
	}

	if (!hasDuration(candidate)) {
		flags.push('missing_duration', 'hard_block');
	}

	if (candidate.startTime && !isValidTime(candidate.startTime)) {
		flags.push('invalid_time', 'hard_block');
	}
	if (candidate.endTime && !isValidTime(candidate.endTime)) {
		flags.push('invalid_time', 'hard_block');
	}

	const duration = getEffectiveDuration(candidate);
	if (duration !== null) {
		if (duration < MIN_DURATION || duration > MAX_DURATION) {
			if (!flags.includes('hard_block')) flags.push('invalid_time', 'hard_block');
		} else if (duration > EXTREME_DURATION) {
			flags.push('extreme_duration');
		}
	}

	return [...new Set(flags)];
}

export function validateCandidates(
	candidates: TimeEntryCandidate[],
	categories: Category[]
): ValidationResult {
	const issues: ImportIssue[] = [];
	const categoryNames = new Set(categories.map((c) => c.name.toLowerCase()));

	const validatedCandidates = candidates.map((c) => {
		const flags = validateCandidate(c);

		if (c.categoryGuess && !categoryNames.has(c.categoryGuess.toLowerCase())) {
			flags.push('unknown_category');
		}

		return { ...c, flags: [...new Set([...c.flags, ...flags])] };
	});

	for (let i = 0; i < validatedCandidates.length; i++) {
		for (let j = i + 1; j < validatedCandidates.length; j++) {
			if (timeRangesOverlap(validatedCandidates[i], validatedCandidates[j])) {
				if (!validatedCandidates[i].flags.includes('overlaps')) {
					validatedCandidates[i].flags.push('overlaps');
				}
				if (!validatedCandidates[j].flags.includes('overlaps')) {
					validatedCandidates[j].flags.push('overlaps');
				}
			}
		}
	}

	const groupedIssues = new Map<IssueType, string[]>();
	for (const c of validatedCandidates) {
		if (c.flags.includes('missing_date')) {
			const ids = groupedIssues.get('missing_date') || [];
			ids.push(c.id);
			groupedIssues.set('missing_date', ids);
		}
		if (c.flags.includes('missing_duration')) {
			const ids = groupedIssues.get('missing_duration') || [];
			ids.push(c.id);
			groupedIssues.set('missing_duration', ids);
		}
		if (c.flags.includes('unknown_category')) {
			const ids = groupedIssues.get('unknown_category') || [];
			ids.push(c.id);
			groupedIssues.set('unknown_category', ids);
		}
		if (c.flags.includes('overlaps')) {
			const ids = groupedIssues.get('overlap') || [];
			ids.push(c.id);
			groupedIssues.set('overlap', ids);
		}
		if (c.flags.includes('extreme_duration')) {
			const ids = groupedIssues.get('extreme_duration') || [];
			ids.push(c.id);
			groupedIssues.set('extreme_duration', ids);
		}
	}

	const issueMessages: Record<IssueType, { msg: string; severity: 'error' | 'warning' }> = {
		missing_date: { msg: 'Einträge ohne Datum', severity: 'error' },
		missing_duration: { msg: 'Einträge ohne Dauer', severity: 'error' },
		unknown_category: { msg: 'Unbekannte Kategorie', severity: 'warning' },
		overlap: { msg: 'Überlappende Zeiträume', severity: 'warning' },
		duplicate: { msg: 'Mögliche Duplikate', severity: 'warning' },
		extreme_duration: { msg: 'Ungewöhnlich lange Dauer (>12h)', severity: 'warning' },
		invalid_format: { msg: 'Ungültiges Format', severity: 'error' },
		parse_error: { msg: 'Parsing-Fehler', severity: 'error' }
	};

	for (const [type, candidateIds] of groupedIssues) {
		const config = issueMessages[type];
		issues.push({
			id: crypto.randomUUID(),
			type,
			severity: config.severity,
			message: `${config.msg} (${candidateIds.length})`,
			candidateIds
		});
	}

	return { candidates: validatedCandidates, issues };
}

export function isImportable(candidate: TimeEntryCandidate): boolean {
	return !candidate.flags.includes('hard_block');
}

export function countImportable(candidates: TimeEntryCandidate[]): number {
	return candidates.filter((c) => isImportable(c) && c.selected).length;
}
