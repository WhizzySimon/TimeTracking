<!--
  AddCategoryModal component - modal for adding new categories
  
  Spec refs:
  - ui-logic-spec-v1.md Section 7 (Kategorien)
  
  Features:
  - Name input (required)
  - "Zählt als Arbeitszeit" checkbox
  - Validation: name required, no duplicates
-->
<script lang="ts">
	import { put } from '$lib/storage/db';
	import { categories } from '$lib/stores';
	import type { Category } from '$lib/types';
	import Modal from './Modal.svelte';

	interface Props {
		/** Callback when category is saved */
		onsave?: (category: Category) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
		/** Pre-set countsAsWorkTime value (hides checkbox when set) */
		countsAsWorkTime?: boolean;
		/** Modal title override */
		title?: string;
	}

	let { onsave, onclose, countsAsWorkTime: fixedCountsAsWorkTime, title }: Props = $props();

	// Form state
	let name = $state('');
	// Use fixed value if provided, otherwise default to true
	function getInitialCountsAsWorkTime() {
		return fixedCountsAsWorkTime ?? true;
	}
	let countsAsWorkTimeState = $state(getInitialCountsAsWorkTime());
	// Determine if checkbox should be shown
	function isCheckboxVisible() {
		return fixedCountsAsWorkTime === undefined;
	}
	const showCheckbox = isCheckboxVisible();
	let error = $state('');
	let saving = $state(false);

	// Validate and save
	async function handleSave() {
		// Trim name
		const trimmedName = name.trim();

		// Validate: name required
		if (!trimmedName) {
			error = 'Name ist erforderlich';
			return;
		}

		// Validate: no duplicates
		const existingNames = $categories.map((c) => c.name.toLowerCase());
		if (existingNames.includes(trimmedName.toLowerCase())) {
			error = 'Eine Kategorie mit diesem Namen existiert bereits';
			return;
		}

		error = '';
		saving = true;

		try {
			const now = Date.now();
			const newCategory: Category = {
				id: crypto.randomUUID(),
				name: trimmedName,
				type: 'user',
				countsAsWorkTime: fixedCountsAsWorkTime ?? countsAsWorkTimeState,
				createdAt: now,
				updatedAt: now
			};

			await put('categories', newCategory);

			// Update store
			categories.update((cats) => [...cats, newCategory]);

			onsave?.(newCategory);
		} catch (e) {
			error = 'Fehler beim Speichern';
			console.error('Failed to save category:', e);
		} finally {
			saving = false;
		}
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal title={title ?? 'Neue Kategorie'} onclose={handleClose}>
	<div class="add-category-form">
		<div class="field">
			<label for="category-name">Name:</label>
			<input
				type="text"
				id="category-name"
				data-testid="new-category-name"
				bind:value={name}
				placeholder="z.B. Meeting"
				class="text-input"
				disabled={saving}
			/>
		</div>

		{#if showCheckbox}
			<div class="field checkbox-field">
				<label>
					<input type="checkbox" bind:checked={countsAsWorkTimeState} disabled={saving} />
					Zählt als Arbeitszeit
				</label>
			</div>
		{/if}

		<!-- Error Message -->
		{#if error}
			<p class="error">{error}</p>
		{/if}

		<!-- Actions -->
		<div class="actions">
			<button type="button" class="btn-secondary" onclick={handleClose} disabled={saving}>
				Abbrechen
			</button>
			<button
				type="button"
				class="btn-primary"
				data-testid="add-category-btn"
				onclick={handleSave}
				disabled={saving}
			>
				{saving ? 'Speichern...' : 'Speichern'}
			</button>
		</div>
	</div>
</Modal>

<style>
	.add-category-form {
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
		color: var(--tt-text-primary);
	}

	.text-input {
		padding: 0.75rem;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: 1rem;
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
	}

	.text-input::placeholder {
		color: var(--tt-text-muted);
	}

	.text-input:focus {
		outline: none;
		border-color: var(--tt-border-focus);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-faded);
	}

	.text-input:disabled {
		background: var(--tt-background-card-hover);
		color: var(--tt-text-muted);
	}

	.checkbox-field {
		flex-direction: row;
		align-items: center;
	}

	.checkbox-field label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-field input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.error {
		margin: 0;
		padding: 0.5rem;
		background: var(--tt-status-danger-faded);
		border: 1px solid var(--tt-status-danger);
		border-radius: var(--tt-radius-input);
		color: var(--tt-status-danger);
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--tt-border-default);
	}

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--tt-button-secondary-border);
		border-radius: var(--tt-radius-button);
		background: var(--tt-button-secondary-bg);
		color: var(--tt-button-secondary-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--tt-button-secondary-hover);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--tt-radius-button);
		background: var(--tt-button-primary-bg);
		color: var(--tt-button-primary-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--tt-button-primary-hover);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
