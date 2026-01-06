<!--
  ImportExcelModal - Modal for importing time entries from Excel files
  
  Features:
  - File upload (.xlsx, .xlsm)
  - Preview of import data (records, dates, total hours)
  - Shows unknown activities that need to be created first
  - Import button to save entries
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { categories, timeEntries } from '$lib/stores';
	import { saveTimeEntry, saveUserCategory } from '$lib/storage/operations';
	import { getActiveEmployers } from '$lib/storage/employers';
	import type { Category, Employer } from '$lib/types';
	import {
		parseExcelWorkbook,
		buildCategoryMap,
		findUnknownActivities,
		convertToTimeEntries,
		type ImportPreview
	} from '$lib/import/excelImport';
	import Modal from './Modal.svelte';
	import CustomDropdown from './CustomDropdown.svelte';

	interface Props {
		onclose?: () => void;
	}

	let { onclose }: Props = $props();

	let selectedFile: File | null = $state(null);
	let preview: ImportPreview | null = $state(null);
	let unknownActivities: string[] = $state([]);
	let importing = $state(false);
	let importResult: {
		success: boolean;
		count: number;
		errors: string[];
		createdCategories: string[];
	} | null = $state(null);
	let parseError: string | null = $state(null);
	let employers = $state<Employer[]>([]);
	let selectedEmployerId = $state<string>('');

	// Convert employers to dropdown options
	let employerOptions = $derived([
		{ value: '', label: 'Kein Arbeitgeber (Alle)' },
		...employers.map((e) => ({ value: e.id, label: e.name }))
	]);

	onMount(async () => {
		employers = await getActiveEmployers();
	});

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			selectedFile = file;
			preview = null;
			importResult = null;
			parseError = null;
			unknownActivities = [];
			parseFile(file);
		}
	}

	async function parseFile(file: File) {
		try {
			parseError = null;
			preview = await parseExcelWorkbook(file);

			// Check for unknown activities
			const categoryMap = buildCategoryMap($categories);
			unknownActivities = findUnknownActivities(preview.records, categoryMap);
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
			// Auto-create missing categories first
			const createdCategories: string[] = [];
			let currentCategories = $categories;

			for (const activityName of unknownActivities) {
				const now = Date.now();
				const newCategory: Category = {
					id: crypto.randomUUID(),
					name: activityName,
					type: 'user',
					countsAsWorkTime: true,
					createdAt: now,
					updatedAt: now
				};
				await saveUserCategory(newCategory);
				currentCategories = [...currentCategories, newCategory];
				createdCategories.push(activityName);
			}

			// Update categories store if we created any
			if (createdCategories.length > 0) {
				categories.set(currentCategories);
			}

			// Now build category map with all categories (including newly created)
			const categoryMap = buildCategoryMap(currentCategories);
			const { entries, skipped } = convertToTimeEntries(preview.records, categoryMap);

			// Assign selected employer to all entries
			const entriesWithEmployer = entries.map((entry) => ({
				...entry,
				employerId: selectedEmployerId || null
			}));

			// Save all entries
			for (const entry of entriesWithEmployer) {
				await saveTimeEntry(entry);
			}

			// Update store
			timeEntries.update((current) => [...current, ...entriesWithEmployer]);

			importResult = {
				success: true,
				count: entries.length,
				errors: skipped.length > 0 ? [`${skipped.length} Einträge übersprungen`] : [],
				createdCategories
			};
		} catch (e) {
			importResult = {
				success: false,
				count: 0,
				errors: [e instanceof Error ? e.message : 'Import fehlgeschlagen'],
				createdCategories: []
			};
		} finally {
			importing = false;
		}
	}

	function formatMinutes(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal title="Excel-Import" onclose={handleClose}>
	<div class="import-modal">
		<!-- Employer Selection -->
		<div class="employer-section">
			<label for="import-employer">Arbeitgeber für importierte Zeitdaten:</label>
			<CustomDropdown
				options={employerOptions}
				value={selectedEmployerId}
				onchange={(id) => (selectedEmployerId = id)}
			/>
		</div>

		<!-- File Upload -->
		<div class="upload-section">
			<label class="upload-label">
				<input type="file" accept=".xlsx,.xlsm" onchange={handleFileSelect} class="file-input" />
				<span class="upload-btn">
					{selectedFile ? selectedFile.name : 'Excel-Datei auswählen (.xlsx, .xlsm)'}
				</span>
			</label>
		</div>

		<!-- Parse Error -->
		{#if parseError}
			<div class="error-box">
				<p>{parseError}</p>
			</div>
		{/if}

		<!-- Preview -->
		{#if preview}
			<div class="preview-section">
				<h3>Vorschau</h3>

				<!-- Stats -->
				<div class="stats">
					<div class="stat">
						<span class="stat-value">{preview.records.length}</span>
						<span class="stat-label">Einträge</span>
					</div>
					<div class="stat">
						<span class="stat-value">{preview.uniqueDates}</span>
						<span class="stat-label">Tage</span>
					</div>
					<div class="stat">
						<span class="stat-value">{formatMinutes(preview.totalMinutes)}</span>
						<span class="stat-label">Gesamt</span>
					</div>
				</div>

				<!-- Parse Errors -->
				{#if preview.errors.length > 0}
					<div class="warning-box">
						<p class="warning-title">Warnungen:</p>
						<ul>
							{#each preview.errors.slice(0, 5) as error, i (i)}
								<li>{error}</li>
							{/each}
							{#if preview.errors.length > 5}
								<li>... und {preview.errors.length - 5} weitere</li>
							{/if}
						</ul>
					</div>
				{/if}

				<!-- Unknown Activities (info, will be auto-created) -->
				{#if unknownActivities.length > 0}
					<div class="info-box">
						<p class="info-title">Neue Tätigkeiten:</p>
						<p class="info-hint">Diese Tätigkeiten werden beim Import automatisch angelegt:</p>
						<ul>
							{#each unknownActivities as activity (activity)}
								<li>{activity}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Import Result -->
		{#if importResult}
			<div class={importResult.success ? 'success-box' : 'error-box'}>
				{#if importResult.success}
					<p>✓ {importResult.count} Einträge erfolgreich importiert!</p>
					{#if importResult.createdCategories.length > 0}
						<p class="created-categories">
							Neue Tätigkeiten angelegt: {importResult.createdCategories.join(', ')}
						</p>
					{/if}
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
			<button type="button" class="tt-button-secondary" onclick={handleClose}>
				{importResult?.success ? 'Schließen' : 'Abbrechen'}
			</button>
			{#if preview && !importResult?.success}
				<button type="button" class="tt-button-primary" onclick={handleImport} disabled={importing}>
					{#if importing}
						Importiere...
					{:else}
						Import starten ({preview.records.length} Einträge)
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
		gap: var(--tt-space-16);
	}

	.employer-section {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.employer-section label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.employer-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
		font-size: var(--tt-font-size-body);
	}

	.employer-select:focus {
		outline: none;
		border-color: var(--tt-border-focus);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-800);
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
		background: var(--tt-background-card);
		border: 2px dashed var(--tt-border-default);
		border-radius: var(--tt-radius-button);
		color: var(--tt-text-primary);
		font-size: var(--tt-font-size-body);
		transition: all 0.2s;
	}

	.upload-btn:hover {
		background: var(--tt-state-hover);
		border-color: var(--tt-brand-primary-500);
	}

	.preview-section {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-12);
	}

	.preview-section h3 {
		margin: 0;
		font-size: var(--tt-font-size-normal);
		font-weight: 600;
		color: var(--tt-text-primary);
	}

	.stats {
		display: flex;
		gap: var(--tt-space-16);
		justify-content: center;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--tt-brand-primary-800);
		border: 1px solid var(--tt-brand-primary-500);
		border-radius: var(--tt-radius-card);
		min-width: 80px;
	}

	.stat-value {
		font-size: var(--tt-font-size-title);
		font-weight: 600;
		color: var(--tt-brand-primary-500);
	}

	.stat-label {
		font-size: var(--tt-font-size-tiny);
		color: var(--tt-text-muted);
	}

	.warning-box {
		padding: var(--tt-space-12);
		background: var(--tt-status-warning-50);
		border: 1px solid var(--tt-status-warning-500);
		border-radius: var(--tt-radius-card);
	}

	.warning-title {
		margin: 0 0 0.5rem 0;
		font-weight: 600;
		color: var(--tt-status-warning-500);
	}

	.warning-box ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: var(--tt-font-size-small);
		color: var(--tt-status-warning-500);
	}

	.error-box {
		padding: var(--tt-space-12);
		background: var(--tt-status-danger-800);
		border: 1px solid var(--tt-status-danger-500);
		border-radius: var(--tt-radius-card);
	}

	/* Info box for new categories */
	.info-box {
		padding: var(--tt-space-12);
		background: var(--tt-brand-primary-800);
		border: 1px solid var(--tt-brand-primary-500);
		border-radius: var(--tt-radius-card);
	}

	.info-title {
		margin: 0 0 0.25rem 0;
		font-weight: 600;
		color: var(--tt-brand-primary-500);
	}

	.info-hint {
		margin: 0 0 0.5rem 0;
		font-size: var(--tt-font-size-small);
		color: var(--tt-brand-primary-500);
	}

	.info-box ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: var(--tt-font-size-small);
		color: var(--tt-brand-primary-500);
	}

	.error-box ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: var(--tt-font-size-small);
		color: var(--tt-status-danger-500);
	}

	.error-box p {
		margin: 0;
		color: var(--tt-status-danger-500);
	}

	.success-box {
		padding: var(--tt-space-12);
		background: var(--tt-status-success-800);
		border: 1px solid var(--tt-status-success-500);
		border-radius: var(--tt-radius-card);
	}

	.success-box p {
		margin: 0;
		color: var(--tt-status-success-500);
		font-weight: 500;
	}

	.success-box .created-categories {
		margin-top: 0.5rem;
		font-weight: 400;
		font-size: var(--tt-font-size-body);
	}

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--tt-border-default);
	}
</style>
