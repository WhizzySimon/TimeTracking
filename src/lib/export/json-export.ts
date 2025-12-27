/**
 * JSON Export for TimeTracker.
 * Exports all user data as a JSON file for backup/transfer.
 * Spec refs: Docs/Specs/subscription-plans.md
 */

import { getAll } from '$lib/storage/db';
import type { Category, TimeEntry, DayType, WorkTimeModel } from '$lib/types';

export interface JsonExportOptions {
	filename?: string;
}

export interface ExportData {
	meta: {
		version: string;
		exportedAt: string;
		schemaVersion: number;
	};
	categories: Category[];
	timeEntries: TimeEntry[];
	dayTypes: DayType[];
	workTimeModels: WorkTimeModel[];
}

async function getAppVersion(): Promise<string> {
	try {
		const response = await fetch('/version.json');
		const versionInfo = await response.json();
		return versionInfo.version || 'unknown';
	} catch {
		return 'unknown';
	}
}

function triggerDownload(content: string, filename: string): void {
	const blob = new Blob([content], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function formatDateForFilename(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export async function exportToJson(options: JsonExportOptions = {}): Promise<void> {
	const [categories, timeEntries, dayTypes, workTimeModels] = await Promise.all([
		getAll<Category>('categories'),
		getAll<TimeEntry>('timeEntries'),
		getAll<DayType>('dayTypes'),
		getAll<WorkTimeModel>('workTimeModels')
	]);

	const appVersion = await getAppVersion();
	const now = new Date();

	const exportData: ExportData = {
		meta: {
			version: appVersion,
			exportedAt: now.toISOString(),
			schemaVersion: 1
		},
		categories,
		timeEntries,
		dayTypes,
		workTimeModels
	};

	const jsonContent = JSON.stringify(exportData, null, 2);
	const filename = options.filename || `timetracker-backup-${formatDateForFilename(now)}.json`;

	triggerDownload(jsonContent, filename);
}
