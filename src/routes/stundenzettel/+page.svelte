<!--
  Stundenzettel Export Page
  
  Full-page export interface for generating Stundenzettel (time sheets)
  for a specific employer and date range.
  
  Uses DayPicker dialogs for date selection (same as day page).
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getActiveEmployers } from '$lib/storage/employers';
	import { getEntriesByDateRange } from '$lib/storage/db';
	import { getAllCategories } from '$lib/storage/categories';
	import type { Employer, TimeEntry, Category } from '$lib/types';
	import { SvelteSet } from 'svelte/reactivity';
	import CustomDropdown from '$lib/components/CustomDropdown.svelte';
	import DayPicker from '$lib/components/DayPicker.svelte';
	import { userFullName } from '$lib/stores/user';
	import { timeEntries } from '$lib/stores';
	import { formatDate } from '$lib/utils/date';
	import {
		exportStundenzettelExcel,
		exportStundenzettelPdf,
		type ExportData,
		type ProcessedEntry
	} from '$lib/export/stundenzettel-export';

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
	let selectedEmployerId = $state('');
	let startDate = $state(getDefaultStartDate());
	let endDate = $state(getDefaultEndDate());
	let selectedColumns = $state(
		new SvelteSet<ColumnId>(
			AVAILABLE_COLUMNS.filter((col) => col.defaultSelected).map((col) => col.id)
		)
	);

	let entries = $state<TimeEntry[]>([]);
	let processedEntries = $state<ProcessedEntry[]>([]);
	let loading = $state(false);
	let error = $state('');
	let isExporting = $state(false);

	// Day picker dialog states
	let showStartDatePicker = $state(false);
	let showEndDatePicker = $state(false);

	function getDefaultStartDate(): Date {
		// Pre-select first day of last month
		const today = new Date();
		return new Date(today.getFullYear(), today.getMonth() - 1, 1);
	}

	function getDefaultEndDate(): Date {
		// Pre-select last day of last month
		const today = new Date();
		return new Date(today.getFullYear(), today.getMonth(), 0);
	}

	// Computed: employer options for dropdown
	let employerOptions = $derived(
		employers.map((emp) => ({
			value: emp.id,
			label: emp.name
		}))
	);

	function formatDisplayDate(dateStr: string): string {
		const [year, month, day] = dateStr.split('-');
		return `${day}.${month}.${year}`;
	}

	function calculateDuration(startTime: string, endTime: string | null): string {
		if (!endTime) return '-';
		const [startH, startM] = startTime.split(':').map(Number);
		const [endH, endM] = endTime.split(':').map(Number);
		const startMinutes = startH * 60 + startM;
		const endMinutes = endH * 60 + endM;
		const durationMinutes = endMinutes - startMinutes;
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
			console.error('[StundenzettelPage] Failed to load employers:', err);
			error = 'Fehler beim Laden der Arbeitgeber';
		}
	}

	async function loadCategories() {
		try {
			categories = await getAllCategories();
		} catch (err) {
			console.error('[StundenzettelPage] Failed to load categories:', err);
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
			const startISO = formatDate(startDate, 'ISO');
			const endISO = formatDate(endDate, 'ISO');
			const allEntries = await getEntriesByDateRange<TimeEntry>('timeEntries', startISO, endISO);

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
			console.error('[StundenzettelPage] Failed to load entries:', err);
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
			startDate: formatDate(startDate, 'ISO'),
			endDate: formatDate(endDate, 'ISO'),
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
			console.log('[StundenzettelPage] Excel export completed');
		} catch (err) {
			console.error('[StundenzettelPage] Excel export failed:', err);
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
			console.log('[StundenzettelPage] PDF export completed');
		} catch (err) {
			console.error('[StundenzettelPage] PDF export failed:', err);
			error = 'Export fehlgeschlagen. Bitte erneut versuchen.';
		} finally {
			isExporting = false;
		}
	}

	// Day picker handlers
	function handleStartDateSelect(date: Date) {
		startDate = date;
		showStartDatePicker = false;
	}

	function handleEndDateSelect(date: Date) {
		endDate = date;
		showEndDatePicker = false;
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

<svelte:head>
	<title>Stundenzettel | TimeTracker</title>
</svelte:head>

<div class="stundenzettel-page">
	<main class="page-content">
		<!-- User Name Display -->
		<div class="user-info">
			<span class="user-label">Name:</span>
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

		<!-- Date Range with DayPicker buttons -->
		<div class="date-range">
			<div class="date-field">
				<span class="date-field__label">Von:</span>
				<button
					class="tt-date-selector-button tt-interactive-card"
					onclick={() => (showStartDatePicker = true)}
				>
					<span class="tt-date-selector-button__date">{formatDate(startDate, 'DE')}</span>
				</button>
			</div>
			<div class="date-field">
				<span class="date-field__label">Bis:</span>
				<button
					class="tt-date-selector-button tt-interactive-card"
					onclick={() => (showEndDatePicker = true)}
				>
					<span class="tt-date-selector-button__date">{formatDate(endDate, 'DE')}</span>
				</button>
			</div>
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
									<th>Eintrag</th>
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
										<td>{entry.description}</td>
									{/if}
								</tr>
							{/each}
							{#if processedEntries.length > 5}
								<tr class="more-entries">
									<td colspan="6">... und {processedEntries.length - 5} weitere Einträge</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

		<!-- Error Message -->
		{#if error}
			<p class="error">{error}</p>
		{/if}

		<!-- Export Actions -->
		<div class="export-actions">
			<button
				class="tt-button-secondary tt-button-full"
				onclick={handleExcelExport}
				disabled={isExporting || processedEntries.length === 0}
			>
				{isExporting ? 'Exportiere...' : 'Excel exportieren'}
			</button>
			<button
				class="tt-button-primary tt-button-full"
				onclick={handlePdfExport}
				disabled={isExporting || processedEntries.length === 0}
			>
				{isExporting ? 'Exportiere...' : 'PDF exportieren'}
			</button>
		</div>
	</main>
</div>

<!-- Start Date Picker -->
{#if showStartDatePicker}
	<DayPicker
		currentDate={startDate}
		timeEntries={$timeEntries}
		onselect={handleStartDateSelect}
		onclose={() => (showStartDatePicker = false)}
	/>
{/if}

<!-- End Date Picker -->
{#if showEndDatePicker}
	<DayPicker
		currentDate={endDate}
		timeEntries={$timeEntries}
		onselect={handleEndDateSelect}
		onclose={() => (showEndDatePicker = false)}
	/>
{/if}

<style>
	.stundenzettel-page {
		min-height: 100vh;
		max-width: 100vw;
		overflow-x: hidden;
		background: var(--tt-background-page);
		display: flex;
		flex-direction: column;
	}

	.page-content {
		flex: 1;
		padding: var(--tt-space-16);
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
		max-width: 600px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		padding: var(--tt-space-12);
		background: var(--tt-background-card);
		border-radius: var(--tt-radius-card);
	}

	.user-label {
		font-weight: 500;
		color: var(--tt-text-muted);
	}

	.user-name {
		color: var(--tt-text-primary);
	}

	.user-name-warning {
		color: var(--tt-status-warning-500);
		font-style: italic;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

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

	.date-field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.date-field__label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
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

	.loading,
	.no-entries {
		padding: var(--tt-space-16);
		text-align: center;
		color: var(--tt-text-muted);
		background: var(--tt-background-card-hover);
		border-radius: var(--tt-radius-input);
	}

	.preview-table-container {
		overflow-x: auto;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
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
		color: var(--tt-text-muted);
	}

	.preview-table td {
		color: var(--tt-text-primary);
	}

	.more-entries td {
		text-align: center;
		font-style: italic;
		color: var(--tt-text-muted);
	}

	.error {
		margin: 0;
		padding: var(--tt-space-12);
		background: var(--tt-status-danger-800);
		border: 1px solid var(--tt-status-danger-500);
		border-radius: var(--tt-radius-input);
		color: var(--tt-status-danger-500);
		font-size: var(--tt-font-size-body);
	}

	.export-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--tt-space-12);
	}
</style>
