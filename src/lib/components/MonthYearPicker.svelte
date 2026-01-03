<!--
  MonthYearPicker component - modal for selecting a month and year
  
  Features:
  - Year selector (limited by data range + next month)
  - Month selector
  - Quick button to go to current month
-->
<script lang="ts">
	import Modal from './Modal.svelte';
	import type { TimeEntry } from '$lib/types';

	interface Props {
		currentDate: Date;
		timeEntries?: TimeEntry[];
		onselect?: (date: Date) => void;
		onclose?: () => void;
	}

	let { currentDate, timeEntries = [], onselect, onclose }: Props = $props();

	// Month names in German
	const monthNames = [
		'Januar',
		'Februar',
		'März',
		'April',
		'Mai',
		'Juni',
		'Juli',
		'August',
		'September',
		'Oktober',
		'November',
		'Dezember'
	];

	// Initialize from props using functions to avoid state_referenced_locally warning
	function getInitialYear() {
		return currentDate.getFullYear();
	}
	function getInitialMonth() {
		return currentDate.getMonth();
	}

	let selectedYear = $state(getInitialYear());
	let selectedMonth = $state(getInitialMonth());

	// Calculate date range from time entries
	const now = new Date();
	const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0); // End of next month

	// Find earliest entry date - wrap in function to avoid state_referenced_locally warning
	function getEarliestDate(): Date {
		if (timeEntries.length > 0) {
			const dates = timeEntries
				.map((e) => new Date(e.date))
				.filter((d) => !isNaN(d.getTime()))
				.sort((a, b) => a.getTime() - b.getTime());
			if (dates.length > 0) {
				return dates[0];
			}
		}
		return now;
	}

	const earliestDate = getEarliestDate();

	// Year range
	const startYear = earliestDate.getFullYear();
	const endYear = nextMonth.getFullYear();
	const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

	// Get valid month range for a given year
	function getValidMonthRange(year: number): { min: number; max: number } {
		let min = 0;
		let max = 11;

		if (year === startYear) {
			min = earliestDate.getMonth();
		}
		if (year === endYear) {
			max = nextMonth.getMonth();
		}

		return { min, max };
	}

	let validMonthRange = $derived(getValidMonthRange(selectedYear));

	// Ensure selected month is valid when year changes
	$effect(() => {
		const range = getValidMonthRange(selectedYear);
		if (selectedMonth < range.min) {
			selectedMonth = range.min;
		}
		if (selectedMonth > range.max) {
			selectedMonth = range.max;
		}
	});

	function handleSelect() {
		// Create date for first day of selected month
		const date = new Date(selectedYear, selectedMonth, 1);
		onselect?.(date);
	}

	function goToCurrentMonth() {
		const now = new Date();
		selectedYear = now.getFullYear();
		selectedMonth = now.getMonth();
		const date = new Date(selectedYear, selectedMonth, 1);
		onselect?.(date);
	}
</script>

<Modal title="Monat wählen" onclose={() => onclose?.()}>
	<div class="picker-content">
		<!-- Quick action -->
		<button type="button" class="quick-btn" onclick={goToCurrentMonth}>
			Zum aktuellen Monat
		</button>

		<div class="divider">oder</div>

		<!-- Year/Month selectors -->
		<div class="selectors">
			<div class="selector-group">
				<label for="year-select">Jahr:</label>
				<select id="year-select" bind:value={selectedYear} class="select-input">
					{#each years as year (year)}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</div>

			<div class="selector-group">
				<label for="month-select">Monat:</label>
				<select id="month-select" bind:value={selectedMonth} class="select-input">
					{#each Array.from({ length: validMonthRange.max - validMonthRange.min + 1 }, (_, i) => validMonthRange.min + i) as month (month)}
						<option value={month}>{monthNames[month]}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="actions">
			<button type="button" class="btn-cancel" onclick={() => onclose?.()}>Abbrechen</button>
			<button type="button" class="btn-select" onclick={handleSelect}>Auswählen</button>
		</div>
	</div>
</Modal>

<style>
	.picker-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.quick-btn {
		width: 100%;
		padding: 0.75rem;
		background: var(--tt-background-card);
		border: 2px solid var(--tt-brand-primary);
		border-radius: var(--tt-radius-button);
		color: var(--tt-brand-primary);
		font-weight: 600;
		cursor: pointer;
		font-size: 1rem;
	}

	.quick-btn:hover {
		background: var(--tt-brand-primary-faded);
	}

	.divider {
		text-align: center;
		color: var(--tt-text-muted);
		font-size: 0.9rem;
	}

	.selectors {
		display: flex;
		gap: 1rem;
	}

	.selector-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.selector-group label {
		font-size: 0.85rem;
		color: var(--tt-text-muted);
	}

	.select-input {
		padding: 0.5rem;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: 1rem;
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
	}

	.select-input:focus {
		outline: none;
		border-color: var(--tt-border-focus);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-faded);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.btn-cancel,
	.btn-select {
		flex: 1;
		padding: 0.75rem;
		border-radius: var(--tt-radius-button);
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-cancel {
		background: var(--tt-button-secondary-bg);
		border: 1px solid var(--tt-button-secondary-border);
		color: var(--tt-button-secondary-text);
	}

	.btn-cancel:hover {
		background: var(--tt-button-secondary-hover);
	}

	.btn-select {
		background: var(--tt-button-primary-bg);
		border: none;
		color: var(--tt-button-primary-text);
		font-weight: 600;
	}

	.btn-select:hover {
		background: var(--tt-button-primary-hover);
	}
</style>
