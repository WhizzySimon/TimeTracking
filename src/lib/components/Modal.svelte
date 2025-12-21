<!--
  Modal component - reusable modal wrapper
  
  Provides:
  - Backdrop with click-to-close
  - Centered content container
  - Close button
  - Keyboard escape to close
-->
<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		title: string;
		onclose: () => void;
		children?: import('svelte').Snippet;
	}

	let { title, onclose, children }: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onclose();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="modal-backdrop" onclick={handleBackdropClick}>
	<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
		<header class="modal-header">
			<h2 id="modal-title">{title}</h2>
			<button class="close-btn" onclick={onclose} aria-label="Schließen">×</button>
		</header>
		<div class="modal-body">
			{@render children?.()}
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 400px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1rem 0.5rem;
		border-bottom: 1px solid #eee;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #666;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}

	.close-btn:hover {
		background: #f5f5f5;
		color: #333;
	}

	.modal-body {
		padding: 1rem;
	}
</style>
