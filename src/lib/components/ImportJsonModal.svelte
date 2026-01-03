<!--
  ImportJsonModal - Modal for importing time entries from JSON backup files
  
  Features:
  - File upload (.json)
  - Preview of import data (categories, entries, models, day types)
  - Validation and error display
  - Import button to restore data
-->
<script lang="ts">
	import { categories, timeEntries, workTimeModels } from '$lib/stores';
	import {
		saveTimeEntry,
		saveUserCategory,
		saveDayType,
		saveWorkTimeModel
	} from '$lib/storage/operations';
	import { parseJsonFile, type ImportData } from '$lib/import/json-import';
	import Modal from './Modal.svelte';

	interface Props {
		onclose?: () => void;
	}

	let { onclose }: Props = $props();

	let selectedFile: File | null = $state(null);
	let preview: ImportData | null = $state(null);
	let importing = $state(false);
	let importResult: {
		success: boolean;
		count: number;
		errors: string[];
	} | null = $state(null);
	let parseError: string | null = $state(null);
	let warnings: string[] = $state([]);

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			selectedFile = file;
			preview = null;
			importResult = null;
			parseError = null;
			warnings = [];
			parseFile(file);
		}
	}

	async function parseFile(file: File) {
		try {
			parseError = null;
			const result = await parseJsonFile(file);

			if (!result.success) {
				parseError = result.errors.join(', ');
				preview = null;
				return;
			}

			preview = result.data!;
			warnings = result.warnings;
		} catch (e) {
			parseError = e instanceof Error ? e.message : 'Fehler beim Parsen der Datei';
			preview = null;
		}
	}

	async function handleImport() {
		if (!preview) return;

		importing = true;
		importResult = null;

		try {
			let importedCount = 0;

			// Import categories
			for (const category of preview.categories) {
				await saveUserCategory(category);
				importedCount++;
			}
			categories.set(preview.categories);

			// Import time entries
			for (const entry of preview.timeEntries) {
				await saveTimeEntry(entry);
				importedCount++;
			}
			timeEntries.set(preview.timeEntries);

			// Import day types (saved to DB only, no store)
			for (const dayType of preview.dayTypes) {
				await saveDayType(dayType);
				importedCount++;
			}

			// Import work time models
			for (const model of preview.workTimeModels) {
				await saveWorkTimeModel(model);
				importedCount++;
			}
			workTimeModels.set(preview.workTimeModels);

			importResult = {
				success: true,
				count: importedCount,
				errors: []
			};
		} catch (e) {
			importResult = {
				success: false,
				count: 0,
				errors: [e instanceof Error ? e.message : 'Import fehlgeschlagen']
			};
		} finally {
			importing = false;
		}
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal title="JSON-Import" onclose={handleClose}>
	<div class="import-modal">
		<!-- File Upload -->
		<div class="upload-section">
			<label class="upload-label">
				<input type="file" accept=".json" onchange={handleFileSelect} class="file-input" />
				<span class="upload-btn">
					{selectedFile ? selectedFile.name : 'JSON-Datei auswählen (.json)'}
				</span>
			</label>
		</div>

		<!-- Parse Error -->
		{#if parseError}
			<div class="error-box">
				<p>{parseError}</p>
			</div>
		{/if}

		<!-- Warnings -->
		{#if warnings.length > 0}
			<div class="warning-box">
				<p class="warning-title">Warnungen:</p>
				<ul>
					{#each warnings as warning, i (i)}
						<li>{warning}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Preview -->
		{#if preview}
			<div class="preview-section">
				<h3>Vorschau</h3>

				<!-- Stats -->
				<div class="stats">
					<div class="stat">
						<span class="stat-value">{preview.timeEntries.length}</span>
						<span class="stat-label">Zeiteinträge</span>
					</div>
					<div class="stat">
						<span class="stat-value">{preview.categories.length}</span>
						<span class="stat-label">Kategorien</span>
					</div>
					<div class="stat">
						<span class="stat-value">{preview.dayTypes.length}</span>
						<span class="stat-label">Tagestypen</span>
					</div>
					<div class="stat">
						<span class="stat-value">{preview.workTimeModels.length}</span>
						<span class="stat-label">Modelle</span>
					</div>
				</div>

				<div class="info-box">
					<p class="info-title">⚠️ Achtung:</p>
					<p class="info-hint">
						Der Import überschreibt alle vorhandenen Daten. Stelle sicher, dass du ein aktuelles
						Backup hast.
					</p>
				</div>
			</div>
		{/if}

		<!-- Import Result -->
		{#if importResult}
			<div class={importResult.success ? 'success-box' : 'error-box'}>
				{#if importResult.success}
					<p>✓ Daten erfolgreich importiert!</p>
					<p class="result-details">
						{preview?.timeEntries.length} Zeiteinträge, {preview?.categories.length} Kategorien, {preview
							?.dayTypes.length} Tagestypen, {preview?.workTimeModels.length} Modelle
					</p>
				{:else}
					<p>Import fehlgeschlagen:</p>
					<ul>
						{#each importResult.errors as error, i (i)}
							<li>{error}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}

		<!-- Actions -->
		<div class="actions">
			<button type="button" class="btn-secondary" onclick={handleClose}>
				{importResult?.success ? 'Schließen' : 'Abbrechen'}
			</button>
			{#if preview && !importResult?.success}
				<button type="button" class="btn-primary" onclick={handleImport} disabled={importing}>
					{#if importing}
						Importiere...
					{:else}
						Import starten
					{/if}
				</button>
			{/if}
		</div>
	</div>
</Modal>

<style>
	.import-modal {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.upload-section {
		display: flex;
		justify-content: center;
	}

	.upload-label {
		cursor: pointer;
	}

	.file-input {
		display: none;
	}

	.upload-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--tt-background-card-hover);
		border: 2px dashed var(--tt-border-default);
		border-radius: var(--tt-radius-button);
		color: var(--tt-text-primary);
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.upload-btn:hover {
		background: var(--tt-background-card-hover);
		border-color: var(--tt-brand-primary);
	}

	.preview-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.preview-section h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--tt-text-primary);
	}

	.stats {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--tt-brand-primary-faded);
		border: 1px solid var(--tt-brand-primary);
		border-radius: var(--tt-radius-card);
		min-width: 80px;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--tt-brand-primary);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--tt-text-muted);
	}

	.warning-box {
		padding: 0.75rem;
		background: var(--tt-status-warning-faded);
		border: 1px solid var(--tt-status-warning);
		border-radius: var(--tt-radius-card);
	}

	.warning-title {
		margin: 0 0 0.5rem 0;
		font-weight: 600;
		color: var(--tt-status-warning);
	}

	.warning-box ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.85rem;
		color: var(--tt-status-warning);
	}

	.error-box {
		padding: 0.75rem;
		background: var(--tt-status-danger-faded);
		border: 1px solid var(--tt-status-danger);
		border-radius: var(--tt-radius-card);
	}

	.info-box {
		padding: 0.75rem;
		background: var(--tt-status-warning-faded);
		border: 1px solid var(--tt-status-warning);
		border-radius: var(--tt-radius-card);
	}

	.info-title {
		margin: 0 0 0.25rem 0;
		font-weight: 600;
		color: var(--tt-status-warning);
	}

	.info-hint {
		margin: 0;
		font-size: 0.85rem;
		color: var(--tt-status-warning);
	}

	.error-box ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.85rem;
		color: var(--tt-status-danger);
	}

	.error-box p {
		margin: 0;
		color: var(--tt-status-danger);
	}

	.success-box {
		padding: 0.75rem;
		background: var(--tt-status-success-faded);
		border: 1px solid var(--tt-status-success);
		border-radius: var(--tt-radius-card);
	}

	.success-box p {
		margin: 0;
		color: var(--tt-status-success);
		font-weight: 500;
	}

	.success-box .result-details {
		margin-top: 0.5rem;
		font-weight: 400;
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

	.btn-secondary:hover {
		background: var(--tt-button-secondary-hover);
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
