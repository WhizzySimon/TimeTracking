/**
 * Cloud sync service using Supabase (2-way sync).
 * Spec refs: cloud-backup-and-auth.md
 *
 * P09 SPEC COMPLIANCE:
 * - Section 3: Sync conflict detection with semantic comparison
 * - Section 4: Automatic conflict resolution (merge before user interaction)
 * - Section 5: User interaction only when auto-resolution fails
 * - Section 7: Code documentation for conflict logic
 */

import { getSupabase, isSupabaseConfigured } from '$lib/supabase/client';
import { getCurrentUserId } from '$lib/api/auth';
import { exportSnapshot, type DatabaseSnapshot } from './snapshot';
import { importSnapshot } from './restore';
import { put, getByKey, getAll } from '$lib/storage/db';
import type { TimeEntry, Category, DayType, WorkTimeModel } from '$lib/types';

const SYNC_META_KEY = 'cloudSyncMeta';

/**
 * Local metadata for cloud sync state.
 * Stored in IndexedDB 'meta' store.
 */
export interface CloudSyncMeta {
	key: string;
	lastSyncAt: string | null; // When last successful sync completed
	lastCloudUpdatedAt: string | null; // Cloud's updated_at at last sync
	localChangedAt: string | null; // When local data last changed
}

/**
 * Sync action determined by comparing local and cloud state.
 * P09 Section 4: 'merge' action added for automatic conflict resolution.
 */
export type SyncAction = 'upload' | 'restore' | 'conflict' | 'merge' | 'noop';

/**
 * P09 Section 3.1: Definition of what constitutes a sync conflict.
 *
 * A REAL conflict occurs when:
 * - Same entity (by ID) exists in both local and cloud with DIFFERENT semantic content
 * - User intent cannot be automatically determined
 *
 * NOT a conflict (P09 Section 3.1):
 * - Timestamp-only differences (meta.exportedAt, etc.)
 * - Reordered but semantically identical data
 * - Locally cached values identical to cloud state
 * - One side has entries the other doesn't (can be merged)
 */
export interface ConflictAnalysis {
	/** True if there are real conflicts that require user decision */
	hasRealConflicts: boolean;
	/** True if data can be merged without losing information */
	canAutoMerge: boolean;
	/** Merged snapshot if auto-merge is possible */
	mergedSnapshot?: DatabaseSnapshot;
	/** Description of conflicts for user (P09 Section 5.2) */
	conflictDescription?: string;
	/** What would be lost if user chooses local */
	localChoiceLoss?: string;
	/** What would be lost if user chooses cloud */
	cloudChoiceLoss?: string;
}

/**
 * Determine what sync action to take based on local meta and cloud state.
 * Implements decision table from spec.
 *
 * P09 Section 3.2: Conflicts are detected during automatic sync.
 * P09 Section 4.1: Automatic resolution is attempted first.
 */
export function determineSyncAction(
	localMeta: CloudSyncMeta | null,
	cloudUpdatedAt: string | null,
	cloudHasData: boolean,
	localHasData: boolean = true
): SyncAction {
	const neverSynced = !localMeta?.lastSyncAt;
	const hasLocalChanges = localMeta?.localChangedAt != null;
	const isFreshInstall = neverSynced && !hasLocalChanges && !localHasData;

	// Fresh install with no local data: always restore if cloud has data
	if (isFreshInstall && cloudHasData) {
		return 'restore';
	}

	// Never synced but both have data: conflict (user must choose)
	if (neverSynced && cloudHasData && localHasData) {
		return 'conflict';
	}

	// Never synced, no cloud data: upload local data
	if (!cloudHasData) {
		return 'upload';
	}

	const cloudChanged =
		cloudUpdatedAt != null &&
		(localMeta?.lastCloudUpdatedAt == null ||
			new Date(cloudUpdatedAt) > new Date(localMeta.lastCloudUpdatedAt));

	if (hasLocalChanges && cloudChanged) {
		return 'conflict';
	}
	if (hasLocalChanges) {
		return 'upload';
	}
	if (cloudChanged) {
		return 'restore';
	}
	return 'noop';
}

// --------- START: P09 Semantic Conflict Detection ---------

/**
 * P09 Section 3.1: Compare two entities for semantic equality.
 * Ignores timestamp-only differences and field ordering.
 *
 * Two entities are semantically equal if all user-meaningful fields match.
 * Metadata fields (createdAt, updatedAt, etc.) are ignored.
 */
