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
	import type { Category, TimeEntry, Employer } from '$lib/types';
	import { getSmartTopCategories } from '$lib/utils/frequency';

	interface Props {
		categories: Category[];
		entries: TimeEntry[];
		onselect: (categoryId: string) => void;
		employers?: Employer[];
		selectedEmployerId?: string | null;
		oncreatecategory?: () => void;
	}

	let {
		categories,
		entries,
		onselect,
		employers = [],
		selectedEmployerId = null,
		oncreatecategory
	}: Props = $props();

	// Filter input state
	let filterText = $state('');

	// Get top 5 categories using smart context-aware suggestions
	let topCategories = $derived(getSmartTopCategories(5, entries, categories));

	// Group top categories by employer when "Alle" is selected
	interface TopCategoryGroup {
		employerId: string | null;
		employerName: string;
		categories: Category[];
	}

	let groupedTopCategories = $derived.by(() => {
		if (!hasMultipleEmployers || selectedEmployerId !== null) {
			return null;
		}

		const groups: TopCategoryGroup[] = [];
		
		for (const employer of employers) {
			const employerCats = topCategories.filter((cat) => cat.employerId === employer.id);
			if (employerCats.length > 0) {
				groups.push({
					employerId: employer.id,
					employerName: employer.name,
					categories: employerCats
				});
			}
		}

		// Add global categories (no employer) if any
		const globalCats = topCategories.filter(
			(cat) => cat.employerId === null || cat.employerId === undefined
		);
		if (globalCats.length > 0) {
			groups.push({
				employerId: null,
				employerName: 'Allgemein',
				categories: globalCats
			});
		}

		return groups.length > 0 ? groups : null;
	});

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

	// Check if we have multiple employers for grouping
	let hasMultipleEmployers = $derived(employers.length > 1);

	// Group remaining categories by employer when "Alle" is selected
	interface CategoryGroup {
		employerId: string | null;
		employerName: string;
		categories: Category[];
	}

	let groupedCategories = $derived.by(() => {
		if (!hasMultipleEmployers || selectedEmployerId !== null) {
			return null;
		}

		const groups: CategoryGroup[] = [];
		const globalCats = remainingCategories.filter(
			(cat) => cat.employerId === null || cat.employerId === undefined
		);
		if (globalCats.length > 0) {
			groups.push({
				employerId: null,
				employerName: 'Allgemein',
				categories: globalCats.sort((a, b) => a.name.localeCompare(b.name, 'de'))
			});
		}

		for (const employer of employers) {
			const employerCats = remainingCategories.filter((cat) => cat.employerId === employer.id);
			if (employerCats.length > 0) {
				groups.push({
					employerId: employer.id,
					employerName: employer.name,
					categories: employerCats.sort((a, b) => a.name.localeCompare(b.name, 'de'))
				});
			}
		}

		return groups;
	});

	// For filtered display when filter is active
	let filteredGroupedCategories = $derived.by(() => {
		if (!groupedCategories || !filterText.trim()) return groupedCategories;

		const filterLower = filterText.toLowerCase();
		return groupedCategories
			.map((group) => ({
				...group,
				categories: group.categories.filter((cat) => cat.name.toLowerCase().includes(filterLower))
			}))
			.filter((group) => group.categories.length > 0);
	});

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
				{#if groupedTopCategories}
					<!-- Grouped view: multiple employers, "Alle" selected -->
					{#each groupedTopCategories as group (group.employerId ?? 'global')}
						<div class="suggestion-group">
							<h2 class="section-title" data-testid="smart-suggestions-heading">
								Vorschläge {group.employerName}
							</h2>
							<div class="category-grid">
								{#each group.categories as category (category.id)}
									<button
										class="tt-chip tt-chip--suggestion"
										onclick={() => onselect(category.id)}
										aria-label={`${category.name} starten`}
									>
										{category.name}
									</button>
								{/each}
							</div>
						</div>
					{/each}
				{:else}
					<!-- Single employer or specific employer selected -->
					<h2 class="section-title" data-testid="smart-suggestions-heading">Vorschläge</h2>
					<div class="category-grid">
						{#each topCategories as category (category.id)}
							<button
								class="tt-chip tt-chip--suggestion"
								onclick={() => onselect(category.id)}
								aria-label={`${category.name} starten`}
							>
								{category.name}
							</button>
						{/each}
					</div>
				{/if}
			</section>
		{/if}

		<!-- Remaining categories A-Z (grouped by employer when multiple employers exist) -->
		{#if remainingCategories.length > 0}
			<section class="section all-section" data-testid="all-categories-section">
				<div class="filter-row">
					<input
						type="text"
						class="tt-text-input"
						placeholder="Filtern..."
						bind:value={filterText}
					/>
					{#if oncreatecategory}
						<button class="tt-button-primary tt-button-small" onclick={oncreatecategory}>
							Tätigkeit erstellen
						</button>
					{/if}
				</div>

				{#if filteredGroupedCategories}
					<!-- Grouped view: multiple employers, "Alle" selected -->
					{#each filteredGroupedCategories as group (group.employerId ?? 'global')}
						<div class="employer-group">
							<h3 class="group-title">{group.employerName}</h3>
							<div class="category-list-vertical">
								{#each group.categories as category (category.id)}
									<button
										class="tt-list-row-clickable"
										onclick={() => onselect(category.id)}
										aria-label={`${category.name} starten`}
									>
										{category.name}
									</button>
								{/each}
							</div>
						</div>
					{/each}
				{:else}
					<!-- Flat view: single employer or specific employer selected -->
					<div class="category-list-vertical">
						{#each filteredCategories as category (category.id)}
							<button
								class="tt-list-row-clickable"
								onclick={() => onselect(category.id)}
								aria-label={`${category.name} starten`}
							>
								{category.name}
							</button>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	{/if}
</div>

<style>
	.category-list {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-24);
		padding: var(--tt-space-8) 0;
	}

	.empty-state {
		text-align: center;
		padding: var(--tt-space-32) var(--tt-space-16);
		color: var(--tt-text-muted);
	}

	.settings-link {
		display: inline-block;
		margin-top: var(--tt-space-16);
		color: var(--tt-primary);
		text-decoration: underline;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-12);
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--tt-text-muted);
		margin: 0;
	}

	.category-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--tt-space-8);
	}

	.category-list-vertical {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.employer-group {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
		margin-top: var(--tt-space-8);
	}

	.suggestion-group {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-12);
	}

	.suggestion-group:not(:first-child) {
		margin-top: var(--tt-space-16);
	}

	.group-title {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--tt-text-muted);
		margin: 0;
		padding-left: var(--tt-space-4);
	}

	.filter-row {
		display: flex;
		gap: var(--tt-space-8);
		align-items: center;
		width: 100%;
	}

	/* Override tt-text-input to flex properly in filter row */
	.filter-row :global(.tt-text-input) {
		flex: 1 1 auto;
		min-width: 0;
	}
</style>
