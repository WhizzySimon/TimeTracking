/**
 * Supabase client for TimeTracker.
 * Provides authenticated access to Supabase Auth and Database.
 * Spec refs: cloud-backup-and-auth.md
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance.
 * Only creates client in browser environment.
 * Throws if Supabase env vars are not configured.
 */
export function getSupabase(): SupabaseClient {
	if (!browser) {
		throw new Error('Supabase client can only be used in browser');
	}

	if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
		throw new Error(
			'Supabase ist nicht konfiguriert. Bitte setzen Sie PUBLIC_SUPABASE_URL und PUBLIC_SUPABASE_ANON_KEY in .env'
		);
	}

	if (!supabaseInstance) {
		supabaseInstance = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true
			}
		});
	}

	return supabaseInstance;
}

/**
 * Check if Supabase is configured (env vars present).
 * Returns true only if both URL and anon key are set.
 */
export function isSupabaseConfigured(): boolean {
	return Boolean(PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Get the configuration error message if Supabase is not configured.
 * Returns null if configured properly.
 */
export function getSupabaseConfigError(): string | null {
	if (!PUBLIC_SUPABASE_URL) {
		return 'PUBLIC_SUPABASE_URL ist nicht gesetzt';
	}
	if (!PUBLIC_SUPABASE_ANON_KEY) {
		return 'PUBLIC_SUPABASE_ANON_KEY ist nicht gesetzt';
	}
	return null;
}
