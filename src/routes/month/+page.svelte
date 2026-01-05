<!--
  Month Tab - Monthly overview
  
  Similar to Week tab but for entire month:
  1. Month navigation (← Monat Jahr →)
  2. Month type selector (optional)
  3. Inline summary (Ist/Soll/Saldo)
  4. Week list with summaries (clickable to navigate to week)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		currentDate,
		timeEntries,
		categories,
		workTimeModels,
		filteredEntries,
		filteredCategories,
		filteredModels
	} from '$lib/stores';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll, getByKey, put } from '$lib/storage/db';
	import { browser } from '$app/environment';
	import type { UserPreference } from '$lib/types';
	import { parseDate } from '$lib/utils/date';
	import { getWeekNumber, formatDate, getDayOfWeek, startOfDay } from '$lib/utils/date';
	import { calculateIst, calculateSoll, calculateSaldo } from '$lib/utils/calculations';
	import type { Category, DayType, DayTypeValue, TimeEntry, WorkTimeModel } from '$lib/types';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import MonthYearPicker from '$lib/components/MonthYearPicker.svelte';

	const PREF_KEY = 'month-selected-date';
	let loading = $state(true);
	let showMonthPicker = $state(false);
	let dateLoaded = $state(false);
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

	// Month abbreviations (3 letters)
	const monthAbbreviations = [
		'Jan',
		'Feb',
		'Mär',
		'Apr',
		'Mai',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Okt',
		'Nov',
		'Dez'
	];

	// Current month/year
	let currentMonth = $derived($currentDate.getMonth());
	let currentYear = $derived($currentDate.getFullYear());

	// Is this the current month?
	let isThisCurrentMonth = $derived(() => {
		const now = new Date();
		return currentMonth === now.getMonth() && currentYear === now.getFullYear();
	});

	// Month title display
	let monthPrefix = $derived(isThisCurrentMonth() ? 'Aktueller Monat' : null);
	let monthTitle = $derived(`${monthNames[currentMonth]} ${currentYear}`);

	// Navigation labels showing adjacent month abbreviations
	let previousMonthLabel = $derived(() => {
		const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		return monthAbbreviations[prevMonth];
	});

	let nextMonthLabel = $derived(() => {
		const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
		return monthAbbreviations[nextMonth];
	});

	// Get all days in the current month
	function getMonthDates(year: number, month: number): Date[] {
		const dates: Date[] = [];
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		for (let day = 1; day <= daysInMonth; day++) {
			dates.push(new Date(year, month, day));
		}
		return dates;
	}

	let monthDates = $derived(getMonthDates(currentYear, currentMonth));

	// Get weeks in the month (grouped by ISO week number)
	function getWeeksInMonth(dates: Date[]): { weekNumber: number; year: number; dates: Date[] }[] {
		const weeksObj: Record<string, { weekNumber: number; year: number; dates: Date[] }> = {};

		for (const date of dates) {
			const weekNum = getWeekNumber(date);
			// Use year of Thursday of the week for ISO week year
			const dayOffset = date.getDate() - ((date.getDay() + 6) % 7) + 3;
			const thursdayYear = new Date(date.getFullYear(), date.getMonth(), dayOffset).getFullYear();
			const key = `${thursdayYear}-${weekNum}`;

			if (!weeksObj[key]) {
				weeksObj[key] = { weekNumber: weekNum, year: thursdayYear, dates: [] };
			}
			weeksObj[key].dates.push(date);
		}

		return Object.values(weeksObj).sort((a, b) => {
			if (a.year !== b.year) return a.year - b.year;
			return a.weekNumber - b.weekNumber;
		});
	}

	let weeksInMonth = $derived(getWeeksInMonth(monthDates));

	// Filter entries for current month (respects employer filter)
	let monthEntries = $derived(
		$filteredEntries.filter((entry) => {
			const entryDate = parseDate(entry.date);
			if (!entryDate) return false;
			return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
		})
	);

	// Day types for the month (loaded from IndexedDB)
	let dayTypes = new SvelteMap<string, DayTypeValue>();

	// Today's date for comparison
	let today = $derived(startOfDay(new Date()));

	// Check if a date is in the future
	function isFutureDay(date: Date): boolean {
		return startOfDay(date) > today;
	}

	// Filter entries only up to today for Ist calculation
	let monthEntriesUpToToday = $derived(
		monthEntries.filter((e) => {
			const entryDate = parseDate(e.date);
			return entryDate && startOfDay(entryDate) <= today;
		})
	);

	// Calculate month totals (respects employer filter)
	let monthIst = $derived(calculateIst(monthEntriesUpToToday, $filteredCategories));

	let monthSoll = $derived(() => {
		let total = 0;
		for (const date of monthDates) {
			if (isFutureDay(date)) continue;
			if (!isDayActiveInModel(date)) continue;
			const dateKey = formatDate(date, 'ISO');
			const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
			const model = getActiveModelForDate(date);
			total += calculateSoll(date, dayType, model);
		}
		return total;
	});

	let monthSaldo = $derived(calculateSaldo(monthIst, monthSoll()));

	// Load day types when month changes
	$effect(() => {
		loadMonthDayTypes(monthDates);
	});

	async function loadMonthDayTypes(dates: Date[]) {
		dayTypes.clear();
		for (const date of dates) {
			const dateKey = formatDate(date, 'ISO');
			const record = await getByKey<DayType>('dayTypes', dateKey);
			dayTypes.set(dateKey, record?.type ?? 'arbeitstag');
		}
	}

	// Month navigation functions
	function goToPreviousMonth() {
		const year = $currentDate.getFullYear();
		const month = $currentDate.getMonth();
		currentDate.set(new Date(year, month - 1, 1));
	}

	function goToNextMonth() {
		const year = $currentDate.getFullYear();
		const month = $currentDate.getMonth();
		currentDate.set(new Date(year, month + 1, 1));
	}

	function openMonthPicker() {
		showMonthPicker = true;
	}

	function handleMonthSelect(date: Date) {
		currentDate.set(date);
		showMonthPicker = false;
	}

	// Navigate to week tab with selected week
	function navigateToWeek(weekDates: Date[]) {
		// Set to the first day of the week
		if (weekDates.length > 0) {
			currentDate.set(weekDates[0]);
			// Mark that we're navigating (so target page doesn't load saved date)
			sessionStorage.setItem('date-navigation', 'true');
			goto(resolve('/week'));
		}
	}

	// Get active work time model for a specific date (respects employer filter)
	function getActiveModelForDate(date: Date): WorkTimeModel | null {
		const dateStr = formatDate(date, 'ISO');
		const validModels = $filteredModels
			.filter((model) => model.validFrom <= dateStr)
			.sort((a, b) => b.validFrom.localeCompare(a.validFrom));
		return validModels[0] ?? null;
	}

	// Check if a day is active in the work time model (respects employer filter)
	function isDayActiveInModel(date: Date): boolean {
		const model = getActiveModelForDate(date);
		if (!model) return true;
		const weekday = getDayOfWeek(date);
		const hours = model[weekday];
		return hours !== null;
	}

	// Get Ist for a specific week's dates (within current month, respects employer filter)
	function getWeekIst(dates: Date[]): number {
		const entries = monthEntries.filter((entry) => {
			const entryDate = parseDate(entry.date);
			if (!entryDate) return false;
			// Only count entries up to today
			if (startOfDay(entryDate) > today) return false;
			return dates.some((d) => formatDate(d, 'ISO') === entry.date);
		});
		return calculateIst(entries, $filteredCategories);
	}

	// Get Soll for a specific week's dates (within current month, respects employer filter)
	function getWeekSoll(dates: Date[]): number {
		let total = 0;
		for (const date of dates) {
			if (isFutureDay(date)) continue;
			if (!isDayActiveInModel(date)) continue;
			const dateKey = formatDate(date, 'ISO');
			const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
			const model = getActiveModelForDate(date);
			total += calculateSoll(date, dayType, model);
		}
		return total;
	}

	// Format week date range
	function formatWeekRange(dates: Date[]): string {
		if (dates.length === 0) return '';
		const first = dates[0];
		const last = dates[dates.length - 1];
		const firstDay = first.getDate();
		const lastDay = last.getDate();
		return `${firstDay}.–${lastDay}.`;
	}

	// Count active work days in week
	function getActiveWorkDays(dates: Date[]): number {
		return dates.filter((d) => isDayActiveInModel(d)).length;
	}

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
		const allCategories = await getAll<Category>('categories');
		categories.set(allCategories);
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);
		const allModels = await getAll<WorkTimeModel>('workTimeModels');
		workTimeModels.set(allModels);
		await loadSavedDate();
		loading = false;
	});
