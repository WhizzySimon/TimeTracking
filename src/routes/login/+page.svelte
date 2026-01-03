<!--
  Login Page
  Spec ref: ui-logic-spec-v1.md Section 13.1
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import PasswordInput from '$lib/components/PasswordInput.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let checkingSession = $state(true);

	onMount(async () => {
		if (!browser) {
			checkingSession = false;
			return;
		}

		// Skip auto-login if user just logged out
		const isLogout = new URLSearchParams(window.location.search).get('logout') === '1';
		if (isLogout) {
			checkingSession = false;
			return;
		}

		try {
			const { getSupabase, isSupabaseConfigured } = await import('$lib/supabase/client');
			if (!isSupabaseConfigured()) {
				checkingSession = false;
				return;
			}

			const supabase = getSupabase();

			// Debug: log URL params for troubleshooting email change flow
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			const urlType = hashParams.get('type');
			console.log('[Login] URL check:', {
				search: window.location.search,
				hash: window.location.hash,
				hashType: urlType,
				hasAccessToken: hashParams.has('access_token')
			});

			// Supabase's detectSessionInUrl:true automatically processes tokens in URL hash
			// After email change confirmation, Supabase redirects with access_token in hash
			// getSession() will pick up the session from the URL automatically
			const {
				data: { session }
			} = await supabase.auth.getSession();

			// Log if this was an email change confirmation
			if (urlType === 'email_change' && session) {
				console.log('[Login] Email change confirmed via URL token, session established');
			}

			if (session?.user) {
				const { saveSession } = await import('$lib/stores/auth');
				const { getCurrentUserId } = await import('$lib/api/auth');
				const { loadUserProfile } = await import('$lib/api/profile');
				const { setUserProfile, loadPersistedPlanOverride, loadPersistedUserName } =
					await import('$lib/stores/user');

				await saveSession({
					token: session.access_token,
					email: session.user.email ?? '',
					expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
					createdAt: Date.now()
				});

				// Load user profile for settings page
				const userId = await getCurrentUserId();
				if (userId) {
					const profile = await loadUserProfile(userId);
					setUserProfile(profile);
					loadPersistedPlanOverride();
					loadPersistedUserName();
				}

				console.log('[Login] Auto-login from session, email:', session.user.email);
				goto(resolve('/day'));
				return;
			}
		} catch (e) {
			console.error('[Login] Session check failed:', e);
		}

		checkingSession = false;
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';

		if (!email.trim()) {
			error = 'E-Mail ist erforderlich';
			return;
		}

		if (!password) {
			error = 'Passwort ist erforderlich';
			return;
		}

		loading = true;

		try {
			const { login, getCurrentUserId } = await import('$lib/api/auth');
			const { saveSession } = await import('$lib/stores/auth');
			const { loadUserProfile } = await import('$lib/api/profile');
			const { setUserProfile, loadPersistedPlanOverride, loadPersistedUserName } =
				await import('$lib/stores/user');

			const response = await login(email, password);

			const session = {
				token: response.token,
				email: response.email,
				expiresAt: response.expiresAt,
				createdAt: Date.now()
			};
			await saveSession(session);

			// Load user profile after login
			const userId = await getCurrentUserId();
			if (userId) {
				const profile = await loadUserProfile(userId);
				setUserProfile(profile);
				loadPersistedPlanOverride();
				loadPersistedUserName();
			}

			goto(resolve('/day'));
		} catch (e) {
			console.error('[Login] Failed:', e);
			error =
				e instanceof Error ? e.message : 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-page">
	<div class="login-card">
		<h1>TimeTracker</h1>
		{#if checkingSession}
			<p class="checking">Sitzung wird geprüft...</p>
		{:else}
			<h2>Anmelden</h2>

			<form onsubmit={handleSubmit}>
				<div class="field">
					<label for="email">E-Mail</label>
					<input
						type="email"
						id="email"
						name="email"
						autocomplete="username"
						bind:value={email}
						disabled={loading}
						placeholder="ihre@email.de"
					/>
				</div>

				<div class="field">
					<label for="password">Passwort</label>
					<PasswordInput
						id="password"
						bind:value={password}
						autocomplete="current-password"
						disabled={loading}
					/>
				</div>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<button type="submit" class="submit-btn" disabled={loading}>
					{loading ? 'Anmelden...' : 'Anmelden'}
				</button>
			</form>

			<div class="links">
				<a href={resolve('/signup')}>Registrieren</a>
				<a href={resolve('/forgot-password')}>Passwort vergessen?</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: var(--tt-background-page);
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		background: var(--tt-background-card);
		border-radius: var(--tt-radius-card);
		padding: 2rem;
		box-shadow: var(--tt-shadow-modal);
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
		text-align: center;
		color: var(--tt-brand-primary-500);
	}

	h2 {
		margin: 0 0 1.5rem;
		font-size: 1.25rem;
		text-align: center;
		color: var(--tt-text-primary);
		font-weight: 500;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field label {
		font-size: 0.9rem;
		color: var(--tt-text-primary);
		font-weight: 500;
	}

	.field input {
		padding: 0.75rem;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: 1rem;
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
	}

	.field input::placeholder {
		color: var(--tt-text-muted);
	}

	.field input:focus {
		outline: none;
		border-color: var(--tt-border-focus);
	}

	.field input:disabled {
		background: var(--tt-background-card-hover);
	}

	.error {
		color: var(--tt-status-danger-500);
		font-size: 0.9rem;
		padding: 0.75rem;
		background: var(--tt-status-danger-800);
		border-radius: var(--tt-radius-input);
		text-align: center;
	}

	.submit-btn {
		padding: 0.875rem;
		background: var(--tt-button-primary-bg);
		color: var(--tt-button-primary-text);
		border: none;
		border-radius: var(--tt-radius-button);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.submit-btn:hover:not(:disabled) {
		background: var(--tt-button-primary-hover);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.links {
		display: flex;
		justify-content: space-between;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--tt-border-default);
	}

	.links a {
		color: var(--tt-brand-primary-500);
		text-decoration: none;
		font-size: 0.9rem;
	}

	.links a:hover {
		text-decoration: underline;
	}

	.checking {
		text-align: center;
		color: var(--tt-text-muted);
		padding: 2rem 0;
	}
</style>
