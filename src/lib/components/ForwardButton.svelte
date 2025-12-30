<!--
  ForwardButton - Browser-style history forward button
  
  Features:
  - Uses browser history (history.forward())
  - Hidden when no forward history available
  - Visible after navigating back
-->
<script lang="ts">
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';

	let canGoForward = $state(false);

	onMount(() => {
		// Check if there's forward history
		// This is tricky - we need to track navigation state
		updateForwardState();
	});

	// Update canGoForward when navigation occurs
	$effect(() => {
		if ($navigating) {
			updateForwardState();
		}
	});

	function updateForwardState() {
		// Try to detect if forward navigation is possible
		// This is a heuristic - browser doesn't expose this directly
		canGoForward = false;

		// Listen for popstate to detect back/forward navigation
		const handlePopState = () => {
			setTimeout(() => {
				canGoForward = window.history.state !== null;
			}, 100);
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}

	function handleForward() {
		window.history.forward();
	}
</script>

{#if canGoForward}
	<button class="forward-btn" onclick={handleForward} aria-label="Vorwärts">
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
			<path d="M5 12h14M12 5l7 7-7 7" />
		</svg>
	</button>
{/if}

<style>
	.forward-btn {
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

	.forward-btn:hover {
		background: var(--surface-hover);
	}

	.forward-btn:active {
		background: var(--surface-active);
	}

	.forward-btn svg {
		width: 20px;
		height: 20px;
	}
</style>
