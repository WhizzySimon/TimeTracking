/**
 * Authentication API service using Supabase Auth.
 * Spec refs: technical-guideline-v1 section 5, cloud-backup-and-auth.md
 *
 * NO MOCK FALLBACKS: All auth operations require Supabase to be configured.
 * If env vars are missing, operations will throw with a user-friendly error.
 */

import { getSupabase, isSupabaseConfigured, getSupabaseConfigError } from '$lib/supabase/client';

/**
 * Translate common Supabase auth error messages to German.
 */
function translateAuthError(message: string): string {
	const translations: Record<string, string> = {
		'Invalid login credentials': 'Ungültige Anmeldedaten',
		'Email not confirmed': 'E-Mail nicht bestätigt',
		'User already registered': 'Benutzer bereits registriert',
		'Password should be at least 6 characters': 'Passwort muss mindestens 6 Zeichen lang sein',
		'Unable to validate email address: invalid format': 'Ungültiges E-Mail-Format',
		'Email rate limit exceeded':
			'E-Mail-Limit überschritten. Bitte versuchen Sie es später erneut.',
		'Invalid email or password': 'Ungültige E-Mail oder Passwort',
		'Email link is invalid or has expired': 'E-Mail-Link ist ungültig oder abgelaufen',
		'New password should be different from the old password':
			'Neues Passwort muss sich vom alten unterscheiden',
		'Password is too weak': 'Passwort ist zu schwach',
		'User not found': 'Benutzer nicht gefunden',
		'Network request failed': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
		'Failed to fetch': 'Verbindung fehlgeschlagen. Bitte überprüfen Sie Ihre Internetverbindung.'
	};

	// Check for exact match
	if (translations[message]) {
		return translations[message];
	}

	// Check for partial matches
	for (const [english, german] of Object.entries(translations)) {
		if (message.includes(english)) {
			return german;
		}
	}

	// Default fallback for unknown errors
	return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
}

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
 * Ensure Supabase is configured before any auth operation.
 * Throws a user-friendly error if not configured.
 */
function requireSupabase(): void {
	if (!isSupabaseConfigured()) {
		const configError = getSupabaseConfigError();
		throw new Error(
			configError ?? 'Supabase ist nicht konfiguriert. Bitte kontaktieren Sie den Administrator.'
		);
	}
}

/**
 * Login with email and password using Supabase Auth.
 * @param email User email
 * @param password User password
 * @returns Session token and expiry
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
	console.log('[AuthAPI] Login request:', { email });

	requireSupabase();

	const supabase = getSupabase();
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error) {
		console.error('[AuthAPI] Login failed:', error.message);
		// Translate common Supabase error messages
		const translatedMessage = translateAuthError(error.message);
		throw new Error(translatedMessage);
	}

	if (!data.session) {
		throw new Error('Keine Sitzung vom Login zurückgegeben');
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

	requireSupabase();

	const supabase = getSupabase();
	const { data, error } = await supabase.auth.signUp({
		email,
		password
	});

	if (error) {
		console.error('[AuthAPI] Signup failed:', error.message);
		const translatedMessage = translateAuthError(error.message);
		throw new Error(translatedMessage);
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

	requireSupabase();

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

	requireSupabase();

	const supabase = getSupabase();
	const { error } = await supabase.auth.updateUser({
		password: newPassword
	});

	if (error) {
		console.error('[AuthAPI] Update password failed:', error.message);
		const translatedMessage = translateAuthError(error.message);
		throw new Error(translatedMessage);
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

	try {
		const supabase = getSupabase();
		const {
			data: { session }
		} = await supabase.auth.getSession();

		return session !== null;
	} catch {
		return false;
	}
}

/**
 * Get current user ID from Supabase session.
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
	if (!isSupabaseConfigured()) {
		return null;
	}

	try {
		const supabase = getSupabase();
		const {
			data: { user }
		} = await supabase.auth.getUser();

		return user?.id ?? null;
	} catch {
		return null;
	}
}

/**
 * Logout using Supabase Auth.
 */
export async function logout(): Promise<void> {
	console.log('[AuthAPI] Logout request');

	if (!isSupabaseConfigured()) {
		console.log('[AuthAPI] Supabase not configured, skipping signOut');
		return;
	}

	try {
		const supabase = getSupabase();
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error('[AuthAPI] Logout failed:', error.message);
		}

		console.log('[AuthAPI] Session invalidated');
	} catch (e) {
		console.error('[AuthAPI] Logout error:', e);
	}
}

/**
 * Delete user account using Supabase Admin API via Edge Function.
 * Note: Supabase client-side SDK cannot delete users directly.
 * This requires a server-side Edge Function with service_role key.
 *
 * For now, we use the RPC approach which requires a Postgres function.
 */
export async function deleteAccount(): Promise<void> {
	console.log('[AuthAPI] Delete account request');

	requireSupabase();

	const supabase = getSupabase();

	// Call the delete_user RPC function (must be created in Supabase)
	const { error } = await supabase.rpc('delete_user');

	if (error) {
		console.error('[AuthAPI] Delete account failed:', error.message);
		const translatedMessage = translateAuthError(error.message);
		throw new Error(translatedMessage);
	}

	// Sign out after deletion
	await supabase.auth.signOut();

	console.log('[AuthAPI] Account deleted successfully');
}
