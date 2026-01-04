<!--
  ImportReview.svelte
  
  Review table for AI Import candidates:
  - Selectable rows with checkboxes
  - Status indicators (OK, warning, error)
  - Inline editing support (placeholder)
  - Issue summary panel
  
  Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 6 (Screen C)
-->
<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { TimeEntryCandidate, ImportIssue } from '$lib/import/types';

	interface Props {
		candidates: TimeEntryCandidate[];
		issues?: ImportIssue[];
		onselectionchange?: (ids: string[]) => void;
		oncommit?: () => void;
		oncancel?: () => void;
	}

	let { candidates, issues = [], onselectionchange, oncommit, oncancel }: Props = $props();

	// Pre-select all valid entries by default
	let selectedIds = new SvelteSet<string>();

	// Initialize selection when candidates change
	$effect(() => {
		selectedIds.clear();
		candidates.filter((c) => !c.flags.includes('hard_block')).forEach((c) => selectedIds.add(c.id));
	});

	let selectableCount = $derived(candidates.filter((c) => !c.flags.includes('hard_block')).length);
	let selectedCount = $derived(selectedIds.size);
	let allSelected = $derived(selectedCount === selectableCount && selectableCount > 0);

	function toggleAll() {
		if (allSelected) {
			selectedIds.clear();
		} else {
			candidates
				.filter((c) => !c.flags.includes('hard_block'))
				.forEach((c) => selectedIds.add(c.id));
		}
		onselectionchange?.([...selectedIds]);
	}

	function toggleCandidate(id: string) {
		const candidate = candidates.find((c) => c.id === id);
		if (candidate?.flags.includes('hard_block')) return;

		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		onselectionchange?.([...selectedIds]);
	}

	function getStatusIcon(candidate: TimeEntryCandidate): string {
		if (candidate.flags.includes('hard_block')) return '!!';
		if (
			candidate.flags.some((f) =>
				['overlaps', 'duplicate_suspect', 'unknown_category', 'extreme_duration'].includes(f)
			)
		)
			return '?';
		return 'OK';
	}

	function getStatusClass(candidate: TimeEntryCandidate): string {
		if (candidate.flags.includes('hard_block')) return 'status-error';
		if (candidate.flags.length > 0) return 'status-warning';
		return 'status-ok';
	}

	function formatTime(time: string | null): string {
		return time || '--:--';
	}

	function formatDuration(minutes: number | null): string {
		if (!minutes) return '--:--';
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		return `${h}:${m.toString().padStart(2, '0')}`;
	}

	function formatDate(date: string | null): string {
		if (!date) return '--.--';
		const [y, m, d] = date.split('-');
		return `${d}.${m}.${y?.slice(2)}`;
	}
</script>

