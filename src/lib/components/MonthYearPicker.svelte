<!--
  MonthYearPicker component - modal for selecting a month and year
  
  Features:
  - Year selector (limited by data range + next month)
  - Month selector
  - Quick button to go to current month
-->
<script lang="ts">
	import Modal from './Modal.svelte';
	import CustomDropdown from './CustomDropdown.svelte';
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

	// Year options for dropdown
	let yearOptions = $derived(years.map((y) => ({ value: String(y), label: String(y) })));

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

	// Available months for the selected year
	let availableMonths = $derived(
		Array.from(
			{ length: validMonthRange.max - validMonthRange.min + 1 },
			(_, i) => validMonthRange.min + i
		)
	);

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
		<button type="button" class="quick-btn tt-interactive" onclick={goToCurrentMonth}>
			Zum aktuellen Monat
		</button>

		<div class="divider">oder</div>

		<!-- Year selector -->
		<div class="year-selector">
			<label for="year-select">Jahr:</label>
			<CustomDropdown
				options={yearOptions}
				value={String(selectedYear)}
				onchange={(value) => (selectedYear = parseInt(value))}
			/>
		</div>

		<!-- Month grid -->
		<div class="month-section">
			<label>Monat:</label>
			<div class="month-grid">
				{#each monthNames as monthName, index (index)}
					<button
						type="button"
						class="month-btn tt-interactive"
						class:selected={selectedMonth === index}
						class:disabled={!availableMonths.includes(index)}
						disabled={!availableMonths.includes(index)}
						onclick={() => (selectedMonth = index)}
					>
						{monthName.substring(0, 3)}
					</button>
				{/each}
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
		gap: var(--tt-space-16);
	}

	.quick-btn {
		width: 100%;
		padding: var(--tt-space-12);
		background: var(--tt-background-card);
		border: 2px solid var(--tt-brand-primary-500);
		border-radius: var(--tt-radius-button);
		color: var(--tt-brand-primary-500);
		font-weight: 600;
		cursor: pointer;
		font-size: var(--tt-font-size-normal);
	}

	.divider {
		text-align: center;
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-body);
	}

	.year-selector {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.year-selector label {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-muted);
	}

	.month-section {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.month-section label {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-muted);
	}

	.month-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--tt-space-8);
	}

	.month-btn {
		padding: var(--tt-space-8);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-button);
		background: var(--tt-background-card);
		color: var(--tt-text-primary);
		font-size: var(--tt-font-size-small);
		font-weight: 500;
		cursor: pointer;
		transition:
			background var(--tt-transition-fast),
			border-color var(--tt-transition-fast),
			color var(--tt-transition-fast);
	}

	.month-btn.selected {
		background: var(--tt-brand-primary-500);
		border-color: var(--tt-brand-primary-500);
		color: white;
		font-weight: 600;
	}

	.month-btn.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		margin-top: 0.5rem;
	}

	.btn-cancel,
	.btn-select {
		flex: 1;
		padding: var(--tt-space-12);
		border-radius: var(--tt-radius-button);
		font-size: var(--tt-font-size-normal);
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
