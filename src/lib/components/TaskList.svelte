<!--
  TaskList component - displays time entries for a date
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.4 (Task list, newest first)
  
  Loads entries from IndexedDB, sorted by startTime descending
-->
<script lang="ts">
	import { categories as categoriesStore, employers as employersStore } from '$lib/stores';
	import type { TimeEntry, Category, Employer } from '$lib/types';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		entries: TimeEntry[];
		categories?: Category[];
		employers?: Employer[];
		onselect?: (entry: TimeEntry) => void;
		ondelete?: (entry: TimeEntry) => void;
		onend?: (entry: TimeEntry) => void;
		onresume?: (entry: TimeEntry) => void;
	}

	let { entries, categories, employers, onselect, ondelete, onend, onresume }: Props = $props();

	// Use provided categories/employers or fall back to stores
	let effectiveCategories = $derived(categories ?? $categoriesStore);
	let effectiveEmployers = $derived(employers ?? $employersStore);

	// Sort entries newest first (by startTime descending)
	let sortedEntries = $derived([...entries].sort((a, b) => b.startTime.localeCompare(a.startTime)));

	// Create category lookup map
	let categoryMap = $derived(new Map(effectiveCategories.map((c) => [c.id, c])));

	// Create employer lookup map
	let employerMap = $derived(new Map(effectiveEmployers.map((e) => [e.id, e])));
</script>

<div class="task-list">
	{#if sortedEntries.length === 0}
		<div class="tt-empty-state">
			<p class="tt-empty-state__text">Noch keine Tätigkeiten an diesem Tag</p>
			<a href="/add" class="tt-button-primary tt-empty-state__button">Füge eine Tätigkeit hinzu</a>
		</div>
	{:else}
		{#each sortedEntries as entry (entry.id)}
			<TaskItem
				{entry}
				category={categoryMap.get(entry.categoryId)}
				employer={entry.employerId ? employerMap.get(entry.employerId) : undefined}
				onclick={() => onselect?.(entry)}
				ondelete={() => ondelete?.(entry)}
				onend={() => onend?.(entry)}
				onresume={() => onresume?.(entry)}
			/>
		{/each}
	{/if}
</div>

<style>
	.task-list {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	/* Empty state uses design system classes: .tt-empty-state, .tt-empty-state__text, .tt-empty-state__button */
</style>
