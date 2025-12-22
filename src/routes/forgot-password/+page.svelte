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
			// TODO: Replace with real API call
			console.log('[ForgotPassword] Requesting reset for:', email);

			// Mock - simulate API delay
			await new Promise((r) => setTimeout(r, 500));

			// Always show success (security: don't reveal if email exists)
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
		background: #f5f5f5;
	}

	.forgot-card {
		width: 100%;
		max-width: 400px;
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
		text-align: center;
		color: #3b82f6;
	}

	h2 {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		text-align: center;
		color: #333;
		font-weight: 500;
	}

	.description {
		text-align: center;
		color: #666;
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
		color: #333;
		font-weight: 500;
	}

	.field input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
	}

	.field input:focus {
		outline: none;
		border-color: #3b82f6;
	}

	.field input:disabled {
		background: #f5f5f5;
	}

	.error {
		color: #dc2626;
		font-size: 0.9rem;
		padding: 0.75rem;
		background: #fef2f2;
		border-radius: 6px;
		text-align: center;
	}

	.success-message {
		text-align: center;
		padding: 1.5rem;
		background: #dcfce7;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.success-message p {
		margin: 0;
		color: #166534;
		line-height: 1.5;
	}

	.check-hint {
		margin-top: 0.5rem !important;
		font-size: 0.9rem;
	}

	.submit-btn {
		padding: 0.875rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.submit-btn:hover:not(:disabled) {
		background: #2563eb;
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
		border-top: 1px solid #eee;
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
		.forgot-page {
			background: #1a1a1a;
		}

		.forgot-card {
			background: #2a2a2a;
		}

		h2 {
			color: #eee;
		}

		.description {
			color: #999;
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

		.links {
			border-top-color: #444;
		}
	}
</style>
