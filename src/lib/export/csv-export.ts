/**
 * CSV Export for TimeTracker.
 * Exports time entries as a CSV file for Excel/Sheets.
 * Spec refs: Docs/Features/Specs/subscription-plans.md
 */

import { getAll } from '$lib/storage/db';
import type { TimeEntry, Category } from '$lib/types';

export interface CsvExportOptions {
	filename?: string;
}

function escapeCSV(value: string | undefined | null): string {
	if (value == null) return '';
	const str = String(value);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function formatDateForFilename(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function triggerDownload(content: string, filename: string): void {
	// UTF-8 BOM for Excel compatibility
	const BOM = '\uFEFF';
	const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function calculateDurationMinutes(start: string, end: string | null): number {
	if (!end) return 0;
	const [startHour, startMin] = start.split(':').map(Number);
	const [endHour, endMin] = end.split(':').map(Number);
	const startTotal = startHour * 60 + startMin;
	const endTotal = endHour * 60 + endMin;
	return endTotal - startTotal;
}

export async function exportToCsv(options: CsvExportOptions = {}): Promise<void> {
	const [timeEntries, categories] = await Promise.all([
		getAll<TimeEntry>('timeEntries'),
		getAll<Category>('categories')
	]);

	const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

	const headers = ['date', 'start_time', 'end_time', 'category', 'description', 'duration_minutes'];
	const rows: string[][] = [headers];

	for (const entry of timeEntries) {
		const categoryName = categoryMap.get(entry.categoryId) || '';
		const duration = calculateDurationMinutes(entry.startTime, entry.endTime);

		rows.push([
			entry.date,
			entry.startTime,
			entry.endTime ?? '',
			escapeCSV(categoryName),
			escapeCSV(entry.description ?? ''),
			String(duration)
		]);
	}

	const csvContent = rows.map((row) => row.join(',')).join('\n');
	const now = new Date();
	const filename = options.filename || `timetracker-export-${formatDateForFilename(now)}.csv`;

	triggerDownload(csvContent, filename);
}
