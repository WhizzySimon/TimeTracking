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
		padding: var(--tt-space-16);
		background: var(--tt-background-page);
	}

	.forgot-card {
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
		margin: 0 0 1rem;
		font-size: var(--tt-font-size-title);
		text-align: center;
		color: var(--tt-text-primary);
		font-weight: 500;
	}

	.description {
		text-align: center;
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-body);
		margin: 0 0 1.5rem;
		line-height: 1.5;
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

	.error {
		color: var(--tt-status-danger-500);
		font-size: var(--tt-font-size-body);
		padding: var(--tt-space-12);
		background: var(--tt-status-danger-800);
		border-radius: var(--tt-radius-input);
		text-align: center;
	}

	.success-message {
		text-align: center;
		padding: var(--tt-space-24);
		background: var(--tt-status-success-800);
		border-radius: var(--tt-radius-card);
		margin-bottom: 1rem;
	}

	.success-message p {
		margin: 0;
		color: var(--tt-status-success-500);
		line-height: 1.5;
	}

	.check-hint {
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
