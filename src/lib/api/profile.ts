/**
 * Profile API service for loading user profile from Supabase.
 * Spec refs: P10-monetising.md, P10-IG-001, P10-IG-002
 */

import { getSupabase, isSupabaseConfigured } from '$lib/supabase/client';
import type { UserProfile, UserPlan } from '$lib/types';

const PLAN_CACHE_KEY = 'userPlan';

/**
 * Load user profile from Supabase.
 * Caches plan to localStorage for offline fallback.
 * Returns null if not authenticated or on error.
 */
export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
	if (!isSupabaseConfigured()) {
		console.warn('[Profile] Supabase not configured, returning null');
		return null;
	}

	try {
		const supabase = getSupabase();

		// Get email from auth.users (source of truth for email)
		const { data: authData } = await supabase.auth.getUser();
		const authEmail = authData?.user?.email ?? '';

		const { data, error } = await supabase
			.from('profiles')
			.select(
				'id, email, plan, stripe_customer_id, subscription_status, subscription_ends_at, created_at, updated_at'
			)
			.eq('id', userId)
			.single();

		if (error) {
			console.error('[Profile] Failed to load profile:', error.message);
			return null;
		}

		if (!data) {
			console.warn('[Profile] No profile found for user:', userId);
			return null;
		}

		// Use auth email (always current) over profiles table email (may be stale)
		const profile: UserProfile = {
			id: data.id,
			email: authEmail || data.email || '',
			plan: (data.plan as UserPlan) ?? 'free',
			stripeCustomerId: data.stripe_customer_id ?? undefined,
			subscriptionStatus: data.subscription_status ?? undefined,
			subscriptionEndsAt: data.subscription_ends_at ?? undefined,
			createdAt: data.created_at,
			updatedAt: data.updated_at
		};

		// Cache plan for offline fallback
		try {
			localStorage.setItem(PLAN_CACHE_KEY, profile.plan);
		} catch {
			// localStorage may be unavailable
		}

		console.log('[Profile] Loaded profile:', { id: profile.id, plan: profile.plan });
		return profile;
	} catch (error) {
		console.error('[Profile] Unexpected error:', error);
		return null;
	}
}

/**
 * Get cached plan from localStorage.
 * Returns 'free' if no cache exists (conservative default).
 */
export function getCachedPlan(): UserPlan {
	try {
		const cached = localStorage.getItem(PLAN_CACHE_KEY);
		if (cached === 'pro') return 'pro';
	} catch {
		// localStorage may be unavailable
	}
	return 'free';
}

/**
 * Clear cached plan (on logout).
 */
export function clearCachedPlan(): void {
	try {
		localStorage.removeItem(PLAN_CACHE_KEY);
	} catch {
		// localStorage may be unavailable
	}
}
