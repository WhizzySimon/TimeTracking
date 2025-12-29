<!--
  CategoryDialog component - modal for editing categories with employer assignment
  
  Spec refs:
  - multi-arbeitgeber.md A2.12 (categories grouped by AG)
  
  Features:
  - Edit category name
  - Assign to employer or "Alle"
  - System categories cannot be edited
-->
<script lang="ts">
	import { put } from '$lib/storage/db';
	import { categories } from '$lib/stores';
	import { getActiveEmployers } from '$lib/storage/employers';
	import type { Category, Employer } from '$lib/types';
	import Modal from './Modal.svelte';
	import { onMount } from 'svelte';

	interface Props {
		/** Category to edit */
		category: Category;
		/** Callback when category is saved */
		onsave?: (category: Category) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { category, onsave, onclose }: Props = $props();

	// Form state
	function getInitialName() {
		return category.name;
	}
	function getInitialEmployerId() {
		return category.employerId ?? '';
	}
	let name = $state(getInitialName());
	let selectedEmployerId = $state(getInitialEmployerId());
	let error = $state('');
	let saving = $state(false);
	let employers = $state<Employer[]>([]);

	// System categories cannot be edited
	let isSystemCategory = $derived(category.type === 'system');

	onMount(async () => {
		employers = await getActiveEmployers();
	});

	async function handleSave() {
		const trimmedName = name.trim();

		if (!trimmedName) {
			error = 'Name ist erforderlich';
			return;
		}

		// Check for duplicates (excluding current category)
		const existingNames = $categories
			.filter((cat) => cat.id !== category.id)
			.map((cat) => cat.name.toLowerCase());
		if (existingNames.includes(trimmedName.toLowerCase())) {
			error = 'Eine Kategorie mit diesem Namen existiert bereits';
			return;
		}

		error = '';
		saving = true;

		try {
			const updatedCategory: Category = {
				...category,
				name: trimmedName,
				employerId: selectedEmployerId === '' ? null : selectedEmployerId
			};

			await put('categories', updatedCategory);

			// Update store
			categories.update((cats) =>
				cats.map((cat) => (cat.id === category.id ? updatedCategory : cat))
			);

			onsave?.(updatedCategory);
		} catch (err) {
			error = 'Fehler beim Speichern';
			console.error('[CategoryDialog] Save failed:', err);
		} finally {
			saving = false;
		}
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal title="Kategorie bearbeiten" onclose={handleClose}>
	<div class="category-form">
		<div class="field">
			<label for="category-name">Name:</label>
			<input
				type="text"
				id="category-name"
				data-testid="category-name-input"
				bind:value={name}
				class="text-input"
				disabled={saving || isSystemCategory}
			/>
		</div>

		<div class="field">
			<label for="category-employer">Arbeitgeber:</label>
			<select
				id="category-employer"
				data-testid="category-employer-select"
				bind:value={selectedEmployerId}
				class="select-input"
				disabled={saving || isSystemCategory}
			>
				<option value="">Alle Arbeitgeber</option>
				{#each employers as employer (employer.id)}
					<option value={employer.id}>{employer.name}</option>
				{/each}
			</select>
		</div>

		{#if isSystemCategory}
			<p class="info">Systemkategorien können nicht bearbeitet werden.</p>
		{/if}

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="actions">
			<button type="button" class="btn-secondary" onclick={handleClose} disabled={saving}>
				{isSystemCategory ? 'Schließen' : 'Abbrechen'}
			</button>
			{#if !isSystemCategory}
				<button
					type="button"
					class="btn-primary"
					data-testid="save-category-btn"
					onclick={handleSave}
					disabled={saving}
				>
					{saving ? 'Speichern...' : 'Speichern'}
				</button>
			{/if}
		</div>
	</div>
</Modal>

<style>
	.category-form {
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
		color: var(--text);
	}

	.text-input,
	.select-input {
		padding: 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
	}

	.text-input:focus,
	.select-input:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: 0 0 0 2px var(--accent-light);
	}

	.text-input:disabled,
	.select-input:disabled {
		background: var(--surface-hover);
		color: var(--muted);
	}

	.info {
		margin: 0;
		padding: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-input);
		color: var(--muted);
		font-size: 0.9rem;
	}

	.error {
		margin: 0;
		padding: 0.5rem;
		background: var(--neg-light);
		border: 1px solid var(--neg);
		border-radius: var(--r-input);
		color: var(--neg);
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
	}

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--btn-secondary-border);
		border-radius: var(--r-btn);
		background: var(--btn-secondary-bg);
		color: var(--btn-secondary-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--btn-secondary-hover);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--r-btn);
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--btn-primary-hover);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
