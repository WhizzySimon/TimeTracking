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
	<button
		class="nav-btn tt-interactive-dark"
		onclick={handleBack}
		disabled={!canGoBack}
		aria-label="Zurück"
	>
		<svg
			class="nav-icon"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="15 18 9 12 15 6"></polyline>
		</svg>
	</button>
{/if}

<style>
	.nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 1px solid var(--tt-header-border);
		color: var(--tt-header-text);
		border-radius: var(--tt-radius-button);
		cursor: pointer;
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-icon {
		width: 20px;
		height: 20px;
	}
</style>
