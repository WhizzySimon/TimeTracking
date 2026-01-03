<!--
  AddTaskModal component - form for adding/editing time entries
  
  Spec refs:
  - ui-logic-spec-v1.md Section 6 (Aufgabe hinzufügen)
  
  Fields:
  - Category (dropdown, filterable)
  - Start Time (pre-filled with current time)
  - End Time (optional - null for running task)
  - Description (optional)
-->
<script lang="ts">
	import { categories, timeEntries } from '$lib/stores';
	import { categorySort } from '$lib/stores/theme';
	import { formatDate, formatTime } from '$lib/utils/date';
	import { saveTimeEntry } from '$lib/storage/operations';
	import type { TimeEntry } from '$lib/types';
	import Modal from './Modal.svelte';
	import TimePicker from './TimePicker.svelte';
	import CategorySelect from './CategorySelect.svelte';

	interface Props {
		date: Date;
		entry?: TimeEntry | null;
		onclose: () => void;
		onsave: (entry: TimeEntry) => void;
	}

	let { date, entry = null, onclose, onsave }: Props = $props();

	// Form state - initialize from entry prop via function to avoid Svelte warning
	function roundToFiveMinutes(time: string): string {
		const [hours, minutes] = time.split(':').map(Number);
		const roundedMinutes = Math.floor(minutes / 5) * 5;
		return `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
	}

	function addMinutes(time: string, minutesToAdd: number): string {
		const [hours, minutes] = time.split(':').map(Number);
		const totalMinutes = hours * 60 + minutes + minutesToAdd;
		const newHours = Math.floor(totalMinutes / 60) % 24;
		const newMinutes = totalMinutes % 60;
		return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
	}

	function getInitialValues() {
		const currentTime = roundToFiveMinutes(formatTime(new Date()));

		// Task 7.9: When editing a running task (entry.endTime=null), pre-fill end time with current time
		let initialEndTime = '';
		if (entry) {
			if (entry.endTime === null) {
				// Running task: pre-fill with current time (rounded)
				initialEndTime = currentTime;
			} else {
				// Completed task: show existing end time (rounded to match dropdown)
				initialEndTime = roundToFiveMinutes(entry.endTime);
			}
		}
		// New task: endTime stays empty (as before)

		// Round startTime to 5-minute steps so it matches dropdown options
		const initialStartTime = entry?.startTime ? roundToFiveMinutes(entry.startTime) : currentTime;

		return {
			categoryId: entry?.categoryId ?? '',
			startTime: initialStartTime,
			endTime: initialEndTime,
			description: entry?.description ?? ''
		};
	}
	const initial = getInitialValues();

	let categoryId = $state(initial.categoryId);
	let startTime = $state(initial.startTime);
	let endTime = $state(initial.endTime);
	let description = $state(initial.description);
	let saving = $state(false);
	let error = $state('');
	let endTimeClicked = $state(false);

	function handleEndTimeFocus() {
		if (!endTimeClicked && !endTime && startTime) {
			endTime = addMinutes(startTime, 30);
			endTimeClicked = true;
		}
	}

	// Filter categories to only show user-selectable ones
	let selectableCategories = $derived(
		$categories.filter((c) => c.type === 'user' || c.name === 'Pause')
	);

	// Set default category if not set
	$effect(() => {
		if (!categoryId && selectableCategories.length > 0) {
			categoryId = selectableCategories[0].id;
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = '';

		// Validation
		if (!categoryId) {
			error = 'Bitte wählen Sie eine Kategorie';
			return;
		}

		if (!startTime) {
			error = 'Bitte geben Sie eine Startzeit ein';
			return;
		}

		// Validate time format
		if (!/^\d{1,2}:\d{2}$/.test(startTime)) {
			error = 'Startzeit muss im Format HH:mm sein';
			return;
		}

		if (endTime && !/^\d{1,2}:\d{2}$/.test(endTime)) {
			error = 'Endzeit muss im Format HH:mm sein';
			return;
		}

		// Validate end > start if both provided
		if (endTime && endTime <= startTime) {
			error = 'Endzeit muss nach Startzeit liegen';
			return;
		}

		saving = true;

		try {
			const now = Date.now();
			const timeEntry: TimeEntry = {
				id: entry?.id ?? crypto.randomUUID(),
				date: formatDate(date, 'ISO'),
				categoryId,
				startTime: normalizeTime(startTime),
				endTime: endTime ? normalizeTime(endTime) : null,
				description: description.trim() || null,
				createdAt: entry?.createdAt ?? now,
				updatedAt: now
			};

			await saveTimeEntry(timeEntry);
			onsave(timeEntry);
			onclose();
		} catch (e) {
			error = 'Fehler beim Speichern';
			console.error('Failed to save time entry:', e);
		} finally {
			saving = false;
		}
	}

	function normalizeTime(time: string): string {
		const [hours, minutes] = time.split(':');
		return `${hours.padStart(2, '0')}:${minutes}`;
	}

	let modalTitle = $derived(entry ? 'Aufgabe bearbeiten' : 'Aufgabe hinzufügen');
</script>

<Modal title={modalTitle} {onclose}>
	<form onsubmit={handleSubmit}>
		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<div class="form-group">
			<label for="category">Kategorie</label>
			<CategorySelect
				id="category"
				categories={selectableCategories}
				entries={$timeEntries}
				value={categoryId}
				onchange={(id) => (categoryId = id)}
				sortOrder={$categorySort}
				required
			/>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="startTime">Startzeit</label>
				<TimePicker id="startTime" value={startTime} onchange={(v) => (startTime = v)} required />
			</div>

			<div class="form-group">
				<label for="endTime">Endzeit (optional)</label>
				<div onfocusin={handleEndTimeFocus}>
					<TimePicker id="endTime" value={endTime} onchange={(v) => (endTime = v)} />
				</div>
			</div>
		</div>

		<div class="form-group">
			<label for="description">Beschreibung (optional)</label>
			<input
				type="text"
				id="description"
				bind:value={description}
				placeholder="z.B. Meeting, Code Review..."
			/>
		</div>

		<div class="form-actions">
			<button type="button" class="btn-secondary" onclick={onclose} disabled={saving}>
				Abbrechen
			</button>
			<button type="submit" class="btn-primary" disabled={saving}>
				{saving ? 'Speichern...' : 'Speichern'}
			</button>
		</div>
	</form>
</Modal>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.error-message {
		background: var(--tt-status-danger-faded);
		color: var(--tt-status-danger);
		padding: 0.75rem;
		border-radius: var(--tt-radius-input);
		font-size: 0.9rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
	}

	.form-row .form-group {
		flex: 1;
	}

	label {
		font-weight: 500;
		font-size: 0.9rem;
		color: var(--tt-text-primary);
	}

	input {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: 1rem;
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
	}

	input::placeholder {
		color: var(--tt-text-muted);
	}

	input:focus {
		outline: none;
		border-color: var(--tt-border-focus);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-faded);
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.5rem 1rem;
		border-radius: var(--tt-radius-button);
		font-size: 1rem;
		cursor: pointer;
		transition: all var(--tt-transition-normal);
	}

	.btn-primary {
		background: var(--tt-button-primary-bg);
		color: var(--tt-button-primary-text);
		border: none;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--tt-button-primary-hover);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--tt-button-secondary-bg);
		color: var(--tt-button-secondary-text);
		border: 1px solid var(--tt-button-secondary-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--tt-button-secondary-hover);
	}

	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
