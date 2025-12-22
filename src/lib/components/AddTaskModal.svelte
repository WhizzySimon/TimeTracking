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
	import { categories } from '$lib/stores';
	import { formatDate, formatTime } from '$lib/utils/date';
	import { saveTimeEntry } from '$lib/storage/operations';
	import type { TimeEntry } from '$lib/types';
	import Modal from './Modal.svelte';

	interface Props {
		date: Date;
		entry?: TimeEntry | null;
		onclose: () => void;
		onsave: (entry: TimeEntry) => void;
	}

	let { date, entry = null, onclose, onsave }: Props = $props();

	// Form state - initialize from entry prop via function to avoid Svelte warning
	function getInitialValues() {
		return {
			categoryId: entry?.categoryId ?? '',
			startTime: entry?.startTime ?? formatTime(new Date()),
			endTime: entry?.endTime ?? '',
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
			<select id="category" bind:value={categoryId} required>
				{#each selectableCategories as category (category.id)}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="startTime">Startzeit</label>
				<input type="time" id="startTime" bind:value={startTime} required />
			</div>

			<div class="form-group">
				<label for="endTime">Endzeit (optional)</label>
				<input type="time" id="endTime" bind:value={endTime} />
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
		background: #fef2f2;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 8px;
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
		color: #333;
	}

	input,
	select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
		border: none;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: #666;
		border: 1px solid #ddd;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #f5f5f5;
	}

	.btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
