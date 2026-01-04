<!--
  Modal component - reusable modal wrapper
  
  Provides:
  - Backdrop with click-to-close
  - Top-positioned content container (better for small viewports)
  - Draggable by title bar
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

	let modalElement: HTMLDivElement | undefined = $state(undefined);
	let previousActiveElement: Element | null = null;

	// Dragging state
	let isDragging = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	let position = $state({ x: 0, y: 0 });
	let hasBeenDragged = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
		}
	}

	// Drag handlers
	function handleMouseDown(event: MouseEvent) {
		if (!modalElement) return;
		isDragging = true;
		const rect = modalElement.getBoundingClientRect();
		dragOffset = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		if (!hasBeenDragged) {
			// Initialize position from current location
			position = { x: rect.left, y: rect.top };
			hasBeenDragged = true;
		}
		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;
		position = {
			x: event.clientX - dragOffset.x,
			y: event.clientY - dragOffset.y
		};
	}

	function handleMouseUp() {
		isDragging = false;
	}

	onMount(() => {
		// Store previously focused element
		previousActiveElement = document.activeElement;

		// Focus the modal content for screen readers
		modalElement?.focus();

		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			// Restore focus to previous element
			if (previousActiveElement instanceof HTMLElement) {
				previousActiveElement.focus();
			}
		};
	});
</script>

<div class="modal-backdrop" role="button" tabindex="-1" onkeydown={handleKeydown}>
	<div
		class="modal-content"
		class:dragged={hasBeenDragged}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		bind:this={modalElement}
		tabindex="-1"
		style={hasBeenDragged ? `left: ${position.x}px; top: ${position.y}px;` : ''}
	>
		<header
			class="modal-header"
			role="button"
			tabindex="-1"
			onmousedown={handleMouseDown}
			style="cursor: {isDragging ? 'grabbing' : 'grab'};"
		>
			<h2 id="modal-title">{title}</h2>
			<button
				class="tt-symbol-button"
				onclick={onclose}
				onmousedown={(e) => e.stopPropagation()}
				aria-label="Schließen"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
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
		align-items: flex-start;
		justify-content: center;
		padding: 2rem 1rem 1rem;
		z-index: 1000;
		overflow-y: auto;
	}

	.modal-content {
		background: var(--tt-background-card);
		border-radius: var(--tt-radius-modal);
		width: 100%;
		max-width: 400px;
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
		box-shadow: var(--tt-shadow-modal);
	}

	.modal-content.dragged {
		position: fixed;
		margin: 0;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1rem 0.5rem;
		border-bottom: 1px solid var(--tt-border-default);
	}

	.modal-header h2 {
		margin: 0;
		font-size: var(--tt-font-size-title);
		font-weight: 600;
		color: var(--tt-text-primary);
	}

	/* Close button now uses .tt-symbol-button from design system */

	.modal-body {
		padding: var(--tt-space-16);
	}
</style>
