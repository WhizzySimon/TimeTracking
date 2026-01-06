<!--
  WeekPicker component - modal for selecting a week
  
  Based on DayPicker but selects entire weeks (rows).
  Shows calendar grid, user clicks any day to select that week.
  Returns the Monday of the selected week.
-->
<script lang="ts">
	import Modal from './Modal.svelte';
	import CustomDropdown from './CustomDropdown.svelte';
	import type { TimeEntry } from '$lib/types';
	import { getWeekNumber } from '$lib/utils/date';

	interface Props {
		/** Current date to derive initial selection */
		currentDate: Date;
		/** Time entries to determine available date range */
		timeEntries?: TimeEntry[];
		/** Callback when week is selected (returns Monday of selected week) */
		onselect?: (date: Date) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { currentDate, timeEntries = [], onselect, onclose }: Props = $props();

	// Get Monday of a given date's week
	function getMondayOfWeek(date: Date): Date {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(d.setDate(diff));
	}

	// Initialize with Monday of current date's week
	function getInitialMonday(): Date {
		return getMondayOfWeek(currentDate);
	}

	let selectedMonday = $state(getInitialMonday());

	function getInitialYear() {
		return currentDate.getFullYear();
	}
	function getInitialMonth() {
		return currentDate.getMonth();
	}

	let selectedYear = $state(getInitialYear());
	let selectedMonth = $state(getInitialMonth());

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
	let yearOptions = $derived(years.map((y) => ({ value: String(y), label: String(y) })));

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
		if (year === startYear) min = startMonth;
		if (year === endYear) max = endMonth;
		return { min, max };
	}

	let validMonthRange = $derived(getValidMonthRange(selectedYear));

	// Month options for dropdown
	let monthOptions = $derived(
		Array.from(
			{ length: validMonthRange.max - validMonthRange.min + 1 },
			(_, i) => validMonthRange.min + i
		).map((m) => ({ value: String(m), label: monthNames[m] }))
	);

	// Ensure selected month is valid for the year
	$effect(() => {
		if (selectedMonth > validMonthRange.max) selectedMonth = validMonthRange.max;
		if (selectedMonth < validMonthRange.min) selectedMonth = validMonthRange.min;
	});

	// Get days in month
	function getDaysInMonth(year: number, month: number): number {
		return new Date(year, month + 1, 0).getDate();
	}

	let daysInMonth = $derived(getDaysInMonth(selectedYear, selectedMonth));

	// Get first day of month (0 = Monday, 6 = Sunday)
	function getFirstDayOfMonth(year: number, month: number): number {
		const day = new Date(year, month, 1).getDay();
		return day === 0 ? 6 : day - 1;
	}

	let firstDayOfMonth = $derived(getFirstDayOfMonth(selectedYear, selectedMonth));

	// Day names (short, German, Monday-first)
	const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

	// Check if a day is in the selected week
	function isInSelectedWeek(day: number): boolean {
		const date = new Date(selectedYear, selectedMonth, day);
		const monday = getMondayOfWeek(date);
		return monday.getTime() === selectedMonday.getTime();
	}

	// Check if today
	function isToday(day: number): boolean {
		return (
			selectedYear === now.getFullYear() &&
			selectedMonth === now.getMonth() &&
			day === now.getDate()
		);
	}

	// Select week containing clicked day
	function selectWeek(day: number) {
		const date = new Date(selectedYear, selectedMonth, day);
		selectedMonday = getMondayOfWeek(date);
	}

	// Get week number for display
	function getWeekNum(day: number): number {
		const date = new Date(selectedYear, selectedMonth, day);
		return getWeekNumber(date);
	}

	function handleSelect() {
		onselect?.(selectedMonday);
	}

	function handleGoToCurrentWeek() {
		onselect?.(getMondayOfWeek(new Date()));
	}

	function handleClose() {
		onclose?.();
	}

	// Build week rows for the grid
	type WeekRow = { weekNum: number; days: (number | null)[] };

	let weekRows = $derived.by(() => {
		const rows: WeekRow[] = [];
		let currentRow: (number | null)[] = [];

		// Add empty cells for offset
		for (let i = 0; i < firstDayOfMonth; i++) {
			currentRow.push(null);
		}

		// Add day cells
		for (let day = 1; day <= daysInMonth; day++) {
			currentRow.push(day);
			if (currentRow.length === 7) {
				const firstDay = currentRow.find((d) => d !== null) as number;
				rows.push({ weekNum: getWeekNum(firstDay), days: currentRow });
				currentRow = [];
			}
		}

		// Add remaining days if any
		if (currentRow.length > 0) {
			while (currentRow.length < 7) {
				currentRow.push(null);
			}
			const firstDay = currentRow.find((d) => d !== null) as number;
			rows.push({ weekNum: getWeekNum(firstDay), days: currentRow });
		}

		return rows;
	});
