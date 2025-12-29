/**
 * Stundenzettel Export
 *
 * Exports time entries as Excel (.xlsx) files for a specific employer.
 * Spec refs: Docs/Archive/Tasks/multi-arbeitgeber.md Task A2.15
 */

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

function formatDateForFilename(dateStr: string): string {
	return dateStr.replace(/-/g, '');
}

export async function exportStundenzettelExcel(data: ExportData): Promise<void> {
	const XLSX = await import('xlsx');

	const selectedColumns = data.columns.map((colId: ColumnId) => COLUMN_CONFIG[colId]);

	const headers = selectedColumns.map((col) => col.header);
	const rows: (string | number)[][] = [headers];

	for (const entry of data.entries) {
		const row: (string | number)[] = [];
		for (const col of selectedColumns) {
			const value = entry[col.id as keyof ProcessedEntry];
			row.push(value ?? '');
		}
		rows.push(row);
	}

	const worksheet = XLSX.utils.aoa_to_sheet(rows);

	worksheet['!cols'] = selectedColumns.map((col) => ({ wch: col.width }));

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Stundenzettel');

	const startFormatted = formatDateForFilename(data.startDate);
	const endFormatted = formatDateForFilename(data.endDate);
	const employerSafe = sanitizeFilename(data.employerName);
	const filename = `Stundenzettel_${employerSafe}_${startFormatted}-${endFormatted}.xlsx`;

	XLSX.writeFile(workbook, filename);
}
