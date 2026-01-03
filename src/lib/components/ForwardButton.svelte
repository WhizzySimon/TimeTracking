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

<button class="nav-btn" onclick={handleForward} aria-label="Vorwärts">
	Vor
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
		gap: 4px;
		padding: 6px 12px;
		border: 1px solid var(--tt-header-border);
		background: transparent;
		color: var(--tt-header-text);
		font-size: 0.875rem;
		border-radius: var(--tt-radius-button);
		cursor: pointer;
		transition: background var(--tt-transition-fast);
	}

	@media (hover: hover) {
		.nav-btn:hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.nav-btn:active {
		background: rgba(255, 255, 255, 0.2);
	}

	.nav-icon {
		width: 16px;
		height: 16px;
	}
</style>
