/**
 * Data migrations for fixing legacy data issues.
 * Run these one-time to normalize existing data.
 */

import { getAll, put } from './db';
import type { Category, TimeEntry, WorkTimeModel } from '$lib/types';

export interface MigrationResult {
	categoriesUpdated: number;
	entriesUpdated: number;
	modelsUpdated: number;
}

/**
 * Assign employerId to all items that are missing it.
 * This fixes legacy data that was created before employer support.
 *
 * @param defaultEmployerId - The employerId to assign to items missing it
 * @returns Count of items updated
 */
export async function migrateAssignEmployerId(defaultEmployerId: string): Promise<MigrationResult> {
	const result: MigrationResult = {
		categoriesUpdated: 0,
		entriesUpdated: 0,
		modelsUpdated: 0
	};

	// Fix categories (skip system categories)
	const categories = await getAll<Category>('categories');
	for (const cat of categories) {
		if (cat.type === 'system') continue;
		if (cat.employerId === null || cat.employerId === undefined) {
			await put('categories', { ...cat, employerId: defaultEmployerId });
			result.categoriesUpdated++;
		}
	}

	// Fix time entries
	const entries = await getAll<TimeEntry>('timeEntries');
	for (const entry of entries) {
		if (entry.employerId === null || entry.employerId === undefined) {
			await put('timeEntries', { ...entry, employerId: defaultEmployerId });
			result.entriesUpdated++;
		}
	}

	// Fix work time models
	const models = await getAll<WorkTimeModel>('workTimeModels');
	for (const model of models) {
		if (model.employerId === null || model.employerId === undefined) {
			await put('workTimeModels', { ...model, employerId: defaultEmployerId });
			result.modelsUpdated++;
		}
	}

	console.log('[Migration] Assigned employerId to legacy data:', result);
	return result;
}

/**
 * Normalize legacy category IDs (plain UUID → user-prefixed).
 * Also rewrites timeEntry.categoryId references.
 *
 * @returns Count of items updated
 */
export async function migrateNormalizeCategoryIds(): Promise<{
	categoriesNormalized: number;
	entriesRewritten: number;
}> {
	const LEGACY_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

	const result = { categoriesNormalized: 0, entriesRewritten: 0 };
	const idMap = new Map<string, string>();

	// Find and normalize legacy category IDs
	const categories = await getAll<Category>('categories');
	for (const cat of categories) {
		if (LEGACY_UUID_REGEX.test(cat.id) && cat.type === 'user') {
			const newId = `user-${cat.id}`;
			idMap.set(cat.id, newId);

			// Delete old, insert with new ID
			await put('categories', { ...cat, id: newId });
			result.categoriesNormalized++;
		}
	}

	// Rewrite timeEntry.categoryId references
	if (idMap.size > 0) {
		const entries = await getAll<TimeEntry>('timeEntries');
		for (const entry of entries) {
			if (idMap.has(entry.categoryId)) {
				await put('timeEntries', {
					...entry,
					categoryId: idMap.get(entry.categoryId)!
				});
				result.entriesRewritten++;
			}
		}
	}

	console.log('[Migration] Normalized category IDs:', result);
	return result;
}
