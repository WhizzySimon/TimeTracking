/**
 * Authentication store for TimeTracker.
 * Manages user session state and persistence.
 * Spec refs: technical-guideline-v1 section 5
 */

import { writable, derived } from 'svelte/store';
import type { AuthSession } from '$lib/types';
import { getByKey, put, deleteByKey } from '$lib/storage/db';

const AUTH_STORE = 'authSession';
const AUTH_KEY = 'current';

/** Current auth session (null if not logged in) */
export const authSession = writable<AuthSession | null>(null);

/** Derived store: true if user is authenticated with valid (non-expired) session */
export const isAuthenticated = derived(authSession, ($session) => {
	if (!$session) return false;
	return $session.expiresAt > Date.now();
});

/**
 * Load session from IndexedDB on app startup.
 * Returns true if valid session exists, false otherwise.
 */
export async function loadSession(): Promise<boolean> {
	try {
		const session = await getByKey<AuthSession>(AUTH_STORE, AUTH_KEY);
		if (session && session.expiresAt > Date.now()) {
			authSession.set(session);
			return true;
		}
		// Session expired or doesn't exist
		authSession.set(null);
		return false;
	} catch (error) {
		console.error('[Auth] Failed to load session:', error);
		authSession.set(null);
		return false;
	}
}

/**
 * Save session to IndexedDB and update store.
 */
export async function saveSession(session: AuthSession): Promise<void> {
	try {
		await put(AUTH_STORE, { key: AUTH_KEY, ...session });
		authSession.set(session);
		console.log('[Auth] Session saved for:', session.email);
	} catch (error) {
		console.error('[Auth] Failed to save session:', error);
		throw error;
	}
}

/**
 * Clear session from IndexedDB and store (logout).
 */
export async function clearSession(): Promise<void> {
	try {
		await deleteByKey(AUTH_STORE, AUTH_KEY);
		authSession.set(null);
		console.log('[Auth] Session cleared');
	} catch (error) {
		console.error('[Auth] Failed to clear session:', error);
		// Still clear the store even if DB fails
		authSession.set(null);
	}
}

/**
 * Check if session is valid (not expired).
 */
export function isSessionValid(session: AuthSession | null): boolean {
	if (!session) return false;
	return session.expiresAt > Date.now();
}
