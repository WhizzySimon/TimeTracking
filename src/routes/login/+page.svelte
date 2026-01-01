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
			const { data: { session } } = await supabase.auth.getSession();

			if (session?.user) {
				const { saveSession } = await import('$lib/stores/auth');
				await saveSession({
					token: session.access_token,
					email: session.user.email ?? '',
					expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
					createdAt: Date.now()
				});
				console.log('[Login] Auto-login from session (email change confirmation)');
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
			const { setUserProfile, loadPersistedPlanOverride, loadPersistedUserName } = await import('$lib/stores/user');

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
		background: var(--bg);
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		background: var(--surface);
		border-radius: var(--r-card);
		padding: 2rem;
		box-shadow: var(--elev-2);
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
		text-align: center;
		color: var(--accent);
	}

	h2 {
		margin: 0 0 1.5rem;
		font-size: 1.25rem;
		text-align: center;
		color: var(--text);
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
		color: var(--text);
		font-weight: 500;
	}

	.field input {
		padding: 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
	}

	.field input::placeholder {
		color: var(--input-placeholder);
	}

	.field input:focus {
		outline: none;
		border-color: var(--input-focus-border);
	}

	.field input:disabled {
		background: var(--surface-hover);
	}

	.error {
		color: var(--neg);
		font-size: 0.9rem;
		padding: 0.75rem;
		background: var(--neg-light);
		border-radius: var(--r-input);
		text-align: center;
	}

	.submit-btn {
		padding: 0.875rem;
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		border: none;
		border-radius: var(--r-btn);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.submit-btn:hover:not(:disabled) {
		background: var(--btn-primary-hover);
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
		border-top: 1px solid var(--border);
	}

	.links a {
		color: var(--accent);
		text-decoration: none;
		font-size: 0.9rem;
	}

	.links a:hover {
		text-decoration: underline;
	}

	.checking {
		text-align: center;
		color: var(--muted);
		padding: 2rem 0;
	}
</style>
