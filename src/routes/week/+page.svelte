<!--
  Week Tab - Weekly overview
  
  Spec refs:
  - ui-logic-spec-v1.md Section 4 (Tab: Woche)
  
  Order (per spec):
  1. Week navigation (← Aktuelle KW X →)
  2. Week type selector
  3. Inline summary (Ist/Soll/Saldo)
  4. Day list (filtered by active days in model)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		currentDate,
		currentWeek,
		activeWorkTimeModel,
		timeEntries,
		categories,
		workTimeModels
	} from '$lib/stores';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll, getByKey } from '$lib/storage/db';
	import { parseDate } from '$lib/utils/date';
	import {
		getWeekNumber,
		isCurrentWeek,
		addDays,
		getWeekDates,
		formatShortDate,
		formatDate,
		getDayOfWeek,
		startOfDay
	} from '$lib/utils/date';
	import { calculateIst, calculateSoll, calculateSaldo } from '$lib/utils/calculations';
	import type { Category, DayType, DayTypeValue, TimeEntry, WorkTimeModel } from '$lib/types';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import WeekTypeSelector from '$lib/components/WeekTypeSelector.svelte';
	import WeekYearPicker from '$lib/components/WeekYearPicker.svelte';

	let loading = $state(true);
	let showWeekPicker = $state(false);

	// Week dates (Monday to Sunday)
	let weekDates = $derived(getWeekDates($currentDate));

	// Week number
	let weekNumber = $derived(getWeekNumber($currentDate));

	// Is this the current week?
	let isThisCurrentWeek = $derived(isCurrentWeek($currentDate));

	// Week title display
	let weekTitle = $derived(isThisCurrentWeek ? `Aktuelle KW ${weekNumber}` : `KW ${weekNumber}`);

	// Filter entries for current week
	let weekEntries = $derived(
		$timeEntries.filter((e) => {
			const startStr = formatDate($currentWeek.start, 'ISO');
			const endStr = formatDate($currentWeek.end, 'ISO');
			return e.date >= startStr && e.date <= endStr;
		})
	);

	// Day types for the week (loaded from IndexedDB)
	let dayTypes = new SvelteMap<string, DayTypeValue>();

	// Today's date for comparison (start of day for accurate comparison)
	let today = $derived(startOfDay(new Date()));

	// Check if a date is in the future (after today)
	function isFutureDay(date: Date): boolean {
		return startOfDay(date) > today;
	}

	// Filter entries only up to today for Ist calculation
	let weekEntriesUpToToday = $derived(
		weekEntries.filter((e) => {
			const entryDate = parseDate(e.date);
			return entryDate && startOfDay(entryDate) <= today;
		})
	);

	// Calculate week totals - only include days up to today
	let weekIst = $derived(calculateIst(weekEntriesUpToToday, $categories));

	let weekSoll = $derived(() => {
		let total = 0;
		for (const date of weekDates) {
			// Only include days up to today in Soll calculation
			if (isFutureDay(date)) continue;
			const dateKey = formatDate(date, 'ISO');
			const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
			total += calculateSoll(date, dayType, $activeWorkTimeModel);
		}
		return total;
	});

	let weekSaldo = $derived(calculateSaldo(weekIst, weekSoll()));

	// Load day types when week changes
	$effect(() => {
		loadWeekDayTypes(weekDates);
	});

	async function loadWeekDayTypes(dates: Date[]) {
		dayTypes.clear();
		for (const date of dates) {
			const dateKey = formatDate(date, 'ISO');
			const record = await getByKey<DayType>('dayTypes', dateKey);
			dayTypes.set(dateKey, record?.type ?? 'arbeitstag');
		}
	}

	// Week navigation functions
	function goToPreviousWeek() {
		currentDate.set(addDays($currentDate, -7));
	}

	function goToNextWeek() {
		currentDate.set(addDays($currentDate, 7));
	}

	function openWeekPicker() {
		showWeekPicker = true;
	}

	function handleWeekSelect(date: Date) {
		currentDate.set(date);
		showWeekPicker = false;
	}

	// Get entries for a specific day
	function getDayEntries(date: Date): TimeEntry[] {
		const dateKey = formatDate(date, 'ISO');
		return weekEntries.filter((e) => e.date === dateKey);
	}

	// Check if a day is active in the work time model
	function isDayActiveInModel(date: Date): boolean {
		if (!$activeWorkTimeModel) return true; // Show all days if no model
		const weekday = getDayOfWeek(date);
		const hours = $activeWorkTimeModel[weekday];
		return hours !== null;
	}

	// Get Ist for a specific day
	function getDayIst(date: Date): number {
		const entries = getDayEntries(date);
		return calculateIst(entries, $categories);
	}

	// Get Soll for a specific day
	function getDaySoll(date: Date): number {
		const dateKey = formatDate(date, 'ISO');
		const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
		return calculateSoll(date, dayType, $activeWorkTimeModel);
	}

	// Get day type label
	function getDayTypeLabel(date: Date): string {
		const dateKey = formatDate(date, 'ISO');
		const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
		switch (dayType) {
			case 'arbeitstag':
				return 'Arbeitstag';
			case 'urlaub':
				return 'Urlaub';
			case 'krank':
				return 'Krank';
			case 'feiertag':
				return 'Feiertag';
		}
	}

	// Filter days to only show active ones in model
	let activeDays = $derived(weekDates.filter((date) => isDayActiveInModel(date)));

	onMount(async () => {
		await initializeCategories();
		// Load categories into store
		const allCategories = await getAll<Category>('categories');
		categories.set(allCategories);
		// Load all time entries
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);
		// Load work time models
		const allModels = await getAll<WorkTimeModel>('workTimeModels');
		workTimeModels.set(allModels);
		loading = false;
	});
