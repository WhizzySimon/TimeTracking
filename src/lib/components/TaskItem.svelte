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
		ondelete?: () => void;
	}

	let { entry, category, onclick, ondelete }: Props = $props();

	function handleDelete(event: MouseEvent) {
		event.stopPropagation();
		ondelete?.();
	}

	let timeDisplay = $derived(
		entry.endTime ? `${entry.startTime} – ${entry.endTime}` : `${entry.startTime} – laufend`
	);

	let isRunning = $derived(entry.endTime === null);
</script>

<div
	class="task-item"
	class:running={isRunning}
	role="button"
	tabindex="0"
	{onclick}
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
>
	<div class="task-header">
		<div class="task-main">
			<span class="task-time">{timeDisplay}</span>
			<span class="task-category">{category?.name ?? 'Unbekannt'}</span>
		</div>
		<button class="delete-btn" onclick={handleDelete} aria-label="Löschen">×</button>
	</div>
	{#if entry.description}
		<div class="task-description">{entry.description}</div>
	{/if}
</div>

<style>
	.task-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--r-card);
		cursor: pointer;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
		transition: all var(--transition-normal);
	}

	.task-item:hover {
		border-color: var(--accent);
		box-shadow: var(--elev-1);
	}

	.task-item.running {
		border-color: var(--warning);
		background: var(--warning-light);
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.task-main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.delete-btn {
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		color: var(--muted);
		font-size: 1.25rem;
		cursor: pointer;
		border-radius: var(--r-btn);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.delete-btn:hover {
		background: var(--neg-light);
		color: var(--neg);
	}

	.task-time {
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--text);
	}

	.task-category {
		font-size: 0.9rem;
		color: var(--muted);
	}

	.task-description {
		font-size: 0.85rem;
		color: var(--muted);
		font-style: italic;
	}
</style>
