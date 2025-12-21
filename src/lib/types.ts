/**
 * Core type definitions for TimeTracker.
 * Spec refs: TT-FR (categories), TT-IG (system categories immutable)
 */

/** Category type: 'system' = fixed, non-editable, non-deletable; 'user' = user-defined */
export type CategoryType = 'system' | 'user';

/**
 * Represents a task category.
 * System categories: Pause, Urlaub, Krank, Feiertag (countsAsWorkTime=false, immutable)
 * User categories: freely editable/deletable
 */
export interface Category {
	id: string;
	name: string;
	type: CategoryType;
	countsAsWorkTime: boolean;
	createdAt: number;
}

/** Shape of default-categories.de.json */
export interface DefaultCategoriesFile {
	version: number;
	locale: string;
	categories: Array<{ name: string; countsAsWorkTime: boolean }>;
}
