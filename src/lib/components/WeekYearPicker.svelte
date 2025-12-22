<!--
  WeekYearPicker component - modal for selecting week and year
  
  Features:
  - Year selector (dropdown or input)
  - Week selector (1-52/53)
  - Quick button to go to current week
-->
<script lang="ts">
	import { getWeekNumber } from '$lib/utils/date';
	import Modal from './Modal.svelte';

	interface Props {
		/** Current date to derive initial week/year */
		currentDate: Date;
		/** Callback when week is selected */
		onselect?: (date: Date) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { currentDate, onselect, onclose }: Props = $props();

	// Initialize with current week/year from prop
	const initialYear = currentDate.getFullYear();
	const initialWeek = getWeekNumber(currentDate);
	let selectedYear = $state(initialYear);
	let selectedWeek = $state(initialWeek);

	// Generate year options (current year ± 10 years)
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

	// Get number of weeks in a year (52 or 53)
	function getWeeksInYear(year: number): number {
		// A year has 53 weeks if Jan 1 is Thursday, or Dec 31 is Thursday
		const jan1 = new Date(year, 0, 1);
		const dec31 = new Date(year, 11, 31);
		return jan1.getDay() === 4 || dec31.getDay() === 4 ? 53 : 52;
	}

	let weeksInYear = $derived(getWeeksInYear(selectedYear));

	// Ensure selected week is valid for the year
	$effect(() => {
		if (selectedWeek > weeksInYear) {
			selectedWeek = weeksInYear;
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
				{#each Array.from({ length: weeksInYear }, (_, i) => i + 1) as week (week)}
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
		border: 1px solid #3b82f6;
		border-radius: 8px;
		background: #eff6ff;
		color: #3b82f6;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.current-week-btn:hover {
		background: #dbeafe;
	}

	.divider {
		text-align: center;
		color: #999;
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
		color: #333;
	}

	.select-input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
	}

	.select-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid #eee;
	}

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: white;
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-secondary:hover {
		background: #f5f5f5;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		background: #3b82f6;
		color: white;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: #2563eb;
	}
</style>
