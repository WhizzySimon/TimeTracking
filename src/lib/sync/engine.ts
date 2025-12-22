/**
 * Sync engine for TimeTracker.
 * Handles uploading outbox items to the server.
 * Spec refs: technical-guideline-v1 section 4.3, 4.4
 *
 * v1 implementation: Logs items to console and marks as acked (no actual API).
 */

import { get } from 'svelte/store';
import { syncStatus } from '$lib/stores';
import { getOutboxItems, markAsSent, clearAckedItems } from './outbox';

/** Minimum time between syncs (debounce) */
const SYNC_DEBOUNCE_MS = 5000;

/** Last sync timestamp for debouncing */
let lastSyncTime = 0;

/** Flag to prevent concurrent syncs */
let isSyncing = false;

/**
 * Trigger a sync of pending outbox items.
 * Debounced to prevent rapid triggers.
 * Returns true if sync was performed, false if skipped.
 */
export async function syncNow(): Promise<boolean> {
	// Debounce: skip if synced recently
	const now = Date.now();
	if (now - lastSyncTime < SYNC_DEBOUNCE_MS) {
		console.log('[Sync] Skipped - debounce active');
		return false;
	}

	// Prevent concurrent syncs
	if (isSyncing) {
		console.log('[Sync] Skipped - already syncing');
		return false;
	}

	isSyncing = true;
	lastSyncTime = now;

	try {
		// Get pending items
		const items = await getOutboxItems();

		if (items.length === 0) {
			syncStatus.set('synced');
			console.log('[Sync] No pending items');
			return true;
		}

		// Update status to syncing
		syncStatus.set('syncing');
		console.log(`[Sync] Starting sync of ${items.length} items...`);

		// Process each item (v1: just log and mark as sent)
		for (const item of items) {
			console.log(`[Sync] Processing: ${item.type}`, item.payload);

			// Simulate API call delay (remove in production)
			// await new Promise((resolve) => setTimeout(resolve, 100));

			// Mark as sent (simulating successful upload)
			await markAsSent(item.id);
			console.log(`[Sync] Marked as sent: ${item.id}`);
		}

		// Clean up acked items
		await clearAckedItems();

		// Update status to synced
		syncStatus.set('synced');
		console.log('[Sync] Complete - all items synced');

		return true;
	} catch (error) {
		console.error('[Sync] Error:', error);
		syncStatus.set('error');
		return false;
	} finally {
		isSyncing = false;
	}
}

/**
 * Check if there are pending items and update sync status accordingly.
 * Call this on app startup to set initial status.
 */
export async function checkSyncStatus(): Promise<void> {
	const items = await getOutboxItems();
	if (items.length > 0) {
		syncStatus.set('pending');
	} else {
		syncStatus.set('synced');
	}
}

/**
 * Get current sync status value (non-reactive).
 */
export function getSyncStatusValue(): string {
	return get(syncStatus);
}