<div class="review-container">
	<!-- Action buttons at top -->
	<div class="review-header">
		<div class="selection-info">
			{selectedCount} von {candidates.length} ausgewählt
		</div>
		<div class="review-actions">
			{#if oncancel}
				<button class="btn-cancel" onclick={oncancel}>Zurück</button>
			{/if}
			{#if oncommit}
				<button class="btn-commit" onclick={oncommit} disabled={selectedCount === 0}>
					{selectedCount} importieren
				</button>
			{/if}
		</div>
	</div>

	{#if issues.length > 0}
		<div class="issues-panel">
			<h3>Probleme ({issues.length})</h3>
			<ul class="issues-list">
				{#each issues as issue (issue.id)}
					<li class="issue-item" class:error={issue.severity === 'error'}>
						<span class="issue-icon">{issue.severity === 'error' ? '!' : '?'}</span>
						<span class="issue-message">{issue.message}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="table-wrapper">
		<table class="review-table">
			<thead>
				<tr>
					<th class="col-select">
						<input
							type="checkbox"
							checked={allSelected}
							onchange={toggleAll}
							aria-label="Alle auswählen"
						/>
					</th>
					<th class="col-date">Datum</th>
					<th class="col-time">Start</th>
					<th class="col-time">Ende</th>
					<th class="col-duration">Dauer</th>
					<th class="col-category">Kategorie</th>
					<th class="col-note">Notiz</th>
					<th class="col-status">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each candidates as candidate (candidate.id)}
					{@const isBlocked = candidate.flags.includes('hard_block')}
					<tr class:blocked={isBlocked} class:selected={selectedIds.has(candidate.id)}>
						<td class="col-select">
							<input
								type="checkbox"
								checked={selectedIds.has(candidate.id)}
								disabled={isBlocked}
								onchange={() => toggleCandidate(candidate.id)}
							/>
						</td>
						<td class="col-date">{formatDate(candidate.date)}</td>
						<td class="col-time">{formatTime(candidate.startTime)}</td>
						<td class="col-time">{formatTime(candidate.endTime)}</td>
						<td class="col-duration">{formatDuration(candidate.durationMinutes)}</td>
						<td class="col-category">{candidate.categoryGuess || '???'}</td>
						<td class="col-note" title={candidate.note || ''}>
							{candidate.note?.slice(0, 30) || '-'}{candidate.note && candidate.note.length > 30
								? '...'
								: ''}
						</td>
						<td class="col-status">
							<span class="status-badge {getStatusClass(candidate)}"
								>{getStatusIcon(candidate)}</span
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.review-container {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--tt-background-card-hover);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.issues-panel {
		background: var(--tt-background-card-hover);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		padding: var(--tt-space-16);
	}

	.issues-panel h3 {
		font-size: var(--tt-font-size-small);
		margin: 0 0 0.75rem;
		color: var(--tt-text-secondary);
	}

	.issues-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.issue-item {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		font-size: var(--tt-font-size-small);
		padding: 0.25rem 0;
		color: var(--tt-text-secondary);
	}

	.issue-item.error {
		color: var(--tt-status-danger-500);
	}

	.issue-icon {
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--tt-background-card-pressed);
		font-size: var(--tt-font-size-tiny);
		font-weight: 600;
	}

	.issue-item.error .issue-icon {
		background: var(--tt-status-danger-500);
		color: white;
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
	}

	.review-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--tt-font-size-small);
	}

	.review-table th,
	.review-table td {
		padding: 0.625rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--tt-border-default);
	}

	.review-table th {
		background: var(--tt-background-card-hover);
		font-weight: 600;
		color: var(--tt-text-secondary);
		white-space: nowrap;
	}

	.review-table tbody tr:hover {
		background: var(--tt-state-hover);
	}

	.review-table tbody tr.selected {
		background: var(--tt-brand-primary-500-light, rgba(59, 130, 246, 0.1));
	}

	.review-table tbody tr.blocked {
		opacity: 0.5;
		background: var(--tt-background-card-pressed);
	}

	.col-select {
		width: 40px;
		text-align: center;
	}

	.col-date {
		width: 80px;
	}

	.col-time {
		width: 60px;
	}

	.col-duration {
		width: 60px;
	}

	.col-category {
		width: 120px;
	}

	.col-note {
		min-width: 150px;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.col-status {
		width: 50px;
		text-align: center;
	}

	.status-badge {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		border-radius: var(--tt-radius-badge);
		font-size: var(--tt-font-size-tiny);
		font-weight: 600;
	}

	.status-ok {
		background: var(--tt-status-success-500);
		color: white;
	}

	.status-warning {
		background: var(--tt-status-warning-500);
		color: white;
	}

	.status-error {
		background: var(--tt-status-danger-500);
		color: white;
	}

	.review-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 0.5rem;
	}

	.selection-info {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-secondary);
	}

	.review-actions {
		display: flex;
		gap: var(--tt-space-12);
	}

	.btn-cancel,
	.btn-commit {
		padding: 0.625rem 1.25rem;
		border-radius: var(--tt-radius-button);
		font-size: var(--tt-font-size-small);
		cursor: pointer;
		border: none;
	}

	.btn-cancel {
		background: var(--tt-background-card-pressed);
		color: var(--tt-text-primary);
		border: 1px solid var(--tt-border-default);
	}

	.btn-commit {
		background: var(--tt-brand-primary-500);
		color: white;
		font-weight: 500;
	}

	.btn-commit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