function areEntitiesSemanticallyEqual<T extends { id: string }>(a: T, b: T): boolean {
	// Compare by serializing without timestamp fields
	const normalize = (obj: T): string => {
		const copy = { ...obj } as Record<string, unknown>;
		// Remove timestamp/meta fields that don't affect semantic meaning
		delete copy.createdAt;
		delete copy.updatedAt;
		delete copy.syncedAt;
		// Sort keys for consistent comparison
		return JSON.stringify(copy, Object.keys(copy).sort());
	};
	return normalize(a) === normalize(b);
}

/**
 * P09 Section 3.1 & 4.2: Analyze conflicts between local and cloud data.
 * Attempts to merge data without losing information.
 *
 * Merge strategy (P09 Section 4.2):
 * - Union of entries that exist only on one side
 * - For entries on both sides: keep if semantically equal, conflict if different
 */
export async function analyzeConflicts(cloudSnapshot: DatabaseSnapshot): Promise<ConflictAnalysis> {
	// Get current local data
	const [localEntries, localCategories, localDayTypes, localWorkTimeModels] = await Promise.all([
		getAll<TimeEntry>('timeEntries'),
		getAll<Category>('categories'),
		getAll<DayType>('dayTypes'),
		getAll<WorkTimeModel>('workTimeModels')
	]);

	const cloudEntries = cloudSnapshot.timeEntries ?? [];
	const cloudCategories = cloudSnapshot.categories ?? [];
	const cloudDayTypes = cloudSnapshot.dayTypes ?? [];
	const cloudWorkTimeModels = cloudSnapshot.workTimeModels ?? [];

	// Build ID maps for comparison
	const localEntryMap = new Map(localEntries.map((e) => [e.id, e]));
	const cloudEntryMap = new Map(cloudEntries.map((e) => [e.id, e]));
	const localCategoryMap = new Map(localCategories.map((c) => [c.id, c]));
	const cloudCategoryMap = new Map(cloudCategories.map((c) => [c.id, c]));

	// P09 Section 3.1: Find real conflicts (same ID, different content)
	const conflictingEntries: string[] = [];
	const conflictingCategories: string[] = [];

	// Check time entries for conflicts
	for (const [id, localEntry] of localEntryMap) {
		const cloudEntry = cloudEntryMap.get(id);
		if (cloudEntry && !areEntitiesSemanticallyEqual(localEntry, cloudEntry)) {
			conflictingEntries.push(id);
		}
	}

	// Check categories for conflicts
	for (const [id, localCat] of localCategoryMap) {
		const cloudCat = cloudCategoryMap.get(id);
		if (cloudCat && !areEntitiesSemanticallyEqual(localCat, cloudCat)) {
			conflictingCategories.push(id);
		}
	}

	const hasRealConflicts = conflictingEntries.length > 0 || conflictingCategories.length > 0;

	// P09 Section 4.2: If no real conflicts, we can auto-merge
	if (!hasRealConflicts) {
		// Merge: union of all entries from both sides
		const mergedEntries = mergeArraysById(localEntries, cloudEntries);
		const mergedCategories = mergeArraysById(localCategories, cloudCategories);
		// DayType uses 'date' as key, not 'id'
		const mergedDayTypes = mergeArraysByKey(localDayTypes, cloudDayTypes, 'date');
		const mergedWorkTimeModels = mergeArraysById(localWorkTimeModels, cloudWorkTimeModels);

		const mergedSnapshot: DatabaseSnapshot = {
			meta: {
				schemaVersion: cloudSnapshot.meta.schemaVersion,
				exportedAt: new Date().toISOString(),
				exportedAtMs: Date.now(),
				appVersion: cloudSnapshot.meta.appVersion,
				tz: cloudSnapshot.meta.tz,
				tzOffsetMinutes: cloudSnapshot.meta.tzOffsetMinutes
			},
			categories: mergedCategories,
			timeEntries: mergedEntries,
			dayTypes: mergedDayTypes,
			workTimeModels: mergedWorkTimeModels,
			outbox: [] // Outbox is local-only
		};

		return {
			hasRealConflicts: false,
			canAutoMerge: true,
			mergedSnapshot
		};
	}

	// P09 Section 5.2: Build user-friendly conflict description
	const localOnlyEntries = localEntries.filter((e) => !cloudEntryMap.has(e.id)).length;
	const cloudOnlyEntries = cloudEntries.filter((e) => !localEntryMap.has(e.id)).length;

	let conflictDescription = 'Einige Einträge wurden sowohl lokal als auch in der Cloud geändert.';
	if (conflictingEntries.length > 0) {
		conflictDescription += ` ${conflictingEntries.length} Zeiteinträge haben unterschiedliche Werte.`;
	}
	if (conflictingCategories.length > 0) {
		conflictDescription += ` ${conflictingCategories.length} Kategorien haben unterschiedliche Werte.`;
	}

	// P09 Section 5.2: Describe what would be lost with each choice
	let localChoiceLoss = '';
	let cloudChoiceLoss = '';

	if (cloudOnlyEntries > 0) {
		localChoiceLoss = `${cloudOnlyEntries} Einträge aus der Cloud werden überschrieben.`;
	}
	if (localOnlyEntries > 0) {
		cloudChoiceLoss = `${localOnlyEntries} lokale Einträge werden überschrieben.`;
	}

	return {
		hasRealConflicts: true,
		canAutoMerge: false,
		conflictDescription,
		localChoiceLoss: localChoiceLoss || 'Keine Daten gehen verloren.',
		cloudChoiceLoss: cloudChoiceLoss || 'Keine Daten gehen verloren.'
	};
}

