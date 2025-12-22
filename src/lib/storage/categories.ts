/**
 * Category store for TimeTracker.
 * Handles system categories (fixed) and user categories (editable).
 * Seeds default user categories from static/default-categories.de.json on first run.
 * Spec refs: TT-FR (categories), TT-IG (system categories immutable)
 */

import type { Category, DefaultCategoriesFile } from '$lib/types';
import { getAll, getByKey, put } from './db';
import { saveUserCategory, deleteUserCategoryWithSync } from './operations';

const CATEGORIES_STORE = 'categories';
const META_STORE = 'meta';
const SEEDED_KEY = 'categories_seeded';

/** System categories: fixed, non-editable, non-deletable, countsAsWorkTime=false */
export const SYSTEM_CATEGORIES: Category[] = [
	{ id: 'system-pause', name: 'Pause', type: 'system', countsAsWorkTime: false, createdAt: 0 },
	{ id: 'system-urlaub', name: 'Urlaub', type: 'system', countsAsWorkTime: false, createdAt: 0 },
	{ id: 'system-krank', name: 'Krank', type: 'system', countsAsWorkTime: false, createdAt: 0 },
	{ id: 'system-feiertag', name: 'Feiertag', type: 'system', countsAsWorkTime: false, createdAt: 0 }
];

/**
 * Initialize categories: ensure system categories exist and seed defaults on first run.
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

	// Seed default user categories from JSON
	await seedDefaultCategories();

	// Mark as seeded
	await put(META_STORE, { key: SEEDED_KEY, value: true });
}

/**
 * Seed default user categories from static/default-categories.de.json.
 * Skips any category named "Pause" (system category).
 * Does not create duplicates.
 */
async function seedDefaultCategories(): Promise<void> {
	try {
		const response = await fetch('/default-categories.de.json');
		if (!response.ok) {
			console.warn('Failed to fetch default categories:', response.status);
			return;
		}
		const data: DefaultCategoriesFile = await response.json();

		const existingCategories = await getAll<Category>(CATEGORIES_STORE);
		const existingNames = new Set(existingCategories.map((c) => c.name.toLowerCase()));

		for (const cat of data.categories) {
			// Skip system category names
			if (SYSTEM_CATEGORIES.some((sc) => sc.name.toLowerCase() === cat.name.toLowerCase())) {
				continue;
			}
			// Skip duplicates
			if (existingNames.has(cat.name.toLowerCase())) {
				continue;
			}

			const newCat: Category = {
				id: `user-${crypto.randomUUID()}`,
				name: cat.name,
				type: 'user',
				countsAsWorkTime: cat.countsAsWorkTime,
				createdAt: Date.now()
			};
			await put(CATEGORIES_STORE, newCat);
			existingNames.add(cat.name.toLowerCase());
		}
	} catch (error) {
		console.error('Error seeding default categories:', error);
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
export async function addUserCategory(name: string, countsAsWorkTime: boolean): Promise<Category> {
	const existing = await getAll<Category>(CATEGORIES_STORE);
	if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
		throw new Error(`Category "${name}" already exists`);
	}

	const newCat: Category = {
		id: `user-${crypto.randomUUID()}`,
		name,
		type: 'user',
		countsAsWorkTime,
		createdAt: Date.now()
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
