/**
 * User store for TimeTracker.
 * Manages user profile and plan state.
 * Spec refs: P10-monetising.md, P10-DD-003
 */

import { writable, derived } from 'svelte/store';
import type { UserProfile, UserPlan } from '$lib/types';

/** Current user profile (null if not loaded) */
export const userProfile = writable<UserProfile | null>(null);

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
 * Update plan in store (for testing or manual override).
 * Note: This does NOT persist to Supabase.
 */
export function setUserPlanLocal(plan: UserPlan): void {
	userProfile.update((profile) => {
		if (profile) {
			return { ...profile, plan };
		}
		return profile;
	});
}
