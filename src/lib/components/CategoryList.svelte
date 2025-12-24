<!--
  CategoryList - Full category list for Plus-Tab
  
  Spec refs:
  - Phase 8 Plus-Tab (Ein-Klick-Workflow)
  
  Shows:
  1. Top 5 categories (smart suggestions based on context)
  2. Remaining categories A-Z (no duplicates)
  
  System categories are excluded.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Category, TimeEntry } from '$lib/types';
	import { getSmartTopCategories } from '$lib/utils/frequency';

	interface Props {
		categories: Category[];
		entries: TimeEntry[];
		onselect: (categoryId: string) => void;
	}

	let { categories, entries, onselect }: Props = $props();

	// Filter input state
	let filterText = $state('');

	// Get top 5 categories using smart context-aware suggestions
	let topCategories = $derived(getSmartTopCategories(5, entries, categories));

	// Get all user categories (excluding system)
	let allUserCategories = $derived(categories.filter((c) => c.type === 'user'));

	// Get remaining categories (not in top 5), sorted A-Z
	let remainingCategories = $derived(
		allUserCategories
			.filter((c) => !topCategories.some((t) => t.id === c.id))
			.sort((a, b) => a.name.localeCompare(b.name, 'de'))
	);

	// Filtered categories based on search input
	let filteredCategories = $derived(
		filterText.trim()
			? remainingCategories.filter((c) => c.name.toLowerCase().includes(filterText.toLowerCase()))
			: remainingCategories
	);

	// Check if we have any categories
	let hasCategories = $derived(allUserCategories.length > 0);
</script>

<div class="category-list">
	{#if !hasCategories}
		<div class="empty-state">
			<p>Keine Kategorien vorhanden.</p>
			<a href={resolve('/settings')} class="settings-link">Kategorien in Einstellungen anlegen</a>
		</div>
	{:else}
		<!-- Top 5 Smart Suggestions -->
		{#if topCategories.length > 0}
			<section class="section top-section" data-testid="smart-suggestions-section">
				<h2 class="section-title" data-testid="smart-suggestions-heading">Vorschläge</h2>
				<div class="category-grid">
					{#each topCategories as category (category.id)}
						<button
							class="category-btn top-btn"
							onclick={() => onselect(category.id)}
							aria-label={`${category.name} starten`}
						>
							{category.name}
						</button>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Remaining categories A-Z -->
		{#if remainingCategories.length > 0}
			<section class="section all-section" data-testid="all-categories-section">
				<h2 class="section-title" data-testid="all-categories-heading">Alle Kategorien</h2>
				<input type="text" class="filter-input" placeholder="Filtern..." bind:value={filterText} />
				<div class="category-list-vertical">
					{#each filteredCategories as category (category.id)}
						<button
							class="category-btn list-btn"
							onclick={() => onselect(category.id)}
							aria-label={`${category.name} starten`}
						>
							{category.name}
						</button>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.category-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 0.5rem 0;
	}

	.empty-state {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--text-secondary, #6b7280);
	}

	.settings-link {
		display: inline-block;
		margin-top: 1rem;
		color: var(--accent);
		text-decoration: underline;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary, #6b7280);
		margin: 0;
	}

	.category-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.category-list-vertical {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.filter-input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--border-color, #d1d5db);
		border-radius: var(--r-input, 0.5rem);
		font-size: 0.875rem;
		background: var(--bg-primary, #ffffff);
		color: var(--text-primary, #1f2937);
		outline: none;
		transition: border-color var(--transition-fast, 0.15s);
	}

	.filter-input:focus {
		border-color: var(--accent);
	}

	.filter-input::placeholder {
		color: var(--text-secondary, #6b7280);
	}

	.category-btn {
		border: none;
		border-radius: var(--r-btn, 0.5rem);
		font-size: 1rem;
		cursor: pointer;
		transition: all var(--transition-fast, 0.15s);
		text-align: left;
	}

	/* Top suggestion buttons - prominent style */
	.top-btn {
		flex: 1 1 auto;
		min-width: 100px;
		max-width: calc(50% - 0.25rem);
		padding: 0.875rem 1rem;
		background: var(--accent);
		color: white;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: center;
	}

	.top-btn:hover {
		background: var(--accent-dark, #1d4ed8);
		transform: translateY(-1px);
	}

	.top-btn:active {
		transform: scale(0.98);
	}

	/* List buttons - subtle style */
	.list-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary, #f3f4f6);
		color: var(--text-primary, #1f2937);
	}

	.list-btn:hover {
		background: var(--bg-tertiary, #e5e7eb);
	}

	.list-btn:active {
		background: var(--bg-tertiary, #e5e7eb);
		transform: scale(0.99);
	}

	/* Dark mode */
	:global(.dark) .empty-state {
		color: var(--text-secondary-dark, #9ca3af);
	}

	:global(.dark) .section-title {
		color: var(--text-secondary-dark, #9ca3af);
	}

	:global(.dark) .list-btn {
		background: var(--bg-secondary-dark, #374151);
		color: var(--text-primary-dark, #f3f4f6);
	}

	:global(.dark) .list-btn:hover {
		background: var(--bg-tertiary-dark, #4b5563);
	}

	:global(.dark) .filter-input {
		background: var(--bg-secondary-dark, #374151);
		border-color: var(--border-color-dark, #4b5563);
		color: var(--text-primary-dark, #f3f4f6);
	}

	:global(.dark) .filter-input::placeholder {
		color: var(--text-secondary-dark, #9ca3af);
	}

	/* Responsive - full width on small screens */
	@media (max-width: 360px) {
		.top-btn {
			max-width: 100%;
		}
	}
</style>
