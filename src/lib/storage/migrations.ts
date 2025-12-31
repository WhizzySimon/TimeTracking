/**
 * Data migrations for fixing legacy data issues.
 * Run these one-time to normalize existing data.
 *
 * STRICT EMPLOYER MODEL (AG-FR-060):
 * Every record type that participates in filtering/calculation MUST have employerId set.
 */

import { getAll, put } from './db';
import type { Category, DayType, TimeEntry, WorkTimeModel, Employer } from '$lib/types';

export interface MigrationResult {
	categoriesUpdated: number;
	entriesUpdated: number;
	modelsUpdated: number;
	dayTypesUpdated: number;
	defaultEmployerCreated: boolean;
	defaultEmployerId: string | null;
}

/**
 * Comprehensive migration: Ensures every record has an employerId.
 * Creates a default employer if none exists, then assigns employerId to all records.
 *
 * Algorithm (STRICT EMPLOYER MODEL):
 * 1. Ensure at least one employer exists (create "Default" if empty)
 * 2. For each category without employerId: set employerId = defaultEmployerId
 * 3. For each workTimeModel without employerId: set employerId = defaultEmployerId
 * 4. For each dayType without employerId: set employerId = defaultEmployerId
 * 5. For each timeEntry without employerId:
 *    - Prefer: categoryMap.get(entry.categoryId)?.employerId
 *    - Else fallback: defaultEmployerId
 *
 * @returns Migration result with counts
 */
export async function migrateStrictEmployerModel(): Promise<MigrationResult> {
	const result: MigrationResult = {
		categoriesUpdated: 0,
		entriesUpdated: 0,
		modelsUpdated: 0,
		dayTypesUpdated: 0,
		defaultEmployerCreated: false,
		defaultEmployerId: null
	};

	// Step 1: Ensure at least one employer exists
	const employers = await getAll<Employer>('employers');
	let defaultEmployerId: string;

	const activeEmployers = employers.filter((e) => e.isActive);
	if (activeEmployers.length === 0) {
		// Create default employer
		const now = Date.now();
		const defaultEmployer: Employer = {
			id: `employer-${crypto.randomUUID()}`,
			name: 'Default',
			isActive: true,
			createdAt: now,
			updatedAt: now
		};
		await put('employers', defaultEmployer);
		defaultEmployerId = defaultEmployer.id;
		result.defaultEmployerCreated = true;
		console.log('[Migration] Created default employer:', defaultEmployer.name);
	} else {
		defaultEmployerId = activeEmployers[0].id;
	}
	result.defaultEmployerId = defaultEmployerId;

	// Step 2: Fix categories (skip system categories - they don't need employerId)
	const categories = await getAll<Category>('categories');
	const categoryMap = new Map<string, Category>();
	for (const cat of categories) {
		categoryMap.set(cat.id, cat);
		if (cat.type === 'system') continue;
		if (cat.employerId === null || cat.employerId === undefined) {
			const updated = { ...cat, employerId: defaultEmployerId };
			await put('categories', updated);
			categoryMap.set(cat.id, updated);
			result.categoriesUpdated++;
		}
	}

	// Step 3: Fix work time models
	const models = await getAll<WorkTimeModel>('workTimeModels');
	for (const model of models) {
		if (model.employerId === null || model.employerId === undefined) {
			await put('workTimeModels', { ...model, employerId: defaultEmployerId });
			result.modelsUpdated++;
		}
	}

	// Step 4: Fix day types
	const dayTypesData = await getAll<DayType>('dayTypes');
	for (const dayType of dayTypesData) {
		if (dayType.employerId === null || dayType.employerId === undefined) {
			await put('dayTypes', { ...dayType, employerId: defaultEmployerId });
			result.dayTypesUpdated++;
		}
	}

	// Step 5: Fix time entries (prefer category's employerId)
	const entries = await getAll<TimeEntry>('timeEntries');
	for (const entry of entries) {
		if (entry.employerId === null || entry.employerId === undefined) {
			// Prefer category's employerId if available
			const category = categoryMap.get(entry.categoryId);
			const employerId = category?.employerId ?? defaultEmployerId;
			await put('timeEntries', { ...entry, employerId });
			result.entriesUpdated++;
		}
	}

	console.log('[Migration] Strict employer model applied:', result);
	return result;
}

/**
 * Legacy function - kept for backward compatibility.
 * Use migrateStrictEmployerModel() instead.
 */
export async function migrateAssignEmployerId(defaultEmployerId: string): Promise<MigrationResult> {
	const result: MigrationResult = {
		categoriesUpdated: 0,
		entriesUpdated: 0,
		modelsUpdated: 0,
		dayTypesUpdated: 0,
		defaultEmployerCreated: false,
		defaultEmployerId
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

	// Fix day types
	const dayTypesData = await getAll<DayType>('dayTypes');
	for (const dayType of dayTypesData) {
		if (dayType.employerId === null || dayType.employerId === undefined) {
			await put('dayTypes', { ...dayType, employerId: defaultEmployerId });
			result.dayTypesUpdated++;
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
