<!--
  Login Page
  Spec ref: ui-logic-spec-v1.md Section 13.1
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let email = $state('');
	let password = $state('');
	let error = $state('');
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

		loading = true;

		try {
			const { login } = await import('$lib/api/auth');
			const { saveSession } = await import('$lib/stores/auth');

			const response = await login(email, password);

			const session = {
				token: response.token,
				email: response.email,
				expiresAt: response.expiresAt,
				createdAt: Date.now()
			};
			await saveSession(session);

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
				<input
					type="password"
					id="password"
					name="password"
					autocomplete="current-password"
					bind:value={password}
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
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: #f5f5f5;
	}

	.login-card {
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
		margin: 0 0 1.5rem;
		font-size: 1.25rem;
		text-align: center;
		color: #333;
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
		justify-content: space-between;
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
		.login-page {
			background: #1a1a1a;
		}

		.login-card {
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

		.links {
			border-top-color: #444;
		}
	}
</style>
