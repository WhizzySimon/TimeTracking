/**
 * Import Presets
 *
 * Manages saved import configurations for reuse.
 * Stored in IndexedDB.
 *
 * Spec ref: Docs/Features/Specs/ai-import.md Section 7
 */

import type { ColumnMapping } from './parsers/csv';

export interface ImportPreset {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	columnMapping: ColumnMapping;
	sourcePattern?: string;
	categoryMappings: Record<string, string>;
}

const DB_NAME = 'timetracker';
const STORE_NAME = 'importPresets';

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 2);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'id' });
			}
		};
	});
}

export async function getPresets(): Promise<ImportPreset[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const store = tx.objectStore(STORE_NAME);
		const request = store.getAll();

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result || []);
	});
}

export async function getPreset(id: string): Promise<ImportPreset | null> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const store = tx.objectStore(STORE_NAME);
		const request = store.get(id);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result || null);
	});
}

export async function savePreset(
	preset: Omit<ImportPreset, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ImportPreset> {
	const db = await openDB();
	const now = Date.now();

	const newPreset: ImportPreset = {
		...preset,
		id: `preset_${now}_${Math.random().toString(36).slice(2, 9)}`,
		createdAt: now,
		updatedAt: now
	};

	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const request = store.add(newPreset);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(newPreset);
	});
}

export async function updatePreset(
	id: string,
	updates: Partial<ImportPreset>
): Promise<ImportPreset> {
	const existing = await getPreset(id);
	if (!existing) {
		throw new Error(`Preset ${id} not found`);
	}

	const updated: ImportPreset = {
		...existing,
		...updates,
		id,
		createdAt: existing.createdAt,
		updatedAt: Date.now()
	};

	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const request = store.put(updated);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(updated);
	});
}

export async function deletePreset(id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const request = store.delete(id);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

export function validatePresetName(name: string, existingPresets: ImportPreset[]): string | null {
	if (!name || !name.trim()) {
		return 'Name darf nicht leer sein';
	}

	if (name.length > 50) {
		return 'Name darf maximal 50 Zeichen haben';
	}

	const duplicate = existingPresets.find((p) => p.name.toLowerCase() === name.trim().toLowerCase());
	if (duplicate) {
		return 'Ein Preset mit diesem Namen existiert bereits';
	}

	return null;
}
