/**
 * IndexedDB wrapper for TimeTracker.
 * Provides async access to local storage (offline-first).
 * Spec refs: TT-IG (persistence), technical-guideline-v1 section 3.1
 */

const DB_NAME = 'timetracker';
const DB_VERSION = 2;

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