</script>

<Modal title="Woche wählen" onclose={handleClose}>
	<div class="week-picker">
		<!-- Quick action -->
		<button type="button" class="today-btn" onclick={handleGoToCurrentWeek}>
			Zur aktuellen Woche
		</button>

		<div class="divider">oder</div>

		<!-- Year/Month selectors -->
		<div class="selectors">
			<div class="field">
				<label for="year-select">Jahr:</label>
				<CustomDropdown
					options={yearOptions}
					value={String(selectedYear)}
					onchange={(value) => (selectedYear = parseInt(value))}
				/>
			</div>
			<div class="field">
				<label for="month-select">Monat:</label>
				<CustomDropdown
					options={monthOptions}
					value={String(selectedMonth)}
					onchange={(value) => (selectedMonth = parseInt(value))}
				/>
			</div>
		</div>

		<!-- Week grid with selectable rows -->
		<div class="week-grid">
			<!-- Header row -->
			<div class="week-header">
				<div class="week-num-header">KW</div>
				{#each dayNames as name (name)}
					<div class="day-header">{name}</div>
				{/each}
			</div>

			<!-- Week rows -->
			{#each weekRows as row (row.weekNum)}
				<button
					type="button"
					class="week-row tt-interactive"
					class:selected={row.days.some((d) => d !== null && isInSelectedWeek(d))}
					onclick={() => {
						const firstDay = row.days.find((d) => d !== null);
						if (firstDay) selectWeek(firstDay);
					}}
				>
					<div class="week-num">KW {row.weekNum}</div>
					{#each row.days as day, i (i)}
						{#if day === null}
							<div class="day-cell empty"></div>
						{:else}
							<div class="day-cell" class:today={isToday(day)}>
								{day}
							</div>
						{/if}
					{/each}
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
	.week-picker {
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

	.week-grid {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.week-header {
		display: grid;
		grid-template-columns: 50px repeat(7, 1fr);
		gap: var(--tt-space-4);
	}

	.week-num-header,
	.day-header {
		text-align: center;
		font-size: var(--tt-font-size-small);
		font-weight: 600;
		color: var(--tt-text-muted);
		padding: 0.25rem;
	}

	.week-row {
		display: grid;
		grid-template-columns: 50px repeat(7, 1fr);
		gap: var(--tt-space-4);
		padding: var(--tt-space-4);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		background: var(--tt-background-card);
		cursor: pointer;
		text-align: left;
	}

	.week-row:hover {
		background: var(--tt-background-card-hover);
	}

	.week-row.selected {
		background: var(--tt-brand-primary-800);
		border-color: var(--tt-brand-primary-500);
	}

	.week-num {
		font-size: var(--tt-font-size-small);
		font-weight: 600;
		color: var(--tt-text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.week-row.selected .week-num {
		color: var(--tt-brand-primary-500);
	}

	.day-cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--tt-font-size-body);
		color: var(--tt-text-primary);
		border-radius: var(--tt-radius-input);
	}

	.day-cell.empty {
		opacity: 0;
	}

	.day-cell.today {
		font-weight: 700;
		color: var(--tt-brand-primary-500);
	}

	.week-row.selected .day-cell {
		color: var(--tt-brand-primary-500);
	}

	.week-row.selected .day-cell.today {
		background: var(--tt-brand-primary-500);
		color: white;
	}

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--tt-border-default);
	}
</style>
