<!--
  ImportCommit.svelte
  
  Commit confirmation screen for AI Import:
  - Summary: count, date range, total hours
  - Warning for skipped entries
  - Confirm/Cancel buttons
  
  Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 6 (Screen D)
-->
<script lang="ts">
	import type { TimeEntryCandidate } from '$lib/import/types';

	interface Props {
		candidates: TimeEntryCandidate[];
		onconfirm?: () => void;
		oncancel?: () => void;
	}

	let { candidates, onconfirm, oncancel }: Props = $props();

	let selectedCandidates = $derived(
		candidates.filter((c) => c.selected && !c.flags.includes('hard_block'))
	);
	let skippedCount = $derived(candidates.length - selectedCandidates.length);

	let dateRange = $derived(() => {
		const dates = selectedCandidates
			.filter((c) => c.date)
			.map((c) => c.date!)
			.sort();
		if (dates.length === 0) return null;
		return { min: dates[0], max: dates[dates.length - 1] };
	});

	let totalMinutes = $derived(
		selectedCandidates.reduce((sum, c) => sum + (c.durationMinutes || 0), 0)
	);

	function formatDate(date: string): string {
		const [y, m, d] = date.split('-');
		return `${d}.${m}.${y}`;
	}

	function formatDuration(minutes: number): string {
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return `${h}:${m.toString().padStart(2, '0')}`;
	}
</script>

<div class="commit-container">
	<h2>Import bestätigen</h2>

	<div class="summary-card">
		<h3>Zusammenfassung</h3>
		<dl class="summary-list">
			<div class="summary-item">
				<dt>Einträge</dt>
				<dd>{selectedCandidates.length}</dd>
			</div>
			{#if dateRange()}
				<div class="summary-item">
					<dt>Zeitraum</dt>
					<dd>{formatDate(dateRange()!.min)} - {formatDate(dateRange()!.max)}</dd>
				</div>
			{/if}
			<div class="summary-item">
				<dt>Gesamtstunden</dt>
				<dd>{formatDuration(totalMinutes)}</dd>
			</div>
		</dl>
	</div>

	{#if skippedCount > 0}
		<div class="warning-card">
			<span class="warning-icon">!</span>
			<div class="warning-text">
				<strong>{skippedCount} Einträge werden NICHT importiert</strong>
				<p>Diese Einträge sind unvollständig oder nicht ausgewählt.</p>
			</div>
		</div>
	{/if}

	<div class="commit-actions">
		<button class="btn-cancel" onclick={oncancel}>Zurück</button>
		<button class="btn-confirm" onclick={onconfirm} disabled={selectedCandidates.length === 0}>
			{selectedCandidates.length} importieren
		</button>
	</div>
</div>

<style>
	.commit-container {
		max-width: 500px;
		margin: 0 auto;
		padding: var(--tt-space-16);
	}

	h2 {
		font-size: var(--tt-font-size-title);
		margin: 0 0 1.5rem;
		text-align: center;
	}

	.summary-card {
		background: var(--tt-background-card-hover);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		padding: var(--tt-space-16);
		margin-bottom: 1rem;
	}

	.summary-card h3 {
		font-size: var(--tt-font-size-small);
		margin: 0 0 0.75rem;
		color: var(--tt-text-secondary);
	}

	.summary-list {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.summary-item dt {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-secondary);
	}

	.summary-item dd {
		margin: 0;
		font-size: var(--tt-font-size-small);
		font-weight: 600;
		color: var(--tt-text-primary);
	}

	.warning-card {
		display: flex;
		gap: var(--tt-space-12);
		padding: var(--tt-space-16);
		background: var(--tt-status-warning-500-light, rgba(245, 158, 11, 0.1));
		border: 1px solid var(--tt-status-warning-500);
		border-radius: var(--tt-radius-card);
		margin-bottom: 1.5rem;
	}

	.warning-icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--tt-status-warning-500);
		color: white;
		border-radius: 50%;
		font-weight: 600;
		flex-shrink: 0;
	}

	.warning-text {
		font-size: var(--tt-font-size-small);
	}

	.warning-text strong {
		display: block;
		margin-bottom: 0.25rem;
	}

	.warning-text p {
		margin: 0;
		color: var(--tt-text-secondary);
	}

	.commit-actions {
		display: flex;
		justify-content: space-between;
		gap: var(--tt-space-16);
	}

	.btn-cancel,
	.btn-confirm {
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: var(--tt-radius-card);
		font-size: var(--tt-font-size-normal);
		cursor: pointer;
		border: none;
	}

	.btn-cancel {
		background: var(--tt-background-card-pressed);
		color: var(--tt-text-primary);
		border: 1px solid var(--tt-border-default);
	}

	.btn-confirm {
		background: var(--tt-brand-primary-500);
		color: white;
	}

	.btn-confirm:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