/**
 * P09 Section 4.2: Merge two arrays by ID, preferring local for duplicates.
 * Used for auto-merge when no real conflicts exist.
 */
function mergeArraysById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
	const merged = new Map<string, T>();

	// Add all cloud entries first
	for (const item of cloud) {
		merged.set(item.id, item);
	}

	// Override with local entries (local takes precedence for identical IDs)
	for (const item of local) {
		merged.set(item.id, item);
	}

	return Array.from(merged.values());
}

/**
 * P09 Section 4.2: Merge two arrays by a custom key field.
 * Used for entities like DayType that use 'date' instead of 'id'.
 */
function mergeArraysByKey<T, K extends keyof T>(local: T[], cloud: T[], keyField: K): T[] {
	const merged = new Map<T[K], T>();

	// Add all cloud entries first
	for (const item of cloud) {
		merged.set(item[keyField], item);
	}

	// Override with local entries (local takes precedence)
	for (const item of local) {
		merged.set(item[keyField], item);
	}

	return Array.from(merged.values());
}

// --------- END: P09 Semantic Conflict Detection ---------

/**
 * Save current database snapshot to cloud.
 * @returns Success status and timestamp
 */
export async function saveToCloud(): Promise<{
	success: boolean;
	timestamp?: string;
	error?: string;
}> {
	if (!isSupabaseConfigured()) {
		return { success: false, error: 'Supabase nicht konfiguriert' };
	}

	const userId = await getCurrentUserId();
	if (!userId) {
		return { success: false, error: 'Nicht angemeldet' };
	}

	try {
		const snapshot = await exportSnapshot();
		const supabase = getSupabase();

		const { error } = await supabase.from('user_backups').upsert(
			{
				user_id: userId,
				snapshot: snapshot as unknown as Record<string, unknown>,
				schema_version: snapshot.meta.schemaVersion,
				updated_at: new Date().toISOString()
			},
			{
				onConflict: 'user_id'
			}
		);

		if (error) {
			console.error('[CloudSync] Upload failed:', error.message);
			return { success: false, error: error.message };
		}

		const timestamp = new Date().toISOString();
		await updateSyncMeta(timestamp, timestamp);

		console.log('[CloudSync] Uploaded successfully at:', timestamp);
		return { success: true, timestamp };
	} catch (e) {
		console.error('[CloudSync] Upload failed:', e);
		return {
			success: false,
			error: e instanceof Error ? e.message : 'Unbekannter Fehler'
		};
	}
}

/**
 * Get cloud sync metadata from local storage.
 */
export async function getSyncMeta(): Promise<CloudSyncMeta | null> {
	try {
		const meta = await getByKey<CloudSyncMeta>('meta', SYNC_META_KEY);
		return meta ?? null;
	} catch {
		return null;
	}
}

/**
 * Update local sync metadata after successful sync.
 * Clears localChangedAt to indicate data is synced.
 */
export async function updateSyncMeta(
	lastSyncAt: string,
	lastCloudUpdatedAt: string
): Promise<void> {
	try {
		await put('meta', {
			key: SYNC_META_KEY,
			lastSyncAt,
			lastCloudUpdatedAt,
			localChangedAt: null // Clear local changes flag after sync
		});
	} catch (e) {
		console.error('[CloudSync] Failed to update meta:', e);
	}
}

