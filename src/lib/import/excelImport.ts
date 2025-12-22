/**
 * Excel Import Module for TimeTracker
 *
 * Parses Excel workbooks (.xlsx/.xlsm) with KW (calendar week) sheets
 * and converts them to TimeEntry records matching the app's data model.
 *
 * Excel Format (per user's existing workbook):
 * - Sheets named "KW1", "KW2", ..., "KW52" (regex: /^KW\d+$/)
 * - Each sheet has 7 days, each day has 3 columns: Zeit / Dauer / Tätigkeit
 * - Start column: B (index 1), then +3 per day
 * - Date in row 2 of Zeit column (format: "dd.mm.")
 * - Data starts at row 4
 * - Year extracted from filename (*_2024.*) or fallback
 */

import type { TimeEntry, Category } from '$lib/types';

/** Raw parsed row from Excel before mapping */
export interface ExcelRow {
	date: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	durationMinutes: number;
	activity: string; // Raw activity name from Excel
}

/** Import preview result */
export interface ImportPreview {
	records: ExcelRow[];
	totalMinutes: number;
	uniqueDates: number;
	unknownActivities: string[]; // Activities not found in categories
	errors: string[];
}

/** Final import result */
export interface ImportResult {
	success: boolean;
	importedCount: number;
	skippedCount: number;
	errors: string[];
}

/** Category mapping: activity name -> category */
export type CategoryMap = Map<string, Category>;

/**
 * Parse time string "HH:mm" or "H:mm" to minutes since midnight
 */
