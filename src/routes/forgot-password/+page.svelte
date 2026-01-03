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
		background: var(--tt-background-page);
	}

	.forgot-card {
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
		color: var(--tt-brand-primary);
	}

	h2 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		text-align: center;
		color: var(--tt-text-primary);
		font-weight: 500;
	}

	.description {
		text-align: center;
		color: var(--tt-text-muted);
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
		color: var(--tt-status-danger);
		font-size: 0.9rem;
		padding: 0.75rem;
		background: var(--tt-status-danger-faded);
		border-radius: var(--tt-radius-input);
		text-align: center;
	}

	.success-message {
		text-align: center;
		padding: 1.5rem;
		background: var(--tt-status-success-faded);
		border-radius: var(--tt-radius-card);
		margin-bottom: 1rem;
	}

	.success-message p {
		margin: 0;
		color: var(--tt-status-success);
		line-height: 1.5;
	}

	.check-hint {
		margin-top: 0.5rem !important;
		font-size: 0.9rem;
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
		justify-content: center;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--tt-border-default);
	}

	.links a {
		color: var(--tt-brand-primary);
		text-decoration: none;
		font-size: 0.9rem;
	}

	.links a:hover {
		text-decoration: underline;
	}
</style>
