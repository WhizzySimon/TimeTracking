/**
 * Import cloud snapshot to IndexedDB.
 * Spec refs: cloud-backup-and-auth.md
 *
 * Includes normalization for:
 * - Legacy category IDs (plain UUID → user-prefixed)
 * - Missing employerId on entities
 */

import { openDB, put } from '$lib/storage/db';
import type { DatabaseSnapshot } from './snapshot';
import type {
	Category,
	TimeEntry,
	DayType,
	WorkTimeModel,
	UserPreference,
	Employer
} from '$lib/types';

// Regex to detect legacy UUID format (no prefix)
const LEGACY_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
 * Normalize snapshot data before import:
 * 1. Normalize legacy category IDs (plain UUID → user-prefixed)
 * 2. Assign employerId to entities missing it
 * 3. Rewrite timeEntry.categoryId to match normalized category IDs
 */
function normalizeSnapshot(
	snapshot: DatabaseSnapshot,
	defaultEmployerId: string | null
): { snapshot: DatabaseSnapshot; normalizationLog: NormalizationLog } {
	const log: NormalizationLog = {
		categoriesNormalized: 0,
		entriesRewritten: 0,
		entriesMissingEmployerId: 0,
		categoriesMissingEmployerId: 0,
		modelsMissingEmployerId: 0,
		dayTypesMissingEmployerId: 0
	};

	// Build map of old categoryId → new categoryId for legacy IDs
	const categoryIdMap = new Map<string, string>();
	const normalizedCategories = (snapshot.categories ?? []).map((cat) => {
		let newId = cat.id;

		// Normalize legacy UUID → user-prefixed
		if (LEGACY_UUID_REGEX.test(cat.id) && cat.type === 'user') {
			newId = `user-${cat.id}`;
			categoryIdMap.set(cat.id, newId);
			log.categoriesNormalized++;
		}

		// Assign employerId if missing
		let employerId = cat.employerId;
		if (employerId === null || employerId === undefined) {
			if (defaultEmployerId) {
				employerId = defaultEmployerId;
				log.categoriesMissingEmployerId++;
			}
		}

		return { ...cat, id: newId, employerId };
	});

	// Rewrite timeEntry.categoryId and assign employerId
	const normalizedEntries = (snapshot.timeEntries ?? []).map((entry) => {
		let categoryId = entry.categoryId;
		if (categoryIdMap.has(categoryId)) {
			categoryId = categoryIdMap.get(categoryId)!;
			log.entriesRewritten++;
		}

		let employerId = entry.employerId;
		if (employerId === null || employerId === undefined) {
			if (defaultEmployerId) {
				employerId = defaultEmployerId;
				log.entriesMissingEmployerId++;
			}
		}

		return { ...entry, categoryId, employerId };
	});

	// Assign employerId to work time models if missing
	const normalizedModels = (snapshot.workTimeModels ?? []).map((model) => {
		let employerId = model.employerId;
		if (employerId === null || employerId === undefined) {
			if (defaultEmployerId) {
				employerId = defaultEmployerId;
				log.modelsMissingEmployerId++;
			}
		}
		return { ...model, employerId };
	});

	// Assign employerId to day types if missing (STRICT EMPLOYER MODEL)
	const normalizedDayTypes = (snapshot.dayTypes ?? []).map((dayType) => {
		let employerId = dayType.employerId;
		if (employerId === null || employerId === undefined) {
			if (defaultEmployerId) {
				employerId = defaultEmployerId;
				log.dayTypesMissingEmployerId++;
			}
		}
		return { ...dayType, employerId };
	});

	return {
		snapshot: {
			...snapshot,
			categories: normalizedCategories,
			timeEntries: normalizedEntries,
			workTimeModels: normalizedModels,
			dayTypes: normalizedDayTypes
		},
		normalizationLog: log
	};
}

interface NormalizationLog {
	categoriesNormalized: number;
	entriesRewritten: number;
	entriesMissingEmployerId: number;
	categoriesMissingEmployerId: number;
	modelsMissingEmployerId: number;
	dayTypesMissingEmployerId: number;
}

/**
 * Import a cloud snapshot into IndexedDB.
 * Clears existing data and replaces with snapshot data.
 * Does NOT import outbox (local-only sync queue).
 * Deep-clones all data to ensure IndexedDB compatibility.
 *
 * @param snapshot - The snapshot to import
 * @param defaultEmployerId - If provided, assign this employerId to entities missing it
 */
export async function importSnapshot(
	snapshot: DatabaseSnapshot,
	defaultEmployerId: string | null = null
): Promise<void> {
	const safeSnapshot = deepClone(snapshot);

	// Normalize data (category IDs, employerId)
	const { snapshot: normalizedSnapshot, normalizationLog } = normalizeSnapshot(
		safeSnapshot,
		defaultEmployerId
	);

	if (
		normalizationLog.categoriesNormalized > 0 ||
		normalizationLog.entriesMissingEmployerId > 0 ||
		normalizationLog.categoriesMissingEmployerId > 0 ||
		normalizationLog.modelsMissingEmployerId > 0 ||
		normalizationLog.dayTypesMissingEmployerId > 0
	) {
		console.log('[Restore] Normalization applied:', normalizationLog);
	}

	await Promise.all([
		clearStore('categories'),
		clearStore('timeEntries'),
		clearStore('dayTypes'),
		clearStore('workTimeModels'),
		clearStore('userPreferences'),
		clearStore('employers')
	]);

	const counts = {
		categories: await importItems<Category>('categories', normalizedSnapshot.categories),
		timeEntries: await importItems<TimeEntry>('timeEntries', normalizedSnapshot.timeEntries),
		dayTypes: await importItems<DayType>('dayTypes', normalizedSnapshot.dayTypes),
		workTimeModels: await importItems<WorkTimeModel>(
			'workTimeModels',
			normalizedSnapshot.workTimeModels
		),
		userPreferences: await importItems<UserPreference>(
			'userPreferences',
			normalizedSnapshot.userPreferences
		),
		employers: await importItems<Employer>('employers', normalizedSnapshot.employers)
	};

	console.log('[Restore] Imported snapshot:', counts);
}
