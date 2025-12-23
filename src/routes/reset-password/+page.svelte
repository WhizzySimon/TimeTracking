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

	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let success = $state(false);
	let loading = $state(false);
	let validLink = $state(true);

	onMount(() => {
		if (browser) {
			const hash = window.location.hash;
			if (!hash || !hash.includes('access_token')) {
				validLink = false;
			}
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

		{#if !validLink}
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
		padding: 1rem;
		background: var(--bg);
	}

	.reset-card {
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

	.field input:focus {
		outline: none;
		border-color: var(--input-focus-border);
	}

	.field input:disabled {
		background: var(--surface-hover);
	}

	.hint {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.error {
		color: var(--neg);
		font-size: 0.9rem;
		padding: 0.75rem;
		background: var(--neg-light);
		border-radius: var(--r-input);
		text-align: center;
	}

	.error-message {
		text-align: center;
		padding: 1.5rem;
		background: var(--neg-light);
		border-radius: var(--r-card);
		margin-bottom: 1rem;
	}

	.error-message p {
		margin: 0;
		color: var(--neg);
		line-height: 1.5;
	}

	.success-message {
		text-align: center;
		padding: 1.5rem;
		background: var(--pos-light);
		border-radius: var(--r-card);
	}

	.success-message p {
		margin: 0;
		color: var(--pos);
		line-height: 1.5;
	}

	.redirect-hint {
		margin-top: 0.5rem !important;
		font-size: 0.9rem;
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
		justify-content: center;
		margin-top: 1rem;
	}

	.links a {
		color: #3b82f6;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.links a:hover {
		text-decoration: underline;
	}

	@media (prefers-color-scheme: dark) {
		.reset-page {
			background: #1a1a1a;
		}

		.reset-card {
			background: #2a2a2a;
		}

		h2 {
			color: #eee;
		}

		.field label {
			color: #ddd;
		}

		.field input {
			background: #333;
			border-color: #444;
			color: #eee;
		}

		.field input:focus {
			border-color: #3b82f6;
		}

		.field input:disabled {
			background: #2a2a2a;
		}

		.hint {
			color: #999;
		}
	}
</style>
