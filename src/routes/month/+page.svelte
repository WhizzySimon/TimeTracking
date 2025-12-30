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
		filteredActiveWorkTimeModel
	} from '$lib/stores';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll, getByKey } from '$lib/storage/db';
	import { parseDate } from '$lib/utils/date';
	import { getWeekNumber, formatDate, getDayOfWeek, startOfDay } from '$lib/utils/date';
	import { calculateIst, calculateSoll, calculateSaldo } from '$lib/utils/calculations';
	import type { Category, DayType, DayTypeValue, TimeEntry, WorkTimeModel } from '$lib/types';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import MonthYearPicker from '$lib/components/MonthYearPicker.svelte';

	let loading = $state(true);
	let showMonthPicker = $state(false);
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
	let monthTitle = $derived(
		isThisCurrentMonth()
			? `Aktueller Monat: ${monthNames[currentMonth]} ${currentYear}`
			: `${monthNames[currentMonth]} ${currentYear}`
	);

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
			total += calculateSoll(date, dayType, $filteredActiveWorkTimeModel);
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
			goto(resolve('/week'));
		}
	}

	// Check if a day is active in the work time model (respects employer filter)
	function isDayActiveInModel(date: Date): boolean {
		if (!$filteredActiveWorkTimeModel) return true;
		const weekday = getDayOfWeek(date);
		const hours = $filteredActiveWorkTimeModel[weekday];
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
			total += calculateSoll(date, dayType, $filteredActiveWorkTimeModel);
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

	onMount(async () => {
		await initializeCategories();
		const allCategories = await getAll<Category>('categories');
		categories.set(allCategories);
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);
		const allModels = await getAll<WorkTimeModel>('workTimeModels');
		workTimeModels.set(allModels);
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
				class="nav-btn nav-btn-prev"
				onclick={goToPreviousMonth}
				aria-label="Vorheriger Monat"
			>
				{previousMonthLabel()}
			</button>
			<button class="month-title" onclick={openMonthPicker}>{monthTitle}</button>
			<button class="nav-btn nav-btn-next" onclick={goToNextMonth} aria-label="Nächster Monat">
				{nextMonthLabel()}
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
				<button class="week-item" type="button" onclick={() => navigateToWeek(week.dates)}>
					<div class="week-info">
						<span class="week-number">KW {week.weekNumber}</span>
						<span class="week-range">{formatWeekRange(week.dates)}</span>
						<span class="week-days">({activeDays} Tage)</span>
					</div>
					<div class="week-hours">
						<span class="ist">{weekIst.toFixed(1).replace('.', ',')}</span>
						<span class="separator">/</span>
						<span class="soll">{weekSoll.toFixed(1).replace('.', ',')}</span>
						<span class="separator">/</span>
						<span class="saldo" class:positive={weekSaldo >= 0} class:negative={weekSaldo < 0}>
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
		color: var(--muted);
	}

	/* Month Navigation */
	.month-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.nav-btn {
		min-width: 44px;
		height: 44px;
		padding: 0 0.75rem;
		border: none;
		background: var(--surface);
		color: var(--text);
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.nav-btn-prev {
		clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%);
	}

	.nav-btn-next {
		clip-path: polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%);
	}

	.nav-btn:hover {
		background: var(--surface-hover);
	}

	.nav-btn:active {
		background: var(--surface-active);
	}

	.month-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		text-align: center;
		flex: 1;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: var(--r-btn);
		color: var(--text);
	}

	.month-title:hover {
		background: var(--surface-hover);
	}

	/* Week List */
	.week-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.week-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--r-card);
		width: 100%;
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
	}

	.week-item:hover {
		background: var(--surface-hover);
		border-color: var(--accent);
	}

	.week-item:active {
		background: var(--accent-light);
	}

	.week-info {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}

	.week-number {
		font-weight: 600;
		color: var(--text);
		min-width: 50px;
	}

	.week-range {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.week-days {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.week-hours {
		display: flex;
		gap: 0.25rem;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.week-hours .ist {
		color: var(--text);
	}

	.week-hours .separator {
		color: var(--muted);
	}

	.week-hours .soll {
		color: var(--muted);
	}

	.week-hours .saldo.positive {
		color: var(--pos);
	}

	.week-hours .saldo.negative {
		color: var(--neg);
	}
</style>
