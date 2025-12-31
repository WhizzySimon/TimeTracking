/**
 * Category store for TimeTracker.
 * Handles system categories (fixed) and user categories (editable).
 * Seeds default work time model on first run (no default user categories).
 * Spec refs: TT-FR (categories), TT-IG (system categories immutable)
 */

import type { Category, WorkTimeModel } from '$lib/types';
import { getAll, getByKey, put } from './db';
import { saveUserCategory, deleteUserCategoryWithSync } from './operations';

const CATEGORIES_STORE = 'categories';
const META_STORE = 'meta';
const SEEDED_KEY = 'categories_seeded';

/** System categories: fixed, non-editable, non-deletable, countsAsWorkTime=false */
export const SYSTEM_CATEGORIES: Category[] = [
	{
		id: 'system-pause',
		name: 'Pause',
		type: 'system',
		countsAsWorkTime: false,
		createdAt: 0,
		updatedAt: 0
	},
	{
		id: 'system-urlaub',
		name: 'Urlaub',
		type: 'system',
		countsAsWorkTime: false,
		createdAt: 0,
		updatedAt: 0
	},
	{
		id: 'system-krank',
		name: 'Krank',
		type: 'system',
		countsAsWorkTime: false,
		createdAt: 0,
		updatedAt: 0
	},
	{
		id: 'system-feiertag',
		name: 'Feiertag',
		type: 'system',
		countsAsWorkTime: false,
		createdAt: 0,
		updatedAt: 0
	}
];

/**
 * Initialize categories and work time model: ensure system categories exist and seed defaults on first run.
 */
export async function initializeCategories(): Promise<void> {
	// Always ensure system categories exist
	for (const cat of SYSTEM_CATEGORIES) {
		const existing = await getByKey<Category>(CATEGORIES_STORE, cat.id);
		if (!existing) {
			await put(CATEGORIES_STORE, cat);
		}
	}

	// Check if already seeded
	const seeded = await getByKey<{ key: string; value: boolean }>(META_STORE, SEEDED_KEY);
	if (seeded?.value) {
		return;
	}

	// Seed default work time model (no default user categories per spec)
	await seedDefaultWorkTimeModel();

	// Mark as seeded
	await put(META_STORE, { key: SEEDED_KEY, value: true });
}

/**
 * Seed default work time model "Vollzeit 40h" on first run.
 * Mon-Fri: 8.0h, Sat-Sun: 0.0h
 * Spec ref: ui-logic-spec-v1.md Section 12
 */
async function seedDefaultWorkTimeModel(): Promise<void> {
	try {
		const existingModels = await getAll<WorkTimeModel>('workTimeModels');
		if (existingModels.length > 0) {
			// Already has models, don't seed
			return;
		}

		const now = Date.now();
		const defaultModel: WorkTimeModel = {
			id: `model-${crypto.randomUUID()}`,
			name: 'Vollzeit 40h',
			validFrom: '2020-01-01',
			monday: 8.0,
			tuesday: 8.0,
			wednesday: 8.0,
			thursday: 8.0,
			friday: 8.0,
			saturday: 0.0,
			sunday: 0.0,
			createdAt: now,
			updatedAt: now
		};
		await put('workTimeModels', defaultModel);
		console.log('[Init] Seeded default work time model: Vollzeit 40h');
	} catch (error) {
		console.error('Error seeding default work time model:', error);
	}
}

/**
 * Get all categories (system + user).
 */
export async function getAllCategories(): Promise<Category[]> {
	return getAll<Category>(CATEGORIES_STORE);
}

/**
 * Add a new user category.
 * @throws if name conflicts with existing category
 */
export async function addUserCategory(
	name: string,
	countsAsWorkTime: boolean,
	employerId?: string
): Promise<Category> {
	const existing = await getAll<Category>(CATEGORIES_STORE);
	// Check for duplicate: same name AND same employerId
	const isDuplicate = existing.some(
		(c) =>
			c.name.toLowerCase() === name.toLowerCase() && (c.employerId ?? '') === (employerId ?? '')
	);
	if (isDuplicate) {
		throw new Error(`Category "${name}" already exists for this employer`);
	}

	const now = Date.now();
	const newCat: Category = {
		id: `user-${crypto.randomUUID()}`,
		name,
		type: 'user',
		countsAsWorkTime,
		createdAt: now,
		updatedAt: now,
		...(employerId && { employerId })
	};
	await saveUserCategory(newCat);
	return newCat;
}

/**
 * Delete a user category by ID.
 * @throws if category is a system category
 */
export async function deleteUserCategory(id: string): Promise<void> {
	const cat = await getByKey<Category>(CATEGORIES_STORE, id);
	if (!cat) {
		throw new Error(`Category not found: ${id}`);
	}
	if (cat.type === 'system') {
		throw new Error('Cannot delete system category');
	}
	await deleteUserCategoryWithSync(id);
}

/**
 * Check if a category is a system category.
 */
export function isSystemCategory(category: Category): boolean {
	return category.type === 'system';
}
