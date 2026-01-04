<!--
  Import Categories Modal
  Allows importing categories from file or text input.
  
  Spec ref: ui-logic-spec-v1.md Section 11.2
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { categories } from '$lib/stores';
	import { addUserCategory, SYSTEM_CATEGORIES } from '$lib/storage/categories';
	import { prepareImport } from '$lib/utils/categoryIO';
	import { getAll } from '$lib/storage/db';
	import { getAllEmployers } from '$lib/storage/employers';
	import type { Category, Employer } from '$lib/types';
	import Modal from './Modal.svelte';
	import CustomDropdown from './CustomDropdown.svelte';

	interface Props {
		onclose: () => void;
		onsave: () => void;
	}

	let { onclose, onsave }: Props = $props();

	let textInput = $state('');
	let importing = $state(false);
	let result: { imported: number; skipped: number } | null = $state(null);
	let error = $state('');
	let employers = $state<Employer[]>([]);
	let selectedEmployerId = $state<string>('');

	// Convert employers to dropdown options (no "Alle" option - must select specific employer)
	let employerOptions = $derived(
		employers.filter((e) => e.isActive).map((e) => ({ value: e.id, label: e.name }))
	);

	onMount(async () => {
		employers = await getAllEmployers();
		// Pre-select first active employer
		const activeEmployers = employers.filter((e) => e.isActive);
		if (activeEmployers.length > 0) {
			selectedEmployerId = activeEmployers[0].id;
		}
	});

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			textInput = text;
		} catch (e) {
			error = 'Datei konnte nicht gelesen werden';
			console.error('File read error:', e);
		}
	}

	async function handleImport() {
		if (!textInput.trim()) {
			error = 'Bitte Kategorien eingeben oder Datei auswählen';
			return;
		}

		// STRICT: Require employer selection for category import
		if (!selectedEmployerId) {
			error = 'Bitte zuerst Arbeitgeber auswählen';
			return;
		}

		importing = true;
		error = '';
		result = null;

		try {
			const existingCategories = await getAll<Category>('categories');
			const systemNames = SYSTEM_CATEGORIES.map((c) => c.name);
			const { toImport, skippedCount } = prepareImport(
				textInput,
				existingCategories,
				systemNames,
				selectedEmployerId
			);

			let importedCount = 0;
			for (const cat of toImport) {
				try {
					await addUserCategory(cat.name, cat.countsAsWorkTime, selectedEmployerId);
					importedCount++;
				} catch (e) {
					console.warn(`Failed to import category "${cat.name}":`, e);
				}
			}

			// Reload categories into store
			const allCategories = await getAll<Category>('categories');
			categories.set(allCategories);

			result = { imported: importedCount, skipped: skippedCount };

			// Close immediately after import completes
			onsave();
		} catch (e) {
			error = 'Fehler beim Importieren';
			console.error('Import error:', e);
		} finally {
			importing = false;
		}
	}
</script>

<Modal title="Kategorien importieren" {onclose}>
	<div class="import-form">
		<div class="hint">Komma-getrennte Liste (z.B. Meeting, Projekt A, Verwaltung)</div>

		{#if employers.filter((e) => e.isActive).length > 0}
			<div class="employer-select">
				<label for="employer-dropdown">Arbeitgeber</label>
				<CustomDropdown
					options={employerOptions}
					value={selectedEmployerId}
					onchange={(id) => (selectedEmployerId = id)}
				/>
			</div>
		{/if}

		<div class="file-upload">
			<label class="file-label">
				<input type="file" accept=".txt,.csv" onchange={handleFileUpload} />
				<span class="file-btn">Datei auswählen</span>
			</label>
		</div>

		<div class="textarea-field">
			<label for="categories-text">Oder direkt eingeben:</label>
			<textarea
				id="categories-text"
				class="tt-textarea"
				bind:value={textInput}
				placeholder="Kategorie 1, Kategorie 2, Kategorie 3"
				rows="6"
				disabled={importing}
			></textarea>
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		{#if result}
			<div class="result" class:success={result.imported > 0}>
				{#if result.imported > 0}
					✓ {result.imported} Kategorie(n) importiert
				{/if}
				{#if result.skipped > 0}
					<span class="skipped">({result.skipped} übersprungen)</span>
				{/if}
				{#if result.imported === 0 && result.skipped > 0}
					Alle Kategorien bereits vorhanden
				{/if}
			</div>
		{/if}

		<div class="actions">
			<button type="button" class="cancel-btn" onclick={onclose} disabled={importing}>
				Abbrechen
			</button>
			<button
				type="button"
				class="import-btn"
				onclick={handleImport}
				disabled={importing || !textInput.trim()}
			>
				{importing ? 'Importiere...' : 'Importieren'}
			</button>
		</div>
	</div>
</Modal>

<style>
	.import-form {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	.hint {
		font-size: var(--tt-font-size-body);
		color: var(--tt-text-muted);
		background: var(--tt-background-card-hover);
		padding: var(--tt-space-12);
		border-radius: var(--tt-radius-input);
	}

	.employer-select {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.employer-select label {
		font-size: var(--tt-font-size-body);
		color: var(--tt-text-primary);
	}

	.file-upload {
		display: flex;
		justify-content: center;
	}

	.file-label {
		cursor: pointer;
	}

	.file-label input[type='file'] {
		display: none;
	}

	.file-btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		border: 1px solid var(--tt-brand-primary-500);
		border-radius: var(--tt-radius-button);
		background: var(--tt-background-card);
		color: var(--tt-brand-primary-500);
		font-size: var(--tt-font-size-body);
		cursor: pointer;
	}

	.file-btn:hover {
		background: var(--tt-state-hover);
	}

	.textarea-field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.textarea-field label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.tt-textarea {
		width: 100%;
		min-height: 120px;
		padding: var(--tt-space-12);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: var(--tt-font-size-normal);
		font-family: inherit;
		resize: vertical;
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
	}

	.tt-textarea:focus {
		outline: none;
		border-color: var(--tt-brand-primary-500);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-800);
	}

	.error {
		color: var(--tt-status-danger-500);
		font-size: var(--tt-font-size-body);
		padding: var(--tt-space-8);
		background: var(--tt-status-danger-800);
		border-radius: var(--tt-radius-input);
	}

	.result {
		font-size: var(--tt-font-size-body);
		padding: var(--tt-space-12);
		background: var(--tt-background-card-hover);
		border-radius: var(--tt-radius-input);
		text-align: center;
		color: var(--tt-text-primary);
	}

	.result.success {
		background: var(--tt-status-success-800);
		color: var(--tt-status-success-500);
	}

	.skipped {
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-small);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--tt-space-12);
		margin-top: 0.5rem;
	}

	.cancel-btn {
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--tt-button-secondary-border);
		border-radius: var(--tt-radius-button);
		background: var(--tt-button-secondary-bg);
		color: var(--tt-button-secondary-text);
		font-size: var(--tt-font-size-normal);
		cursor: pointer;
	}

	.cancel-btn:hover:not(:disabled) {
		background: var(--tt-button-secondary-hover);
	}

	.import-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--tt-radius-button);
		background: var(--tt-button-primary-bg);
		color: var(--tt-button-primary-text);
		font-size: var(--tt-font-size-normal);
		cursor: pointer;
	}

	.import-btn:hover:not(:disabled) {
		background: var(--tt-button-primary-hover);
	}

	.import-btn:disabled,
	.cancel-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