function parseTimeToMinutes(timeStr: string): number | null {
	if (!timeStr || typeof timeStr !== 'string') return null;
	const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return null;
	const hours = parseInt(match[1], 10);
	const minutes = parseInt(match[2], 10);
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
	return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to "HH:mm"
 */
function formatMinutesToTime(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Parse German date "dd.mm." with year to ISO date
 */
function parseGermanDate(dateStr: string, year: number): string | null {
	if (!dateStr || typeof dateStr !== 'string') return null;
	const match = dateStr.trim().match(/^(\d{1,2})\.(\d{1,2})\.?$/);
	if (!match) return null;
	const day = parseInt(match[1], 10);
	const month = parseInt(match[2], 10);
	if (day < 1 || day > 31 || month < 1 || month > 12) return null;
	return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * Extract year from filename (e.g., "Zeiterfassung_2024.xlsm" -> 2024)
 */
export function extractYearFromFilename(filename: string): number | null {
	const match = filename.match(/[_-]?(20\d{2})/);
	return match ? parseInt(match[1], 10) : null;
}

/**
 * Parse duration cell - can be number (Excel decimal hours/minutes) or string
 */
function parseDuration(value: unknown): number | null {
	if (value === null || value === undefined || value === '') return null;

	if (typeof value === 'number') {
		// Excel stores time as fraction of day (0.5 = 12 hours)
		// If value < 1, it's likely a time fraction
		if (value > 0 && value < 1) {
			return Math.round(value * 24 * 60); // Convert to minutes
		}
		// If value >= 1, assume it's already minutes
		return Math.round(value);
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		// Try parsing as "HH:mm" format
		const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
		if (timeMatch) {
			return parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
		}
		// Try parsing as decimal number
		const num = parseFloat(trimmed.replace(',', '.'));
		if (!isNaN(num)) {
			if (num > 0 && num < 24) {
				// Likely hours, convert to minutes
				return Math.round(num * 60);
			}
			return Math.round(num);
		}
	}

	return null;
}

/**
 * Parse a single KW sheet
 */
function parseKWSheet(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sheet: any,
	year: number,
	errors: string[]
): ExcelRow[] {
	const rows: ExcelRow[] = [];

	// Sheet structure: 7 days, each with 3 columns (Zeit, Dauer, Tätigkeit)
	// Starting at column B (index 1)
	const START_COL = 1; // B
	const COLS_PER_DAY = 3;
	const DATE_ROW = 1; // Row 2 (0-indexed)
	const DATA_START_ROW = 3; // Row 4 (0-indexed)

	// Get sheet range
	const range = sheet['!ref'];
	if (!range) return rows;

	// Helper to get cell value
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const getCell = (row: number, col: number): any => {
		const colLetter = String.fromCharCode(65 + col); // A=0, B=1, etc.
		const cellRef = `${colLetter}${row + 1}`;
		const cell = sheet[cellRef];
		return cell ? cell.v : null;
	};

	// Process each of the 7 days
	for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
		const zeitCol = START_COL + dayIndex * COLS_PER_DAY;
		const dauerCol = zeitCol + 1;
		const taetigkeitCol = zeitCol + 2;

		// Get date from row 2
		const dateCell = getCell(DATE_ROW, zeitCol);
		const dateStr = parseGermanDate(String(dateCell || ''), year);
		if (!dateStr) {
			continue; // Skip days without valid date
		}

		// Process data rows
		let rowIndex = DATA_START_ROW;
		let prevTimeMinutes: number | null = null;

		while (rowIndex < 100) {
			// Safety limit
			const zeitValue = getCell(rowIndex, zeitCol);
			const dauerValue = getCell(rowIndex, dauerCol);
			const taetigkeitValue = getCell(rowIndex, taetigkeitCol);

			// Stop if all cells are empty
			if (!zeitValue && !dauerValue && !taetigkeitValue) {
				// Check next row too (might be a gap)
				const nextZeit = getCell(rowIndex + 1, zeitCol);
				const nextTaetigkeit = getCell(rowIndex + 1, taetigkeitCol);
				if (!nextZeit && !nextTaetigkeit) {
					break;
				}
				rowIndex++;
				continue;
			}

			// Skip rows without activity
			if (!taetigkeitValue || String(taetigkeitValue).trim() === '') {
				rowIndex++;
				continue;
			}

			const activity = String(taetigkeitValue).trim();
			const timeMinutes = parseTimeToMinutes(String(zeitValue || ''));

			// Get duration: prefer Dauer column, fallback to time difference
			let durationMinutes = parseDuration(dauerValue);

			if (durationMinutes === null && timeMinutes !== null && prevTimeMinutes !== null) {
				// Calculate from time difference
				durationMinutes = timeMinutes - prevTimeMinutes;
				if (durationMinutes < 0) durationMinutes = 0;
			}

			if (timeMinutes !== null && durationMinutes !== null && durationMinutes > 0) {
				rows.push({
					date: dateStr,
					startTime: formatMinutesToTime(timeMinutes),
					durationMinutes,
					activity
				});
			} else if (timeMinutes === null && activity) {
				errors.push(`Zeile ${rowIndex + 1}: Keine gültige Zeit für "${activity}"`);
			}

			prevTimeMinutes = timeMinutes;
			rowIndex++;
		}
	}

	return rows;
}

/**
 * Parse Excel workbook and extract time entries
 */
export async function parseExcelWorkbook(
	file: File,
	fallbackYear?: number
): Promise<ImportPreview> {
	const errors: string[] = [];
	const records: ExcelRow[] = [];

	// Dynamically import xlsx library
	const XLSX = await import('xlsx');

	// Determine year from filename or fallback
	const filenameYear = extractYearFromFilename(file.name);
	const year = filenameYear ?? fallbackYear ?? new Date().getFullYear();

	try {
		const arrayBuffer = await file.arrayBuffer();
		const workbook = XLSX.read(arrayBuffer, { type: 'array' });

		// Find KW sheets (KW1, KW2, ..., KW52)
		const kwSheetPattern = /^KW\d+$/i;
		const kwSheets = workbook.SheetNames.filter((name: string) => kwSheetPattern.test(name));

		if (kwSheets.length === 0) {
			errors.push('Keine KW-Sheets gefunden (erwartet: KW1, KW2, ...)');
			return { records: [], totalMinutes: 0, uniqueDates: 0, unknownActivities: [], errors };
		}

		// Parse each KW sheet
		for (const sheetName of kwSheets) {
			const sheet = workbook.Sheets[sheetName];
			const sheetRows = parseKWSheet(sheet, year, errors);
			records.push(...sheetRows);
		}
	} catch (e) {
		errors.push(`Fehler beim Lesen der Datei: ${e instanceof Error ? e.message : String(e)}`);
	}

	// Calculate summary
	const totalMinutes = records.reduce((sum, r) => sum + r.durationMinutes, 0);
	const uniqueDates = new Set(records.map((r) => r.date)).size;

	return {
		records,
		totalMinutes,
		uniqueDates,
		unknownActivities: [], // Will be filled by caller after category mapping
		errors
	};
}

/**
 * Build category map from existing categories (name -> category, case-insensitive)
 */
export function buildCategoryMap(categories: Category[]): CategoryMap {
	const map = new Map<string, Category>();
	for (const cat of categories) {
		map.set(cat.name.toLowerCase(), cat);
	}
	return map;
}

/**
 * Find unknown activities that don't exist in categories
 */
export function findUnknownActivities(records: ExcelRow[], categoryMap: CategoryMap): string[] {
	const unknown = new Set<string>();
	for (const record of records) {
		const key = record.activity.toLowerCase();
		if (!categoryMap.has(key)) {
			unknown.add(record.activity);
		}
	}
	return Array.from(unknown).sort();
}

/**
 * Convert ExcelRows to TimeEntry records
 */
export function convertToTimeEntries(
	records: ExcelRow[],
	categoryMap: CategoryMap
): { entries: TimeEntry[]; skipped: ExcelRow[] } {
	const entries: TimeEntry[] = [];
	const skipped: ExcelRow[] = [];
	const now = Date.now();

	for (const record of records) {
		const category = categoryMap.get(record.activity.toLowerCase());
		if (!category) {
			skipped.push(record);
			continue;
		}

		// Calculate end time from start + duration
		const startMinutes = parseTimeToMinutes(record.startTime);
		if (startMinutes === null) {
			skipped.push(record);
			continue;
		}
		const endMinutes = startMinutes + record.durationMinutes;
		const endTime = formatMinutesToTime(endMinutes);

		const entry: TimeEntry = {
			id: crypto.randomUUID(),
			date: record.date,
			categoryId: category.id,
			startTime: record.startTime,
			endTime,
			description: null,
			createdAt: now,
			updatedAt: now
		};

		entries.push(entry);
	}

	return { entries, skipped };
}
