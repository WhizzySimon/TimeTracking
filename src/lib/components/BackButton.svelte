<!--
  BackButton - Browser-style history back button
  
  Spec refs:
  - ux-improvements.md UX-FR-020 to UX-FR-024
  
  Features:
  - Uses browser history (history.back())
  - Hidden on initial app load (no history)
  - Visible after any navigation
-->
<script lang="ts">
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';

	let canGoBack = $state(false);

	onMount(() => {
		// Check if there's history to go back to
		// history.length > 1 means there's at least one page to go back to
		canGoBack = window.history.length > 1;
	});

	// Update canGoBack when navigation occurs
	$effect(() => {
		if ($navigating) {
			// After navigation completes, update canGoBack
			canGoBack = window.history.length > 1;
		}
	});

	function handleBack() {
		window.history.back();
	}
</script>

{#if canGoBack}
	<button class="back-btn" onclick={handleBack} aria-label="Zurück">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M19 12H5M12 19l-7-7 7-7" />
		</svg>
	</button>
{/if}

<style>
	.back-btn {
		width: 44px;
		height: 44px;
		border: 1px solid var(--border);
		border-radius: var(--r-btn);
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.back-btn:hover {
		background: var(--surface-hover);
	}

	.back-btn:active {
		background: var(--surface-active);
	}

	.back-btn svg {
		width: 20px;
		height: 20px;
	}
</style>
