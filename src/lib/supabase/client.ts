/**
 * Supabase client for TimeTracker.
 * Provides authenticated access to Supabase Auth and Database.
 * Spec refs: cloud-backup-and-auth.md
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance.
 * Only creates client in browser environment.
 */
export function getSupabase(): SupabaseClient {
	if (!browser) {
		throw new Error('Supabase client can only be used in browser');
	}

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			'Missing Supabase environment variables. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env'
		);
	}

	if (!supabaseInstance) {
		supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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
 */
export function isSupabaseConfigured(): boolean {
	return Boolean(supabaseUrl && supabaseAnonKey);
}
