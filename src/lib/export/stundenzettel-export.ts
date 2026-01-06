/**
 * Stundenzettel Export
 *
 * Exports time entries as Excel (.xlsx) and PDF files for a specific employer.
 * Includes weekly summaries after each week's entries and a monthly total at the end.
 * Spec refs: TempAppDevDocs/Archive/Tasks/multi-arbeitgeber.md Tasks A2.15, A2.16
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type ColumnId = 'date' | 'category' | 'startTime' | 'endTime' | 'duration' | 'description';

export interface ProcessedEntry {
	date: string;
	category: string;
	startTime: string;
	endTime: string;
	duration: string;
	description: string;
}

export interface ExportData {
	employerId: string;
	employerName: string;
	startDate: string;
	endDate: string;
	columns: ColumnId[];
	entries: ProcessedEntry[];
}

interface ColumnConfig {
	id: ColumnId;
	header: string;
	width: number;
}

const COLUMN_CONFIG: Record<ColumnId, ColumnConfig> = {
	date: { id: 'date', header: 'Datum', width: 12 },
	category: { id: 'category', header: 'Kategorie', width: 25 },
	startTime: { id: 'startTime', header: 'Von', width: 8 },
	endTime: { id: 'endTime', header: 'Bis', width: 8 },
	duration: { id: 'duration', header: 'Dauer', width: 8 },
	description: { id: 'description', header: 'Beschreibung', width: 40 }
};

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-zA-Z0-9äöüÄÖÜß\-_]/g, '_');
}

function parseDate(dateStr: string): Date {
	// Handle both ISO format (yyyy-mm-dd) and German format (dd.mm.yyyy)
	if (dateStr.includes('-')) {
		return new Date(dateStr);
	} else if (dateStr.includes('.')) {
		const [day, month, year] = dateStr.split('.');
		return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
	}
	return new Date(dateStr);
}

function getISOWeek(dateStr: string): number {
	const date = parseDate(dateStr);
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function parseDuration(durationStr: string): number {
	if (!durationStr || durationStr === '-') return 0;
	const parts = durationStr.split(':');
	if (parts.length !== 2) return 0;
	const hours = parseInt(parts[0], 10) || 0;
	const minutes = parseInt(parts[1], 10) || 0;
	return hours * 60 + minutes;
}

function formatMinutesToHours(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}:${mins.toString().padStart(2, '0')}`;
}

interface EntryWithWeek extends ProcessedEntry {
	weekNumber: number;
	weekYear: number;
}

function groupEntriesByWeek(entries: ProcessedEntry[]): Map<string, EntryWithWeek[]> {
	const grouped = new Map<string, EntryWithWeek[]>();

	for (const entry of entries) {
		const date = parseDate(entry.date);
		const weekNum = getISOWeek(entry.date);
		const year = date.getFullYear();
		const key = `${year}-W${String(weekNum).padStart(2, '0')}`;

		const entryWithWeek: EntryWithWeek = {
			...entry,
			weekNumber: weekNum,
			weekYear: year
		};

		if (!grouped.has(key)) {
			grouped.set(key, []);
		}
		grouped.get(key)!.push(entryWithWeek);
	}

	return grouped;
}

function calculateWeekTotal(entries: ProcessedEntry[]): number {
	return entries.reduce((sum, entry) => sum + parseDuration(entry.duration), 0);
}

export async function exportStundenzettelExcel(data: ExportData): Promise<void> {
	const XLSX = await import('xlsx');

	const selectedColumns = data.columns.map((colId: ColumnId) => COLUMN_CONFIG[colId]);
	const headers = selectedColumns.map((col) => col.header);
	const rows: (string | number)[][] = [headers];

	// Group entries by week
	const weekGroups = groupEntriesByWeek(data.entries);
	// Sort weeks by the first entry's actual date, not by week key string
	const sortedWeeks = Array.from(weekGroups.keys()).sort((a, b) => {
		const entriesA = weekGroups.get(a)!;
		const entriesB = weekGroups.get(b)!;
		const dateA = parseDate(entriesA[0].date);
		const dateB = parseDate(entriesB[0].date);
		return dateA.getTime() - dateB.getTime();
	});

	let totalMinutes = 0;

	for (const weekKey of sortedWeeks) {
		const weekEntries = weekGroups.get(weekKey)!;
		const weekTotal = calculateWeekTotal(weekEntries);
		totalMinutes += weekTotal;

		// Add entries for this week
		for (const entry of weekEntries) {
			const row: (string | number)[] = [];
			for (const col of selectedColumns) {
				const value = entry[col.id as keyof ProcessedEntry];
				row.push(value ?? '');
			}
			rows.push(row);
		}

		// Add weekly summary row
		const weekNum = weekEntries[0].weekNumber;
		const summaryRow: (string | number)[] = selectedColumns.map((col, index) => {
			if (index === 0) return `Woche ${weekNum}:`;
			if (col.id === 'duration') return formatMinutesToHours(weekTotal);
			return '';
		});
		rows.push(summaryRow);

		// Add empty row after week summary for spacing
		rows.push(selectedColumns.map(() => ''));
	}

	// Add monthly total row
	const monthlyTotalRow: (string | number)[] = selectedColumns.map((col, index) => {
		if (index === 0) return 'Gesamt:';
		if (col.id === 'duration') return formatMinutesToHours(totalMinutes);
		return '';
	});
	rows.push(monthlyTotalRow);

	const worksheet = XLSX.utils.aoa_to_sheet(rows);
	worksheet['!cols'] = selectedColumns.map((col) => ({ wch: col.width }));

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Stundenzettel');

	const employerSafe = sanitizeFilename(data.employerName);
	const filename = `Stundenzettel_${employerSafe}_${data.startDate}-${data.endDate}.xlsx`;

	XLSX.writeFile(workbook, filename);
}

function formatDisplayDate(dateStr: string): string {
	const [year, month, day] = dateStr.split('-');
	return `${day}.${month}.${year}`;
}

export async function exportStundenzettelPdf(data: ExportData): Promise<void> {
	const selectedColumns = data.columns.map((colId: ColumnId) => COLUMN_CONFIG[colId]);

	const doc = new jsPDF();

	doc.setFontSize(16);
	doc.text('Stundenzettel', 14, 20);

	doc.setFontSize(11);
	doc.setTextColor(60);
	doc.text(data.employerName, 14, 28);

	doc.setFontSize(10);
	doc.setTextColor(100);
	doc.text(
		`Zeitraum: ${formatDisplayDate(data.startDate)} - ${formatDisplayDate(data.endDate)}`,
		14,
		35
	);
	doc.text(`Anzahl Einträge: ${data.entries.length}`, 14, 41);

	const headers = selectedColumns.map((col) => col.header);

	// Group entries by week and build table data with summaries
	const weekGroups = groupEntriesByWeek(data.entries);
	// Sort weeks by the first entry's actual date, not by week key string
	const sortedWeeks = Array.from(weekGroups.keys()).sort((a, b) => {
		const entriesA = weekGroups.get(a)!;
		const entriesB = weekGroups.get(b)!;
		const dateA = parseDate(entriesA[0].date);
		const dateB = parseDate(entriesB[0].date);
		return dateA.getTime() - dateB.getTime();
	});

	const tableData: string[][] = [];
	let totalMinutes = 0;

	for (const weekKey of sortedWeeks) {
		const weekEntries = weekGroups.get(weekKey)!;
		const weekTotal = calculateWeekTotal(weekEntries);
		totalMinutes += weekTotal;

		// Add entries for this week
		for (const entry of weekEntries) {
			const row = selectedColumns.map((col) => {
				const value = entry[col.id as keyof ProcessedEntry];
				return value ?? '-';
			});
			tableData.push(row);
		}

		// Add weekly summary row
		const weekNum = weekEntries[0].weekNumber;
		const summaryRow = selectedColumns.map((col, index) => {
			if (index === 0) return `Woche ${weekNum}:`;
			if (col.id === 'duration') return formatMinutesToHours(weekTotal);
			return '';
		});
		tableData.push(summaryRow);
	}

	// Add monthly total row
	const monthlyTotalRow = selectedColumns.map((col, index) => {
		if (index === 0) return 'Gesamt:';
		if (col.id === 'duration') return formatMinutesToHours(totalMinutes);
		return '';
	});
	tableData.push(monthlyTotalRow);

	const columnWidths: Record<ColumnId, number> = {
		date: 25,
		category: 35,
		startTime: 18,
		endTime: 18,
		duration: 20,
		description: 50
	};

	// Find indices for summary rows to style them differently
	const summaryRowIndices: number[] = [];
	let rowIndex = 0;
	for (const weekKey of sortedWeeks) {
		const weekEntries = weekGroups.get(weekKey)!;
		rowIndex += weekEntries.length; // entries
		summaryRowIndices.push(rowIndex); // weekly summary
		rowIndex += 1;
	}
	summaryRowIndices.push(rowIndex); // monthly total

	autoTable(doc, {
		startY: 47,
		head: [headers],
		body: tableData,
		styles: { fontSize: 9 },
		headStyles: { fillColor: [102, 77, 60] },
		columnStyles: Object.fromEntries(
			selectedColumns.map((col, index) => [index, { cellWidth: columnWidths[col.id] }])
		),
		didParseCell: (hookData) => {
			// Style summary rows with bold and background
			if (hookData.section === 'body' && summaryRowIndices.includes(hookData.row.index)) {
				hookData.cell.styles.fontStyle = 'bold';
				hookData.cell.styles.fillColor = [240, 240, 240];
			}
		}
	});

	const employerSafe = sanitizeFilename(data.employerName);
	const filename = `Stundenzettel_${employerSafe}_${data.startDate}-${data.endDate}.pdf`;

	doc.save(filename);
}
