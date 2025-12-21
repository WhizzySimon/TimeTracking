<!--
  TaskItem component - displays a single time entry
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.4 (Task list item display)
  
  Shows:
  - Time span (start - end, or "laufend" if running)
  - Category name
  - "zählt als Arbeitszeit" indicator
-->
<script lang="ts">
	import type { TimeEntry, Category } from '$lib/types';

	interface Props {
		entry: TimeEntry;
		category: Category | undefined;
		onclick?: () => void;
	}

	let { entry, category, onclick }: Props = $props();

	let timeDisplay = $derived(
		entry.endTime ? `${entry.startTime} – ${entry.endTime}` : `${entry.startTime} – laufend`
	);

	let isRunning = $derived(entry.endTime === null);
	let countsAsWork = $derived(category?.countsAsWorkTime ?? false);
</script>

<button class="task-item" class:running={isRunning} {onclick}>
	<div class="task-main">
		<span class="task-time">{timeDisplay}</span>
		<span class="task-category">{category?.name ?? 'Unbekannt'}</span>
	</div>
	<div class="task-meta">
		{#if countsAsWork}
			<span class="work-indicator work">Arbeitszeit</span>
		{:else}
			<span class="work-indicator no-work">Keine Arbeitszeit</span>
		{/if}
	</div>
	{#if entry.description}
		<div class="task-description">{entry.description}</div>
	{/if}
</button>

<style>
	.task-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: all 0.2s;
	}

	.task-item:hover {
		border-color: #3b82f6;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.task-item.running {
		border-color: #f59e0b;
		background: #fffbeb;
	}

	.task-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.task-time {
		font-weight: 600;
		font-size: 0.95rem;
		color: #333;
	}

	.task-category {
		font-size: 0.9rem;
		color: #666;
	}

	.task-meta {
		display: flex;
		gap: 0.5rem;
	}

	.work-indicator {
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
	}

	.work-indicator.work {
		background: #dcfce7;
		color: #166534;
	}

	.work-indicator.no-work {
		background: #f3f4f6;
		color: #6b7280;
	}

	.task-description {
		font-size: 0.85rem;
		color: #888;
		font-style: italic;
	}
</style>
