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

/** Day type options per ui-logic-spec-v1 section 3.2 */
export type DayTypeValue = 'arbeitstag' | 'urlaub' | 'krank' | 'feiertag';

/**
 * Day type record stored per date.
 * Spec refs: TT-FR (day type affects Soll calculation)
 */
export interface DayType {
	date: string; // YYYY-MM-DD (primary key)
	type: DayTypeValue;
	updatedAt: number;
}

/**
 * Time entry (task) for a specific date.
 * Spec refs: TT-FR (task list), ui-logic-spec-v1 section 6
 */
export interface TimeEntry {
	id: string;
	date: string; // YYYY-MM-DD
	categoryId: string;
	startTime: string; // HH:mm
	endTime: string | null; // HH:mm or null if running
	description: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Work time model defining target hours per weekday.
 * Spec refs: TT-FR (work time models), ui-logic-spec-v1 sections 8-9
 */
export interface WorkTimeModel {
	id: string;
	name: string; // User-friendly name for the model
	validFrom: string; // YYYY-MM-DD
	monday: number | null; // hours, null if day inactive
	tuesday: number | null;
	wednesday: number | null;
	thursday: number | null;
	friday: number | null;
	saturday: number | null;
	sunday: number | null;
	createdAt: number;
	updatedAt: number;
}

/** Sync status for outbox indicator */
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';

/** Outbox item status */
export type OutboxStatus = 'pending' | 'sending' | 'acked' | 'failed';

/** Outbox operation types (technical-guideline-v1 section 4.2) */
export type OutboxOperationType =
	| 'category_upsert'
	| 'category_delete'
	| 'entry_upsert'
	| 'entry_delete'
	| 'dayType_upsert'
	| 'workTimeModel_upsert'
	| 'workTimeModel_delete';

/**
 * Outbox item for sync queue.
 * Spec refs: technical-guideline-v1 section 4.2
 */
export interface OutboxItem {
	id: string;
	createdAt: number;
	type: OutboxOperationType;
	payload: unknown;
	status: OutboxStatus;
	retryCount: number;
	lastError: string | null;
}

/** Week bounds for week navigation */
export interface WeekBounds {
	start: Date; // Monday
	end: Date; // Sunday
}

/**
 * Authentication session stored in IndexedDB.
 * Spec refs: technical-guideline-v1 section 5
 */
export interface AuthSession {
	token: string;
	email: string;
	expiresAt: number; // Unix timestamp
	createdAt: number;
}
