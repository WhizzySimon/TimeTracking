/**
 * Import cloud snapshot to IndexedDB.
 * Spec refs: cloud-backup-and-auth.md
 *
 * P09 SPEC COMPLIANCE:
 * - Section 2.2: Auth tokens MUST survive page reload and SW updates
 * - Section 2.2: Clearing caches MUST NOT clear authentication storage
 *   This module explicitly does NOT clear 'authSession' store during import.
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
 * Deep clone an object to ensure it's IndexedDB-safe.
 * Removes any non-serializable properties (functions, symbols, etc.)
 */
function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Import a cloud snapshot into IndexedDB.
 * Clears existing data and replaces with snapshot data.
 * Does NOT import outbox (local-only sync queue).
 * Deep-clones all data to ensure IndexedDB compatibility.
 */
export async function importSnapshot(snapshot: DatabaseSnapshot): Promise<void> {
	// Deep clone the snapshot to ensure all objects are IndexedDB-safe
	// (Supabase JSONB might return objects with non-cloneable properties)
	const safeSnapshot = deepClone(snapshot);

	// Clear existing data stores (not meta, not outbox, not authSession)
	await Promise.all([
		clearStore('categories'),
		clearStore('timeEntries'),
		clearStore('dayTypes'),
		clearStore('workTimeModels')
	]);

	// Import categories
	for (const category of safeSnapshot.categories ?? []) {
		await put<Category>('categories', category);
	}

	// Import time entries
	for (const entry of safeSnapshot.timeEntries ?? []) {
		await put<TimeEntry>('timeEntries', entry);
	}

	// Import day types
	for (const dayType of safeSnapshot.dayTypes ?? []) {
		await put<DayType>('dayTypes', dayType);
	}

	// Import work time models
	for (const model of safeSnapshot.workTimeModels ?? []) {
		await put<WorkTimeModel>('workTimeModels', model);
	}

	console.log('[Restore] Imported snapshot:', {
		categories: safeSnapshot.categories?.length ?? 0,
		timeEntries: safeSnapshot.timeEntries?.length ?? 0,
		dayTypes: safeSnapshot.dayTypes?.length ?? 0,
		workTimeModels: safeSnapshot.workTimeModels?.length ?? 0
	});
}
