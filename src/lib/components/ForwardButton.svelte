<!--
  ForwardButton - Browser-style history forward button
  
  Features:
  - Uses browser history (history.forward())
  - Always visible (like standard browsers)
  - Browser handles disabled state internally
  - Arrow-shaped background like navigation buttons
-->
<script lang="ts">
	function handleForward() {
		window.history.forward();
	}
</script>

<button class="tt-header-nav-button tt-interactive-dark" onclick={handleForward} aria-label="Vorwärts">
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
	/* Visual styles use design system classes: .tt-header-nav-button, .tt-header-nav-button__icon */
</style>
