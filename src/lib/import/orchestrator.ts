/**
 * Import Orchestrator
 *
 * Coordinates the import pipeline from sources to validated candidates.
 *
 * Spec ref: Docs/Features/Specs/ai-import.md Section 8
 */

import type {
	ImportSource,
	TimeEntryCandidate,
	ImportIssue,
	ImportBatch,
	ImportStats
} from './types';
import { parseCSV, applyMapping, type ColumnMapping } from './parsers/csv';
import { parseText } from './parsers/text';
import { parseExcel, detectExcelMapping } from './parsers/excel';
import { parseImage, isImageFile } from './parsers/ocr';
import { validateCandidates } from './validators';
import { checkBatchDuplicates } from './duplicates';
import { suggestColumnMapping, guessCategories } from './ai';
import type { Category } from '$lib/types';

export interface ProcessingProgress {
	current: number;
	total: number;
	currentFile: string;
	step: 'parsing' | 'validating' | 'checking_duplicates' | 'done';
}

export interface ProcessingResult {
	candidates: TimeEntryCandidate[];
	issues: ImportIssue[];
	stats: ImportStats;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

function getFileType(source: ImportSource): 'csv' | 'excel' | 'text' | 'image' {
	const ext = source.filename.toLowerCase().split('.').pop();
	if (ext === 'csv') return 'csv';
	if (ext === 'xlsx' || ext === 'xls') return 'excel';
	if (isImageFile(source.filename)) return 'image';
	return 'text';
}

async function parseSource(
	source: ImportSource,
	mapping?: ColumnMapping
): Promise<TimeEntryCandidate[]> {
	const fileType = getFileType(source);

	switch (fileType) {
		case 'csv': {
			const { headers, rows } = parseCSV(source.content);
			let effectiveMapping = mapping;
			if (!effectiveMapping) {
				try {
					const suggestion = await suggestColumnMapping({ headers, sampleRows: rows.slice(0, 3) });
					effectiveMapping = suggestion.mapping as ColumnMapping;
				} catch {
					effectiveMapping = {};
				}
			}
			return applyMapping(rows, headers, effectiveMapping, source.id);
		}

		case 'excel': {
			const result = await parseExcel(source.content, source.id, mapping);
			if (result.candidates.length === 0 && result.sheets.length > 0) {
				const firstSheet = result.sheets[0];
				const autoMapping = detectExcelMapping(firstSheet.headers);
				return applyMapping(
					firstSheet.rows,
					firstSheet.headers,
					autoMapping,
					`${source.id}:${firstSheet.name}`
				);
			}
			return result.candidates;
		}

		case 'image': {
			const result = await parseImage(source.content, source.id);
			return result.candidates;
		}

		case 'text':
		default: {
			const result = parseText(source.content, source.id);
			return result.candidates;
		}
	}
}

async function enrichWithCategories(
	candidates: TimeEntryCandidate[],
	userCategories: string[]
): Promise<TimeEntryCandidate[]> {
	const textsToGuess = candidates.filter((c) => c.note && !c.categoryGuess).map((c) => c.note!);

	if (textsToGuess.length === 0) return candidates;

	try {
		const result = await guessCategories({ texts: textsToGuess, userCategories });
		const guessMap = new Map(result.guesses.map((g) => [g.text, g]));

		return candidates.map((c) => {
			if (c.note && !c.categoryGuess) {
				const guess = guessMap.get(c.note);
				if (guess) {
					return {
						...c,
						categoryGuess: guess.category,
						confidence: Math.min(c.confidence, guess.confidence)
					};
				}
			}
			return c;
		});
	} catch {
		return candidates;
	}
}

export async function processImportSources(
	sources: ImportSource[],
	options: {
		mapping?: ColumnMapping;
		userCategories?: Category[];
		existingEntries?: { date: string; startTime: string; endTime: string; description: string }[];
		onProgress?: ProgressCallback;
	} = {}
): Promise<ProcessingResult> {
	const { mapping, userCategories = [], onProgress } = options;
	const categoryNames = userCategories.map((c) => c.name);

	let allCandidates: TimeEntryCandidate[] = [];

	for (let i = 0; i < sources.length; i++) {
		const source = sources[i];

		onProgress?.({
			current: i + 1,
			total: sources.length,
			currentFile: source.filename,
			step: 'parsing'
		});

		const candidates = await parseSource(source, mapping);
		allCandidates.push(...candidates);
	}

	onProgress?.({
		current: sources.length,
		total: sources.length,
		currentFile: '',
		step: 'validating'
	});

	allCandidates = await enrichWithCategories(allCandidates, categoryNames);

	const validationResult = validateCandidates(allCandidates, userCategories);
	allCandidates = validationResult.candidates;

	onProgress?.({
		current: sources.length,
		total: sources.length,
		currentFile: '',
		step: 'checking_duplicates'
	});

	allCandidates = checkBatchDuplicates(allCandidates);

	const issues = validationResult.issues;

	const validCandidates = allCandidates.filter((c) => !c.flags.includes('hard_block'));
	const dates = validCandidates
		.filter((c) => c.date)
		.map((c) => c.date!)
		.sort();

	const stats: ImportStats = {
		entryCount: allCandidates.length,
		dateMin: dates[0] || '',
		dateMax: dates[dates.length - 1] || '',
		totalMinutesEstimated: validCandidates.reduce((sum, c) => sum + (c.durationMinutes || 0), 0),
		issueCount: issues.length,
		highConfidenceCount: allCandidates.filter((c) => c.confidence >= 0.8).length,
		lowConfidenceCount: allCandidates.filter((c) => c.confidence < 0.5).length
	};

	onProgress?.({
		current: sources.length,
		total: sources.length,
		currentFile: '',
		step: 'done'
	});

	return { candidates: allCandidates, issues, stats };
}

export function createImportBatch(
	sources: ImportSource[],
	result: ProcessingResult,
	userId: string
): ImportBatch {
	return {
		id: `batch_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
		createdAt: new Date().toISOString(),
		userId,
		sources,
		candidates: result.candidates,
		issues: result.issues,
		stats: result.stats,
		status: 'draft'
	};
}
