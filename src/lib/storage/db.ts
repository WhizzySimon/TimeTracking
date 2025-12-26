/**
 * IndexedDB wrapper for TimeTracker.
 * Provides async access to local storage (offline-first).
 * Spec refs: TT-IG (persistence), technical-guideline-v1 section 3.1
 */

const DB_NAME = 'timetracker';
const DB_VERSION = 7;

let dbInstance: IDBDatabase | null = null;

/**
 * Opens or returns the cached IndexedDB instance.
 */
export async function openDB(): Promise<IDBDatabase> {
	if (dbInstance) return dbInstance;

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			// Categories store
			if (!db.objectStoreNames.contains('categories')) {
				const store = db.createObjectStore('categories', { keyPath: 'id' });
				store.createIndex('name', 'name', { unique: true });
				store.createIndex('type', 'type', { unique: false });
			}

			// Meta store for flags like "seeded"
			if (!db.objectStoreNames.contains('meta')) {
				db.createObjectStore('meta', { keyPath: 'key' });
			}

			// Day types store (keyed by date YYYY-MM-DD)
			if (!db.objectStoreNames.contains('dayTypes')) {
				db.createObjectStore('dayTypes', { keyPath: 'date' });
			}

			// Time entries store
			if (!db.objectStoreNames.contains('timeEntries')) {
				const store = db.createObjectStore('timeEntries', { keyPath: 'id' });
				store.createIndex('date', 'date', { unique: false });
				store.createIndex('categoryId', 'categoryId', { unique: false });
			}

			// Work time models store
			if (!db.objectStoreNames.contains('workTimeModels')) {
				const store = db.createObjectStore('workTimeModels', { keyPath: 'id' });
				store.createIndex('validFrom', 'validFrom', { unique: false });
			}

			// Outbox store for sync queue (technical-guideline-v1 section 4.2)
			if (!db.objectStoreNames.contains('outbox')) {
				const store = db.createObjectStore('outbox', { keyPath: 'id' });
				store.createIndex('status', 'status', { unique: false });
				store.createIndex('createdAt', 'createdAt', { unique: false });
			}

			// Auth session store (technical-guideline-v1 section 5)
			if (!db.objectStoreNames.contains('authSession')) {
				db.createObjectStore('authSession', { keyPath: 'key' });
			}

			// Import batches store (ai-import.md Section 7)
			if (!db.objectStoreNames.contains('importBatches')) {
				const store = db.createObjectStore('importBatches', { keyPath: 'id' });
				store.createIndex('userId', 'userId', { unique: false });
				store.createIndex('status', 'status', { unique: false });
				store.createIndex('createdAt', 'createdAt', { unique: false });
			}

			// Import presets store (ai-import.md Section 7)
			if (!db.objectStoreNames.contains('importPresets')) {
				const store = db.createObjectStore('importPresets', { keyPath: 'id' });
				store.createIndex('name', 'name', { unique: true });
			}
		};

		request.onsuccess = (event) => {
			dbInstance = (event.target as IDBOpenDBRequest).result;
			resolve(dbInstance);
		};

		request.onerror = () => {
			reject(request.error);
		};
	});
}

/**
 * Generic get by key from a store.
 */
export async function getByKey<T>(storeName: string, key: string): Promise<T | undefined> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readonly');
		const store = tx.objectStore(storeName);
		const request = store.get(key);
		request.onsuccess = () => resolve(request.result as T | undefined);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Generic getAll from a store.
 */
export async function getAll<T>(storeName: string): Promise<T[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readonly');
		const store = tx.objectStore(storeName);
		const request = store.getAll();
		request.onsuccess = () => resolve(request.result as T[]);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Generic put (upsert) into a store.
 */
export async function put<T>(storeName: string, value: T): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		const request = store.put(value);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Generic delete by key from a store.
 */
export async function deleteByKey(storeName: string, key: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readwrite');
		const store = tx.objectStore(storeName);
		const request = store.delete(key);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

/**
 * Get entries by date range using the date index.
 * More efficient than getAll + filter for large datasets.
 */
export async function getEntriesByDateRange<T>(
	storeName: string,
	startDate: string,
	endDate: string
): Promise<T[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readonly');
		const store = tx.objectStore(storeName);
		const index = store.index('date');
		const range = IDBKeyRange.bound(startDate, endDate);
		const request = index.getAll(range);
		request.onsuccess = () => resolve(request.result as T[]);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Get all entries for a specific date using the date index.
 */
export async function getEntriesByDate<T>(storeName: string, date: string): Promise<T[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeName, 'readonly');
		const store = tx.objectStore(storeName);
		const index = store.index('date');
		const request = index.getAll(date);
		request.onsuccess = () => resolve(request.result as T[]);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Clear entire database (for testing).
 */
export async function clearDatabase(): Promise<void> {
	const db = await openDB();
	const storeNames = Array.from(db.objectStoreNames);
	return new Promise((resolve, reject) => {
		const tx = db.transaction(storeNames, 'readwrite');
		let pending = storeNames.length;
		if (pending === 0) {
			resolve();
			return;
		}
		for (const name of storeNames) {
			const request = tx.objectStore(name).clear();
			request.onsuccess = () => {
				pending--;
				if (pending === 0) resolve();
			};
			request.onerror = () => reject(request.error);
		}
	});
}
