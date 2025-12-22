/**
 * Category Import/Export utilities.
 * Spec ref: ui-logic-spec-v1.md Section 11
 */

import type { Category } from '$lib/types';

/**
 * Export user categories to a comma-separated string.
 * Only exports user categories (not system categories).
 * @param categories All categories
 * @returns Comma-separated string of category names
 */
export function exportCategoriesToString(categories: Category[]): string {
	const userCategories = categories.filter((c) => c.type === 'user');
	return userCategories.map((c) => c.name).join(', ');
}

/**
 * Download categories as a text file.
 * @param categories All categories
 * @param filename Filename for download (default: kategorien.txt)
 */
export function downloadCategoriesFile(categories: Category[], filename = 'kategorien.txt'): void {
	const content = exportCategoriesToString(categories);

	if (!content) {
		console.warn('[CategoryIO] No user categories to export');
		return;
	}

	const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Parse comma-separated category names from string.
 * Trims whitespace and filters empty entries.
 * @param input Comma-separated string
 * @returns Array of category names
 */
export function parseCategoriesFromString(input: string): string[] {
	return input
		.split(',')
		.map((name) => name.trim())
		.filter((name) => name.length > 0);
}

/**
 * Import categories from a comma-separated string.
 * Skips duplicates (case-insensitive) and system category names.
 * All imported categories have countsAsWorkTime: true.
 * @param input Comma-separated string
 * @param existingCategories Current categories for duplicate checking
 * @param systemCategoryNames Names of system categories to skip
 * @returns Object with imported and skipped counts, and new categories to add
 */
export function prepareImport(
	input: string,
	existingCategories: Category[],
	systemCategoryNames: string[]
): {
	toImport: { name: string; countsAsWorkTime: boolean }[];
	skippedCount: number;
} {
	const names = parseCategoriesFromString(input);
	const existingNames = new Set(existingCategories.map((c) => c.name.toLowerCase()));
	const systemNames = new Set(systemCategoryNames.map((n) => n.toLowerCase()));

	const toImport: { name: string; countsAsWorkTime: boolean }[] = [];
	let skippedCount = 0;

	for (const name of names) {
		const lowerName = name.toLowerCase();

		// Skip system category names
		if (systemNames.has(lowerName)) {
			skippedCount++;
			continue;
		}

		// Skip duplicates
		if (existingNames.has(lowerName)) {
			skippedCount++;
			continue;
		}

		toImport.push({ name, countsAsWorkTime: true });
		existingNames.add(lowerName); // Prevent duplicates within import
	}

	return { toImport, skippedCount };
}
