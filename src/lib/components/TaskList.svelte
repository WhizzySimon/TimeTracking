<!--
  TaskList component - displays time entries for a date
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.4 (Task list, newest first)
  
  Loads entries from IndexedDB, sorted by startTime descending
-->
<script lang="ts">
	import { categories } from '$lib/stores';
	import type { TimeEntry } from '$lib/types';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		entries: TimeEntry[];
		onselect?: (entry: TimeEntry) => void;
		ondelete?: (entry: TimeEntry) => void;
	}

	let { entries, onselect, ondelete }: Props = $props();

	// Sort entries newest first (by startTime descending)
	let sortedEntries = $derived([...entries].sort((a, b) => b.startTime.localeCompare(a.startTime)));

	// Create category lookup map
	let categoryMap = $derived(new Map($categories.map((c) => [c.id, c])));
</script>

<div class="task-list">
	{#if sortedEntries.length === 0}
		<p class="empty-state">Keine Aufgaben für diesen Tag</p>
	{:else}
		{#each sortedEntries as entry (entry.id)}
			<TaskItem
				{entry}
				category={categoryMap.get(entry.categoryId)}
				onclick={() => onselect?.(entry)}
				ondelete={() => ondelete?.(entry)}
			/>
		{/each}
	{/if}
</div>

<style>
	.task-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.empty-state {
		text-align: center;
		color: #888;
		padding: 2rem;
		font-style: italic;
	}
</style>
