<!--
  BackButton - Browser-style history back button
  
  Spec refs:
  - ux-improvements.md UX-FR-020 to UX-FR-024
  
  Features:
  - Uses browser history (history.back())
  - Disabled when no history available
  - Reactive state based on popstate events
  - Arrow-shaped background like navigation buttons
-->
<script lang="ts">
	import { onMount } from 'svelte';

	let canGoBack = $state(false);

	onMount(() => {
		// Check if we can go back
		canGoBack = window.history.length > 1;

		// Listen for navigation changes
		const handlePopState = () => {
			canGoBack = window.history.length > 1;
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	});

	function handleBack() {
		if (canGoBack) {
			window.history.back();
		}
	}
</script>

{#if canGoBack}
	<button class="back-btn" onclick={handleBack} disabled={!canGoBack} aria-label="Zurück">
		Zurück
	</button>
{/if}

<style>
	.back-btn {
		width: 70px;
		height: 32px;
		padding: 6px 12px;
		border: none;
		background: var(--surface);
		color: var(--text);
		font-size: 0.875rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%);
		transition: opacity 0.2s;
	}

	.back-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.back-btn:active:not(:disabled) {
		opacity: 0.8;
	}

	.back-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>
