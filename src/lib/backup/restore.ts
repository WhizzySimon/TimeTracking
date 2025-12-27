/**
 * Import cloud snapshot to IndexedDB.
 * Spec refs: cloud-backup-and-auth.md
 */

import { openDB, put } from '$lib/storage/db';
import type { DatabaseSnapshot } from './snapshot';
import type { Category, TimeEntry, DayType, WorkTimeModel, UserPreference } from '$lib/types';

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
 * Deep clone an object to ensure it's IndexedDB-safe.
 * Removes any non-serializable properties (functions, symbols, etc.)
 */
function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Import items into a store.
 */
async function importItems<T>(storeName: string, items: T[] | undefined): Promise<number> {
	const safeItems = items ?? [];
	for (const item of safeItems) {
		await put<T>(storeName, item);
	}
	return safeItems.length;
}

/**
 * Import a cloud snapshot into IndexedDB.
 * Clears existing data and replaces with snapshot data.
 * Does NOT import outbox (local-only sync queue).
 * Deep-clones all data to ensure IndexedDB compatibility.
 */
export async function importSnapshot(snapshot: DatabaseSnapshot): Promise<void> {
	const safeSnapshot = deepClone(snapshot);

	await Promise.all([
		clearStore('categories'),
		clearStore('timeEntries'),
		clearStore('dayTypes'),
		clearStore('workTimeModels'),
		clearStore('userPreferences')
	]);

	const counts = {
		categories: await importItems<Category>('categories', safeSnapshot.categories),
		timeEntries: await importItems<TimeEntry>('timeEntries', safeSnapshot.timeEntries),
		dayTypes: await importItems<DayType>('dayTypes', safeSnapshot.dayTypes),
		workTimeModels: await importItems<WorkTimeModel>('workTimeModels', safeSnapshot.workTimeModels),
		userPreferences: await importItems<UserPreference>(
			'userPreferences',
			safeSnapshot.userPreferences
		)
	};

	console.log('[Restore] Imported snapshot:', counts);
}
