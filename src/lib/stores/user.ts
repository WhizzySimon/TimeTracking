/**
 * User store for TimeTracker.
 * Manages user profile and plan state.
 * Spec refs: P10-monetising.md, P10-DD-003
 */

import { writable, derived } from 'svelte/store';
import type { UserProfile, UserPlan, UserPreference } from '$lib/types';
import { getAll, put, getByKey } from '$lib/storage/db';
import { markLocalChanged } from '$lib/backup/cloud';

/** Current user profile (null if not loaded) */
export const userProfile = writable<UserProfile | null>(null);

/** Flag indicating if user has never added an entry (for first-time hints) */
export const neverAddedAnEntry = writable<boolean>(true);

/** Current user plan - derived from profile or defaults to 'free' */
export const userPlan = derived(userProfile, ($profile) => {
	return $profile?.plan ?? 'free';
});

/** Derived store: true if user has Pro plan or higher */
export const isPro = derived(userPlan, ($plan) => $plan === 'pro' || $plan === 'premium');

/** Derived store: true if user has Premium plan */
export const isPremium = derived(userPlan, ($plan) => $plan === 'premium');

/** Derived store: true if user has Free plan */
export const isFree = derived(userPlan, ($plan) => $plan === 'free');

/**
 * Set user profile (called after loading from Supabase).
 * If profile is null, attempts to restore plan from cache.
 */
export function setUserProfile(profile: UserProfile | null): void {
	if (profile === null) {
		// Profile load failed - try to restore from cache
		const cachedPlan = getCachedPlanFromStorage();
		if (cachedPlan !== 'free') {
			console.log('[User] Profile load failed, restoring from cache:', cachedPlan);
			// Create minimal profile with cached plan
			userProfile.set({
				id: '',
				email: '',
				plan: cachedPlan,
				createdAt: '',
				updatedAt: ''
			});
			return;
		}
	}
	userProfile.set(profile);
}

/**
 * Get cached plan from localStorage.
 * Returns 'free' if no cache exists.
 */
function getCachedPlanFromStorage(): 'free' | 'pro' | 'premium' {
	if (typeof localStorage === 'undefined') return 'free';
	try {
		const cached = localStorage.getItem('userPlan');
		if (cached === 'pro' || cached === 'premium') return cached;
	} catch {
		// localStorage may be unavailable
	}
	return 'free';
}

/**
 * Clear user profile (called on logout).
 */
export function clearUserProfile(): void {
	userProfile.set(null);
}

/**
 * Update plan in store, persist to localStorage, and sync to Supabase.
 * This ensures the plan survives app reinstalls.
 */
export async function setUserPlanLocal(plan: UserPlan): Promise<void> {
	userProfile.update((profile) => {
		if (profile) {
			return { ...profile, plan };
		}
		return profile;
	});
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('timetracker_user_plan', plan);
	}
	// Also update in Supabase so it persists across reinstalls
	try {
		const { updateUserPlanInDatabase } = await import('$lib/api/profile');
		await updateUserPlanInDatabase(plan);
	} catch (err) {
		console.error('[User] Failed to sync plan to database:', err);
	}
}

/**
 * Load persisted plan override from localStorage.
 * Call this after loading user profile from Supabase.
 */
export function loadPersistedPlanOverride(): void {
	if (typeof localStorage !== 'undefined') {
		const savedPlan = localStorage.getItem('timetracker_user_plan') as UserPlan | null;
		if (savedPlan && (savedPlan === 'pro' || savedPlan === 'premium')) {
			userProfile.update((profile) => {
				if (profile) {
					return { ...profile, plan: savedPlan };
				}
				return profile;
			});
		}
	}
}

/**
 * Load neverAddedAnEntry flag from localStorage.
 * Includes migration: if user has existing entries, set to false.
 * Call this on app initialization.
 */
export async function loadNeverAddedAnEntry(): Promise<void> {
	if (typeof localStorage === 'undefined') {
		neverAddedAnEntry.set(true);
		return;
	}

	const savedValue = localStorage.getItem('timetracker_never_added_entry');

	if (savedValue !== null) {
		neverAddedAnEntry.set(savedValue === 'true');
		return;
	}

	try {
		const entries = await getAll('timeEntries');
		const hasEntries = entries.length > 0;
		const value = !hasEntries;
		neverAddedAnEntry.set(value);
		localStorage.setItem('timetracker_never_added_entry', String(value));
	} catch (err) {
		console.error('[User] Failed to load neverAddedAnEntry:', err);
		neverAddedAnEntry.set(true);
	}
}

/**
 * Set neverAddedAnEntry flag and persist to localStorage.
 * Call this when user creates their first entry.
 */
export function setNeverAddedAnEntry(value: boolean): void {
	neverAddedAnEntry.set(value);
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('timetracker_never_added_entry', String(value));
	}
}

const USER_NAME_PREF_KEY = 'user-name';

/**
 * Update user name (firstName + lastName) and persist to IndexedDB for cloud sync.
 */
export async function setUserName(firstName: string, lastName: string): Promise<void> {
	userProfile.update((profile) => {
		if (profile) {
			return { ...profile, firstName, lastName };
		}
		return profile;
	});

	// Save to IndexedDB for cloud sync
	const pref: UserPreference = {
		key: USER_NAME_PREF_KEY,
		value: JSON.stringify({ firstName, lastName }),
		updatedAt: Date.now()
	};
	await put('userPreferences', pref);
	markLocalChanged();
}

/**
 * Load persisted user name from IndexedDB.
 * Call this after loading user profile.
 */
export async function loadPersistedUserName(): Promise<void> {
	try {
		const pref = await getByKey<UserPreference>('userPreferences', USER_NAME_PREF_KEY);
		if (pref?.value) {
			const parsed = JSON.parse(pref.value);
			const firstName = parsed.firstName ?? '';
			const lastName = parsed.lastName ?? '';
			if (firstName || lastName) {
				userProfile.update((profile) => {
					if (profile) {
						return { ...profile, firstName, lastName };
					}
					return profile;
				});
			}
		}
	} catch (err) {
		console.error('[User] Failed to load persisted user name:', err);
	}
}

/**
 * Derived store: full user name (firstName + lastName) or empty string.
 */
export const userFullName = derived(userProfile, ($profile) => {
	const first = $profile?.firstName ?? '';
	const last = $profile?.lastName ?? '';
	return [first, last].filter(Boolean).join(' ');
});
