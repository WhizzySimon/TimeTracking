/**
 * Category Import/Export utilities.
 * Spec ref: ui-logic-spec-v1.md Section 11
 */

import type { Category } from '$lib/types';

/**
 * Export user categories to a newline-separated string.
 * Only exports user categories (not system categories).
 * @param categories All categories
 * @returns Newline-separated string of category names (one per line)
 */
export function exportCategoriesToString(categories: Category[]): string {
	const userCategories = categories.filter((c) => c.type === 'user');
	return userCategories.map((c) => c.name).join('\n');
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
 * Parse category names from string.
 * Accepts commas, newlines (\n, \r, \r\n), or any combination as separators.
 * Trims whitespace and filters empty entries.
 * @param input String with category names separated by commas and/or newlines
 * @returns Array of category names
 */
export function parseCategoriesFromString(input: string): string[] {
	// Split by any combination of commas and newlines (\r\n, \n, \r, or comma)
	return input
		.split(/[,\r\n]+/)
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
