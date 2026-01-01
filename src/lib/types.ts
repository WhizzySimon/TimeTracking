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
	updatedAt: number;
	employerId?: string | null; // null = visible in all employers (AG-FR-030)
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
	employerId?: string | null; // Required for employer filtering (AG-FR-050)
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
	employerId?: string | null; // null = visible in all employers (AG-FR-040)
}

/**
 * Work time model defining target hours per weekday.
 * Spec refs: TT-FR (work time models), ui-logic-spec-v1 sections 8-9
 *
 * Each weekday has:
 * - hours: target hours (0-24, or null if not set)
 * - isWorkday: whether the day counts as a workday (independent of hours)
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
	// Whether each day counts as a workday (independent of hours)
	mondayIsWorkday?: boolean;
	tuesdayIsWorkday?: boolean;
	wednesdayIsWorkday?: boolean;
	thursdayIsWorkday?: boolean;
	fridayIsWorkday?: boolean;
	saturdayIsWorkday?: boolean;
	sundayIsWorkday?: boolean;
	createdAt: number;
	updatedAt: number;
	employerId?: string | null; // null = applies to all employers (AG-FR-020)
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

/** User plan type for feature gating. Spec refs: P10-FR-001, P11-FR-001 */
export type UserPlan = 'free' | 'pro' | 'premium';

/**
 * Employer (Arbeitgeber) entity for multi-employer support.
 * Spec refs: multi-arbeitgeber.md AG-FR-001 to AG-FR-004
 */
export interface Employer {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	isActive: boolean; // false = soft deleted
}

/**
 * User preference stored in IndexedDB for cloud sync.
 * Key-value store for preferences that should sync across devices.
 */
export interface UserPreference {
	key: string;
	value: string;
	updatedAt: number;
}

/**
 * User profile from Supabase profiles table.
 * Spec refs: P10-monetising.md
 */
export interface UserProfile {
	id: string;
	email: string;
	plan: UserPlan;
	firstName?: string;
	lastName?: string;
	stripeCustomerId?: string;
	subscriptionStatus?: string;
	subscriptionEndsAt?: string;
	createdAt: string;
	updatedAt: string;
}
