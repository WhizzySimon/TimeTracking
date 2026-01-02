<script lang="ts">
	import PlanGrid from './PlanGrid.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	function handleSelectPlan() {
		onclose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
		}
	}
</script>

<div class="modal-backdrop" onkeydown={handleKeydown} role="dialog" aria-modal="true" tabindex="-1">
	<div class="modal">
		<header class="modal-header">
			<h2>Plan wählen</h2>
			<button class="tt-symbol-button" onclick={onclose} aria-label="Schließen">
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
			<PlanGrid onselect={handleSelectPlan} />
		</div>

		<footer class="modal-footer">
			<button class="close-btn-secondary" onclick={onclose}>Schließen</button>
		</footer>
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
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: var(--surface);
		border-radius: 12px;
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--fg);
	}

	/* Close button uses .tt-symbol-button from design system */

	.modal-body {
		padding: 20px;
	}

	.modal-footer {
		padding: 16px 20px;
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: flex-end;
	}

	.close-btn-secondary {
		padding: 10px 20px;
		background: transparent;
		color: var(--muted);
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
	}

	.close-btn-secondary:hover {
		border-color: var(--muted);
	}
</style>
