/**
 * Import cloud snapshot to IndexedDB.
 * Spec refs: cloud-backup-and-auth.md
 */

import { openDB, put } from '$lib/storage/db';
import type { DatabaseSnapshot } from './snapshot';
import type { Category, TimeEntry, DayType, WorkTimeModel } from '$lib/types';

/**
 * Clear a single object store.
 */
async function clearStore(storeName: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		const request = store.clear();
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Import a cloud snapshot into IndexedDB.
 * Clears existing data and replaces with snapshot data.
 * Does NOT import outbox (local-only sync queue).
 */
export async function importSnapshot(snapshot: DatabaseSnapshot): Promise<void> {
	// Clear existing data stores (not meta, not outbox, not authSession)
	await Promise.all([
		clearStore('categories'),
		clearStore('timeEntries'),
		clearStore('dayTypes'),
		clearStore('workTimeModels')
	]);

	// Import categories
	for (const category of snapshot.categories ?? []) {
		await put<Category>('categories', category);
	}

	// Import time entries
	for (const entry of snapshot.timeEntries ?? []) {
		await put<TimeEntry>('timeEntries', entry);
	}

	// Import day types
	for (const dayType of snapshot.dayTypes ?? []) {
		await put<DayType>('dayTypes', dayType);
	}

	// Import work time models
	for (const model of snapshot.workTimeModels ?? []) {
		await put<WorkTimeModel>('workTimeModels', model);
	}

	console.log('[Restore] Imported snapshot:', {
		categories: snapshot.categories?.length ?? 0,
		timeEntries: snapshot.timeEntries?.length ?? 0,
		dayTypes: snapshot.dayTypes?.length ?? 0,
		workTimeModels: snapshot.workTimeModels?.length ?? 0
	});
}
