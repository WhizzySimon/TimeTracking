<!--
  TaskItem component - displays a single time entry
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.4 (Task list item display)
  - TT-FR-010: Running task shows "Beenden" button
  - TT-FR-012: Running task has visually different layout
  - TT-FR-013: Completed tasks show Resume button (▶)
  - TT-FR-016: Tap on task text opens edit modal
  
  Shows:
  - Time span (start - end, or "laufend" if running)
  - Category name
  - Beenden button (running) or Resume button (completed)
-->
<script lang="ts">
	import type { TimeEntry, Category, Employer } from '$lib/types';

	interface Props {
		entry: TimeEntry;
		category: Category | undefined;
		employer?: Employer | undefined;
		onclick?: () => void;
		ondelete?: () => void;
		onend?: () => void;
		onresume?: () => void;
	}

	let { entry, category, employer, onclick, ondelete, onend, onresume }: Props = $props();

	function handleDelete(event: MouseEvent) {
		event.stopPropagation();
		ondelete?.();
	}

	function handleEnd(event: MouseEvent) {
		event.stopPropagation();
		onend?.();
	}

	function handleResume(event: MouseEvent) {
		event.stopPropagation();
		onresume?.();
	}

	let isRunning = $derived(entry.endTime === null);

	let timeDisplay = $derived(
		entry.endTime ? `${entry.startTime} – ${entry.endTime}` : `${entry.startTime} – laufend`
	);
</script>

<div
	class="task-item"
	class:running={isRunning}
	role="button"
	tabindex="0"
	data-testid={isRunning ? 'task-item-running' : 'task-item'}
	{onclick}
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
>
	<div class="task-header">
		<div class="task-main">
			<span class="task-time">{timeDisplay}</span>
			<span class="task-category">{category?.name ?? 'Unbekannt'}</span>
			{#if category?.countsAsWorkTime}
				<span class="badge employer-badge">{employer?.name ?? 'Unbekannt'}</span>
			{:else}
				<span class="badge no-work-badge">Keine Arbeitszeit</span>
			{/if}
		</div>
		<div class="task-actions">
			{#if isRunning}
				<button class="end-btn" onclick={handleEnd} aria-label="Beenden">Beenden</button>
			{:else}
				<button class="resume-btn" onclick={handleResume} aria-label="Fortsetzen">▶</button>
			{/if}
			<button class="delete-btn" onclick={handleDelete} aria-label="Löschen">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="3 6 5 6 21 6"></polyline>
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
					></path>
				</svg>
			</button>
		</div>
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

	.task-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.end-btn {
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--accent);
		background: var(--accent);
		color: white;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		border-radius: var(--r-btn);
	}

	.end-btn:hover {
		background: var(--accent-dark, #0056b3);
	}

	.resume-btn {
		width: 28px;
		height: 28px;
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--accent);
		font-size: 0.875rem;
		cursor: pointer;
		border-radius: var(--r-btn);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.resume-btn:hover {
		background: var(--accent-light);
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

	.badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.employer-badge {
		background: var(--accent-light, #eff6ff);
		color: var(--accent-dark, #1e40af);
		border: 1px solid var(--accent, #3b82f6);
	}

	.no-work-badge {
		background: var(--muted-light, #f3f4f6);
		color: var(--muted, #6b7280);
		border: 1px solid var(--border, #d1d5db);
	}

	:global(.dark) .employer-badge {
		background: rgba(59, 130, 246, 0.1);
		color: var(--accent, #3b82f6);
	}

	:global(.dark) .no-work-badge {
		background: rgba(107, 114, 128, 0.1);
		color: var(--muted, #9ca3af);
		border-color: var(--border-dark, #4b5563);
	}
</style>
