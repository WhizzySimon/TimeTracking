<!--
  Signup Page
  Spec ref: ui-logic-spec-v1.md Section 13.2
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let success = $state('');
	let loading = $state(false);

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

		if (password.length < 8) {
			error = 'Passwort muss mindestens 8 Zeichen haben';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwörter stimmen nicht überein';
			return;
		}

		loading = true;
		success = '';

		try {
			const { signup } = await import('$lib/api/auth');
			const { saveSession } = await import('$lib/stores/auth');

			const response = await signup(email, password);

			const session = {
				token: response.token,
				email: response.email,
				expiresAt: response.expiresAt,
				createdAt: Date.now()
			};
			await saveSession(session);

			goto(resolve('/day'));
		} catch (e) {
			console.error('[Signup] Failed:', e);
			const message =
				e instanceof Error
					? e.message
					: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';

			// Check if this is actually a success message (email confirmation required)
			if (message.includes('erfolgreich')) {
				success = message;
			} else {
				error = message;
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="signup-page">
	<div class="signup-card">
		<h1>TimeTracker</h1>
		<h2>Registrieren</h2>

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

			{#if success}
				<div class="success">{success}</div>
			{/if}

			{#if error}
				<div class="error">{error}</div>
			{/if}

			<button type="submit" class="tt-button-primary tt-button-full" disabled={loading}>
				{loading ? 'Registrieren...' : 'Registrieren'}
			</button>
		</form>

		<div class="links">
			<a href={resolve('/login')}>Bereits registriert? Anmelden</a>
		</div>
	</div>
</div>

<style>
	.signup-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--tt-space-16);
		background: var(--tt-background-page);
	}

	.signup-card {
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

	.success {
		color: var(--tt-status-success-500);
		font-size: var(--tt-font-size-body);
		padding: var(--tt-space-12);
		background: var(--tt-status-success-800);
		border-radius: var(--tt-radius-input);
		text-align: center;
	}

	.links {
		display: flex;
		justify-content: center;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--tt-border-default);
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
