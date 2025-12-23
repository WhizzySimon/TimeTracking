<!--
  WeekYearPicker component - modal for selecting week and year
  
  Features:
  - Year selector (dropdown or input)
  - Week selector (1-52/53)
  - Quick button to go to current week
-->
<script lang="ts">
	import { getWeekNumber, getISOWeekYear } from '$lib/utils/date';
	import Modal from './Modal.svelte';
	import type { TimeEntry } from '$lib/types';

	interface Props {
		/** Current date to derive initial week/year */
		currentDate: Date;
		/** Time entries to determine available weeks */
		timeEntries?: TimeEntry[];
		/** Callback when week is selected */
		onselect?: (date: Date) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { currentDate, timeEntries = [], onselect, onclose }: Props = $props();

	// Initialize with current week/year from prop (using ISO week year)
	function getInitialYear() {
		return getISOWeekYear(currentDate);
	}
	function getInitialWeek() {
		return getWeekNumber(currentDate);
	}
	let selectedYear = $state(getInitialYear());
	let selectedWeek = $state(getInitialWeek());

	// Calculate available weeks based on time entries + future until end of next month
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth();

	// End of next month
	const endOfNextMonth = new Date(currentYear, currentMonth + 2, 0);
	const endWeek = getWeekNumber(endOfNextMonth);
	const endYear = endOfNextMonth.getFullYear();

	// Find earliest entry date
	function getEarliestEntryDate(): Date {
		if (timeEntries.length === 0) return now;
		const dates = timeEntries.map((e) => new Date(e.date)).filter((d) => !isNaN(d.getTime()));
		if (dates.length === 0) return now;
		return dates.reduce((min, d) => (d < min ? d : min), dates[0]);
	}

	const earliestDate = getEarliestEntryDate();
	const startYear = earliestDate.getFullYear();
	const startWeek = getWeekNumber(earliestDate);

	// Generate year options from earliest entry year to end of next month year
	const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

	// Get number of weeks in a year (52 or 53)
	function getWeeksInYear(year: number): number {
		// A year has 53 weeks if Jan 1 is Thursday, or Dec 31 is Thursday
		const jan1 = new Date(year, 0, 1);
		const dec31 = new Date(year, 11, 31);
		return jan1.getDay() === 4 || dec31.getDay() === 4 ? 53 : 52;
	}

	// Get valid week range for a given year
	function getValidWeekRange(year: number): { min: number; max: number } {
		const maxWeeks = getWeeksInYear(year);
		let min = 1;
		let max = maxWeeks;

		if (year === startYear) {
			min = startWeek;
		}
		if (year === endYear) {
			max = Math.min(endWeek, maxWeeks);
		}
		return { min, max };
	}

	let validWeekRange = $derived(getValidWeekRange(selectedYear));

	// Ensure selected week is valid for the year
	$effect(() => {
		if (selectedWeek > validWeekRange.max) {
			selectedWeek = validWeekRange.max;
		}
		if (selectedWeek < validWeekRange.min) {
			selectedWeek = validWeekRange.min;
		}
	});

	// Get date from week number and year (Monday of that week)
	function getDateFromWeek(week: number, year: number): Date {
		// ISO week date: Week 1 contains Jan 4
		const jan4 = new Date(year, 0, 4);
		const jan4Day = jan4.getDay() || 7; // Convert Sunday (0) to 7
		// Calculate Monday of week 1
		const week1MondayTime = jan4.getTime() - (jan4Day - 1) * 24 * 60 * 60 * 1000;
		// Add weeks
		const targetTime = week1MondayTime + (week - 1) * 7 * 24 * 60 * 60 * 1000;
		return new Date(targetTime);
	}

	function handleSelect() {
		const date = getDateFromWeek(selectedWeek, selectedYear);
		onselect?.(date);
	}

	function handleGoToCurrentWeek() {
		const now = new Date();
		onselect?.(now);
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal title="Woche wählen" onclose={handleClose}>
	<div class="week-picker">
		<!-- Quick action -->
		<button type="button" class="current-week-btn" onclick={handleGoToCurrentWeek}>
			Zur aktuellen Woche
		</button>

		<div class="divider">oder</div>

		<!-- Year selector -->
		<div class="field">
			<label for="year-select">Jahr:</label>
			<select id="year-select" bind:value={selectedYear} class="select-input">
				{#each years as year (year)}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</div>

		<!-- Week selector -->
		<div class="field">
			<label for="week-select">Kalenderwoche:</label>
			<select id="week-select" bind:value={selectedWeek} class="select-input">
				{#each Array.from({ length: validWeekRange.max - validWeekRange.min + 1 }, (_, i) => validWeekRange.min + i) as week (week)}
					<option value={week}>KW {week}</option>
				{/each}
			</select>
		</div>

		<!-- Actions -->
		<div class="actions">
			<button type="button" class="btn-secondary" onclick={handleClose}>Abbrechen</button>
			<button type="button" class="btn-primary" onclick={handleSelect}>Auswählen</button>
		</div>
	</div>
</Modal>

<style>
	.week-picker {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.current-week-btn {
		padding: 0.75rem 1rem;
		border: 1px solid var(--accent);
		border-radius: var(--r-btn);
		background: var(--accent-light);
		color: var(--accent);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.current-week-btn:hover {
		background: var(--accent-light);
		opacity: 0.9;
	}

	.divider {
		text-align: center;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
	}

	.select-input {
		padding: 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
	}

	.select-input:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: 0 0 0 2px var(--accent-light);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border-light);
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

	.btn-secondary:hover {
		background: var(--btn-secondary-hover);
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--r-btn);
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--btn-primary-hover);
	}
</style>
