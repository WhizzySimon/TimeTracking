/**
 * Data operations with outbox integration.
 * All write operations create outbox entries for sync.
 * Spec refs: technical-guideline-v1 section 4.2
 */

import { put, deleteByKey } from './db';
import { addToOutbox } from '$lib/sync/outbox';
import type { TimeEntry, DayType, WorkTimeModel, Category } from '$lib/types';

/**
 * Save a time entry and add to outbox.
 */
export async function saveTimeEntry(entry: TimeEntry): Promise<void> {
	await put('timeEntries', entry);
	await addToOutbox('entry_upsert', entry);
}

/**
 * Delete a time entry and add to outbox.
 */
export async function deleteTimeEntry(id: string): Promise<void> {
	await deleteByKey('timeEntries', id);
	await addToOutbox('entry_delete', { id });
}

/**
 * Save a day type and add to outbox.
 */
export async function saveDayType(dayType: DayType): Promise<void> {
	await put('dayTypes', dayType);
	await addToOutbox('dayType_upsert', dayType);
}

/**
 * Save a work time model and add to outbox.
 */
export async function saveWorkTimeModel(model: WorkTimeModel): Promise<void> {
	await put('workTimeModels', model);
	await addToOutbox('workTimeModel_upsert', model);
}

/**
 * Delete a work time model and add to outbox.
 */
export async function deleteWorkTimeModel(id: string): Promise<void> {
	await deleteByKey('workTimeModels', id);
	await addToOutbox('workTimeModel_delete', { id });
}

/**
 * Save a user category and add to outbox.
 * Note: System categories are not synced (they're fixed).
 */
export async function saveUserCategory(category: Category): Promise<void> {
	await put('categories', category);
	if (category.type === 'user') {
		await addToOutbox('category_upsert', category);
	}
}

/**
 * Delete a user category and add to outbox.
 */
export async function deleteUserCategoryWithSync(id: string): Promise<void> {
	await deleteByKey('categories', id);
	await addToOutbox('category_delete', { id });
}
