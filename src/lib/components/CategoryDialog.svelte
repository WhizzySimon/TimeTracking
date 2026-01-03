<!--
  CategoryDialog component - modal for creating/editing categories with employer assignment
  
  Spec refs:
  - multi-arbeitgeber.md A2.12 (categories grouped by AG)
  - kleine-aenderungen.md A3.1, A3.2 (create/edit modes)
  
  Features:
  - Create new category (mode='create')
  - Edit category name (mode='edit')
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
		/** Mode: 'create' for new category, 'edit' for existing */
		mode?: 'create' | 'edit';
		/** Category to edit (required for edit mode) */
		category?: Category;
		/** Default category type for create mode */
		categoryType?: 'user';
		/** Whether this is a work category (true) or absence category (false) */
		countsAsWorkTime?: boolean;
		/** Default employer ID for create mode */
		defaultEmployerId?: string;
		/** Callback when category is saved */
		onsave?: (category: Category) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let {
		mode = 'edit',
		category,
		categoryType = 'user',
		countsAsWorkTime = true,
		defaultEmployerId,
		onsave,
		onclose
	}: Props = $props();

	// Computed values for mode handling
	let isCreateMode = $derived(mode === 'create');
	let isSystemCategory = $derived(!isCreateMode && category?.type === 'system');
	let dialogTitle = $derived(isCreateMode ? 'Tätigkeit erstellen' : 'Kategorie bearbeiten');
	// Absence categories (countsAsWorkTime=false) should not have employer assignment
	let isAbsenceCategory = $derived(isCreateMode ? !countsAsWorkTime : !category?.countsAsWorkTime);

	// Form state - initialize based on mode
	let name = $state(category?.name ?? '');
	let selectedEmployerId = $state(category?.employerId ?? defaultEmployerId ?? '');
	let error = $state('');
	let employers = $state<Employer[]>([]);

	onMount(async () => {
		employers = await getActiveEmployers();
	});

	async function handleSave() {
		const trimmedName = name.trim();

		if (!trimmedName) {
			error = 'Name ist erforderlich';
			return;
		}

		// STRICT: Require employer selection for work categories only (not absence)
		if (!isAbsenceCategory && selectedEmployerId === '') {
			error = 'Bitte zuerst Arbeitgeber auswählen';
			return;
		}

		// Check for duplicates (excluding current category in edit mode)
		const currentId = isCreateMode ? null : category?.id;
		const existingNames = $categories
			.filter((cat) => cat.id !== currentId)
			.map((cat) => cat.name.toLowerCase());
		if (existingNames.includes(trimmedName.toLowerCase())) {
			error = 'Eine Kategorie mit diesem Namen existiert bereits';
			return;
		}

		error = '';

		let savedCategory: Category;

		const now = Date.now();
		if (isCreateMode) {
			// Create new category - employerId required for work categories only
			savedCategory = {
				id: crypto.randomUUID(),
				name: trimmedName,
				type: categoryType,
				countsAsWorkTime: countsAsWorkTime,
				employerId: isAbsenceCategory ? null : selectedEmployerId,
				createdAt: now,
				updatedAt: now
			};
			// Update store immediately for instant UI feedback
			categories.update((cats) => [...cats, savedCategory]);
		} else {
			// Update existing category - employerId required for work categories only
			savedCategory = {
				...category!,
				name: trimmedName,
				employerId: isAbsenceCategory ? null : selectedEmployerId,
				updatedAt: now
			};
			// Update store immediately for instant UI feedback
			categories.update((cats) =>
				cats.map((cat) => (cat.id === category!.id ? savedCategory : cat))
			);
		}

		// Close dialog immediately - don't wait for DB write
		onsave?.(savedCategory);

		// Persist to DB in background (fire-and-forget)
		put('categories', savedCategory).catch((err) => {
			console.error('[CategoryDialog] Save failed:', err);
		});
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal title={dialogTitle} onclose={handleClose}>
	<div class="category-form">
		<div class="field">
			<label for="category-name">Name:</label>
			<input
				type="text"
				id="category-name"
				data-testid="category-name-input"
				bind:value={name}
				class="tt-text-input"
				disabled={isSystemCategory}
			/>
		</div>

		{#if !isAbsenceCategory}
			<div class="field">
				<label for="category-employer">Arbeitgeber:</label>
				<select
					id="category-employer"
					data-testid="category-employer-select"
					bind:value={selectedEmployerId}
					class="tt-dropdown"
					disabled={isSystemCategory}
				>
					<option value="" disabled>Arbeitgeber auswählen...</option>
					{#each employers as employer (employer.id)}
						<option value={employer.id}>{employer.name}</option>
					{/each}
				</select>
			</div>
		{/if}

		{#if isSystemCategory}
			<p class="info">Systemkategorien können nicht bearbeitet werden.</p>
		{/if}

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="actions">
			<button type="button" class="tt-button-secondary" onclick={handleClose}>
				{isSystemCategory ? 'Schließen' : 'Abbrechen'}
			</button>
			{#if !isSystemCategory}
				<button
					type="button"
					class="tt-button-primary"
					data-testid="save-category-btn"
					onclick={handleSave}
				>
					Speichern
				</button>
			{/if}
		</div>
	</div>
</Modal>

<style>
	.category-form {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.field label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	/* Inputs use design system classes: .tt-text-input, .tt-dropdown */

	.info {
		margin: 0;
		padding: var(--tt-space-8);
		background: var(--tt-background-card-hover);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		color: var(--tt-text-muted);
		font-size: 0.9rem;
	}

	.error {
		margin: 0;
		padding: var(--tt-space-8);
		background: var(--tt-status-danger-faded);
		border: 1px solid var(--tt-status-danger);
		border-radius: var(--tt-radius-input);
		color: var(--tt-status-danger);
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
		padding-top: var(--tt-space-8);
		border-top: 1px solid var(--tt-border-default);
	}

	/* Buttons use design system classes: .tt-button-primary, .tt-button-secondary */
</style>
