/**
 * User store for TimeTracker.
 * Manages user profile and plan state.
 * Spec refs: P10-monetising.md, P10-DD-003
 */

import { writable, derived } from 'svelte/store';
import type { UserProfile, UserPlan } from '$lib/types';
import { getAll } from '$lib/storage/db';

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
 */
export function setUserProfile(profile: UserProfile | null): void {
	userProfile.set(profile);
}

/**
 * Clear user profile (called on logout).
 */
export function clearUserProfile(): void {
	userProfile.set(null);
}

/**
 * Update plan in store and persist to localStorage.
 * Used for local upgrade (payment system coming later).
 */
export function setUserPlanLocal(plan: UserPlan): void {
	userProfile.update((profile) => {
		if (profile) {
			return { ...profile, plan };
		}
		return profile;
	});
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('timetracker_user_plan', plan);
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

/**
 * Update user name (firstName + lastName) and persist to localStorage.
 */
export function setUserName(firstName: string, lastName: string): void {
	userProfile.update((profile) => {
		if (profile) {
			return { ...profile, firstName, lastName };
		}
		return profile;
	});
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('timetracker_user_firstName', firstName);
		localStorage.setItem('timetracker_user_lastName', lastName);
	}
}

/**
 * Load persisted user name from localStorage.
 * Call this after loading user profile.
 */
export function loadPersistedUserName(): void {
	if (typeof localStorage !== 'undefined') {
		const firstName = localStorage.getItem('timetracker_user_firstName') ?? '';
		const lastName = localStorage.getItem('timetracker_user_lastName') ?? '';
		if (firstName || lastName) {
			userProfile.update((profile) => {
				if (profile) {
					return { ...profile, firstName, lastName };
				}
				return profile;
			});
		}
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
