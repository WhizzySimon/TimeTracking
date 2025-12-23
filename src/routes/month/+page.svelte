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
		addDays,
		formatDate,
		getDayOfWeek,
		startOfDay
	} from '$lib/utils/date';
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

	// Get all days in the current month
	function getMonthDates(year: number, month: number): Date[] {
		const dates: Date[] = [];
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
			dates.push(new Date(d));
		}
		return dates;
	}

	let monthDates = $derived(getMonthDates(currentYear, currentMonth));

	// Get weeks in the month (grouped by ISO week number)
	function getWeeksInMonth(dates: Date[]): { weekNumber: number; year: number; dates: Date[] }[] {
		const weeksMap = new Map<string, { weekNumber: number; year: number; dates: Date[] }>();

		for (const date of dates) {
			const weekNum = getWeekNumber(date);
			// Use year of Thursday of the week for ISO week year
			const thursday = new Date(date);
			thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
			const weekYear = thursday.getFullYear();
			const key = `${weekYear}-${weekNum}`;

			if (!weeksMap.has(key)) {
				weeksMap.set(key, { weekNumber: weekNum, year: weekYear, dates: [] });
			}
			weeksMap.get(key)!.dates.push(date);
		}

		return Array.from(weeksMap.values()).sort((a, b) => {
			if (a.year !== b.year) return a.year - b.year;
			return a.weekNumber - b.weekNumber;
		});
	}

	let weeksInMonth = $derived(getWeeksInMonth(monthDates));

	// Filter entries for current month
	let monthEntries = $derived(
		$timeEntries.filter((e) => {
			const entryDate = parseDate(e.date);
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

	// Calculate month totals
	let monthIst = $derived(calculateIst(monthEntriesUpToToday, $categories));

	let monthSoll = $derived(() => {
		let total = 0;
		for (const date of monthDates) {
			if (isFutureDay(date)) continue;
			if (!isDayActiveInModel(date)) continue;
			const dateKey = formatDate(date, 'ISO');
			const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
			total += calculateSoll(date, dayType, $activeWorkTimeModel);
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
		const newDate = new Date($currentDate);
		newDate.setMonth(newDate.getMonth() - 1);
		currentDate.set(newDate);
	}

	function goToNextMonth() {
		const newDate = new Date($currentDate);
		newDate.setMonth(newDate.getMonth() + 1);
		currentDate.set(newDate);
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

	// Check if a day is active in the work time model
	function isDayActiveInModel(date: Date): boolean {
		if (!$activeWorkTimeModel) return true;
		const weekday = getDayOfWeek(date);
		const hours = $activeWorkTimeModel[weekday];
		return hours !== null;
	}

	// Get Ist for a specific week's dates (within current month)
	function getWeekIst(dates: Date[]): number {
		const entries = monthEntries.filter((e) => {
			const entryDate = parseDate(e.date);
			if (!entryDate) return false;
			// Only count entries up to today
			if (startOfDay(entryDate) > today) return false;
			return dates.some((d) => formatDate(d, 'ISO') === e.date);
		});
		return calculateIst(entries, $categories);
	}

	// Get Soll for a specific week's dates (within current month)
	function getWeekSoll(dates: Date[]): number {
		let total = 0;
		for (const date of dates) {
			if (isFutureDay(date)) continue;
			if (!isDayActiveInModel(date)) continue;
			const dateKey = formatDate(date, 'ISO');
			const dayType = dayTypes.get(dateKey) ?? 'arbeitstag';
			total += calculateSoll(date, dayType, $activeWorkTimeModel);
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
			<button class="nav-btn" onclick={goToPreviousMonth} aria-label="Vorheriger Monat">←</button>
			<button class="month-title" onclick={openMonthPicker}>{monthTitle}</button>
			<button class="nav-btn" onclick={goToNextMonth} aria-label="Nächster Monat">→</button>
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
						<span
							class="saldo"
							class:positive={weekSaldo >= 0}
							class:negative={weekSaldo < 0}
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

	/* Month Navigation */
	.month-nav {
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
		border-radius: 8px;
	}

	.month-title:hover {
		background: #f5f5f5;
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
		background: white;
		border: 1px solid #eee;
		border-radius: 8px;
		width: 100%;
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
	}

	.week-item:hover {
		background: #f8fafc;
		border-color: #3b82f6;
	}

	.week-item:active {
		background: #eff6ff;
	}

	.week-info {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}

	.week-number {
		font-weight: 600;
		color: #333;
		min-width: 50px;
	}

	.week-range {
		color: #666;
		font-size: 0.9rem;
	}

	.week-days {
		color: #999;
		font-size: 0.8rem;
	}

	.week-hours {
		display: flex;
		gap: 0.25rem;
		font-size: 0.9rem;
		color: #666;
	}

	.week-hours .ist {
		color: #333;
	}

	.week-hours .separator {
		color: #999;
	}

	.week-hours .soll {
		color: #666;
	}

	.week-hours .saldo.positive {
		color: #16a34a;
	}

	.week-hours .saldo.negative {
		color: #dc2626;
	}
</style>