</script>

<div class="month-page">
	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Month Navigation -->
		<header class="month-nav">
			<button
				class="tt-nav-button tt-interactive-card"
				onclick={goToPreviousMonth}
				aria-label="Vorheriger Monat"
			>
				<svg
					class="tt-nav-button__chevron"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				<span class="tt-nav-button__label">{previousMonthLabel()}</span>
			</button>
			<button class="tt-date-selector-button tt-interactive-card" onclick={openMonthPicker}>
				{#if monthPrefix}
					<span class="tt-date-selector-button__prefix">{monthPrefix}</span>
				{/if}
				<span class="tt-date-selector-button__date">{monthTitle}</span>
			</button>
			<button
				class="tt-nav-button tt-interactive-card"
				onclick={goToNextMonth}
				aria-label="Nächster Monat"
			>
				<span class="tt-nav-button__label">{nextMonthLabel()}</span>
				<svg
					class="tt-nav-button__chevron"
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

		<!-- Inline Summary -->
		<InlineSummary ist={monthIst} soll={monthSoll()} saldo={monthSaldo} />

		<!-- Week List -->
		<div class="week-list">
			{#each weeksInMonth as week (`${week.year}-${week.weekNumber}`)}
				{@const weekIst = getWeekIst(week.dates)}
				{@const weekSoll = getWeekSoll(week.dates)}
				{@const weekSaldo = weekIst - weekSoll}
				{@const activeDays = getActiveWorkDays(week.dates)}
				<button
					class="tt-list-row-clickable"
					type="button"
					onclick={() => navigateToWeek(week.dates)}
				>
					<div class="tt-list-row__content">
						<span class="tt-list-row__title">KW {week.weekNumber}</span>
						<span class="tt-list-row__detail">{formatWeekRange(week.dates)}</span>
						<span class="tt-list-row__detail">({activeDays} Tage)</span>
					</div>
					<div class="week-hours">
						<span class="week-hours__ist">{weekIst.toFixed(1).replace('.', ',')}</span>
						<span class="week-hours__separator">/</span>
						<span class="week-hours__soll">{weekSoll.toFixed(1).replace('.', ',')}</span>
						<span class="week-hours__separator">/</span>
						<span
							class="week-hours__saldo"
							class:week-hours__saldo--positive={weekSaldo >= 0}
							class:week-hours__saldo--negative={weekSaldo < 0}
						>
							{weekSaldo >= 0 ? '+' : ''}{weekSaldo.toFixed(1).replace('.', ',')}
						</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Month Year Picker Modal -->
{#if showMonthPicker}
	<MonthYearPicker
		currentDate={$currentDate}
		timeEntries={$timeEntries}
		onselect={handleMonthSelect}
		onclose={() => (showMonthPicker = false)}
	/>
{/if}

<style>
	.month-page {
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

	/* Month Navigation */
	.month-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--tt-space-16);
	}

	/* Layout properties now in design system .tt-nav-button class */

	.tt-date-selector-button {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--tt-space-4);
	}

	/* Week List */
	.week-list {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	/* Week hours display - layout-only styles for right side */
	.week-hours {
		display: flex;
		gap: var(--tt-space-4);
		font-size: var(--tt-font-size-body);
		color: var(--tt-text-muted);
		margin-left: auto;
	}

	.week-hours__ist {
		color: var(--tt-text-primary);
	}

	.week-hours__separator {
		color: var(--tt-text-muted);
	}

	.week-hours__soll {
		color: var(--tt-text-muted);
	}

	.week-hours__saldo--positive {
		color: var(--tt-saldo-positive);
	}

	.week-hours__saldo--negative {
		color: var(--tt-status-danger-500);
	}
</style>
