<!--
  StundenzettelExport component - export time entries for a specific employer
  
  Spec refs:
  - multi-arbeitgeber.md Task A2.14
  
  Features:
  - Employer selector (required, no combined export)
  - Date range picker
  - Column selection checkboxes
  - Preview table
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getActiveEmployers } from '$lib/storage/employers';
	import { getEntriesByDateRange } from '$lib/storage/db';
	import { getAllCategories } from '$lib/storage/categories';
	import type { Employer, TimeEntry, Category } from '$lib/types';
	import { SvelteSet } from 'svelte/reactivity';
	import Modal from './Modal.svelte';
	import {
		exportStundenzettelExcel,
		exportStundenzettelPdf,
		type ExportData,
		type ProcessedEntry
	} from '$lib/export/stundenzettel-export';

	interface Props {
		onclose: () => void;
		onexport?: (data: ExportData) => void;
	}

	let { onclose, onexport }: Props = $props();

	// Available columns for export
	const AVAILABLE_COLUMNS = [
		{ id: 'date', label: 'Datum', defaultSelected: true },
		{ id: 'category', label: 'Kategorie', defaultSelected: true },
		{ id: 'startTime', label: 'Von', defaultSelected: true },
		{ id: 'endTime', label: 'Bis', defaultSelected: true },
		{ id: 'duration', label: 'Dauer', defaultSelected: true },
		{ id: 'description', label: 'Beschreibung', defaultSelected: false }
	] as const;

	type ColumnId = (typeof AVAILABLE_COLUMNS)[number]['id'];

	// State
	let employers = $state<Employer[]>([]);
	let categories = $state<Category[]>([]);
	let selectedEmployerId = $state<string>('');
	let startDate = $state(getDefaultStartDate());
	let endDate = $state(getDefaultEndDate());
	let selectedColumns = new SvelteSet<ColumnId>(
		AVAILABLE_COLUMNS.filter((col) => col.defaultSelected).map((col) => col.id)
	);
	let entries = $state<TimeEntry[]>([]);
	let processedEntries = $state<ProcessedEntry[]>([]);
	let loading = $state(false);
	let isExporting = $state(false);
	let error = $state('');

	function getDefaultStartDate(): string {
		const today = new Date();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
	}

	function getDefaultEndDate(): string {
		const today = new Date();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
	}

	function formatDisplayDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function calculateDuration(startTime: string, endTime: string | null): string {
		if (!endTime) return '-';
		const [startHours, startMinutes] = startTime.split(':').map(Number);
		const [endHours, endMinutes] = endTime.split(':').map(Number);
		const startTotalMinutes = startHours * 60 + startMinutes;
		const endTotalMinutes = endHours * 60 + endMinutes;
		const durationMinutes = endTotalMinutes - startTotalMinutes;
		if (durationMinutes < 0) return '-';
		const hours = Math.floor(durationMinutes / 60);
		const minutes = durationMinutes % 60;
		return `${hours}:${minutes.toString().padStart(2, '0')}`;
	}

	function getCategoryName(categoryId: string): string {
		const category = categories.find((cat) => cat.id === categoryId);
		return category?.name ?? 'Unbekannt';
	}

	function toggleColumn(columnId: ColumnId) {
		if (selectedColumns.has(columnId)) {
			selectedColumns.delete(columnId);
		} else {
			selectedColumns.add(columnId);
		}
	}

	async function loadEmployers() {
		try {
			employers = await getActiveEmployers();
			if (employers.length > 0 && !selectedEmployerId) {
				selectedEmployerId = employers[0].id;
			}
		} catch (err) {
			console.error('[StundenzettelExport] Failed to load employers:', err);
			error = 'Fehler beim Laden der Arbeitgeber';
		}
	}

	async function loadCategories() {
		try {
			categories = await getAllCategories();
		} catch (err) {
			console.error('[StundenzettelExport] Failed to load categories:', err);
		}
	}

	async function loadEntries() {
		if (!selectedEmployerId || !startDate || !endDate) {
			entries = [];
			processedEntries = [];
			return;
		}

		loading = true;
		error = '';

		try {
			const allEntries = await getEntriesByDateRange<TimeEntry>('timeEntries', startDate, endDate);

			// Filter by employer
			entries = allEntries.filter((entry) => entry.employerId === selectedEmployerId);

			// Sort by date and start time
			entries.sort((entryA, entryB) => {
				const dateCompare = entryA.date.localeCompare(entryB.date);
				if (dateCompare !== 0) return dateCompare;
				return entryA.startTime.localeCompare(entryB.startTime);
			});

			// Process entries for display
			processedEntries = entries.map((entry) => ({
				date: formatDisplayDate(entry.date),
				category: getCategoryName(entry.categoryId),
				startTime: entry.startTime,
				endTime: entry.endTime ?? '-',
				duration: calculateDuration(entry.startTime, entry.endTime),
				description: entry.description ?? ''
			}));
		} catch (err) {
			console.error('[StundenzettelExport] Failed to load entries:', err);
			error = 'Fehler beim Laden der Einträge';
		} finally {
			loading = false;
		}
	}

	function getSelectedEmployerName(): string {
		const employer = employers.find((emp) => emp.id === selectedEmployerId);
		return employer?.name ?? '';
	}

	function buildExportData(): ExportData {
		return {
			employerId: selectedEmployerId,
			employerName: getSelectedEmployerName(),
			startDate,
			endDate,
			columns: Array.from(selectedColumns),
			entries: processedEntries
		};
	}

	async function handleExcelExport() {
		if (!selectedEmployerId || processedEntries.length === 0) {
			return;
		}

		isExporting = true;
		try {
			const exportData = buildExportData();
			await exportStundenzettelExcel(exportData);
			console.log('[StundenzettelExport] Excel export completed');
			onexport?.(exportData);
		} catch (err) {
			console.error('[StundenzettelExport] Excel export failed:', err);
			error = 'Export fehlgeschlagen. Bitte erneut versuchen.';
		} finally {
			isExporting = false;
		}
	}

	async function handlePdfExport() {
		if (!selectedEmployerId || processedEntries.length === 0) {
			return;
		}

		isExporting = true;
		try {
			const exportData = buildExportData();
			await exportStundenzettelPdf(exportData);
			console.log('[StundenzettelExport] PDF export completed');
			onexport?.(exportData);
		} catch (err) {
			console.error('[StundenzettelExport] PDF export failed:', err);
			error = 'Export fehlgeschlagen. Bitte erneut versuchen.';
		} finally {
			isExporting = false;
		}
	}

	// Load data on mount
	onMount(() => {
		loadEmployers();
		loadCategories();
	});

	// Reload entries when filters change
	$effect(() => {
		if (selectedEmployerId && startDate && endDate && categories.length > 0) {
			loadEntries();
		}
	});
