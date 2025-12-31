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
	ImportStats,
	CandidateFlag
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

function getFileType(source: ImportSource): 'csv' | 'excel' | 'json' | 'text' | 'image' {
	const ext = source.filename.toLowerCase().split('.').pop();
	if (ext === 'csv') return 'csv';
	if (ext === 'json') return 'json';
	if (ext === 'xlsx' || ext === 'xls') return 'excel';
	if (isImageFile(source.filename)) return 'image';
	return 'text';
}

/**
 * Parse TimeTracker JSON export format.
 * Structure: { meta, categories, timeEntries, dayTypes, workTimeModels }
 */
function parseTimeTrackerJson(content: string, sourceId: string): TimeEntryCandidate[] {
	try {
		const data = JSON.parse(content);

		// Check if this is a TimeTracker export format
		if (!data.timeEntries || !Array.isArray(data.timeEntries)) {
			return [];
		}

		// Build category map if available
		const categoryMap = new Map<string, string>();
		if (data.categories && Array.isArray(data.categories)) {
			for (const cat of data.categories) {
				if (cat.id && cat.name) {
					categoryMap.set(cat.id, cat.name);
				}
			}
		}

		return data.timeEntries.map((entry: Record<string, unknown>, index: number) => {
			const date = (entry.date as string) || null;
			const startTime = (entry.startTime as string) || null;
			const endTime = (entry.endTime as string) || null;
			const categoryId = (entry.categoryId as string) || null;
			const description = (entry.description as string) || null;

			// Calculate duration
			let durationMinutes: number | null = null;
			if (startTime && endTime) {
				const [sh, sm] = startTime.split(':').map(Number);
				const [eh, em] = endTime.split(':').map(Number);
				durationMinutes = eh * 60 + em - (sh * 60 + sm);
			}

			// Get category name from map
			const categoryName = categoryId ? categoryMap.get(categoryId) || null : null;

			const flags: CandidateFlag[] = [];
			if (!date) flags.push('missing_date');
			if (!durationMinutes) flags.push('missing_duration');

			return {
				id: `${sourceId}_${index}`,
				date,
				startTime,
				endTime,
				durationMinutes,
				categoryGuess: categoryName,
				categoryId: null, // Will be matched later
				note: description,
				sourceRef: sourceId,
				confidence: date && startTime && endTime ? 0.95 : 0.5,
				flags,
				selected: flags.length === 0,
				edited: false
			};
		});
	} catch {
		return [];
	}
}

/**
 * Parse TimeTracker CSV export format.
 * Headers: date,start_time,end_time,category,description,duration_minutes
 */
function parseTimeTrackerCsv(
	headers: string[],
	rows: string[][],
	sourceId: string
): TimeEntryCandidate[] | null {
	// Check if this matches TimeTracker CSV export format
	const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

	const hasDateCol = lowerHeaders.includes('date') || lowerHeaders.includes('datum');
	const hasStartCol =
		lowerHeaders.includes('start_time') ||
		lowerHeaders.includes('start') ||
		lowerHeaders.includes('von');

	if (!hasDateCol || !hasStartCol) {
		return null; // Not a TimeTracker format, let AI handle it
	}

	// Find column indices
	const dateIdx = lowerHeaders.findIndex((h) => h === 'date' || h === 'datum');
	const startIdx = lowerHeaders.findIndex(
		(h) => h === 'start_time' || h === 'start' || h === 'von'
	);
	const endIdx = lowerHeaders.findIndex((h) => h === 'end_time' || h === 'end' || h === 'bis');
	const categoryIdx = lowerHeaders.findIndex(
		(h) => h === 'category' || h === 'kategorie' || h === 'tätigkeit'
	);
	const descIdx = lowerHeaders.findIndex(
		(h) => h === 'description' || h === 'beschreibung' || h === 'notiz' || h === 'note'
	);
	const durationIdx = lowerHeaders.findIndex((h) => h === 'duration_minutes' || h === 'dauer');

	return rows.map((row, index) => {
		const date = dateIdx >= 0 ? row[dateIdx]?.trim() || null : null;
		const startTime = startIdx >= 0 ? row[startIdx]?.trim() || null : null;
		const endTime = endIdx >= 0 ? row[endIdx]?.trim() || null : null;
		const category = categoryIdx >= 0 ? row[categoryIdx]?.trim() || null : null;
		const description = descIdx >= 0 ? row[descIdx]?.trim() || null : null;

		let durationMinutes: number | null = null;
		if (durationIdx >= 0 && row[durationIdx]) {
			durationMinutes = parseInt(row[durationIdx], 10) || null;
		} else if (startTime && endTime) {
			const [sh, sm] = startTime.split(':').map(Number);
			const [eh, em] = endTime.split(':').map(Number);
			if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
				durationMinutes = eh * 60 + em - (sh * 60 + sm);
			}
		}

		const flags: CandidateFlag[] = [];
		if (!date) flags.push('missing_date');
		if (!durationMinutes) flags.push('missing_duration');

		return {
			id: `${sourceId}_${index}`,
			date,
			startTime,
			endTime,
			durationMinutes,
			categoryGuess: category,
			categoryId: null,
			note: description,
			sourceRef: sourceId,
			confidence: date && startTime && endTime ? 0.95 : 0.5,
			flags,
			selected: flags.length === 0,
			edited: false
		};
	});
}

async function parseSource(
	source: ImportSource,
	mapping?: ColumnMapping
): Promise<TimeEntryCandidate[]> {
	const fileType = getFileType(source);

	switch (fileType) {
		case 'json': {
			// Try TimeTracker JSON export format first
			const jsonCandidates = parseTimeTrackerJson(source.content, source.id);
			if (jsonCandidates.length > 0) {
				return jsonCandidates;
			}
			// Fall back to text parsing
			const textResult = parseText(source.content, source.id);
			return textResult.candidates;
		}

		case 'csv': {
			const { headers, rows } = parseCSV(source.content);

			// Try TimeTracker CSV export format first
			const ttCandidates = parseTimeTrackerCsv(headers, rows, source.id);
			if (ttCandidates !== null) {
				return ttCandidates;
			}

			// Fall back to AI-assisted mapping
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