/**
 * Mark that local data has changed (needs sync).
 * Called by operations.ts on any data write.
 */
export async function markLocalChanged(): Promise<void> {
	try {
		const existing = await getSyncMeta();
		await put('meta', {
			key: SYNC_META_KEY,
			lastSyncAt: existing?.lastSyncAt ?? null,
			lastCloudUpdatedAt: existing?.lastCloudUpdatedAt ?? null,
			localChangedAt: new Date().toISOString()
		});
	} catch (e) {
		console.error('[CloudSync] Failed to mark local changed:', e);
	}
}

/**
 * Check if sync action is needed.
 * Returns true if:
 * - Never synced before (fresh install or cleared cache)
 * - Local changes exist since last sync
 */
export async function needsSync(): Promise<boolean> {
	const meta = await getSyncMeta();
	// Never synced = needs sync (to check cloud state)
	if (!meta?.lastSyncAt) {
		return true;
	}
	// Has local changes since last sync
	return meta.localChangedAt != null;
}

/**
 * Cloud snapshot with metadata.
 */
export interface CloudSnapshotWithMeta {
	snapshot: DatabaseSnapshot | null;
	updatedAt: string | null;
	hasData: boolean;
}

/**
 * Fetch cloud snapshot with updated_at timestamp.
 * Used by syncWithCloud to determine sync action.
 */
export async function getCloudSnapshotWithMeta(): Promise<CloudSnapshotWithMeta> {
	if (!isSupabaseConfigured()) {
		return { snapshot: null, updatedAt: null, hasData: false };
	}

	const userId = await getCurrentUserId();
	if (!userId) {
		return { snapshot: null, updatedAt: null, hasData: false };
	}

	try {
		const supabase = getSupabase();
		const { data, error } = await supabase
			.from('user_backups')
			.select('snapshot, updated_at')
			.eq('user_id', userId)
			.single();

		if (error) {
			// PGRST116 = no rows found (not an error for our purposes)
			if (error.code === 'PGRST116') {
				return { snapshot: null, updatedAt: null, hasData: false };
			}
			console.error('[CloudSync] Fetch failed:', error.message);
			return { snapshot: null, updatedAt: null, hasData: false };
		}

		// Deep clone snapshot to ensure it's safe for IndexedDB storage later
		// (Supabase JSONB might return objects with non-cloneable properties)
		const safeSnapshot = data?.snapshot
			? (JSON.parse(JSON.stringify(data.snapshot)) as DatabaseSnapshot)
			: null;

		return {
			snapshot: safeSnapshot,
			updatedAt: data?.updated_at as string | null,
			hasData: safeSnapshot != null
		};
	} catch (e) {
		console.error('[CloudSync] Fetch failed:', e);
		return { snapshot: null, updatedAt: null, hasData: false };
	}
}

/**
 * Result of a sync operation.
 * P09 Section 5.2: Includes conflict explanation for user dialog.
 */
export interface SyncResult {
	success: boolean;
	action: SyncAction;
	error?: string;
	/** P09 Section 5.1: True only when user decision is required */
	needsConflictResolution?: boolean;
	cloudSnapshot?: DatabaseSnapshot | null;
	cloudUpdatedAt?: string | null;
	/** P09 Section 5.2: Explanation of what happened */
	conflictDescription?: string;
	/** P09 Section 5.2: What user loses if choosing local */
	localChoiceLoss?: string;
	/** P09 Section 5.2: What user loses if choosing cloud */
	cloudChoiceLoss?: string;
}

/**
 * Main 2-way sync function.
 * Determines sync direction and executes (except for conflicts).
 *
 * P09 SPEC COMPLIANCE:
 * - Section 3.2: Conflicts detected during automatic sync
 * - Section 4.1: Automatic resolution attempted first
 * - Section 5.1: User dialog only when auto-resolution fails
 */
