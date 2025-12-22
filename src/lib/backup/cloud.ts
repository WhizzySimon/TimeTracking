/**
 * Cloud backup service using Supabase.
 * Spec refs: cloud-backup-and-auth.md
 */

import { getSupabase, isSupabaseConfigured } from '$lib/supabase/client';
import { getCurrentUserId } from '$lib/api/auth';
import { exportSnapshot, type DatabaseSnapshot } from './snapshot';
import { put, getByKey } from '$lib/storage/db';

const BACKUP_META_KEY = 'cloudBackupMeta';

export interface CloudBackupMeta {
	key: string;
	lastBackupAt: string | null;
	lastBackupSuccess: boolean;
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
			console.error('[CloudBackup] Save failed:', error.message);
			await updateBackupMeta(null, false);
			return { success: false, error: error.message };
		}

		const timestamp = new Date().toISOString();
		await updateBackupMeta(timestamp, true);

		console.log('[CloudBackup] Saved successfully at:', timestamp);
		return { success: true, timestamp };
	} catch (e) {
		console.error('[CloudBackup] Save failed:', e);
		await updateBackupMeta(null, false);
		return {
			success: false,
			error: e instanceof Error ? e.message : 'Unbekannter Fehler'
		};
	}
}

/**
 * Get last cloud backup metadata from local storage.
 */
export async function getBackupMeta(): Promise<CloudBackupMeta | null> {
	try {
		const meta = await getByKey<CloudBackupMeta>('meta', BACKUP_META_KEY);
		return meta ?? null;
	} catch {
		return null;
	}
}

/**
 * Update local backup metadata.
 */
async function updateBackupMeta(timestamp: string | null, success: boolean): Promise<void> {
	try {
		await put('meta', {
			key: BACKUP_META_KEY,
			lastBackupAt: timestamp,
			lastBackupSuccess: success
		});
	} catch (e) {
		console.error('[CloudBackup] Failed to update meta:', e);
	}
}

/**
 * Restore database from cloud backup.
 * @returns The snapshot if found, null otherwise
 */
export async function getCloudSnapshot(): Promise<DatabaseSnapshot | null> {
	if (!isSupabaseConfigured()) {
		return null;
	}

	const userId = await getCurrentUserId();
	if (!userId) {
		return null;
	}

	try {
		const supabase = getSupabase();
		const { data, error } = await supabase
			.from('user_backups')
			.select('snapshot')
			.eq('user_id', userId)
			.single();

		if (error) {
			console.error('[CloudBackup] Fetch failed:', error.message);
			return null;
		}

		return data?.snapshot as DatabaseSnapshot | null;
	} catch (e) {
		console.error('[CloudBackup] Fetch failed:', e);
		return null;
	}
}
