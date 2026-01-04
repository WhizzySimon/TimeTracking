<!--
  Reset Password Page
  Handles password reset after clicking email link
  Spec ref: cloud-backup-and-auth.md
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { getSupabase, isSupabaseConfigured } from '$lib/supabase/client';

	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let success = $state(false);
	let loading = $state(false);
	let validLink = $state(true);
	let checking = $state(true);

	onMount(async () => {
		if (browser) {
			// Check if we have a valid session for password reset
			// Supabase auto-processes the hash fragment (detectSessionInUrl: true)
			// so we need to check if a session was established, not the hash itself
			const hash = window.location.hash;
			const hasTokenInHash = hash && hash.includes('access_token');

			if (hasTokenInHash) {
				// Hash still present - wait for Supabase to process it
				await new Promise((resolve) => setTimeout(resolve, 500));
			}

			// Now check if Supabase has a valid session
			if (isSupabaseConfigured()) {
				try {
					const supabase = getSupabase();
					const {
						data: { session }
					} = await supabase.auth.getSession();
					validLink = session !== null;
				} catch {
					validLink = false;
				}
			} else {
				validLink = false;
			}

			checking = false;
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';

		if (!password) {
			error = 'Passwort ist erforderlich';
			return;
		}

		if (password.length < 8) {
			error = 'Passwort muss mindestens 8 Zeichen haben';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwörter stimmen nicht überein';
			return;
		}

		loading = true;

		try {
			const { updatePassword } = await import('$lib/api/auth');
			await updatePassword(password);
			success = true;

			setTimeout(() => {
				goto(resolve('/login'));
			}, 3000);
		} catch (e) {
			console.error('[ResetPassword] Failed:', e);
			error =
				e instanceof Error
					? e.message
					: 'Passwort konnte nicht geändert werden. Bitte versuchen Sie es erneut.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="reset-page">
	<div class="reset-card">
		<h1>TimeTracker</h1>
		<h2>Neues Passwort</h2>

		{#if checking}
			<div class="checking-message">
				<p>Link wird überprüft...</p>
			</div>
		{:else if !validLink}
			<div class="error-message">
				<p>Ungültiger oder abgelaufener Link.</p>
				<p>Bitte fordern Sie einen neuen Link an.</p>
			</div>
			<div class="links">
				<a href={resolve('/forgot-password')}>Neuen Link anfordern</a>
			</div>
		{:else if success}
			<div class="success-message">
				<p>Passwort erfolgreich geändert!</p>
				<p class="redirect-hint">Sie werden zur Anmeldung weitergeleitet...</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit}>
				<div class="field">
					<label for="password">Neues Passwort</label>
					<input
						type="password"
						id="password"
						name="password"
						autocomplete="new-password"
						bind:value={password}
						disabled={loading}
					/>
					<span class="hint">Mindestens 8 Zeichen</span>
				</div>

				<div class="field">
					<label for="confirmPassword">Passwort bestätigen</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						autocomplete="new-password"
						bind:value={confirmPassword}
						disabled={loading}
					/>
				</div>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<button type="submit" class="submit-btn" disabled={loading}>
					{loading ? 'Speichern...' : 'Passwort ändern'}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	.reset-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--tt-space-16);
		background: var(--tt-background-page);
	}

	.reset-card {
		width: 100%;
		max-width: 400px;
		background: var(--tt-background-card);
		border-radius: var(--tt-radius-card);
		padding: var(--tt-space-32);
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
		font-size: var(--tt-font-size-title);
		text-align: center;
		color: var(--tt-text-primary);
		font-weight: 500;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.field label {
		font-size: var(--tt-font-size-body);
		color: var(--tt-text-primary);
		font-weight: 500;
	}

	.field input {
		padding: var(--tt-space-12);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: var(--tt-font-size-normal);
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
	}

	.field input:focus {
		outline: none;
		border-color: var(--tt-border-focus);
	}

	.field input:disabled {
		background: var(--tt-background-card-hover);
	}

	.hint {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-muted);
	}

	.error {
		color: var(--tt-status-danger-500);
		font-size: var(--tt-font-size-body);
		padding: var(--tt-space-12);
		background: var(--tt-status-danger-800);
		border-radius: var(--tt-radius-input);
		text-align: center;
	}

	.checking-message {
		text-align: center;
		padding: var(--tt-space-24);
		color: var(--tt-text-muted);
	}

	.error-message {
		text-align: center;
		padding: var(--tt-space-24);
		background: var(--tt-status-danger-800);
		border-radius: var(--tt-radius-card);
		margin-bottom: 1rem;
	}

	.error-message p {
		margin: 0;
		color: var(--tt-status-danger-500);
		line-height: 1.5;
	}

	.success-message {
		text-align: center;
		padding: var(--tt-space-24);
		background: var(--tt-status-success-800);
		border-radius: var(--tt-radius-card);
	}

	.success-message p {
		margin: 0;
		color: var(--tt-status-success-500);
		line-height: 1.5;
	}

	.redirect-hint {
		margin-top: 0.5rem !important;
		font-size: var(--tt-font-size-body);
	}

	.submit-btn {
		padding: 0.875rem;
		background: var(--tt-button-primary-bg);
		color: var(--tt-button-primary-text);
		border: none;
		border-radius: var(--tt-radius-button);
		font-size: var(--tt-font-size-normal);
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
		justify-content: center;
		margin-top: 1rem;
	}

	.links a {
		color: var(--tt-brand-primary-500);
		text-decoration: none;
		font-size: var(--tt-font-size-body);
	}

	.links a:hover {
		text-decoration: underline;
	}
</style>
