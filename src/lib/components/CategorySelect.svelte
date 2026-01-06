<script lang="ts">
	import type { Category, TimeEntry } from '$lib/types';
	import { sortCategoriesByFrequency } from '$lib/utils/frequency';

	type SortOrder = 'alphabetical' | 'frequency';

	interface Props {
		categories: Category[];
		entries: TimeEntry[];
		value: string;
		onchange: (categoryId: string) => void;
		sortOrder?: SortOrder;
		id?: string;
		required?: boolean;
	}

	let {
		categories,
		entries,
		value,
		onchange,
		sortOrder = 'frequency',
		id = '',
		required = false
	}: Props = $props();

	let searchText = $state('');
	let isOpen = $state(false);
	let inputElement: HTMLInputElement | null = $state(null);
	let dropdownElement: HTMLDivElement | null = $state(null);

	// Sort categories based on sortOrder setting
	// TT-FR-006: Sort by frequency when setting is active
	let sortedCategories = $derived(
		sortOrder === 'frequency'
			? sortCategoriesByFrequency(categories, entries, 30)
			: [...categories].sort((a, b) => a.name.localeCompare(b.name, 'de'))
	);

	// Filter categories based on search text
	let filteredCategories = $derived(
		searchText
			? sortedCategories.filter((c) => c.name.toLowerCase().includes(searchText.toLowerCase()))
			: sortedCategories
	);

	// Get selected category name for display
	let selectedCategory = $derived(categories.find((c) => c.id === value));
	let displayText = $derived(selectedCategory?.name ?? '');

	function handleInputFocus() {
		isOpen = true;
		searchText = '';

		// TT-FR-007: Auto-scroll to position 6 when opening (frequency mode)
		// This keeps top 5 accessible by scrolling up, but focuses on position 6
		if (sortOrder === 'frequency' && dropdownElement) {
			setTimeout(() => {
				if (dropdownElement && filteredCategories.length > 5) {
					const optionHeight = 40; // Approximate height of each option
					dropdownElement.scrollTop = 5 * optionHeight;
				}
			}, 10);
		}
	}

	function handleInputBlur() {
		// Delay closing to allow click on option
		setTimeout(() => {
			isOpen = false;
			searchText = '';
		}, 200);
	}

	function handleInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		searchText = input.value;
		isOpen = true;
	}

	function selectCategory(category: Category) {
		onchange(category.id);
		isOpen = false;
		searchText = '';
		inputElement?.blur();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
			searchText = '';
			inputElement?.blur();
		} else if (event.key === 'Enter' && filteredCategories.length > 0) {
			event.preventDefault();
			selectCategory(filteredCategories[0]);
		}
	}
</script>

<div class="category-select">
	<input
		{id}
		type="text"
		class="tt-text-input"
		value={isOpen ? searchText : displayText}
		placeholder="Kategorie suchen..."
		onfocus={handleInputFocus}
		onblur={handleInputBlur}
		oninput={handleInputChange}
		onkeydown={handleKeyDown}
		bind:this={inputElement}
		{required}
		autocomplete="off"
	/>
	{#if isOpen}
		<div class="dropdown" bind:this={dropdownElement}>
			{#if filteredCategories.length === 0}
				<div class="no-results">Keine Kategorie gefunden</div>
			{:else}
				{#each filteredCategories as category (category.id)}
					<button
						type="button"
						class="tt-list-row-clickable"
						class:is-selected={category.id === value}
						onmousedown={() => selectCategory(category)}
					>
						{category.name}
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.category-select {
		position: relative;
		width: 100%;
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		max-height: 200px;
		overflow-y: auto;
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		box-shadow: var(--tt-shadow-md);
		z-index: 100;
		margin-top: var(--tt-space-4);
	}

	.no-results {
		padding: var(--tt-space-12);
		color: var(--tt-text-muted);
		text-align: center;
		font-size: var(--tt-font-size-body);
	}
</style>
