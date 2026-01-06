/**
 * CSV Parser
 *
 * Parses CSV content into structured data for import.
 *
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 8
 */

import type { TimeEntryCandidate } from '../types';
import { generateCandidateId } from '../openai';

export interface CSVParseResult {
	headers: string[];
	rows: string[][];
	candidates: TimeEntryCandidate[];
}

export interface ColumnMapping {
	date?: string;
	startTime?: string;
	endTime?: string;
	duration?: string;
	category?: string;
	note?: string;
}

function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if ((char === ',' || char === ';') && !inQuotes) {
			result.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}

	result.push(current.trim());
	return result;
}

export function parseCSV(content: string): { headers: string[]; rows: string[][] } {
	const lines = content.split(/\r?\n/).filter((line) => line.trim());

	if (lines.length === 0) {
		return { headers: [], rows: [] };
	}

	const headers = parseCSVLine(lines[0]);
	const rows = lines.slice(1).map(parseCSVLine);

	return { headers, rows };
}

function parseDate(value: string): string | null {
	if (!value) return null;

	const patterns = [
		/^(\d{4})-(\d{2})-(\d{2})$/,
		/^(\d{2})\.(\d{2})\.(\d{4})$/,
		/^(\d{2})\/(\d{2})\/(\d{4})$/,
		/^(\d{2})-(\d{2})-(\d{4})$/
	];

	for (const pattern of patterns) {
		const match = value.match(pattern);
		if (match) {
			if (pattern === patterns[0]) {
				return value;
			}
			const [, d, m, y] = match;
			return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
		}
	}

	return null;
}

function parseTime(value: string): string | null {
	if (!value) return null;

	const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
	if (match) {
		const [, h, m] = match;
		return `${h.padStart(2, '0')}:${m}`;
	}

	return null;
}

function parseDuration(value: string): number | null {
	if (!value) return null;

	const hoursMatch = value.match(/^(\d+(?:\.\d+)?)\s*[hH]?$/);
	if (hoursMatch) {
		return Math.round(parseFloat(hoursMatch[1]) * 60);
	}

	const minutesMatch = value.match(/^(\d+)\s*[mM](?:in)?$/);
	if (minutesMatch) {
		return parseInt(minutesMatch[1], 10);
	}

	const timeMatch = value.match(/^(\d+):(\d{2})$/);
	if (timeMatch) {
		return parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
	}

	const numMatch = value.match(/^(\d+(?:\.\d+)?)$/);
	if (numMatch) {
		const num = parseFloat(numMatch[1]);
		return num > 24 ? Math.round(num) : Math.round(num * 60);
	}

	return null;
}

function getColumnIndex(headers: string[], field: string | undefined): number {
	if (!field) return -1;
	return headers.findIndex((h) => h === field);
}

function calculateDurationFromRange(startTime: string, endTime: string): number {
	const [sh, sm] = startTime.split(':').map(Number);
	const [eh, em] = endTime.split(':').map(Number);
	let duration = eh * 60 + em - (sh * 60 + sm);
	if (duration < 0) duration += 24 * 60;
	return duration;
}

function extractRowData(
	row: string[],
	indices: {
		date: number;
		start: number;
		end: number;
		duration: number;
		category: number;
		note: number;
	}
): {
	date: string | null;
	startTime: string | null;
	endTime: string | null;
	durationMinutes: number | null;
	categoryGuess: string | null;
	note: string | null;
} {
	const date = indices.date >= 0 ? parseDate(row[indices.date] || '') : null;
	const startTime = indices.start >= 0 ? parseTime(row[indices.start] || '') : null;
	const endTime = indices.end >= 0 ? parseTime(row[indices.end] || '') : null;
	let durationMinutes = indices.duration >= 0 ? parseDuration(row[indices.duration] || '') : null;

	if (!durationMinutes && startTime && endTime) {
		durationMinutes = calculateDurationFromRange(startTime, endTime);
	}

	const categoryGuess = indices.category >= 0 ? row[indices.category] || null : null;
	const note = indices.note >= 0 ? row[indices.note] || null : null;

	return { date, startTime, endTime, durationMinutes, categoryGuess, note };
}

export function applyMapping(
	rows: string[][],
	headers: string[],
	mapping: ColumnMapping,
	sourceId: string
): TimeEntryCandidate[] {
	const candidates: TimeEntryCandidate[] = [];

	const indices = {
		date: getColumnIndex(headers, mapping.date),
		start: getColumnIndex(headers, mapping.startTime),
		end: getColumnIndex(headers, mapping.endTime),
		duration: getColumnIndex(headers, mapping.duration),
		category: getColumnIndex(headers, mapping.category),
		note: getColumnIndex(headers, mapping.note)
	};

	for (let i = 0; i < rows.length; i++) {
		const data = extractRowData(rows[i], indices);
		const hasData =
			data.date || data.startTime || data.endTime || data.durationMinutes || data.note;
		if (!hasData) continue;

		candidates.push({
			id: generateCandidateId(),
			...data,
			categoryId: null,
			sourceRef: `${sourceId}:${i + 2}`,
			confidence: data.date && data.durationMinutes ? 0.8 : 0.5,
			flags: [],
			selected: true,
			edited: false
		});
	}

	return candidates;
}
