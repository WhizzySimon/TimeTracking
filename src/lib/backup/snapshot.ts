/**
 * IndexedDB snapshot export/import for cloud backup.
 * Spec refs: cloud-backup-and-auth.md
 */

import { getAll } from '$lib/storage/db';
import type { Category, TimeEntry, DayType, WorkTimeModel, OutboxItem } from '$lib/types';

export interface SnapshotMeta {
	schemaVersion: number;
	/** ISO 8601 timestamp of export (e.g., "2025-12-22T12:30:00.000Z") */
	exportedAt: string;
	/** Epoch milliseconds of export (for programmatic use) */
	exportedAtMs: number;
	appVersion: string;
	/** IANA timezone string (e.g., "Europe/Berlin") if available */
	tz?: string;
	/** Timezone offset in minutes behind UTC (e.g., 60 for UTC+1, 120 for UTC+2). Uses Date.getTimezoneOffset() convention. */
	tzOffsetMinutes: number;
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

	const now = new Date();

	// Get IANA timezone if available (e.g., "Europe/Berlin")
	let tz: string | undefined;
	try {
		tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch {
		// Intl not available in some environments
	}

	return {
		meta: {
			schemaVersion: 1,
			exportedAt: now.toISOString(),
			exportedAtMs: now.getTime(),
			appVersion,
			tz,
			tzOffsetMinutes: now.getTimezoneOffset()
		},
		categories,
		timeEntries,
		dayTypes,
		workTimeModels,
		outbox
	};
}
