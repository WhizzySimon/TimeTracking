<!--
  Quick-Start Buttons - 1-tap buttons for frequently used categories
  
  Spec refs:
  - TT-FR-001 to TT-FR-005 (Quick-Start Buttons)
  - TT-IG-003 (System categories excluded)
  
  Shows up to 5 buttons for the most frequently used categories
  based on entries from the last 30 days.
-->
<script lang="ts">
	import type { Category, TimeEntry } from '$lib/types';
	import { getTopCategories } from '$lib/utils/frequency';

	interface Props {
		categories: Category[];
		entries: TimeEntry[];
		onstart: (categoryId: string) => void;
	}

	let { categories, entries, onstart }: Props = $props();

	// Get top 5 categories based on frequency (last 30 days)
	let topCategories = $derived(getTopCategories(5, entries, categories, 30));
</script>

{#if topCategories.length > 0}
	<div class="quick-start-buttons">
		{#each topCategories as category (category.id)}
			<button
				class="quick-start-btn"
				onclick={() => onstart(category.id)}
				aria-label={`${category.name} starten`}
			>
				{category.name}
			</button>
		{/each}
	</div>
{/if}

<style>
	.quick-start-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.quick-start-btn {
		flex: 1 1 auto;
		min-width: 80px;
		max-width: calc(50% - 0.25rem);
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--accent);
		border-radius: var(--r-btn);
		background: var(--accent-light);
		color: var(--accent);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.quick-start-btn:hover {
		background: var(--accent);
		color: white;
	}

	.quick-start-btn:active {
		transform: scale(0.98);
	}

	/* On very small screens, allow full width buttons */
	@media (max-width: 320px) {
		.quick-start-btn {
			max-width: 100%;
		}
	}
</style>
