<!--
  Forgot Password Page
  Spec ref: ui-logic-spec-v1.md Section 13.3
-->
<script lang="ts">
	import { resolve } from '$app/paths';

	let email = $state('');
	let error = $state('');
	let success = $state(false);
	let loading = $state(false);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';

		if (!email.trim()) {
			error = 'E-Mail ist erforderlich';
			return;
		}

		loading = true;

		try {
			const { forgotPassword } = await import('$lib/api/auth');
			await forgotPassword(email);
			success = true;
		} catch (e) {
			console.error('[ForgotPassword] Failed:', e);
			error = 'Anfrage fehlgeschlagen. Bitte versuchen Sie es erneut.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="forgot-page">
	<div class="forgot-card">
		<h1>TimeTracker</h1>
		<h2>Passwort vergessen</h2>

		{#if success}
			<div class="success-message">
				<p>
					Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.
				</p>
				<p class="check-hint">Bitte überprüfen Sie Ihren Posteingang.</p>
			</div>
			<div class="links">
				<a href={resolve('/login')}>Zurück zur Anmeldung</a>
			</div>
		{:else}
			<p class="description">
				Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres
				Passworts.
			</p>

			<form onsubmit={handleSubmit}>
				<div class="field">
					<label for="email">E-Mail</label>
					<input
						type="email"
						id="email"
						name="email"
						autocomplete="email"
						bind:value={email}
						disabled={loading}
						placeholder="ihre@email.de"
					/>
				</div>

				{#if error}
					<div class="error">{error}</div>
				{/if}

				<button type="submit" class="submit-btn" disabled={loading}>
					{loading ? 'Senden...' : 'Link senden'}
				</button>
			</form>

			<div class="links">
				<a href={resolve('/login')}>Zurück zur Anmeldung</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.forgot-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: var(--bg);
	}

	.forgot-card {
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
		margin: 0 0 1rem;
		font-size: 1.25rem;
		text-align: center;
		color: var(--text);
		font-weight: 500;
	}

	.description {
		text-align: center;
		color: var(--muted);
		font-size: 0.9rem;
		margin: 0 0 1.5rem;
		line-height: 1.5;
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

	.success-message {
		text-align: center;
		padding: 1.5rem;
		background: var(--pos-light);
		border-radius: var(--r-card);
		margin-bottom: 1rem;
	}

	.success-message p {
		margin: 0;
		color: var(--pos);
		line-height: 1.5;
	}

	.check-hint {
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
</style>
