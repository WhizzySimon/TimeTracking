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

		<!-- Remaining categories A-Z (grouped by employer when multiple employers exist) -->
		{#if remainingCategories.length > 0}
			<section class="section all-section" data-testid="all-categories-section">
				<div class="filter-row">
					<input
						type="text"
						class="filter-input"
						placeholder="Filtern..."
						bind:value={filterText}
					/>
					{#if oncreatecategory}
						<button class="create-entry-btn" onclick={oncreatecategory}> Eintrag erstellen </button>
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
										class="category-btn list-btn"
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
								class="category-btn list-btn"
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

	.employer-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.group-title {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary, #6b7280);
		margin: 0;
		padding-left: 0.25rem;
	}

	.filter-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.filter-input {
		flex: 1 1 auto;
		max-width: 50%;
		min-width: 150px;
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

	:global(.dark) .group-title {
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

	.create-entry-btn {
		flex: 0 0 auto;
		padding: 0.625rem 1rem;
		background: var(--bg-secondary, #f3f4f6);
		color: var(--text-primary, #1f2937);
		border: 1px solid var(--border-color, #d1d5db);
		border-radius: var(--r-btn, 0.5rem);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast, 0.15s);
		white-space: nowrap;
	}

	.create-entry-btn:hover {
		background: var(--bg-tertiary, #e5e7eb);
		border-color: var(--accent);
	}

	:global(.dark) .create-entry-btn {
		background: var(--bg-secondary-dark, #374151);
		color: var(--text-primary-dark, #f3f4f6);
		border-color: var(--border-color-dark, #4b5563);
	}

	:global(.dark) .create-entry-btn:hover {
		background: var(--bg-tertiary-dark, #4b5563);
		border-color: var(--accent);
	}

	/* Responsive - full width on small screens */
	@media (max-width: 360px) {
		.top-btn {
			max-width: 100%;
		}
	}
</style>
