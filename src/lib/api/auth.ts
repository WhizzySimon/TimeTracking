/**
 * Authentication API service using Supabase Auth.
 * Spec refs: technical-guideline-v1 section 5, cloud-backup-and-auth.md
 */

import { getSupabase, isSupabaseConfigured } from '$lib/supabase/client';

export interface LoginResponse {
	token: string;
	email: string;
	expiresAt: number;
}

export interface SignupResponse {
	token: string;
	email: string;
	expiresAt: number;
}

/**
 * Login with email and password using Supabase Auth.
 * @param email User email
 * @param password User password
 * @returns Session token and expiry
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
	console.log('[AuthAPI] Login request:', { email });

	if (!isSupabaseConfigured()) {
		console.warn('[AuthAPI] Supabase not configured, using mock auth');
		return mockLogin(email);
	}

	const supabase = getSupabase();
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error) {
		console.error('[AuthAPI] Login failed:', error.message);
		throw new Error(error.message);
	}

	if (!data.session) {
		throw new Error('No session returned from login');
	}

	return {
		token: data.session.access_token,
		email: data.user?.email ?? email,
		expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600000
	};
}

/**
 * Register a new user using Supabase Auth.
 * @param email User email
 * @param password User password
 * @returns Session token and expiry (auto-login after signup)
 */
export async function signup(email: string, password: string): Promise<SignupResponse> {
	console.log('[AuthAPI] Signup request:', { email });

	if (!isSupabaseConfigured()) {
		console.warn('[AuthAPI] Supabase not configured, using mock auth');
		return mockLogin(email);
	}

	const supabase = getSupabase();
	const { data, error } = await supabase.auth.signUp({
		email,
		password
	});

	if (error) {
		console.error('[AuthAPI] Signup failed:', error.message);
		throw new Error(error.message);
	}

	if (!data.session) {
		throw new Error(
			'Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse, um sich anzumelden.'
		);
	}

	return {
		token: data.session.access_token,
		email: data.user?.email ?? email,
		expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600000
	};
}

/**
 * Request password reset email using Supabase Auth.
 * @param email User email
 */
export async function forgotPassword(email: string): Promise<void> {
	console.log('[AuthAPI] Forgot password request:', { email });

	if (!isSupabaseConfigured()) {
		console.warn('[AuthAPI] Supabase not configured, mock forgot password');
		await new Promise((r) => setTimeout(r, 300));
		return;
	}

	const supabase = getSupabase();
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${window.location.origin}/reset-password`
	});

	if (error) {
		console.error('[AuthAPI] Forgot password failed:', error.message);
	}
}

/**
 * Update password (for reset flow).
 * @param newPassword New password
 */
export async function updatePassword(newPassword: string): Promise<void> {
	console.log('[AuthAPI] Update password request');

	if (!isSupabaseConfigured()) {
		console.warn('[AuthAPI] Supabase not configured, mock update password');
		await new Promise((r) => setTimeout(r, 300));
		return;
	}

	const supabase = getSupabase();
	const { error } = await supabase.auth.updateUser({
		password: newPassword
	});

	if (error) {
		console.error('[AuthAPI] Update password failed:', error.message);
		throw new Error(error.message);
	}
}

/**
 * Validate current session with Supabase.
 * @returns True if session is valid
 */
export async function validateSession(): Promise<boolean> {
	console.log('[AuthAPI] Validate session request');

	if (!isSupabaseConfigured()) {
		return false;
	}

	const supabase = getSupabase();
	const {
		data: { session }
	} = await supabase.auth.getSession();

	return session !== null;
}

/**
 * Get current user ID from Supabase session.
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
	if (!isSupabaseConfigured()) {
		return null;
	}

	const supabase = getSupabase();
	const {
		data: { user }
	} = await supabase.auth.getUser();

	return user?.id ?? null;
}

/**
 * Logout using Supabase Auth.
 */
export async function logout(): Promise<void> {
	console.log('[AuthAPI] Logout request');

	if (!isSupabaseConfigured()) {
		console.log('[AuthAPI] Session invalidated (mock)');
		return;
	}

	const supabase = getSupabase();
	const { error } = await supabase.auth.signOut();

	if (error) {
		console.error('[AuthAPI] Logout failed:', error.message);
	}

	console.log('[AuthAPI] Session invalidated');
}

/**
 * Mock login for development without Supabase.
 */
function mockLogin(email: string): LoginResponse {
	return {
		token: `mock-token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
		email,
		expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
	};
}
