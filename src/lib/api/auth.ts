/**
 * Authentication API service.
 * Currently mock implementation - replace with real API calls later.
 * Spec refs: technical-guideline-v1 section 5
 */

export interface LoginResponse {
	token: string;
	expiresAt: number;
}

export interface SignupResponse {
	token: string;
	expiresAt: number;
}

/**
 * Login with email and password.
 * TODO: Replace with real API call to backend.
 * @param email User email
 * @param password User password
 * @returns Session token and expiry
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
	// Log request (password masked for security)
	console.log('[AuthAPI] Login request:', { email, passwordLength: password.length });

	// TODO: Replace with real API call
	// const response = await fetch('/api/auth/login', {
	//   method: 'POST',
	//   headers: { 'Content-Type': 'application/json' },
	//   body: JSON.stringify({ email, password })
	// });
	// if (!response.ok) throw new Error('Login failed');
	// return response.json();

	// Mock implementation - simulate network delay
	await new Promise((r) => setTimeout(r, 300));

	// Mock: Always succeed for demo purposes
	return {
		token: `mock-token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
		expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
	};
}

/**
 * Register a new user.
 * TODO: Replace with real API call to backend.
 * @param email User email
 * @param password User password
 * @returns Session token and expiry (auto-login after signup)
 */
export async function signup(email: string, password: string): Promise<SignupResponse> {
	// Log request (password masked for security)
	console.log('[AuthAPI] Signup request:', { email, passwordLength: password.length });

	// TODO: Replace with real API call
	// const response = await fetch('/api/auth/signup', {
	//   method: 'POST',
	//   headers: { 'Content-Type': 'application/json' },
	//   body: JSON.stringify({ email, password })
	// });
	// if (!response.ok) throw new Error('Signup failed');
	// return response.json();

	// Mock implementation - simulate network delay
	await new Promise((r) => setTimeout(r, 300));

	// Mock: Always succeed for demo purposes
	return {
		token: `mock-token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
		expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
	};
}

/**
 * Request password reset email.
 * TODO: Replace with real API call to backend.
 * @param email User email
 */
export async function forgotPassword(email: string): Promise<void> {
	console.log('[AuthAPI] Forgot password request:', { email });

	// TODO: Replace with real API call
	// const response = await fetch('/api/auth/forgot-password', {
	//   method: 'POST',
	//   headers: { 'Content-Type': 'application/json' },
	//   body: JSON.stringify({ email })
	// });
	// Note: Always return success for security (don't reveal if email exists)

	// Mock implementation - simulate network delay
	await new Promise((r) => setTimeout(r, 300));

	// Mock: Always succeed (for security, never reveal if email exists)
	console.log('[AuthAPI] Password reset email would be sent to:', email);
}

/**
 * Validate a session token.
 * TODO: Replace with real API call to backend.
 * @param token Session token
 * @returns True if token is valid
 */
export async function validateToken(token: string): Promise<boolean> {
	console.log('[AuthAPI] Validate token request');

	// TODO: Replace with real API call
	// const response = await fetch('/api/auth/validate', {
	//   headers: { 'Authorization': `Bearer ${token}` }
	// });
	// return response.ok;

	// Mock: Token is valid if it starts with 'mock-token-'
	return token.startsWith('mock-token-');
}

/**
 * Logout (invalidate session on server).
 * TODO: Replace with real API call to backend.
 * @param token Session token
 */
export async function logout(token: string): Promise<void> {
	console.log('[AuthAPI] Logout request for token:', token.substring(0, 10) + '...');

	// TODO: Replace with real API call
	// await fetch('/api/auth/logout', {
	//   method: 'POST',
	//   headers: { 'Authorization': `Bearer ${token}` }
	// });

	// Mock: Just log
	console.log('[AuthAPI] Session invalidated (mock)');
}