export async function syncWithCloud(): Promise<SyncResult> {
	if (!isSupabaseConfigured()) {
		return { success: false, action: 'noop', error: 'Supabase nicht konfiguriert' };
	}

	const userId = await getCurrentUserId();
	if (!userId) {
		return { success: false, action: 'noop', error: 'Nicht angemeldet' };
	}

	try {
		// 1. Fetch cloud state
		const cloudData = await getCloudSnapshotWithMeta();

		// 2. Get local meta
		const localMeta = await getSyncMeta();

		// 3. Check if local has meaningful data (time entries)
		const localEntries = await getAll<TimeEntry>('timeEntries');
		const localHasData = localEntries.length > 0;

		// 4. Determine action
		const action = determineSyncAction(
			localMeta,
			cloudData.updatedAt,
			cloudData.hasData,
			localHasData
		);

		console.log('[CloudSync] Action determined:', action, {
			localMeta,
			cloudUpdatedAt: cloudData.updatedAt,
			cloudHasData: cloudData.hasData,
			localHasData
		});

		// 5. Execute action
		switch (action) {
			case 'noop':
				return { success: true, action: 'noop' };

			case 'upload': {
				const uploadResult = await saveToCloud();
				return {
					success: uploadResult.success,
					action: 'upload',
					error: uploadResult.error
				};
			}

			case 'restore': {
				if (!cloudData.snapshot) {
					return { success: false, action: 'restore', error: 'Cloud-Snapshot nicht gefunden' };
				}
				await importSnapshot(cloudData.snapshot);
				await updateSyncMeta(new Date().toISOString(), cloudData.updatedAt!);
				console.log('[CloudSync] Restored from cloud');
				return { success: true, action: 'restore' };
			}

			case 'conflict': {
				// P09 Section 4.1: Attempt automatic resolution first
				if (!cloudData.snapshot) {
					return { success: false, action: 'conflict', error: 'Cloud-Snapshot nicht gefunden' };
				}

				const conflictAnalysis = await analyzeConflicts(cloudData.snapshot);

				// P09 Section 4.2: If no real conflicts, auto-merge
				if (conflictAnalysis.canAutoMerge && conflictAnalysis.mergedSnapshot) {
					console.log('[CloudSync] Auto-merging data (no real conflicts)');
					await importSnapshot(conflictAnalysis.mergedSnapshot);
					// Upload merged result to cloud
					const uploadResult = await saveToCloud();
					if (uploadResult.success) {
						console.log('[CloudSync] Auto-merge complete, uploaded merged data');
						return { success: true, action: 'merge' };
					}
					return {
						success: false,
						action: 'merge',
						error: uploadResult.error
					};
				}

				// P09 Section 5.1: Real conflicts require user decision
				console.log('[CloudSync] Real conflicts detected, user decision required');
				return {
					success: true,
					action: 'conflict',
					needsConflictResolution: true,
					cloudSnapshot: cloudData.snapshot,
					cloudUpdatedAt: cloudData.updatedAt,
					// P09 Section 5.2: Provide explanations for user
					conflictDescription: conflictAnalysis.conflictDescription,
					localChoiceLoss: conflictAnalysis.localChoiceLoss,
					cloudChoiceLoss: conflictAnalysis.cloudChoiceLoss
				};
			}

			case 'merge':
				// This case is handled above in 'conflict' when auto-merge succeeds
				return { success: true, action: 'merge' };
		}
	} catch (e) {
		console.error('[CloudSync] Sync failed:', e);
		return {
			success: false,
			action: 'noop',
			error: e instanceof Error ? e.message : 'Unbekannter Fehler'
		};
	}
}

/**
 * Resolve a sync conflict by user choice.
 * @param choice 'local' to upload local data, 'cloud' to restore from cloud
 * @param cloudSnapshot The cloud snapshot (passed from syncWithCloud result)
 * @param cloudUpdatedAt The cloud updated_at timestamp
 */
export async function resolveConflict(
	choice: 'local' | 'cloud',
	cloudSnapshot: DatabaseSnapshot | null,
	cloudUpdatedAt: string | null
): Promise<SyncResult> {
	try {
		if (choice === 'local') {
			const uploadResult = await saveToCloud();
			return {
				success: uploadResult.success,
				action: 'upload',
				error: uploadResult.error
			};
		} else {
			if (!cloudSnapshot) {
				return { success: false, action: 'restore', error: 'Cloud-Snapshot nicht gefunden' };
			}
			// Deep clone again as safety net - Svelte reactivity may have added non-cloneable properties
			const safeSnapshot = JSON.parse(JSON.stringify(cloudSnapshot)) as DatabaseSnapshot;
			await importSnapshot(safeSnapshot);
			await updateSyncMeta(new Date().toISOString(), cloudUpdatedAt!);
			console.log('[CloudSync] Conflict resolved: restored from cloud');
			return { success: true, action: 'restore' };
		}
	} catch (e) {
		console.error('[CloudSync] Conflict resolution failed:', e);
		return {
			success: false,
			action: 'noop',
			error: e instanceof Error ? e.message : 'Unbekannter Fehler'
		};
	}
}
