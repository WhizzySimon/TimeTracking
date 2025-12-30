<!--
  ForwardButton - Browser-style history forward button
  
  Features:
  - Uses browser history (history.forward())
  - Always visible (like standard browsers)
  - Browser handles disabled state internally
-->
<script lang="ts">
	function handleForward() {
		window.history.forward();
	}
</script>

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
