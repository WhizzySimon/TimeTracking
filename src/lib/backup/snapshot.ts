/**
 * IndexedDB snapshot export/import for cloud backup.
 * Spec refs: cloud-backup-and-auth.md
 */

import { getAll } from '$lib/storage/db';
import type { Category, TimeEntry, DayType, WorkTimeModel, OutboxItem } from '$lib/types';

export interface SnapshotMeta {
	schemaVersion: number;
	exportedAt: string;
	appVersion: string;
}

export interface DatabaseSnapshot {
	meta: SnapshotMeta;
	categories: Category[];
	timeEntries: TimeEntry[];
	dayTypes: DayType[];
	workTimeModels: WorkTimeModel[];
	outbox: OutboxItem[];
}

/**
 * Export full IndexedDB snapshot for cloud backup.
 */
export async function exportSnapshot(): Promise<DatabaseSnapshot> {
	const [categories, timeEntries, dayTypes, workTimeModels, outbox] = await Promise.all([
		getAll<Category>('categories'),
		getAll<TimeEntry>('timeEntries'),
		getAll<DayType>('dayTypes'),
		getAll<WorkTimeModel>('workTimeModels'),
		getAll<OutboxItem>('outbox')
	]);

	let appVersion = 'unknown';
	try {
		const response = await fetch('/version.json');
		const versionInfo = await response.json();
		appVersion = versionInfo.version;
	} catch {
		console.warn('[Snapshot] Could not fetch app version');
	}

	return {
		meta: {
			schemaVersion: 1,
			exportedAt: new Date().toISOString(),
			appVersion
		},
		categories,
		timeEntries,
		dayTypes,
		workTimeModels,
		outbox
	};
}
