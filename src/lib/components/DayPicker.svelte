<!--
  DayPicker component - modal for selecting a specific day
  
  Features:
  - Year/month selector
  - Day grid
  - Quick button to go to today
  - Limits range based on time entries + next month
-->
<script lang="ts">
	import Modal from './Modal.svelte';
	import type { TimeEntry } from '$lib/types';

	interface Props {
		/** Current date to derive initial selection */
		currentDate: Date;
		/** Time entries to determine available date range */
		timeEntries?: TimeEntry[];
		/** Callback when day is selected */
		onselect?: (date: Date) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { currentDate, timeEntries = [], onselect, onclose }: Props = $props();

	// Initialize with current date from prop
	function getInitialYear() {
		return currentDate.getFullYear();
	}
	function getInitialMonth() {
		return currentDate.getMonth();
	}
	function getInitialDay() {
		return currentDate.getDate();
	}
	let selectedYear = $state(getInitialYear());
	let selectedMonth = $state(getInitialMonth());
	let selectedDay = $state(getInitialDay());

	// Calculate available date range based on time entries + future until end of next month
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth();

	// End of next month
	const endOfNextMonth = new Date(currentYear, currentMonth + 2, 0);
	const endYear = endOfNextMonth.getFullYear();
	const endMonth = endOfNextMonth.getMonth();

	// Find earliest entry date
	function getEarliestEntryDate(): Date {
		if (timeEntries.length === 0) return now;
		const dates = timeEntries.map((e) => new Date(e.date)).filter((d) => !isNaN(d.getTime()));
		if (dates.length === 0) return now;
		return dates.reduce((min, d) => (d < min ? d : min), dates[0]);
	}

	const earliestDate = getEarliestEntryDate();
	const startYear = earliestDate.getFullYear();
	const startMonth = earliestDate.getMonth();

	// Generate year options
	const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

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

	// Get valid month range for a given year
	function getValidMonthRange(year: number): { min: number; max: number } {
		let min = 0;
		let max = 11;

		if (year === startYear) {
			min = startMonth;
		}
		if (year === endYear) {
			max = endMonth;
		}
		return { min, max };
	}

	let validMonthRange = $derived(getValidMonthRange(selectedYear));

	// Ensure selected month is valid for the year
	$effect(() => {
		if (selectedMonth > validMonthRange.max) {
			selectedMonth = validMonthRange.max;
		}
		if (selectedMonth < validMonthRange.min) {
			selectedMonth = validMonthRange.min;
		}
	});

	// Get days in month
	function getDaysInMonth(year: number, month: number): number {
		return new Date(year, month + 1, 0).getDate();
	}

	let daysInMonth = $derived(getDaysInMonth(selectedYear, selectedMonth));

	// Get valid day range for selected month
	function getValidDayRange(year: number, month: number): { min: number; max: number } {
		const maxDays = getDaysInMonth(year, month);
		let min = 1;
		let max = maxDays;

		if (year === startYear && month === startMonth) {
			min = earliestDate.getDate();
		}
		if (year === endYear && month === endMonth) {
			max = Math.min(endOfNextMonth.getDate(), maxDays);
		}
		return { min, max };
	}

	let validDayRange = $derived(getValidDayRange(selectedYear, selectedMonth));

	// Ensure selected day is valid
	$effect(() => {
		if (selectedDay > validDayRange.max) {
			selectedDay = validDayRange.max;
		}
		if (selectedDay < validDayRange.min) {
			selectedDay = validDayRange.min;
		}
	});

	// Get first day of month (0 = Sunday, 1 = Monday, etc.)
	function getFirstDayOfMonth(year: number, month: number): number {
		const day = new Date(year, month, 1).getDay();
		// Convert to Monday-first (0 = Monday, 6 = Sunday)
		return day === 0 ? 6 : day - 1;
	}

	let firstDayOfMonth = $derived(getFirstDayOfMonth(selectedYear, selectedMonth));

	// Day names (short, German, Monday-first)
	const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

	function handleSelect() {
		const date = new Date(selectedYear, selectedMonth, selectedDay);
		onselect?.(date);
	}

	function handleGoToToday() {
		onselect?.(new Date());
	}

	function handleClose() {
		onclose?.();
	}

	function selectDay(day: number) {
		if (day >= validDayRange.min && day <= validDayRange.max) {
			selectedDay = day;
		}
	}

	function isValidDay(day: number): boolean {
		return day >= validDayRange.min && day <= validDayRange.max;
	}

	function isToday(day: number): boolean {
		return (
			selectedYear === now.getFullYear() &&
			selectedMonth === now.getMonth() &&
			day === now.getDate()
		);
	}
</script>

<Modal title="Tag wählen" onclose={handleClose}>
	<div class="day-picker">
		<!-- Quick action -->
		<button type="button" class="today-btn" onclick={handleGoToToday}> Zum heutigen Tag </button>

		<div class="divider">oder</div>

		<!-- Year selector -->
		<div class="selectors">
			<div class="field">
				<label for="year-select">Jahr:</label>
				<select id="year-select" bind:value={selectedYear} class="select-input">
					{#each years as year (year)}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</div>

			<!-- Month selector -->
			<div class="field">
				<label for="month-select">Monat:</label>
				<select id="month-select" bind:value={selectedMonth} class="select-input">
					{#each Array.from({ length: validMonthRange.max - validMonthRange.min + 1 }, (_, i) => validMonthRange.min + i) as month (month)}
						<option value={month}>{monthNames[month]}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Day grid -->
		<div class="day-grid">
			<!-- Day headers -->
			{#each dayNames as name (name)}
				<div class="day-header">{name}</div>
			{/each}

			<!-- Empty cells for offset -->
			{#each Array.from({ length: firstDayOfMonth }, (__, idx) => idx) as i (i)}
				<div class="day-cell empty"></div>
			{/each}

			<!-- Day cells -->
			{#each Array.from({ length: daysInMonth }, (_, i) => i + 1) as day (day)}
				<button
					type="button"
					class="day-cell"
					class:selected={day === selectedDay}
					class:today={isToday(day)}
					class:disabled={!isValidDay(day)}
					disabled={!isValidDay(day)}
					onclick={() => selectDay(day)}
				>
					{day}
				</button>
			{/each}
		</div>

		<!-- Actions -->
		<div class="actions">
			<button type="button" class="tt-button-secondary" onclick={handleClose}>Abbrechen</button>
			<button type="button" class="tt-button-primary" onclick={handleSelect}>Auswählen</button>
		</div>
	</div>
</Modal>

<style>
	.day-picker {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	.today-btn {
		padding: 0.75rem 1rem;
		border: 1px solid var(--tt-brand-primary-500);
		border-radius: var(--tt-radius-button);
		background: var(--tt-brand-primary-800);
		color: var(--tt-brand-primary-500);
		font-size: var(--tt-font-size-normal);
		font-weight: 500;
		cursor: pointer;
	}

	.today-btn:hover {
		background: var(--tt-brand-primary-800);
		opacity: 0.9;
	}

	.divider {
		text-align: center;
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-body);
	}

	.selectors {
		display: flex;
		gap: var(--tt-space-16);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
		flex: 1;
	}

	.field label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.select-input {
		padding: var(--tt-space-12);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: var(--tt-font-size-normal);
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
	}

	.select-input:focus {
		outline: none;
		border-color: var(--tt-border-focus);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-800);
	}

	.day-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--tt-space-4);
	}

	.day-header {
		text-align: center;
		font-size: var(--tt-font-size-small);
		font-weight: 600;
		color: var(--tt-text-muted);
		padding: 0.25rem;
	}

	.day-cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		background: var(--tt-background-card);
		font-size: var(--tt-font-size-body);
		cursor: pointer;
		color: var(--tt-text-primary);
	}

	.day-cell:hover:not(:disabled) {
		background: var(--tt-background-card-hover);
	}

	.day-cell.empty {
		border: none;
		background: transparent;
		cursor: default;
	}

	.day-cell.selected {
		background: var(--tt-brand-primary-500);
		color: white;
		border-color: var(--tt-brand-primary-500);
	}

	.day-cell.today:not(.selected) {
		border-color: var(--tt-brand-primary-500);
		color: var(--tt-brand-primary-500);
		font-weight: 600;
	}

	.day-cell.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--tt-border-default);
	}
</style>
