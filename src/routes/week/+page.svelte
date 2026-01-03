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
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		currentDate,
		currentWeek,
		timeEntries,
		categories,
		workTimeModels,
		filteredEntries,
		filteredCategories,
		filteredActiveWorkTimeModel
	} from '$lib/stores';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll, getByKey, put } from '$lib/storage/db';
	import { browser } from '$app/environment';
	import type { UserPreference } from '$lib/types';
	import { parseDate } from '$lib/utils/date';
	import {
		getWeekNumber,
		getISOWeekYear,
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

	const PREF_KEY = 'week-selected-date';
	let loading = $state(true);
	let showWeekPicker = $state(false);
	let dateLoaded = $state(false);

	// Week dates (Monday to Sunday)
	let weekDates = $derived(getWeekDates($currentDate));

	// Week number
	let weekNumber = $derived(getWeekNumber($currentDate));

	// Is this the current week?
	let isThisCurrentWeek = $derived(isCurrentWeek($currentDate));

	// Week title display (with ISO week year)
	let weekYear = $derived(getISOWeekYear($currentDate));
	let weekPrefix = $derived(isThisCurrentWeek ? 'Aktuelle Woche' : null);
	let weekTitle = $derived(`KW ${weekNumber}/${weekYear}`);

	// Navigation labels showing adjacent week numbers
	let previousWeekLabel = $derived(() => {
		const prevWeekDate = addDays($currentDate, -7);
		return getWeekNumber(prevWeekDate);
	});

	let nextWeekLabel = $derived(() => {
		const nextWeekDate = addDays($currentDate, 7);
		return getWeekNumber(nextWeekDate);
	});

	// Filter entries for current week (respects employer filter)
	let weekEntries = $derived(
		$filteredEntries.filter((entry) => {
			const startStr = formatDate($currentWeek.start, 'ISO');
			const endStr = formatDate($currentWeek.end, 'ISO');
			return entry.date >= startStr && entry.date <= endStr;
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

	// Calculate week totals - only include days up to today (respects employer filter)
	let weekIst = $derived(calculateIst(weekEntriesUpToToday, $filteredCategories));

	let weekSoll = $derived(() => {
		let total = 0;
		for (const date of weekDates) {
			// Only include days up to today in Soll calculation
			if (isFutureDay(date)) continue;
			const dateKey = formatDate(date, 'ISO');
			const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
			total += calculateSoll(date, dayType, $filteredActiveWorkTimeModel);
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

	// Navigate to day tab with selected date
	function navigateToDay(date: Date) {
		currentDate.set(date);
		// Mark that we're navigating (so target page doesn't load saved date)
		sessionStorage.setItem('date-navigation', 'true');
		goto(resolve('/day'));
	}

	// Get entries for a specific day
	function getDayEntries(date: Date): TimeEntry[] {
		const dateKey = formatDate(date, 'ISO');
		return weekEntries.filter((e) => e.date === dateKey);
	}

	// Check if a day is active in the work time model (respects employer filter)
	function isDayActiveInModel(date: Date): boolean {
		if (!$filteredActiveWorkTimeModel) return true; // Show all days if no model
		const weekday = getDayOfWeek(date);
		const hours = $filteredActiveWorkTimeModel[weekday];
		return hours !== null;
	}

	// Get Ist for a specific day (respects employer filter)
	function getDayIst(date: Date): number {
		const entries = getDayEntries(date);
		return calculateIst(entries, $filteredCategories);
	}

	// Get Soll for a specific day (respects employer filter)
	function getDaySoll(date: Date): number {
		const dateKey = formatDate(date, 'ISO');
		const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
		return calculateSoll(date, dayType, $filteredActiveWorkTimeModel);
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

	// Load saved date from IndexedDB (only on page refresh, not on in-app navigation)
	async function loadSavedDate() {
		// Check if we navigated here from another page (e.g., Analysis)
		const isNavigation = sessionStorage.getItem('date-navigation') === 'true';
		sessionStorage.removeItem('date-navigation');

		if (isNavigation) {
			// Don't load saved date - respect the date set by navigation
			dateLoaded = true;
			return;
		}

		try {
			const pref = await getByKey<UserPreference>('userPreferences', PREF_KEY);
			if (pref?.value) {
				const savedDate = new Date(pref.value);
				if (!isNaN(savedDate.getTime())) {
					currentDate.set(savedDate);
				}
			}
		} catch {
			// Use current date on error
		}
		dateLoaded = true;
	}

	// Save date to IndexedDB when it changes
	$effect(() => {
		if (browser && dateLoaded) {
			const pref: UserPreference = {
				key: PREF_KEY,
				value: $currentDate.toISOString(),
				updatedAt: Date.now()
			};
			put('userPreferences', pref);
		}
	});

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
		await loadSavedDate();
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
			<button class="nav-btn nav-btn-prev" onclick={goToPreviousWeek} aria-label="Vorherige Woche">
				<svg
					class="nav-chevron"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				{previousWeekLabel()}
			</button>
			<button class="week-title" data-testid="week-title" onclick={openWeekPicker}>
				{#if weekPrefix}
					<span class="title-prefix">{weekPrefix}</span>
				{/if}
				<span class="title-date">{weekTitle}</span>
			</button>
			<button class="nav-btn nav-btn-next" onclick={goToNextWeek} aria-label="Nächste Woche">
				{nextWeekLabel()}
				<svg
					class="nav-chevron"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
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
					<button class="tt-list-row-clickable" type="button" onclick={() => navigateToDay(date)}>
						<div class="tt-list-row__content">
							<span class="tt-list-row__title">{formatShortDate(date)}</span>
							<span class="tt-list-row__detail">{getDayTypeLabel(date)}</span>
						</div>
						<div class="day-hours">
							<span class="day-hours__ist">{dayIst.toFixed(1).replace('.', ',')}</span>
							<span class="day-hours__separator">/</span>
							<span class="day-hours__soll">{daySoll.toFixed(1).replace('.', ',')}</span>
							<span class="day-hours__separator">/</span>
							<span
								class="day-hours__saldo"
								class:day-hours__saldo--positive={!isFutureDay(date) && dayIst - daySoll >= 0}
								class:day-hours__saldo--negative={!isFutureDay(date) && dayIst - daySoll < 0}
								class:day-hours__saldo--future={isFutureDay(date)}
							>
								{dayIst - daySoll >= 0 ? '+' : ''}{(dayIst - daySoll).toFixed(1).replace('.', ',')}
							</span>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<!-- Week Year Picker Modal -->
{#if showWeekPicker}
	<WeekYearPicker
		currentDate={$currentDate}
		timeEntries={$timeEntries}
		onselect={handleWeekSelect}
		onclose={() => (showWeekPicker = false)}
	/>
{/if}

<style>
	.week-page {
		padding: var(--tt-space-16);
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: var(--tt-space-32);
		color: var(--tt-text-muted);
	}

	/* Week Navigation - custom clip-path design */
	.week-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--tt-space-16);
	}

	.nav-btn {
		min-width: 44px;
		height: 44px;
		padding: 0 0.75rem;
		border: var(--tt-border-touchable-width) solid var(--tt-border-touchable-color);
		background: var(--tt-background-card);
		color: var(--tt-text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--tt-space-8);
		border-radius: var(--tt-radius-button);
	}

	.nav-btn:hover {
		background: var(--tt-background-card-hover);
	}

	.nav-btn:active {
		background: var(--tt-background-card-pressed);
	}

	.nav-chevron {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.week-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		flex: 1;
		padding: 0.5rem 1rem;
		border: none;
		background: var(--tt-background-card);
		text-align: center;
		cursor: pointer;
		border-radius: var(--tt-radius-card);
		color: var(--tt-text-primary);
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--tt-space-4);
		min-height: 44px;
	}

	.week-title:hover {
		background: var(--tt-background-card-hover);
	}

	.title-prefix {
		font-size: 1rem;
		font-weight: 500;
	}

	.title-date {
		font-size: 1.25rem;
		font-weight: 600;
	}

	/* Day List */
	.day-list {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.no-days {
		text-align: center;
		color: var(--tt-text-muted);
		padding: var(--tt-space-32);
	}

	/* Day hours display - layout-only styles for right side */
	.day-hours {
		display: flex;
		gap: var(--tt-space-4);
		font-size: 0.9rem;
		color: var(--tt-text-muted);
	}

	.day-hours__ist {
		color: var(--tt-text-primary);
	}

	.day-hours__separator {
		color: var(--tt-text-muted);
	}

	.day-hours__soll {
		color: var(--tt-text-muted);
	}

	.day-hours__saldo--positive {
		color: var(--tt-status-success);
	}

	.day-hours__saldo--negative {
		color: var(--tt-status-negative);
	}

	.day-hours__saldo--future {
		color: var(--tt-text-muted);
	}
</style>