</script>

<Modal title="Stundenzettel exportieren" {onclose}>
	<div class="export-form">
		<!-- Employer Selection -->
		<div class="field">
			<label for="employer-select">Arbeitgeber:</label>
			{#if employers.length === 0}
				<p class="no-employers">
					Keine Arbeitgeber vorhanden. Erstelle zuerst einen Arbeitgeber in den Einstellungen.
				</p>
			{:else}
				<select id="employer-select" class="select-input" bind:value={selectedEmployerId}>
					{#each employers as employer (employer.id)}
						<option value={employer.id}>{employer.name}</option>
					{/each}
				</select>
			{/if}
		</div>

		<!-- Date Range -->
		<div class="date-range">
			<div class="field">
				<label for="start-date">Von:</label>
				<input type="date" id="start-date" class="date-input" bind:value={startDate} />
			</div>
			<div class="field">
				<label for="end-date">Bis:</label>
				<input type="date" id="end-date" class="date-input" bind:value={endDate} />
			</div>
		</div>

		<!-- Column Selection -->
		<div class="field">
			<span class="field-label">Spalten:</span>
			<div class="columns-grid">
				{#each AVAILABLE_COLUMNS as column (column.id)}
					<label class="column-checkbox">
						<input
							type="checkbox"
							checked={selectedColumns.has(column.id)}
							onchange={() => toggleColumn(column.id)}
						/>
						<span>{column.label}</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Preview Table -->
		<div class="preview-section">
			<span class="field-label"
				>Vorschau ({processedEntries.length}
				{processedEntries.length === 1 ? 'Eintrag' : 'Einträge'}):</span
			>
			{#if loading}
				<div class="loading" role="alert" aria-live="assertive">Laden...</div>
			{:else if processedEntries.length === 0}
				<div class="no-entries" role="alert" aria-live="assertive">
					Keine Einträge im gewählten Zeitraum
				</div>
			{:else}
				<div class="preview-table-container">
					<table class="preview-table">
						<thead>
							<tr>
								{#if selectedColumns.has('date')}
									<th>Datum</th>
								{/if}
								{#if selectedColumns.has('category')}
									<th>Kategorie</th>
								{/if}
								{#if selectedColumns.has('startTime')}
									<th>Von</th>
								{/if}
								{#if selectedColumns.has('endTime')}
									<th>Bis</th>
								{/if}
								{#if selectedColumns.has('duration')}
									<th>Dauer</th>
								{/if}
								{#if selectedColumns.has('description')}
									<th>Beschreibung</th>
								{/if}
							</tr>
						</thead>
						<tbody>
							{#each processedEntries.slice(0, 5) as entry (entry.date + entry.startTime)}
								<tr>
									{#if selectedColumns.has('date')}
										<td>{entry.date}</td>
									{/if}
									{#if selectedColumns.has('category')}
										<td>{entry.category}</td>
									{/if}
									{#if selectedColumns.has('startTime')}
										<td>{entry.startTime}</td>
									{/if}
									{#if selectedColumns.has('endTime')}
										<td>{entry.endTime}</td>
									{/if}
									{#if selectedColumns.has('duration')}
										<td>{entry.duration}</td>
									{/if}
									{#if selectedColumns.has('description')}
										<td class="description-cell">{entry.description || '-'}</td>
									{/if}
								</tr>
							{/each}
							{#if processedEntries.length > 5}
								<tr class="more-rows">
									<td colspan={selectedColumns.size}>
										... und {processedEntries.length - 5} weitere {processedEntries.length - 5 === 1
											? 'Eintrag'
											: 'Einträge'}
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<!-- Actions -->
		<div class="actions">
			<button type="button" class="btn-secondary" onclick={onclose}> Abbrechen </button>
			<button
				type="button"
				class="btn-primary"
				onclick={handlePdfExport}
				disabled={employers.length === 0 || loading || isExporting || processedEntries.length === 0}
			>
				{isExporting ? 'Exportiere...' : 'PDF exportieren'}
			</button>
			<button
				type="button"
				class="btn-primary"
				onclick={handleExcelExport}
				disabled={employers.length === 0 || loading || isExporting || processedEntries.length === 0}
			>
				{isExporting ? 'Exportiere...' : 'Excel exportieren'}
			</button>
		</div>
	</div>
</Modal>

<style>
	.export-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field label,
	.field-label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
	}

	.select-input,
	.date-input {
		padding: 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
	}

	.select-input:focus,
	.date-input:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: 0 0 0 2px var(--accent-light);
	}

	.no-employers {
		margin: 0;
		padding: 0.75rem;
		background: var(--surface-hover);
		border-radius: var(--r-input);
		color: var(--muted);
		font-size: 0.9rem;
	}

	.date-range {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.columns-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.column-checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--r-input);
		cursor: pointer;
		font-size: 0.9rem;
	}

	.column-checkbox:hover {
		background: var(--surface-hover);
	}

	.column-checkbox:has(input:checked) {
		border-color: var(--accent);
		background: var(--accent-light);
	}

	.column-checkbox input {
		margin: 0;
	}

	.preview-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preview-section .field-label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
	}

	.loading,
	.no-entries {
		padding: 1rem;
		text-align: center;
		color: var(--muted);
		background: var(--surface-hover);
		border-radius: var(--r-input);
		font-size: 0.9rem;
	}

	.preview-table-container {
		max-height: 200px;
		overflow: auto;
		border: 1px solid var(--border);
		border-radius: var(--r-input);
	}

	.preview-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
	}

	.preview-table th,
	.preview-table td {
		padding: 0.5rem;
		text-align: left;
		border-bottom: 1px solid var(--border);
	}

	.preview-table th {
		background: var(--surface-hover);
		font-weight: 600;
		position: sticky;
		top: 0;
	}

	.preview-table tbody tr:hover {
		background: var(--surface-hover);
	}

	.description-cell {
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.more-rows td {
		text-align: center;
		color: var(--muted);
		font-style: italic;
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
