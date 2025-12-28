/**
 * Employer store for TimeTracker.
 * Handles multi-employer (Arbeitgeber) CRUD operations.
 * Spec refs: multi-arbeitgeber.md AG-FR-001 to AG-FR-004
 */

import type { Employer } from '$lib/types';
import { getAll, put, deleteByKey } from './db';
import { markLocalChanged } from '$lib/backup/cloud';

const EMPLOYERS_STORE = 'employers';

/**
 * Mark local data as changed (for cloud backup tracking).
 */
function markChanged(): void {
	markLocalChanged().catch((err) => console.error('[Employers] Mark changed failed:', err));
}

/**
 * Get all employers (including inactive/soft-deleted).
 */
export async function getAllEmployers(): Promise<Employer[]> {
	return getAll<Employer>(EMPLOYERS_STORE);
}

/**
 * Get only active employers (not soft-deleted).
 */
export async function getActiveEmployers(): Promise<Employer[]> {
	const all = await getAllEmployers();
	return all.filter((e) => e.isActive);
}

/**
 * Save an employer (create or update).
 * Sets updatedAt timestamp automatically.
 */
export async function saveEmployer(employer: Employer): Promise<Employer> {
	const now = Date.now();
	const employerToSave: Employer = {
		...employer,
		updatedAt: now,
		createdAt: employer.createdAt || now
	};
	await put(EMPLOYERS_STORE, employerToSave);
	markChanged();
	return employerToSave;
}

/**
 * Create a new employer.
 */
export async function createEmployer(name: string): Promise<Employer> {
	const now = Date.now();
	const newEmployer: Employer = {
		id: `employer-${crypto.randomUUID()}`,
		name,
		createdAt: now,
		updatedAt: now,
		isActive: true
	};
	await put(EMPLOYERS_STORE, newEmployer);
	markChanged();
	return newEmployer;
}

/**
 * Soft delete an employer (set isActive = false).
 * Entries with this employerId remain visible in history.
 * Spec ref: AG-FR-070 to AG-FR-072
 */
export async function deleteEmployer(id: string): Promise<void> {
	const employers = await getAllEmployers();
	const employer = employers.find((e) => e.id === id);
	if (!employer) {
		throw new Error(`Employer not found: ${id}`);
	}
	await saveEmployer({
		...employer,
		isActive: false
	});
}

/**
 * Permanently delete an employer from the database.
 * Use with caution - entries will keep orphan employerId.
 * Spec ref: AG-FR-073
 */
export async function permanentlyDeleteEmployer(id: string): Promise<void> {
	await deleteByKey(EMPLOYERS_STORE, id);
	markChanged();
}

/**
 * Reactivate a soft-deleted employer.
 */
export async function reactivateEmployer(id: string): Promise<Employer> {
	const employers = await getAllEmployers();
	const employer = employers.find((e) => e.id === id);
	if (!employer) {
		throw new Error(`Employer not found: ${id}`);
	}
	return saveEmployer({
		...employer,
		isActive: true
	});
}
