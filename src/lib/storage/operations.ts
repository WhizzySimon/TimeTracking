/**
 * Data operations with outbox integration.
 * All write operations create outbox entries for sync.
 * Spec refs: technical-guideline-v1 section 4.2
 */

import { put, deleteByKey } from './db';
import { addToOutbox } from '$lib/sync/outbox';
import { syncNow } from '$lib/sync/engine';
import { markLocalChanged } from '$lib/backup/cloud';
import { roundToFiveMinutes } from '$lib/utils/date';
import type { TimeEntry, DayType, WorkTimeModel, Category } from '$lib/types';

/**
 * Trigger sync after operation (fire-and-forget, non-blocking).
 */
function triggerSync(): void {
	syncNow().catch((err) => console.error('[Operations] Sync failed:', err));
}

/**
 * Mark local data as changed (for cloud backup tracking).
 */
function markChanged(): void {
	markLocalChanged().catch((err) => console.error('[Operations] Mark changed failed:', err));
}

/**
 * Save a time entry and add to outbox.
 * IMPORTANT: Times are automatically rounded to 5-minute increments.
 * This ensures consistent time granularity across the entire app.
 */
export async function saveTimeEntry(entry: TimeEntry): Promise<void> {
	// Round times to 5-minute increments (centralized - no need to round at call sites)
	const normalizedEntry: TimeEntry = {
		...entry,
		startTime: roundToFiveMinutes(entry.startTime),
		endTime: entry.endTime ? roundToFiveMinutes(entry.endTime) : null
	};

	await put('timeEntries', normalizedEntry);
	await addToOutbox('entry_upsert', normalizedEntry);
	markChanged();
	triggerSync();
}

/**
 * Delete a time entry and add to outbox.
 */
export async function deleteTimeEntry(id: string): Promise<void> {
	await deleteByKey('timeEntries', id);
	await addToOutbox('entry_delete', { id });
	markChanged();
	triggerSync();
}

/**
 * Save a day type and add to outbox.
 */
export async function saveDayType(dayType: DayType): Promise<void> {
	await put('dayTypes', dayType);
	await addToOutbox('dayType_upsert', dayType);
	markChanged();
	triggerSync();
}

/**
 * Save a work time model and add to outbox.
 */
export async function saveWorkTimeModel(model: WorkTimeModel): Promise<void> {
	await put('workTimeModels', model);
	await addToOutbox('workTimeModel_upsert', model);
	markChanged();
	triggerSync();
}

/**
 * Delete a work time model and add to outbox.
 */
export async function deleteWorkTimeModel(id: string): Promise<void> {
	await deleteByKey('workTimeModels', id);
	await addToOutbox('workTimeModel_delete', { id });
	markChanged();
	triggerSync();
}

/**
 * Save a user category and add to outbox.
 * Note: System categories are not synced (they're fixed).
 */
export async function saveUserCategory(category: Category): Promise<void> {
	await put('categories', category);
	markChanged();
	if (category.type === 'user') {
		await addToOutbox('category_upsert', category);
		triggerSync();
	}
}

/**
 * Delete a user category and add to outbox.
 */
export async function deleteUserCategoryWithSync(id: string): Promise<void> {
	await deleteByKey('categories', id);
	await addToOutbox('category_delete', { id });
	markChanged();
	triggerSync();
}
