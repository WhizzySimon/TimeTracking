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
	class="tt-list-row-clickable"
	class:task-item-running={isRunning}
	role="button"
	tabindex="0"
	data-testid={isRunning ? 'task-item-running' : 'task-item'}
	{onclick}
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
>
	<div class="tt-list-row__content-compact">
		<span class="tt-list-row__time">{timeDisplay}</span>
		<span class="tt-list-row__separator"></span>
		<span class="tt-list-row__category">{category?.name ?? 'Unbekannt'}</span>
	</div>
	{#if entry.description}
		<div class="tt-list-row__detail">{entry.description}</div>
	{/if}
	<div class="employer-label-container">
		{#if category?.countsAsWorkTime}
			<span class="tt-inline-label-employer">{employer?.name ?? 'Unbekannt'}</span>
		{:else}
			<span class="tt-inline-label-no-work">Keine Arbeitszeit</span>
		{/if}
	</div>
	<div class="tt-list-row__actions">
		{#if isRunning}
			<button class="tt-button-primary tt-button-small" onclick={handleEnd} aria-label="Beenden"
				>Beenden</button
			>
		{:else}
			<button class="tt-symbol-button" onclick={handleResume} aria-label="Fortsetzen">
				<span class="tt-play-icon"></span>
			</button>
		{/if}
		<button class="tt-delete-button" onclick={handleDelete} aria-label="Löschen">
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

<style>
	/* Running task variant - highlighted state */
	.task-item-running {
		border-color: var(--tt-status-warning-500) !important;
		background: var(--tt-status-warning-50) !important;
	}

	/* Employer label positioned to the right */
	.employer-label-container {
		display: flex;
		align-items: center;
		margin-left: auto;
		margin-right: var(--tt-space-8);
	}
</style>
