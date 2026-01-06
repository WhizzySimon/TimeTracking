/**
 * Excel Parser
 *
 * Parses Excel files (.xlsx, .xls) into structured data.
 * Uses SheetJS library for parsing.
 *
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 8
 */

import type { TimeEntryCandidate } from '../types';
import { applyMapping, type ColumnMapping } from './csv';

export interface ExcelSheet {
	name: string;
	headers: string[];
	rows: string[][];
}

export interface ExcelParseResult {
	sheets: ExcelSheet[];
	candidates: TimeEntryCandidate[];
}

export async function parseExcel(
	content: string,
	sourceId: string,
	mapping?: ColumnMapping
): Promise<ExcelParseResult> {
	const binary = atob(content.split(',')[1] || content);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	const sheets: ExcelSheet[] = [];
	const candidates: TimeEntryCandidate[] = [];

	try {
		const XLSX = await import('xlsx');
		const workbook = XLSX.read(bytes, { type: 'array' });

		for (const sheetName of workbook.SheetNames) {
			const worksheet = workbook.Sheets[sheetName];
			const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

			if (jsonData.length === 0) continue;

			const headers = (jsonData[0] || []).map((h) => String(h || ''));
			const rows = jsonData.slice(1).map((row) =>
				(row || []).map((cell) => {
					if (cell === null || cell === undefined) return '';
					if (typeof cell === 'number') {
						if (cell < 1 && cell > 0) {
							const totalMinutes = Math.round(cell * 24 * 60);
							const hours = Math.floor(totalMinutes / 60);
							const minutes = totalMinutes % 60;
							return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
						}
						if (cell > 40000 && cell < 50000) {
							const date = new Date((cell - 25569) * 86400 * 1000);
							return date.toISOString().split('T')[0];
						}
					}
					return String(cell);
				})
			);

			sheets.push({ name: sheetName, headers, rows });

			if (mapping && rows.length > 0) {
				const sheetCandidates = applyMapping(rows, headers, mapping, `${sourceId}:${sheetName}`);
				candidates.push(...sheetCandidates);
			}
		}
	} catch (err) {
		console.error('Excel parsing error:', err);
		throw new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
	}

	return { sheets, candidates };
}

export function detectExcelMapping(headers: string[]): ColumnMapping {
	const mapping: ColumnMapping = {};
	const normalized = headers.map((h) => h.toLowerCase().trim());

	const patterns: Record<keyof ColumnMapping, string[]> = {
		date: ['datum', 'date', 'tag', 'day'],
		startTime: ['von', 'start', 'beginn', 'anfang', 'from'],
		endTime: ['bis', 'ende', 'end', 'to'],
		duration: ['dauer', 'duration', 'zeit', 'time', 'stunden', 'hours'],
		category: ['kategorie', 'category', 'typ', 'type', 'projekt'],
		note: ['notiz', 'note', 'beschreibung', 'tätigkeit', 'aufgabe', 'task']
	};

	for (const [field, keywords] of Object.entries(patterns)) {
		for (let i = 0; i < normalized.length; i++) {
			for (const keyword of keywords) {
				if (normalized[i].includes(keyword)) {
					mapping[field as keyof ColumnMapping] = headers[i];
					break;
				}
			}
			if (mapping[field as keyof ColumnMapping]) break;
		}
	}

	return mapping;
}
