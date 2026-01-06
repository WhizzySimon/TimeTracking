/**
 * Cloud sync service using Supabase (2-way sync).
 * Spec refs: cloud-backup-and-auth.md
 */

import { getSupabase, isSupabaseConfigured } from '$lib/supabase/client';
import { getCurrentUserId } from '$lib/api/auth';
import { exportSnapshot, type DatabaseSnapshot } from './snapshot';
import { importSnapshot } from './restore';
import { put, getByKey, getAll } from '$lib/storage/db';
import type {
	TimeEntry,
	Category,
	DayType,
	WorkTimeModel,
	UserPreference,
	Employer
} from '$lib/types';

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
 */
export type SyncAction = 'upload' | 'restore' | 'conflict' | 'merge' | 'noop';

/**
 * Determine what sync action to take based on local meta and cloud state.
 * Implements decision table from spec.
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

	// Never synced but both have data: merge using LWW strategy
	if (neverSynced && cloudHasData && localHasData) {
		return 'merge';
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
		return 'merge';
	}
	if (hasLocalChanges) {
		return 'upload';
	}
	if (cloudChanged) {
		return 'restore';
	}
	return 'noop';
}

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
 * Merge two arrays using Last-Write-Wins (LWW) strategy.
 * For each unique ID, keeps the entry with the higher updatedAt timestamp.
 * @param local Local entries
 * @param cloud Cloud entries
 * @returns Merged array with newer entries from either source
 */
function mergeByLWW<T extends { id: string; updatedAt: number }>(local: T[], cloud: T[]): T[] {
	const merged = new Map<string, T>();

	// Add all cloud entries first
	for (const item of cloud) {
		merged.set(item.id, item);
	}

	// Override with local if newer (higher updatedAt wins)
	for (const item of local) {
		const existing = merged.get(item.id);
		if (!existing || item.updatedAt > existing.updatedAt) {
			merged.set(item.id, item);
		}
	}

	return Array.from(merged.values());
}

/**
 * Merge UserPreference arrays using LWW (keyed by 'key' instead of 'id').
 */
function mergeUserPreferencesByLWW(
	local: UserPreference[],
	cloud: UserPreference[]
): UserPreference[] {
	const merged = new Map<string, UserPreference>();

	for (const item of cloud) {
		merged.set(item.key, item);
	}

	for (const item of local) {
		const existing = merged.get(item.key);
		if (!existing || item.updatedAt > existing.updatedAt) {
			merged.set(item.key, item);
		}
	}

	return Array.from(merged.values());
}

/**
 * Merge DayType arrays using LWW (keyed by date instead of id).
 */
function mergeDayTypesByLWW(local: DayType[], cloud: DayType[]): DayType[] {
	const merged = new Map<string, DayType>();

	for (const item of cloud) {
		merged.set(item.date, item);
	}

	for (const item of local) {
		const existing = merged.get(item.date);
		if (!existing || item.updatedAt > existing.updatedAt) {
			merged.set(item.date, item);
		}
	}

	return Array.from(merged.values());
}

/**
 * Merge two snapshots using Last-Write-Wins (LWW) per entry.
 * For each entity type, compares entries by ID and keeps the one with higher updatedAt.
 * @param local Local snapshot
 * @param cloud Cloud snapshot
 * @returns Merged snapshot
 */
export function mergeSnapshots(local: DatabaseSnapshot, cloud: DatabaseSnapshot): DatabaseSnapshot {
	return {
		meta: {
			...local.meta,
			exportedAt: new Date().toISOString(),
			exportedAtMs: Date.now()
		},
		categories: mergeByLWW<Category>(local.categories, cloud.categories),
		timeEntries: mergeByLWW<TimeEntry>(local.timeEntries, cloud.timeEntries),
		dayTypes: mergeDayTypesByLWW(local.dayTypes, cloud.dayTypes),
		workTimeModels: mergeByLWW<WorkTimeModel>(local.workTimeModels, cloud.workTimeModels),
		outbox: local.outbox, // Outbox is local-only, never merged
		userPreferences: mergeUserPreferencesByLWW(
			local.userPreferences ?? [],
			cloud.userPreferences ?? []
		),
		employers: mergeByLWW<Employer>(local.employers ?? [], cloud.employers ?? [])
	};
}

/**
 * Result of a sync operation.
 */
export interface SyncResult {
	success: boolean;
	action: SyncAction;
	error?: string;
	needsConflictResolution?: boolean;
	cloudSnapshot?: DatabaseSnapshot | null;
	cloudUpdatedAt?: string | null;
}

/**
 * Main 2-way sync function.
 * Determines sync direction and executes (except for conflicts).
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

			case 'merge': {
				if (!cloudData.snapshot) {
					return { success: false, action: 'merge', error: 'Cloud-Snapshot nicht gefunden' };
				}
				// Get local snapshot
				const localSnapshot = await exportSnapshot();
				// Merge using LWW strategy
				const mergedSnapshot = mergeSnapshots(localSnapshot, cloudData.snapshot);
				// Import merged snapshot locally
				await importSnapshot(mergedSnapshot);
				// Upload merged snapshot to cloud
				const uploadResult = await saveToCloud();
				if (!uploadResult.success) {
					return { success: false, action: 'merge', error: uploadResult.error };
				}
				console.log('[CloudSync] Merged local and cloud data using LWW');
				return { success: true, action: 'merge' };
			}

			case 'conflict':
				// Fallback for edge cases - should rarely happen with LWW merge
				return {
					success: true,
					action: 'conflict',
					needsConflictResolution: true,
					cloudSnapshot: cloudData.snapshot,
					cloudUpdatedAt: cloudData.updatedAt
				};
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
