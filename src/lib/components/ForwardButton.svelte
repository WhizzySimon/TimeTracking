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

<button class="nav-btn tt-interactive-dark" onclick={handleForward} aria-label="Vorwärts">
	<svg
		class="nav-icon"
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

	.nav-icon {
		width: 20px;
		height: 20px;
	}
</style>
