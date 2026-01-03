<!--
  BulkActions.svelte
  
  Bulk action toolbar for import review:
  - Set category for selected
  - Round durations
  - Select/deselect all
  
  Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 6 (Screen C)
-->
<script lang="ts">
	import type { Category } from '$lib/types';

	interface Props {
		selectedCount: number;
		totalCount: number;
		categories?: Category[];
		onsetcategory?: (categoryId: string) => void;
		onroundduration?: (minutes: number) => void;
		onselectall?: () => void;
		ondeselectall?: () => void;
	}

	let {
		selectedCount,
		totalCount,
		categories = [],
		onsetcategory,
		onroundduration,
		onselectall,
		ondeselectall
	}: Props = $props();

	let showCategoryDropdown = $state(false);
	let showRoundDropdown = $state(false);

	function handleCategorySelect(categoryId: string) {
		onsetcategory?.(categoryId);
		showCategoryDropdown = false;
	}

	function handleRoundSelect(minutes: number) {
		onroundduration?.(minutes);
		showRoundDropdown = false;
	}
</script>

<div class="bulk-actions">
	<div class="selection-info">
		<span class="count">{selectedCount} von {totalCount} ausgewählt</span>
		{#if selectedCount < totalCount}
			<button class="link-btn" onclick={onselectall}>Alle auswählen</button>
		{/if}
		{#if selectedCount > 0}
			<button class="link-btn" onclick={ondeselectall}>Auswahl aufheben</button>
		{/if}
	</div>

	{#if selectedCount > 0}
		<div class="actions">
			<div class="dropdown-wrapper">
				<button class="action-btn" onclick={() => (showCategoryDropdown = !showCategoryDropdown)}>
					Kategorie setzen
				</button>
				{#if showCategoryDropdown}
					<div class="dropdown-menu">
						{#each categories as category (category.id)}
							<button class="dropdown-item" onclick={() => handleCategorySelect(category.id)}>
								{category.name}
							</button>
						{/each}
						{#if categories.length === 0}
							<span class="dropdown-empty">Keine Kategorien</span>
						{/if}
					</div>
				{/if}
			</div>

			<div class="dropdown-wrapper">
				<button class="action-btn" onclick={() => (showRoundDropdown = !showRoundDropdown)}>
					Dauer runden
				</button>
				{#if showRoundDropdown}
					<div class="dropdown-menu">
						<button class="dropdown-item" onclick={() => handleRoundSelect(5)}>auf 5 Min</button>
						<button class="dropdown-item" onclick={() => handleRoundSelect(15)}>auf 15 Min</button>
						<button class="dropdown-item" onclick={() => handleRoundSelect(30)}>auf 30 Min</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.bulk-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--tt-background-card-hover);
		border: 1px solid var(--tt-border-default);
		border-radius: 8px;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.selection-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.count {
		font-size: 0.875rem;
		color: var(--tt-text-secondary);
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--tt-brand-primary-500);
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0;
	}

	.link-btn:hover {
		text-decoration: underline;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.dropdown-wrapper {
		position: relative;
	}

	.action-btn {
		padding: 0.5rem 0.75rem;
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: 6px;
		font-size: 0.875rem;
		color: var(--tt-text-primary);
		cursor: pointer;
	}

	.action-btn:hover {
		background: var(--tt-background-card-pressed);
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.25rem;
		min-width: 150px;
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 100;
		overflow: hidden;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: none;
		border: none;
		font-size: 0.875rem;
		color: var(--tt-text-primary);
		cursor: pointer;
		text-align: left;
	}

	.dropdown-item:hover {
		background: var(--tt-background-card-hover);
	}

	.dropdown-empty {
		display: block;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		color: var(--tt-text-muted);
	}
</style>
