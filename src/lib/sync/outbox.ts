/**
 * Outbox queue operations for sync.
 * Spec refs: technical-guideline-v1 section 4.2
 *
 * Pattern: Local changes are committed to main tables, then an outbox entry
 * is appended describing what must be uploaded. Sync engine processes outbox
 * items in chronological order.
 */

import { openDB, getAll, put, deleteByKey } from '$lib/storage/db';
import type { OutboxItem, OutboxOperationType } from '$lib/types';

/**
 * Add a new item to the outbox queue.
 * Called after successful local DB write.
 */
export async function addToOutbox(type: OutboxOperationType, payload: unknown): Promise<string> {
	const id = crypto.randomUUID();
	const item: OutboxItem = {
		id,
		createdAt: Date.now(),
		type,
		payload,
		status: 'pending',
		retryCount: 0,
		lastError: null
	};
	await put('outbox', item);
	return id;
}

/**
 * Get all pending outbox items (status = 'pending' or 'failed').
 * Returns items sorted by createdAt ascending (oldest first).
 */
export async function getOutboxItems(): Promise<OutboxItem[]> {
	const all = await getAll<OutboxItem>('outbox');
	return all
		.filter((item) => item.status === 'pending' || item.status === 'failed')
		.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Get count of pending outbox items.
 */
export async function getOutboxCount(): Promise<number> {
	const items = await getOutboxItems();
	return items.length;
}

/**
 * Mark an outbox item as successfully sent (acked).
 * Item can be deleted or kept for audit trail.
 */
export async function markAsSent(id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('outbox', 'readwrite');
		const store = tx.objectStore('outbox');
		const getRequest = store.get(id);

		getRequest.onsuccess = () => {
			const item = getRequest.result as OutboxItem | undefined;
			if (!item) {
				resolve();
				return;
			}
			item.status = 'acked';
			const putRequest = store.put(item);
			putRequest.onsuccess = () => resolve();
			putRequest.onerror = () => reject(putRequest.error);
		};
		getRequest.onerror = () => reject(getRequest.error);
	});
}

/**
 * Mark an outbox item as failed and increment retry count.
 */
export async function markAsFailed(id: string, error: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('outbox', 'readwrite');
		const store = tx.objectStore('outbox');
		const getRequest = store.get(id);

		getRequest.onsuccess = () => {
			const item = getRequest.result as OutboxItem | undefined;
			if (!item) {
				resolve();
				return;
			}
			item.status = 'failed';
			item.retryCount += 1;
			item.lastError = error;
			const putRequest = store.put(item);
			putRequest.onsuccess = () => resolve();
			putRequest.onerror = () => reject(putRequest.error);
		};
		getRequest.onerror = () => reject(getRequest.error);
	});
}

/**
 * Remove an outbox item completely (after successful sync or cleanup).
 */
export async function removeFromOutbox(id: string): Promise<void> {
	await deleteByKey('outbox', id);
}

/**
 * Clear all acked items from outbox (cleanup).
 */
export async function clearAckedItems(): Promise<void> {
	const all = await getAll<OutboxItem>('outbox');
	const acked = all.filter((item) => item.status === 'acked');
	for (const item of acked) {
		await deleteByKey('outbox', item.id);
	}
}
