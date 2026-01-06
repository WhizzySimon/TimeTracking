<!--
  ForwardButton - Browser-style history forward button
  
  Features:
  - Uses browser history (history.forward())
  - Disabled when no forward history available
  - Reactive state based on navigation changes
  - Arrow-shaped background like navigation buttons
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let canGoForward = $state(false);
	let hasNavigatedBack = $state(false);

	onMount(() => {
		if (!browser) return;

		// Track navigation to detect when user goes back
		const handlePopState = () => {
			// When user navigates back, enable forward button
			hasNavigatedBack = true;
			// Check if we can still go forward after this navigation
			updateForwardState();
		};

		// Track when user navigates forward or to a new page
		const handleNavigation = () => {
			// After a brief delay, check if forward is still possible
			setTimeout(updateForwardState, 100);
		};

		function updateForwardState() {
			// We can go forward if we've navigated back and haven't reached the end
			// This is a heuristic since browsers don't expose forward history length
			canGoForward = hasNavigatedBack;
		}

		window.addEventListener('popstate', handlePopState);
		window.addEventListener('pushstate', handleNavigation);

		return () => {
			window.removeEventListener('popstate', handlePopState);
			window.removeEventListener('pushstate', handleNavigation);
		};
	});

	function handleForward() {
		if (canGoForward) {
			window.history.forward();
			// After going forward, we might not be able to go forward anymore
			setTimeout(() => {
				// If we're at the end of forward history, disable the button
				canGoForward = false;
			}, 100);
		}
	}
</script>

<button
	class="tt-header-nav-button tt-interactive-dark"
	onclick={handleForward}
	disabled={!canGoForward}
	aria-label="Vorwärts"
>
	<svg
		class="tt-header-nav-button__icon"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<polyline points="9 18 15 12 9 6"></polyline>
	</svg>
</button>

<style>
	/* Visual styles use design system classes: .tt-header-nav-button, .tt-header-nav-button:disabled, .tt-header-nav-button__icon */
</style>
