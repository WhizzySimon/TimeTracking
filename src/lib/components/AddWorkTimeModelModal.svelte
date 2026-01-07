<!--
  AddWorkTimeModelModal component - modal for adding/editing work time models
  
  Spec refs:
  - ui-logic-spec-v1.md Section 8-9 (Arbeitszeitmodelle)
  
  Features:
  - Name input (required)
  - Valid from date (required)
  - Hours per weekday (null = inactive day)
  - Edit mode when model prop is provided
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { saveWorkTimeModel } from '$lib/storage/operations';
	import { workTimeModels } from '$lib/stores';
	import { getActiveEmployers } from '$lib/storage/employers';
	import { formatDate, parseDate } from '$lib/utils/date';
	import type { WorkTimeModel, Employer } from '$lib/types';
	import Modal from './Modal.svelte';
	import CustomDropdown from './CustomDropdown.svelte';

	interface Props {
		/** Existing model to edit (null for new) */
		model?: WorkTimeModel | null;
		/** Callback when model is saved */
		onsave?: (model: WorkTimeModel) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { model = null, onsave, onclose }: Props = $props();

	// Capture initial values from model prop (intentionally not reactive)
	// Use function to avoid Svelte state_referenced_locally warning
	function getInitialModel() {
		return model;
	}
	const initialModel = getInitialModel();

	// Helper to format hours for display
	function formatHoursForInput(hours: number | null): string {
		if (hours === null) return '';
		return String(hours);
	}

	// Helper to get initial isWorkday value (fallback to hours > 0 for backwards compatibility)
	function getInitialIsWorkday(isWorkday: boolean | undefined, hours: number | null): boolean {
		if (isWorkday !== undefined) return isWorkday;
		return hours !== null && hours > 0;
	}

	// Form state - initialize from model if editing
	let name = $state(initialModel?.name ?? '');
	let validFrom = $state(
		initialModel?.validFrom
			? formatDate(parseDate(initialModel.validFrom)!, 'DE')
			: formatDate(new Date(), 'DE')
	);
	// Hours per day
	let monday = $state(formatHoursForInput(initialModel?.monday ?? 8));
	let tuesday = $state(formatHoursForInput(initialModel?.tuesday ?? 8));
	let wednesday = $state(formatHoursForInput(initialModel?.wednesday ?? 8));
	let thursday = $state(formatHoursForInput(initialModel?.thursday ?? 8));
	let friday = $state(formatHoursForInput(initialModel?.friday ?? 8));
	let saturday = $state(formatHoursForInput(initialModel?.saturday ?? 0));
	let sunday = $state(formatHoursForInput(initialModel?.sunday ?? 0));
	// Is workday checkboxes
	let mondayIsWorkday = $state(
		getInitialIsWorkday(initialModel?.mondayIsWorkday, initialModel?.monday ?? 8)
	);
	let tuesdayIsWorkday = $state(
		getInitialIsWorkday(initialModel?.tuesdayIsWorkday, initialModel?.tuesday ?? 8)
	);
	let wednesdayIsWorkday = $state(
		getInitialIsWorkday(initialModel?.wednesdayIsWorkday, initialModel?.wednesday ?? 8)
	);
	let thursdayIsWorkday = $state(
		getInitialIsWorkday(initialModel?.thursdayIsWorkday, initialModel?.thursday ?? 8)
	);
	let fridayIsWorkday = $state(
		getInitialIsWorkday(initialModel?.fridayIsWorkday, initialModel?.friday ?? 8)
	);
	let saturdayIsWorkday = $state(
		getInitialIsWorkday(initialModel?.saturdayIsWorkday, initialModel?.saturday ?? null)
	);
	let sundayIsWorkday = $state(
		getInitialIsWorkday(initialModel?.sundayIsWorkday, initialModel?.sunday ?? null)
	);
	let error = $state('');
	let saving = $state(false);
	let employers = $state<Employer[]>([]);

	// Convert employers to dropdown options
	let employerOptions = $derived(employers.map((e) => ({ value: e.id, label: e.name })));

	// Employer selection - initialize from model
	function getInitialEmployerId() {
		return initialModel?.employerId ?? '';
	}
	let selectedEmployerId = $state(getInitialEmployerId());

	let isEditMode = initialModel !== null;

	onMount(async () => {
		employers = await getActiveEmployers();
		// Pre-select first employer if none selected (new model)
		if (!selectedEmployerId && employers.length > 0) {
			selectedEmployerId = employers[0].id;
		}
	});

	// Calculate total hours
	let totalHours = $derived(() => {
		const values = [monday, tuesday, wednesday, thursday, friday, saturday, sunday];
		let total = 0;
		for (const v of values) {
			const parsed = parseFloat(v.trim().replace(',', '.'));
			if (!isNaN(parsed)) total += parsed;
		}
		return total;
	});

	// Count active workdays (based on checkboxes, not hours)
	let activeWorkdays = $derived(() => {
		const workdays = [
			mondayIsWorkday,
			tuesdayIsWorkday,
			wednesdayIsWorkday,
			thursdayIsWorkday,
			fridayIsWorkday,
			saturdayIsWorkday,
			sundayIsWorkday
		];
		return workdays.filter(Boolean).length;
	});

	// Parse hours input (empty = null/inactive)
	function parseHours(value: string): number | null {
		const trimmed = value.trim();
		if (!trimmed) return null;
		const num = parseFloat(trimmed.replace(',', '.'));
		return isNaN(num) ? null : num;
	}

	// Validate hours input (must be 0-24 if provided)
	function validateHours(value: string, dayName: string): string | null {
		const trimmed = value.trim();
		if (!trimmed) return null; // Empty is valid (inactive day)
		const num = parseFloat(trimmed.replace(',', '.'));
		if (isNaN(num)) return `${dayName}: Ungültige Zahl`;
		if (num < 0 || num > 24) return `${dayName}: Stunden müssen zwischen 0 und 24 liegen`;
		return null;
	}

	// Validate and save
	async function handleSave() {
		const trimmedName = name.trim();

		if (!trimmedName) {
			error = 'Name ist erforderlich';
			return;
		}

		// STRICT: Require employer selection for work time models
		if (selectedEmployerId === '') {
			error = 'Bitte zuerst Arbeitgeber auswählen';
			return;
		}

		const parsedDate = parseDate(validFrom);
		if (!parsedDate) {
			error = 'Ungültiges Datum (Format: TT.MM.JJJJ)';
			return;
		}

		// Validate hours
		const hoursValidation =
			validateHours(monday, 'Mo') ||
			validateHours(tuesday, 'Di') ||
			validateHours(wednesday, 'Mi') ||
			validateHours(thursday, 'Do') ||
			validateHours(friday, 'Fr') ||
			validateHours(saturday, 'Sa') ||
			validateHours(sunday, 'So');

		if (hoursValidation) {
			error = hoursValidation;
			return;
		}

		error = '';
		saving = true;

		try {
			const savedModel: WorkTimeModel = {
				id: initialModel?.id ?? crypto.randomUUID(),
				name: trimmedName,
				validFrom: formatDate(parsedDate, 'ISO'),
				monday: parseHours(monday),
				tuesday: parseHours(tuesday),
				wednesday: parseHours(wednesday),
				thursday: parseHours(thursday),
				friday: parseHours(friday),
				saturday: parseHours(saturday),
				sunday: parseHours(sunday),
				mondayIsWorkday,
				tuesdayIsWorkday,
				wednesdayIsWorkday,
				thursdayIsWorkday,
				fridayIsWorkday,
				saturdayIsWorkday,
				sundayIsWorkday,
				employerId: selectedEmployerId,
				createdAt: initialModel?.createdAt ?? Date.now(),
				updatedAt: Date.now()
			};

			await saveWorkTimeModel(savedModel);

			// Update store
			if (isEditMode) {
				// Edit mode - replace existing
				workTimeModels.update((models) =>
					models.map((m) => (m.id === savedModel.id ? savedModel : m))
				);
			} else {
				// Add mode - append new
				workTimeModels.update((models) => [...models, savedModel]);
			}

			onsave?.(savedModel);
		} catch (e) {
			error = 'Fehler beim Speichern';
			console.error('Failed to save work time model:', e);
		} finally {
			saving = false;
		}
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal
	title={isEditMode ? 'Arbeitszeitmodell bearbeiten' : 'Neues Arbeitszeitmodell'}
	onclose={handleClose}
>
	<div class="add-model-form">
		<!-- Name -->
		<div class="tt-form-field">
			<label for="model-name" class="tt-form-field__label">Name:</label>
			<input
				type="text"
				id="model-name"
				bind:value={name}
				placeholder="z.B. Vollzeit 40h"
				class="tt-text-input"
				disabled={saving}
			/>
		</div>

		<!-- Valid From -->
		<div class="tt-form-field">
			<label for="model-valid-from" class="tt-form-field__label">Gültig ab:</label>
			<input
				type="text"
				id="model-valid-from"
				bind:value={validFrom}
				placeholder="TT.MM.JJJJ"
				class="tt-text-input"
				disabled={saving}
			/>
		</div>

		<!-- Employer (hidden when only 1 employer) -->
		{#if employers.length > 1}
			<div class="tt-form-field">
				<label for="model-employer" class="tt-form-field__label">Arbeitgeber:</label>
				<CustomDropdown
					options={employerOptions}
					value={selectedEmployerId}
					onchange={(id) => (selectedEmployerId = id)}
					disabled={saving}
					placeholder="Arbeitgeber auswählen..."
				/>
			</div>
		{/if}

		<!-- Total Summary -->
		<div class="total-summary">
			<span class="total-label">Wochenstunden:</span>
			<span class="total-value">{totalHours().toFixed(1)}h</span>
			<span class="total-separator">|</span>
			<span class="total-label">Arbeitstage:</span>
			<span class="total-value">{activeWorkdays()}</span>
		</div>

		<!-- Weekday Configuration -->
		<div class="weekdays">
			<h3 class="section-title">Wochentage</h3>
			<div class="weekday-header">
				<span class="header-day">Tag</span>
				<span class="header-workday">Arbeitstag</span>
				<span class="header-hours">Stunden</span>
			</div>
			<div class="weekday-list">
				<div class="weekday-row">
					<span class="day-label">Mo</span>
					<input
						type="checkbox"
						id="workday-mon"
						bind:checked={mondayIsWorkday}
						disabled={saving}
					/>
					<input
						type="text"
						id="hours-mon"
						bind:value={monday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday-row">
					<span class="day-label">Di</span>
					<input
						type="checkbox"
						id="workday-tue"
						bind:checked={tuesdayIsWorkday}
						disabled={saving}
					/>
					<input
						type="text"
						id="hours-tue"
						bind:value={tuesday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday-row">
					<span class="day-label">Mi</span>
					<input
						type="checkbox"
						id="workday-wed"
						bind:checked={wednesdayIsWorkday}
						disabled={saving}
					/>
					<input
						type="text"
						id="hours-wed"
						bind:value={wednesday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday-row">
					<span class="day-label">Do</span>
					<input
						type="checkbox"
						id="workday-thu"
						bind:checked={thursdayIsWorkday}
						disabled={saving}
					/>
					<input
						type="text"
						id="hours-thu"
						bind:value={thursday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday-row">
					<span class="day-label">Fr</span>
					<input
						type="checkbox"
						id="workday-fri"
						bind:checked={fridayIsWorkday}
						disabled={saving}
					/>
					<input
						type="text"
						id="hours-fri"
						bind:value={friday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday-row">
					<span class="day-label">Sa</span>
					<input
						type="checkbox"
						id="workday-sat"
						bind:checked={saturdayIsWorkday}
						disabled={saving}
					/>
					<input
						type="text"
						id="hours-sat"
						bind:value={saturday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday-row">
					<span class="day-label">So</span>
					<input
						type="checkbox"
						id="workday-sun"
						bind:checked={sundayIsWorkday}
						disabled={saving}
					/>
					<input
						type="text"
						id="hours-sun"
						bind:value={sunday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
			</div>
		</div>

		<!-- Error Message -->
		{#if error}
			<p class="tt-error-message">{error}</p>
		{/if}

		<!-- Actions -->
		<div class="tt-form-actions">
			<button type="button" class="tt-button-secondary" onclick={handleClose} disabled={saving}>
				Abbrechen
			</button>
			<button type="button" class="tt-button-primary" onclick={handleSave} disabled={saving}>
				{saving ? 'Speichern...' : 'Speichern'}
			</button>
		</div>
	</div>
</Modal>

<style>
	.add-model-form {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	/* Form elements use design system classes: .tt-form-field, .tt-form-field__label, .tt-error-message, .tt-form-actions */

	/* Single-use: Total hours summary display */
	.total-summary {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--tt-space-4) var(--tt-space-8);
		padding: var(--tt-space-8) var(--tt-space-12);
		background: var(--tt-status-info-faded);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		font-size: var(--tt-font-size-small);
	}

	.total-label {
		font-size: var(--tt-font-size-body);
		color: var(--tt-text-muted);
	}

	.total-value {
		font-size: var(--tt-font-size-normal);
		font-weight: 600;
		color: var(--tt-brand-primary-500);
	}

	.total-separator {
		color: var(--tt-border-default);
	}

	.weekdays {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.section-title {
		margin: 0;
		font-size: var(--tt-font-size-body);
		font-weight: 600;
		color: var(--tt-text-muted);
	}

	.weekday-header {
		display: grid;
		grid-template-columns: 2rem 4.5rem 3rem;
		gap: var(--tt-space-4);
		padding: var(--tt-space-4) 0;
		font-size: var(--tt-font-size-tiny);
		font-weight: 600;
		color: var(--tt-text-muted);
		text-align: center;
	}

	.header-day {
		text-align: left;
	}

	.weekday-list {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.weekday-row {
		display: grid;
		grid-template-columns: 2rem 4.5rem 3rem;
		gap: var(--tt-space-4);
		align-items: center;
	}

	.day-label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.weekday-row input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		justify-self: center;
	}

	.hours-input {
		width: 100%;
		max-width: 3rem;
		padding: var(--tt-space-4);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: var(--tt-font-size-small);
		text-align: center;
		background: var(--tt-background-card);
		color: var(--tt-text-primary);
	}

	.hours-input:focus {
		outline: none;
		border-color: var(--tt-brand-primary-500);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-800);
	}

	.hours-input:disabled {
		background: var(--tt-background-card-hover);
		color: var(--tt-text-muted);
	}

	/* Single-use: Weekday grid layout - unique to AddWorkTimeModelModal */
</style>
