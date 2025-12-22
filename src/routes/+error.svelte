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
		background: #f9fafb;
	}

	.error-content {
		max-width: 400px;
		text-align: center;
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		color: #1f2937;
	}

	.error-message {
		margin: 0 0 1.5rem;
		color: #6b7280;
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
		border-radius: 8px;
		background: #3b82f6;
		color: white;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover {
		background: #2563eb;
	}

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: white;
		color: #374151;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-secondary:hover {
		background: #f3f4f6;
	}

	.error-details {
		margin-top: 1.5rem;
		text-align: left;
	}

	.error-details summary {
		cursor: pointer;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.error-details pre {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: #f3f4f6;
		border-radius: 4px;
		font-size: 0.75rem;
		overflow-x: auto;
		color: #dc2626;
	}

	@media (prefers-color-scheme: dark) {
		.error-page {
			background: #111827;
		}

		.error-content {
			background: #1f2937;
		}

		h1 {
			color: #f9fafb;
		}

		.error-message {
			color: #9ca3af;
		}

		.btn-secondary {
			background: #374151;
			border-color: #4b5563;
			color: #f9fafb;
		}

		.btn-secondary:hover {
			background: #4b5563;
		}

		.error-details summary {
			color: #9ca3af;
		}

		.error-details pre {
			background: #374151;
			color: #fca5a5;
		}
	}
</style>
