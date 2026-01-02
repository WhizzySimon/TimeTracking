/**
 * AI Import Types
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 7 (Data Model)
 */

// Source type for categorizing import sources
export type SourceType =
	| 'timesheet'
	| 'projektlog'
	| 'rechnung'
	| 'kalender'
	| 'chat'
	| 'sonstiges';

// Candidate validation flags
export type CandidateFlag =
	| 'missing_date'
	| 'missing_duration'
	| 'ambiguous_time'
	| 'overlaps'
	| 'duplicate_suspect'
	| 'unknown_category'
	| 'extreme_duration'
	| 'invalid_time'
	| 'summary_row'
	| 'handwritten'
	| 'hard_block';

// Issue types for import problems
export type IssueType =
	| 'missing_date'
	| 'missing_duration'
	| 'unknown_category'
	| 'overlap'
	| 'duplicate'
	| 'extreme_duration'
	| 'invalid_format'
	| 'parse_error';

// Import batch status
export type ImportBatchStatus = 'draft' | 'reviewed' | 'committed';

// File type for import sources
export type ImportFileType = 'csv' | 'excel' | 'json' | 'text' | 'image';

// Source file/input metadata
export interface ImportSource {
	id: string;
	type: ImportFileType;
	filename: string;
	content: string;
	sizeBytes: number;
	addedAt: number;
	mimeType?: string;
	hash?: string;
	sheetName?: string;
}

// Import statistics
export interface ImportStats {
	entryCount: number;
	dateMin: string;
	dateMax: string;
	totalMinutesEstimated: number;
	issueCount: number;
	highConfidenceCount: number;
	lowConfidenceCount: number;
}

// Time entry candidate (parsed but not yet imported)
export interface TimeEntryCandidate {
	id: string;
	date: string | null;
	startTime: string | null;
	endTime: string | null;
	durationMinutes: number | null;
	categoryGuess: string | null;
	categoryId: string | null;
	note: string | null;
	sourceRef: string;
	confidence: number;
	flags: CandidateFlag[];
	selected: boolean;
	edited: boolean;
}

// Import issue (problem detected during parsing/validation)
export interface ImportIssue {
	id: string;
	type: IssueType;
	severity: 'error' | 'warning';
	message: string;
	candidateIds: string[];
	suggestion?: string;
}

// Import batch (collection of candidates from one import session)
export interface ImportBatch {
	id: string;
	createdAt: string;
	userId: string;
	sources: ImportSource[];
	candidates: TimeEntryCandidate[];
	issues: ImportIssue[];
	stats: ImportStats;
	status: ImportBatchStatus;
	presetId?: string;
}

// Column mapping for structured files
export interface ColumnMapping {
	date?: string;
	startTime?: string;
	endTime?: string;
	duration?: string;
	category?: string;
	note?: string;
}

// Category text to ID mapping
export interface CategoryMapping {
	sourceText: string;
	categoryId: string;
}

// Saved import preset
export interface ImportPreset {
	id: string;
	name: string;
	createdAt: string;
	sourceType: SourceType;
	columnMapping: ColumnMapping;
	categoryMappings: CategoryMapping[];
	durationRounding?: 5 | 15;
}

// Raw parsed data before candidate generation
export interface RawRow {
	[key: string]: string | number | null;
}

export interface RawData {
	headers: string[];
	rows: RawRow[];
	sourceId: string;
}