</script>

<div class="week-page">
	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Week Navigation -->
		<header class="week-nav">
			<button class="nav-btn" onclick={goToPreviousWeek} aria-label="Vorherige Woche">←</button>
			<button class="week-title" onclick={openWeekPicker}>{weekTitle}</button>
			<button class="nav-btn" onclick={goToNextWeek} aria-label="Nächste Woche">→</button>
		</header>

		<!-- Week Type Selector -->
		<WeekTypeSelector weekDate={$currentDate} onchange={() => loadWeekDayTypes(weekDates)} />

		<!-- Inline Summary -->
		<InlineSummary ist={weekIst} soll={weekSoll()} saldo={weekSaldo} />

		<!-- Day List -->
		<div class="day-list">
			{#if activeDays.length === 0}
				<p class="no-days">Keine aktiven Tage im Arbeitszeitmodell</p>
			{:else}
				{#each activeDays as date (formatDate(date, 'ISO'))}
					{@const dayIst = getDayIst(date)}
					{@const daySoll = getDaySoll(date)}
					<div class="day-item">
						<div class="day-info">
							<span class="day-date">{formatShortDate(date)}</span>
							<span class="day-type">{getDayTypeLabel(date)}</span>
						</div>
						<div class="day-hours">
							<span class="ist">{dayIst.toFixed(1).replace('.', ',')}</span>
							<span class="separator">/</span>
							<span class="soll">{daySoll.toFixed(1).replace('.', ',')}</span>
							<span class="separator">/</span>
							<span
								class="saldo"
								class:positive={!isFutureDay(date) && dayIst - daySoll >= 0}
								class:negative={!isFutureDay(date) && dayIst - daySoll < 0}
								class:future={isFutureDay(date)}
							>
								{dayIst - daySoll >= 0 ? '+' : ''}{(dayIst - daySoll).toFixed(1).replace('.', ',')}
							</span>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<!-- Week Year Picker Modal -->
{#if showWeekPicker}
	<WeekYearPicker
		currentDate={$currentDate}
		onselect={handleWeekSelect}
		onclose={() => (showWeekPicker = false)}
	/>
{/if}

<style>
	.week-page {
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: 2rem;
		color: #666;
	}

	/* Week Navigation */
	.week-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.nav-btn {
		width: 44px;
		height: 44px;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: white;
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-btn:hover {
		background: #f5f5f5;
	}

	.nav-btn:active {
		background: #eee;
	}

	.week-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		text-align: center;
		flex: 1;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
	}

	.week-title:hover {
		background: #f5f5f5;
	}

	/* Day List */
	.day-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.no-days {
		text-align: center;
		color: #888;
		padding: 2rem;
	}

	.day-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: white;
		border: 1px solid #eee;
		border-radius: 8px;
	}

	.day-info {
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
	}

	.day-date {
		font-weight: 600;
		color: #333;
		min-width: 70px;
	}

	.day-type {
		color: #666;
		font-size: 0.9rem;
	}

	.day-hours {
		display: flex;
		gap: 0.25rem;
		font-size: 0.9rem;
		color: #666;
	}

	.day-hours .ist {
		color: #333;
	}

	.day-hours .separator {
		color: #999;
	}

	.day-hours .soll {
		color: #666;
	}

	.day-hours .saldo.positive {
		color: #16a34a;
	}

	.day-hours .saldo.negative {
		color: #dc2626;
	}

	.day-hours .saldo.future {
		color: #9ca3af;
	}
</style>
