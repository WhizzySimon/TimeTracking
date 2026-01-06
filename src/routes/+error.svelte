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
			<button class="tt-button-primary" onclick={handleReload}>Seite neu laden</button>
			<button class="tt-button-secondary" onclick={handleGoHome}>Zur Startseite</button>
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
		padding: var(--tt-space-16);
		background: var(--tt-background-page);
	}

	.error-content {
		max-width: 400px;
		text-align: center;
		background: var(--tt-background-card);
		padding: var(--tt-space-32);
		border-radius: var(--tt-radius-card);
		box-shadow: var(--tt-shadow-modal);
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		color: var(--tt-text-primary);
	}

	.error-message {
		margin: 0 0 1.5rem;
		color: var(--tt-text-muted);
		line-height: 1.5;
	}

	.error-actions {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-12);
	}

	.error-details {
		margin-top: 1.5rem;
		text-align: left;
	}

	.error-details summary {
		cursor: pointer;
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-small);
	}

	.error-details pre {
		margin-top: 0.5rem;
		padding: var(--tt-space-12);
		background: var(--tt-background-card-hover);
		border-radius: var(--tt-radius-input);
		font-size: var(--tt-font-size-tiny);
		overflow-x: auto;
		color: var(--tt-status-danger-500);
	}
</style>
