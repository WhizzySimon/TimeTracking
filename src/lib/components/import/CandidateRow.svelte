<!--
  CandidateRow.svelte
  
  Individual row component for import review table with:
  - Inline editing for all fields
  - Status indicator
  - Selection checkbox
  
  Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 6 (Screen C)
-->
<script lang="ts">
	import type { TimeEntryCandidate } from '$lib/import/types';

	interface Props {
		candidate: TimeEntryCandidate;
		selected: boolean;
		disabled?: boolean;
		onselect?: (id: string) => void;
		onchange?: (candidate: TimeEntryCandidate) => void;
	}

	let { candidate, selected, disabled = false, onselect, onchange }: Props = $props();

	let editingField: string | null = $state(null);
	let editValue = $state('');

	function startEdit(field: string, value: string | number | null) {
		if (disabled) return;
		editingField = field;
		editValue = value?.toString() || '';
	}

	function cancelEdit() {
		editingField = null;
		editValue = '';
	}

	function saveEdit() {
		if (!editingField) return;

		const updated = { ...candidate, edited: true };

		switch (editingField) {
			case 'date':
				updated.date = editValue || null;
				break;
			case 'startTime':
				updated.startTime = editValue || null;
				break;
			case 'endTime':
				updated.endTime = editValue || null;
				break;
			case 'durationMinutes':
				updated.durationMinutes = editValue ? parseInt(editValue, 10) : null;
				break;
			case 'note':
				updated.note = editValue || null;
				break;
			case 'categoryGuess':
				updated.categoryGuess = editValue || null;
				break;
		}

		onchange?.(updated);
		cancelEdit();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			saveEdit();
		} else if (e.key === 'Escape') {
			cancelEdit();
		}
	}

	function getStatusIcon(): string {
		if (candidate.flags.includes('hard_block')) return '!!';
		if (
			candidate.flags.some((f) =>
				['overlaps', 'duplicate_suspect', 'unknown_category', 'extreme_duration'].includes(f)
			)
		)
			return '?';
		return 'OK';
	}

	function getStatusClass(): string {
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

<tr class:blocked={disabled} class:selected class:edited={candidate.edited}>
	<td class="col-select">
		<input
			type="checkbox"
			checked={selected}
			{disabled}
			onchange={() => onselect?.(candidate.id)}
		/>
	</td>

	<td class="col-date" ondblclick={() => startEdit('date', candidate.date)}>
		{#if editingField === 'date'}
			<input type="date" bind:value={editValue} onblur={saveEdit} onkeydown={handleKeydown} />
		{:else}
			{formatDate(candidate.date)}
		{/if}
	</td>

	<td class="col-time" ondblclick={() => startEdit('startTime', candidate.startTime)}>
		{#if editingField === 'startTime'}
			<input type="time" bind:value={editValue} onblur={saveEdit} onkeydown={handleKeydown} />
		{:else}
			{formatTime(candidate.startTime)}
		{/if}
	</td>

	<td class="col-time" ondblclick={() => startEdit('endTime', candidate.endTime)}>
		{#if editingField === 'endTime'}
			<input type="time" bind:value={editValue} onblur={saveEdit} onkeydown={handleKeydown} />
		{:else}
			{formatTime(candidate.endTime)}
		{/if}
	</td>

	<td
		class="col-duration"
		ondblclick={() => startEdit('durationMinutes', candidate.durationMinutes)}
	>
		{#if editingField === 'durationMinutes'}
			<input
				type="number"
				min="1"
				max="960"
				bind:value={editValue}
				onblur={saveEdit}
				onkeydown={handleKeydown}
			/>
		{:else}
			{formatDuration(candidate.durationMinutes)}
		{/if}
	</td>

	<td class="col-category" ondblclick={() => startEdit('categoryGuess', candidate.categoryGuess)}>
		{#if editingField === 'categoryGuess'}
			<input type="text" bind:value={editValue} onblur={saveEdit} onkeydown={handleKeydown} />
		{:else}
			{candidate.categoryGuess || '???'}
		{/if}
	</td>

	<td
		class="col-note"
		ondblclick={() => startEdit('note', candidate.note)}
		title={candidate.note || ''}
	>
		{#if editingField === 'note'}
			<input type="text" bind:value={editValue} onblur={saveEdit} onkeydown={handleKeydown} />
		{:else}
			{candidate.note?.slice(0, 30) || '-'}{candidate.note && candidate.note.length > 30
				? '...'
				: ''}
		{/if}
	</td>

	<td class="col-status">
		<span class="status-badge {getStatusClass()}">{getStatusIcon()}</span>
	</td>
</tr>

<style>
	tr {
		transition: background 0.15s;
	}

	tr:hover {
		background: var(--tt-background-card-hover);
	}

	tr.selected {
		background: var(--tt-brand-primary-500-light, rgba(59, 130, 246, 0.1));
	}

	tr.blocked {
		opacity: 0.5;
		background: var(--tt-background-card-pressed);
	}

	tr.edited {
		border-left: 3px solid var(--tt-brand-primary-500);
	}

	td {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--tt-border-default);
		cursor: default;
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

	input {
		width: 100%;
		padding: 0.25rem;
		border: 1px solid var(--tt-brand-primary-500);
		border-radius: var(--tt-radius-badge);
		background: var(--tt-background-card);
		color: var(--tt-text-primary);
		font-size: var(--tt-font-size-small);
	}

	input[type='number'] {
		width: 60px;
	}

	input[type='time'],
	input[type='date'] {
		width: 100%;
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
</style>
