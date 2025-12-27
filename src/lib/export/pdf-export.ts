/**
 * PDF Export for TimeTracker.
 * Exports time entries as a PDF report with formatted table.
 * Spec refs: Docs/Specs/subscription-plans.md
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAll } from '$lib/storage/db';
import type { TimeEntry, Category } from '$lib/types';

export interface PdfExportOptions {
	filename?: string;
}

function formatDateForFilename(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function formatDateForDisplay(dateStr: string): string {
	const [year, month, day] = dateStr.split('-');
	return `${day}.${month}.${year}`;
}

function calculateDurationMinutes(start: string, end: string | null): number {
	if (!end) return 0;
	const [startHour, startMin] = start.split(':').map(Number);
	const [endHour, endMin] = end.split(':').map(Number);
	const startTotal = startHour * 60 + startMin;
	const endTotal = endHour * 60 + endMin;
	return endTotal - startTotal;
}

function formatDuration(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
}

export async function exportToPdf(options: PdfExportOptions = {}): Promise<void> {
	const [timeEntries, categories] = await Promise.all([
		getAll<TimeEntry>('timeEntries'),
		getAll<Category>('categories')
	]);

	const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

	const doc = new jsPDF();

	doc.setFontSize(18);
	doc.text('TimeTracker Export', 14, 22);

	doc.setFontSize(10);
	doc.setTextColor(100);
	const now = new Date();
	doc.text(`Erstellt am: ${formatDateForDisplay(formatDateForFilename(now))}`, 14, 30);
	doc.text(`Anzahl Einträge: ${timeEntries.length}`, 14, 36);

	const tableData = timeEntries.map((entry) => {
		const categoryName = categoryMap.get(entry.categoryId) || '-';
		const duration = calculateDurationMinutes(entry.startTime, entry.endTime);
		return [
			formatDateForDisplay(entry.date),
			entry.startTime,
			entry.endTime ?? '-',
			categoryName,
			entry.description ?? '-',
			formatDuration(duration)
		];
	});

	const totalMinutes = timeEntries.reduce((sum, entry) => {
		return sum + calculateDurationMinutes(entry.startTime, entry.endTime);
	}, 0);

	autoTable(doc, {
		startY: 42,
		head: [['Datum', 'Start', 'Ende', 'Kategorie', 'Beschreibung', 'Dauer']],
		body: tableData,
		foot: [['', '', '', '', 'Gesamt:', formatDuration(totalMinutes)]],
		styles: { fontSize: 9 },
		headStyles: { fillColor: [66, 139, 202] },
		footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
		columnStyles: {
			0: { cellWidth: 25 },
			1: { cellWidth: 18 },
			2: { cellWidth: 18 },
			3: { cellWidth: 30 },
			4: { cellWidth: 'auto' },
			5: { cellWidth: 22 }
		}
	});

	const filename = options.filename || `timetracker-export-${formatDateForFilename(now)}.pdf`;
	doc.save(filename);
}
