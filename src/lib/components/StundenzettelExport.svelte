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
	import CustomDropdown from './CustomDropdown.svelte';
	import DateInput from './DateInput.svelte';
	import { userFullName } from '$lib/stores/user';
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
		{ id: 'category', label: 'Eintrag', defaultSelected: true },
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

	// Convert employers to dropdown options
	let employerOptions = $derived(employers.map((e) => ({ value: e.id, label: e.name })));
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
	let exportFormat: 'pdf' | 'excel' = $state('pdf');

	function getDefaultStartDate(): string {
		// Pre-select last complete month
		const today = new Date();
		const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
		return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`;
	}

	function getDefaultEndDate(): string {
		// Pre-select last day of last month
		const today = new Date();
		const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
		return `${lastDayOfLastMonth.getFullYear()}-${String(lastDayOfLastMonth.getMonth() + 1).padStart(2, '0')}-${String(lastDayOfLastMonth.getDate()).padStart(2, '0')}`;
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
		<!-- User Name Display -->
		<div class="user-name-display">
			{#if $userFullName}
				<span class="user-name">{$userFullName}</span>
			{:else}
				<span class="user-name-warning">Bitte Name im Abschnitt Konto festlegen</span>
			{/if}
		</div>

		<!-- Employer Selection -->
		{#if employers.length === 0}
			<div class="field">
				<label for="employer-select">Arbeitgeber:</label>
				<p class="no-employers">
					Keine Arbeitgeber vorhanden. Erstelle zuerst einen Arbeitgeber in den Einstellungen.
				</p>
			</div>
		{:else}
			<div class="tt-labeled-dropdown">
				<span class="tt-labeled-dropdown__label">Arbeitgeber</span>
				<CustomDropdown
					options={employerOptions}
					value={selectedEmployerId}
					onchange={(id) => (selectedEmployerId = id)}
				/>
			</div>
		{/if}

		<!-- Date Range -->
		<div class="date-range">
			<DateInput bind:value={startDate} label="Von:" id="start-date" />
			<DateInput bind:value={endDate} label="Bis:" id="end-date" />
		</div>

		<!-- Column Selection -->
		<div class="field">
			<span class="field-label">Spalten:</span>
			<div class="columns-grid">
				{#each AVAILABLE_COLUMNS as column (column.id)}
					<label class="tt-checkbox-label">
						<input
							type="checkbox"
							class="tt-checkbox"
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

		<!-- Export Format Selection -->
		<div class="field">
			<span class="field-label">Format:</span>
			<div class="format-options">
				<label class="format-radio">
					<input type="radio" name="export-format" value="pdf" bind:group={exportFormat} />
					<span>PDF</span>
				</label>
				<label class="format-radio">
					<input type="radio" name="export-format" value="excel" bind:group={exportFormat} />
					<span>Excel</span>
				</label>
			</div>
		</div>

		<!-- Actions -->
		<div class="actions">
			<button type="button" class="tt-button-secondary" onclick={onclose}> Abbrechen </button>
			<button
				type="button"
				class="tt-button-primary"
				onclick={() => (exportFormat === 'pdf' ? handlePdfExport() : handleExcelExport())}
				disabled={employers.length === 0 || loading || isExporting || processedEntries.length === 0}
			>
				{isExporting ? 'Exportiere...' : 'Exportieren'}
			</button>
		</div>
	</div>
</Modal>

<style>
	.export-form {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	.user-name-display {
		padding: var(--tt-space-12);
		background: var(--tt-background-card);
		border-radius: var(--tt-radius-card);
		text-align: center;
		font-weight: 500;
	}

	.user-name {
		color: var(--tt-text-primary);
		font-size: 1.1rem;
	}

	.user-name-warning {
		color: var(--tt-status-danger-500);
		font-size: var(--tt-font-size-body);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.field label,
	.field-label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.no-employers {
		margin: 0;
		padding: var(--tt-space-12);
		background: var(--tt-background-card-hover);
		border-radius: var(--tt-radius-input);
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-body);
	}

	.date-range {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--tt-space-12);
	}

	.columns-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--tt-space-8);
	}

	.preview-section {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.preview-section .field-label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.loading,
	.no-entries {
		padding: var(--tt-space-16);
		text-align: center;
		color: var(--tt-text-muted);
		background: var(--tt-background-card-hover);
		border-radius: var(--tt-radius-input);
		font-size: var(--tt-font-size-body);
	}

	.preview-table-container {
		max-height: 200px;
		overflow: auto;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
	}

	.preview-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--tt-font-size-small);
	}

	.preview-table th,
	.preview-table td {
		padding: var(--tt-space-8);
		text-align: left;
		border-bottom: 1px solid var(--tt-border-default);
	}

	.preview-table th {
		background: var(--tt-background-card-hover);
		font-weight: 600;
		position: sticky;
		top: 0;
	}

	.preview-table tbody tr:hover {
		background: var(--tt-state-hover);
	}

	.description-cell {
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.more-rows td {
		text-align: center;
		color: var(--tt-text-muted);
		font-style: italic;
	}

	.error {
		margin: 0;
		padding: var(--tt-space-8);
		background: var(--tt-status-danger-800);
		border: 1px solid var(--tt-status-danger-500);
		border-radius: var(--tt-radius-input);
		color: var(--tt-status-danger-500);
		font-size: var(--tt-font-size-body);
	}

	.format-options {
		display: flex;
		gap: var(--tt-space-16);
	}

	.format-radio {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		cursor: pointer;
		font-size: var(--tt-font-size-body);
	}

	.format-radio input[type='radio'] {
		cursor: pointer;
		width: 18px;
		height: 18px;
	}

	.format-radio span {
		user-select: none;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--tt-space-8);
		padding-top: 1rem;
		border-top: 1px solid var(--tt-border-default);
	}

	/* Uses design system classes: .tt-button-primary, .tt-button-secondary */
</style>
