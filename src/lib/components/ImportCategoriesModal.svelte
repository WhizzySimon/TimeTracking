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

	onMount(async () => {
		employers = await getAllEmployers();
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
				selectedEmployerId || undefined
			);

			let importedCount = 0;
			for (const cat of toImport) {
				try {
					await addUserCategory(
						cat.name,
						cat.countsAsWorkTime,
						selectedEmployerId || undefined
					);
					importedCount++;
				} catch (e) {
					console.warn(`Failed to import category "${cat.name}":`, e);
				}
			}

			// Reload categories into store
			const allCategories = await getAll<Category>('categories');
			categories.set(allCategories);

			result = { imported: importedCount, skipped: skippedCount };

			if (importedCount > 0) {
				// Auto-close after short delay if successful
				setTimeout(() => {
					onsave();
				}, 1500);
			}
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
				<select id="employer-dropdown" class="employer-dropdown" bind:value={selectedEmployerId}>
					<option value="">Alle Arbeitgeber</option>
					{#each employers.filter((e) => e.isActive) as employer (employer.id)}
						<option value={employer.id}>{employer.name}</option>
					{/each}
				</select>
			</div>
		{/if}

		<div class="file-upload">
			<label class="file-label">
				<input type="file" accept=".txt,.csv" onchange={handleFileUpload} />
				<span class="file-btn">Datei auswählen</span>
			</label>
		</div>

		<div class="text-input">
			<label for="categories-text">Oder direkt eingeben:</label>
			<textarea
				id="categories-text"
				bind:value={textInput}
				placeholder="Kategorie 1, Kategorie 2, Kategorie 3"
				rows="4"
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
		gap: 1rem;
	}

	.hint {
		font-size: 0.9rem;
		color: var(--muted);
		background: var(--surface-hover);
		padding: 0.75rem;
		border-radius: var(--r-input);
	}

	.employer-select {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.employer-select label {
		font-size: 0.9rem;
		color: var(--text);
	}

	.employer-dropdown {
		padding: 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		background: var(--input-bg);
		color: var(--input-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.employer-dropdown:focus {
		outline: none;
		border-color: var(--input-focus-border);
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
		border: 1px solid var(--accent);
		border-radius: var(--r-btn);
		background: var(--surface);
		color: var(--accent);
		font-size: 0.9rem;
		cursor: pointer;
	}

	.file-btn:hover {
		background: var(--accent-light);
	}

	.text-input {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.text-input label {
		font-size: 0.9rem;
		color: var(--text);
	}

	.text-input textarea {
		padding: 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
		background: var(--input-bg);
		color: var(--input-text);
	}

	.text-input textarea:focus {
		outline: none;
		border-color: var(--input-focus-border);
	}

	.error {
		color: var(--neg);
		font-size: 0.9rem;
		padding: 0.5rem;
		background: var(--neg-light);
		border-radius: var(--r-input);
	}

	.result {
		font-size: 0.9rem;
		padding: 0.75rem;
		background: var(--surface-hover);
		border-radius: var(--r-input);
		text-align: center;
		color: var(--text);
	}

	.result.success {
		background: var(--pos-light);
		color: var(--pos);
	}

	.skipped {
		color: var(--muted);
		font-size: 0.85rem;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.cancel-btn {
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--btn-secondary-border);
		border-radius: var(--r-btn);
		background: var(--btn-secondary-bg);
		color: var(--btn-secondary-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.cancel-btn:hover:not(:disabled) {
		background: var(--btn-secondary-hover);
	}

	.import-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--r-btn);
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.import-btn:hover:not(:disabled) {
		background: var(--btn-primary-hover);
	}

	.import-btn:disabled,
	.cancel-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
