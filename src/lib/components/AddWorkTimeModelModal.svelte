<!--
  AddWorkTimeModelModal component - modal for adding new work time models
  
  Spec refs:
  - ui-logic-spec-v1.md Section 8-9 (Arbeitszeitmodelle)
  
  Features:
  - Name input (required)
  - Valid from date (required)
  - Hours per weekday (null = inactive day)
-->
<script lang="ts">
	import { saveWorkTimeModel } from '$lib/storage/operations';
	import { workTimeModels } from '$lib/stores';
	import { formatDate, parseDate } from '$lib/utils/date';
	import type { WorkTimeModel } from '$lib/types';
	import Modal from './Modal.svelte';

	interface Props {
		/** Callback when model is saved */
		onsave?: (model: WorkTimeModel) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { onsave, onclose }: Props = $props();

	// Form state
	let name = $state('');
	let validFrom = $state(formatDate(new Date(), 'DE'));
	let monday = $state('8');
	let tuesday = $state('8');
	let wednesday = $state('8');
	let thursday = $state('8');
	let friday = $state('8');
	let saturday = $state('');
	let sunday = $state('');
	let error = $state('');
	let saving = $state(false);

	// Parse hours input (empty = null/inactive)
	function parseHours(value: string): number | null {
		const trimmed = value.trim();
		if (!trimmed) return null;
		const num = parseFloat(trimmed.replace(',', '.'));
		return isNaN(num) ? null : num;
	}

	// Validate and save
	async function handleSave() {
		const trimmedName = name.trim();

		if (!trimmedName) {
			error = 'Name ist erforderlich';
			return;
		}

		const parsedDate = parseDate(validFrom);
		if (!parsedDate) {
			error = 'Ungültiges Datum (Format: TT.MM.JJJJ)';
			return;
		}

		error = '';
		saving = true;

		try {
			const newModel: WorkTimeModel = {
				id: crypto.randomUUID(),
				name: trimmedName,
				validFrom: formatDate(parsedDate, 'ISO'),
				monday: parseHours(monday),
				tuesday: parseHours(tuesday),
				wednesday: parseHours(wednesday),
				thursday: parseHours(thursday),
				friday: parseHours(friday),
				saturday: parseHours(saturday),
				sunday: parseHours(sunday),
				createdAt: Date.now(),
				updatedAt: Date.now()
			};

			await saveWorkTimeModel(newModel);

			// Update store
			workTimeModels.update((models) => [...models, newModel]);

			onsave?.(newModel);
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

<Modal title="Neues Arbeitszeitmodell" onclose={handleClose}>
	<div class="add-model-form">
		<!-- Name -->
		<div class="field">
			<label for="model-name">Name:</label>
			<input
				type="text"
				id="model-name"
				bind:value={name}
				placeholder="z.B. Vollzeit 40h"
				class="text-input"
				disabled={saving}
			/>
		</div>

		<!-- Valid From -->
		<div class="field">
			<label for="model-valid-from">Gültig ab:</label>
			<input
				type="text"
				id="model-valid-from"
				bind:value={validFrom}
				placeholder="TT.MM.JJJJ"
				class="text-input"
				disabled={saving}
			/>
		</div>

		<!-- Weekday Hours -->
		<div class="weekdays">
			<h3 class="section-title">Stunden pro Tag (leer = inaktiv)</h3>
			<div class="weekday-grid">
				<div class="weekday">
					<label for="hours-mon">Mo:</label>
					<input
						type="text"
						id="hours-mon"
						bind:value={monday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday">
					<label for="hours-tue">Di:</label>
					<input
						type="text"
						id="hours-tue"
						bind:value={tuesday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday">
					<label for="hours-wed">Mi:</label>
					<input
						type="text"
						id="hours-wed"
						bind:value={wednesday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday">
					<label for="hours-thu">Do:</label>
					<input
						type="text"
						id="hours-thu"
						bind:value={thursday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday">
					<label for="hours-fri">Fr:</label>
					<input
						type="text"
						id="hours-fri"
						bind:value={friday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday">
					<label for="hours-sat">Sa:</label>
					<input
						type="text"
						id="hours-sat"
						bind:value={saturday}
						class="hours-input"
						disabled={saving}
					/>
				</div>
				<div class="weekday">
					<label for="hours-sun">So:</label>
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
			<p class="error">{error}</p>
		{/if}

		<!-- Actions -->
		<div class="actions">
			<button type="button" class="btn-secondary" onclick={handleClose} disabled={saving}>
				Abbrechen
			</button>
			<button type="button" class="btn-primary" onclick={handleSave} disabled={saving}>
				{saving ? 'Speichern...' : 'Speichern'}
			</button>
		</div>
	</div>
</Modal>

<style>
	.add-model-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field label {
		font-size: 0.9rem;
		font-weight: 500;
		color: #333;
	}

	.text-input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
	}

	.text-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.text-input:disabled {
		background: #f5f5f5;
		color: #666;
	}

	.weekdays {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-title {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: #666;
	}

	.weekday-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.5rem;
	}

	.weekday {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.weekday label {
		font-size: 0.85rem;
		font-weight: 500;
		color: #333;
	}

	.hours-input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 0.9rem;
		text-align: center;
	}

	.hours-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.hours-input:disabled {
		background: #f5f5f5;
		color: #666;
	}

	.error {
		margin: 0;
		padding: 0.5rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 4px;
		color: #dc2626;
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid #eee;
	}

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: white;
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #f5f5f5;
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		background: #3b82f6;
		color: white;
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
