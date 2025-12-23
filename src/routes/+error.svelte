<!--
  Error boundary page - catches unhandled errors in routes
  
  Spec refs:
  - Task 4.8 (Implement basic error boundaries)
  
  Features:
  - User-friendly error message
  - Reload button to recover
  - Logs error to console for debugging
-->
<script lang="ts">
	import { page } from '$app/stores';

	// Log error for debugging
	$effect(() => {
		if ($page.error) {
			console.error('[Error Page] Unhandled error:', $page.error);
		}
	});

	function handleReload() {
		window.location.reload();
	}

	function handleGoHome() {
		window.location.href = '/';
	}
</script>

<div class="error-page">
	<div class="error-content">
		<div class="error-icon">⚠️</div>
		<h1>Etwas ist schiefgelaufen</h1>
		<p class="error-message">
			Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
		</p>

		<div class="error-actions">
			<button class="btn-primary" onclick={handleReload}>Seite neu laden</button>
			<button class="btn-secondary" onclick={handleGoHome}>Zur Startseite</button>
		</div>

		{#if $page.error?.message}
			<details class="error-details">
				<summary>Technische Details</summary>
				<pre>{$page.error.message}</pre>
			</details>
		{/if}
	</div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: var(--bg);
	}

	.error-content {
		max-width: 400px;
		text-align: center;
		background: var(--surface);
		padding: 2rem;
		border-radius: var(--r-card);
		box-shadow: var(--elev-2);
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		color: var(--text);
	}

	.error-message {
		margin: 0 0 1.5rem;
		color: var(--muted);
		line-height: 1.5;
	}

	.error-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--r-btn);
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover {
		background: var(--btn-primary-hover);
	}

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--btn-secondary-border);
		border-radius: var(--r-btn);
		background: var(--btn-secondary-bg);
		color: var(--btn-secondary-text);
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-secondary:hover {
		background: var(--btn-secondary-hover);
	}

	.error-details {
		margin-top: 1.5rem;
		text-align: left;
	}

	.error-details summary {
		cursor: pointer;
		color: var(--muted);
		font-size: 0.875rem;
	}

	.error-details pre {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: var(--surface-hover);
		border-radius: var(--r-input);
		font-size: 0.75rem;
		overflow-x: auto;
		color: var(--neg);
	}
</style>
