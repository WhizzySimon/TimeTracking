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
		class="category-input"
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
						class="option"
						class:selected={category.id === value}
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

	.category-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
	}

	.category-input::placeholder {
		color: var(--input-placeholder);
	}

	.category-input:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: 0 0 0 2px var(--accent-light);
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		max-height: 200px;
		overflow-y: auto;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-input);
		box-shadow: var(--elev-2);
		z-index: 100;
		margin-top: 4px;
	}

	.option {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		text-align: left;
		border: none;
		background: none;
		color: var(--text);
		cursor: pointer;
		font-size: 1rem;
	}

	.option:hover {
		background: var(--surface-hover);
	}

	.option.selected {
		background: var(--accent-light);
		color: var(--accent);
	}

	.no-results {
		padding: 0.75rem;
		color: var(--muted);
		text-align: center;
		font-size: 0.9rem;
	}
</style>
