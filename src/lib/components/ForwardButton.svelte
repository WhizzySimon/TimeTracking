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

<button class="forward-btn" onclick={handleForward} aria-label="Vorwärts"> Vor </button>

<style>
	.forward-btn {
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
		clip-path: polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%);
		transition: opacity 0.2s;
	}

	.forward-btn:hover {
		opacity: 0.9;
	}

	.forward-btn:active {
		opacity: 0.8;
	}
</style>
