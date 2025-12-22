<!--
  Analysis Tab - Period analysis and reporting
  
  Spec refs:
  - ui-logic-spec-v1.md Section 5 (Tab: Auswertung)
  
  Order (per spec):
  1. Date range selector (button that opens modal)
  2. Inline summary (Gesamt Ist/Soll/Saldo)
  3. Period list (grouped by week or month)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { timeEntries, categories, workTimeModels } from '$lib/stores';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll, getByKey } from '$lib/storage/db';
	import { formatDate, parseDate, getWeekNumber, addDays } from '$lib/utils/date';
	import {
		calculateIst,
		calculateSoll,
		calculateSaldo,
		formatHours
	} from '$lib/utils/calculations';
	import type { Category, DayType, DayTypeValue, TimeEntry, WorkTimeModel } from '$lib/types';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import DateRangeSelector from '$lib/components/DateRangeSelector.svelte';

	let loading = $state(true);
	let showRangeSelector = $state(false);

	// Date range state - default: 01.01.current year to today
	// Store as ISO strings to avoid mutable Date issues
	let rangeStartStr = $state(formatDate(new Date(new Date().getFullYear(), 0, 1), 'ISO'));
	let rangeEndStr = $state(formatDate(new Date(), 'ISO'));

	// Day types cache for the range
	const dayTypesCache = new SvelteMap<string, DayTypeValue>();

	// Parse range strings to dates for calculations
	let rangeStart = $derived(parseDate(rangeStartStr) ?? new Date());
	let rangeEnd = $derived(parseDate(rangeEndStr) ?? new Date());

	// Format range for display
	let rangeDisplay = $derived(`${formatDate(rangeStart, 'DE')} – ${formatDate(rangeEnd, 'DE')}`);

	// Filter entries within date range
	let rangeEntries = $derived(
		$timeEntries.filter((e) => {
			return e.date >= rangeStartStr && e.date <= rangeEndStr;
		})
	);

	// Calculate totals for the range
	let totalIst = $derived(calculateIst(rangeEntries, $categories));

	// Calculate total Soll by iterating through dates
	function calculateTotalSoll(): number {
		let total = 0;
		let current = parseDate(rangeStartStr);
		const end = parseDate(rangeEndStr);
		if (!current || !end) return 0;

		while (current <= end) {
			const dateKey = formatDate(current, 'ISO');
			const dayType = dayTypesCache.get(dateKey) ?? 'arbeitstag';
			const model = getActiveModelForDate(current);
			total += calculateSoll(current, dayType, model);
			current = addDays(current, 1);
		}
		return total;
	}

	let totalSoll = $derived(calculateTotalSoll());
	let totalSaldo = $derived(calculateSaldo(totalIst, totalSoll));

	// Get active work time model for a specific date
	function getActiveModelForDate(date: Date): WorkTimeModel | null {
		const dateStr = formatDate(date, 'ISO');
		const validModels = $workTimeModels
			.filter((model) => model.validFrom <= dateStr)
			.sort((a, b) => b.validFrom.localeCompare(a.validFrom));
		return validModels[0] ?? null;
	}

	// Determine grouping: weeks if range <= 60 days, months otherwise
	let groupByMonth = $derived(() => {
		const diffTime = rangeEnd.getTime() - rangeStart.getTime();
		const diffDays = diffTime / (1000 * 60 * 60 * 24);
		return diffDays > 60;
	});

	// Helper to get period key for a date
	function getPeriodKey(date: Date, byMonth: boolean): string {
		if (byMonth) {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		} else {
			const weekNum = getWeekNumber(date);
			return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
		}
	}

	// Helper to get period label from key
	function getPeriodLabel(key: string, byMonth: boolean): string {
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
		if (byMonth) {
			const [year, month] = key.split('-');
			return `${monthNames[parseInt(month) - 1]} ${year}`;
		} else {
			const weekNum = key.split('-W')[1];
			return `KW ${parseInt(weekNum)}`;
		}
	}

	// Group entries by period (week or month)
	interface PeriodGroup {
		label: string;
		ist: number;
		soll: number;
	}

	// Category breakdown: hours per category for the selected period
	interface CategoryBreakdown {
		name: string;
		hours: number;
		averagePerWeek: number;
		countsAsWorkTime: boolean;
	}

	// Count work days in range (excluding Urlaub, Feiertag, Krank)
	function countWorkDaysInRange(): number {
		let workDays = 0;
		let current = parseDate(rangeStartStr);
		const end = parseDate(rangeEndStr);
		if (!current || !end) return 0;

		while (current <= end) {
			const dateKey = formatDate(current, 'ISO');
			const dayType = dayTypesCache.get(dateKey) ?? 'arbeitstag';
			// Only count actual work days (arbeitstag)
			// Exclude: urlaub, feiertag, krank
			if (dayType === 'arbeitstag') {
				workDays++;
			}
			current = addDays(current, 1);
		}
		return workDays;
	}

	// Calculate number of "effective weeks" based on work days
	// (work days / 7) gives us the equivalent weeks
	let workDaysInRange = $derived(countWorkDaysInRange());
	let effectiveWeeks = $derived(workDaysInRange / 7);

	function calculateCategoryBreakdown(): CategoryBreakdown[] {
		// Group entries by category and sum hours
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local variable in non-reactive function
		const categoryHours = new Map<string, number>();

		for (const entry of rangeEntries) {
			if (!entry.endTime) continue; // Skip running entries

			// Calculate duration in hours
			const [startH, startM] = entry.startTime.split(':').map(Number);
			const [endH, endM] = entry.endTime.split(':').map(Number);
			const startMinutes = startH * 60 + startM;
			const endMinutes = endH * 60 + endM;
			const durationHours = (endMinutes - startMinutes) / 60;

			if (durationHours > 0) {
				const current = categoryHours.get(entry.categoryId) ?? 0;
				categoryHours.set(entry.categoryId, current + durationHours);
			}
		}

		// Build result with category names and weekly average
		const result: CategoryBreakdown[] = [];
		const weeks = effectiveWeeks > 0 ? effectiveWeeks : 1; // Avoid division by zero

		for (const [categoryId, hours] of categoryHours) {
			const category = $categories.find((c) => c.id === categoryId);
			if (category) {
				result.push({
					name: category.name,
					hours,
					averagePerWeek: hours / weeks,
					countsAsWorkTime: category.countsAsWorkTime
				});
			}
		}

		// Sort by hours descending
		result.sort((a, b) => b.hours - a.hours);
		return result;
	}

	let categoryBreakdown = $derived(calculateCategoryBreakdown());

	function calculatePeriodGroups(): PeriodGroup[] {
		const byMonth = groupByMonth();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local variable in non-reactive function
		const groups = new Map<string, { entries: TimeEntry[]; dates: Set<string> }>();

		// Group entries
		for (const entry of rangeEntries) {
			const entryDate = parseDate(entry.date);
			if (!entryDate) continue;

			const key = getPeriodKey(entryDate, byMonth);

			if (!groups.has(key)) {
				groups.set(key, { entries: [], dates: new Set() });
			}
			const group = groups.get(key)!;
			group.entries.push(entry);
			group.dates.add(entry.date);
		}

		// Also add dates without entries (for Soll calculation)
		let current = parseDate(rangeStartStr);
		const end = parseDate(rangeEndStr);
		if (current && end) {
			while (current <= end) {
				const dateStr = formatDate(current, 'ISO');
				const key = getPeriodKey(current, byMonth);

				if (!groups.has(key)) {
					groups.set(key, { entries: [], dates: new Set() });
				}
				groups.get(key)!.dates.add(dateStr);

				current = addDays(current, 1);
			}
		}

		// Calculate Ist/Soll for each group
		const result: PeriodGroup[] = [];
		const sortedKeys = Array.from(groups.keys()).sort();

		for (const key of sortedKeys) {
			const group = groups.get(key)!;
			const ist = calculateIst(group.entries, $categories);

			let soll = 0;
			for (const dateStr of group.dates) {
				const date = parseDate(dateStr);
				if (!date) continue;
				const dayType = dayTypesCache.get(dateStr) ?? 'arbeitstag';
				const model = getActiveModelForDate(date);
				soll += calculateSoll(date, dayType, model);
			}

			const label = getPeriodLabel(key, byMonth);
			result.push({ label, ist, soll });
		}

		return result;
	}

	let periodGroups = $derived(calculatePeriodGroups());

	// Load day types for the entire range
	async function loadDayTypesForRange() {
		dayTypesCache.clear();
		let current = parseDate(rangeStartStr);
		const end = parseDate(rangeEndStr);
		if (!current || !end) return;

		while (current <= end) {
			const dateKey = formatDate(current, 'ISO');
			const record = await getByKey<DayType>('dayTypes', dateKey);
			dayTypesCache.set(dateKey, record?.type ?? 'arbeitstag');
			current = addDays(current, 1);
		}
	}

	// Reload when range changes
	$effect(() => {
		// Access the range strings to create dependency
		if (rangeStartStr && rangeEndStr) {
			loadDayTypesForRange();
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
		await loadDayTypesForRange();
		loading = false;
	});
</script>

<div class="analysis-page">
	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Date Range Selector -->
		<div class="range-section">
			<span class="range-label">Zeitraum:</span>
			<button class="range-button" onclick={() => (showRangeSelector = true)}>
				{rangeDisplay}
			</button>
		</div>

		<!-- Inline Summary -->
		<InlineSummary ist={totalIst} soll={totalSoll} saldo={totalSaldo} />

		<!-- Category Breakdown -->
		{#if categoryBreakdown.length > 0}
			<div class="category-breakdown">
				<div class="section-header-row">
					<h3 class="section-title">Tätigkeiten</h3>
					<div class="column-headers">
						<span class="header-label">Gesamt</span>
						<span class="header-label">Ø/Woche</span>
					</div>
				</div>
				{#each categoryBreakdown as cat (cat.name)}
					<div class="category-item">
						<span class="category-name">
							{cat.name}
							{#if !cat.countsAsWorkTime}
								<span class="no-work-badge">Keine Arbeitszeit</span>
							{/if}
						</span>
						<div class="category-values">
							<span class="category-hours">{formatHours(cat.hours)}</span>
							<span class="category-average">{formatHours(cat.averagePerWeek)}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Period List -->
		<div class="period-list">
			{#if periodGroups.length === 0}
				<p class="no-periods">Keine Daten im ausgewählten Zeitraum</p>
			{:else}
				{#each periodGroups as period (period.label)}
					{@const periodSaldo = period.ist - period.soll}
					<div class="period-item">
						<span class="period-label">{period.label}</span>
						<div class="period-hours">
							<span class="ist">{formatHours(period.ist)}</span>
							<span class="separator">/</span>
							<span class="soll">{formatHours(period.soll)}</span>
							<span class="separator">/</span>
							<span
								class="saldo"
								class:positive={periodSaldo >= 0}
								class:negative={periodSaldo < 0}
							>
								{periodSaldo >= 0 ? '+' : ''}{formatHours(periodSaldo)}
							</span>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<!-- Date Range Selector Modal -->
{#if showRangeSelector}
	<DateRangeSelector
		startDate={rangeStartStr}
		endDate={rangeEndStr}
		onsave={(start, end) => {
			rangeStartStr = start;
			rangeEndStr = end;
			showRangeSelector = false;
		}}
		onclose={() => (showRangeSelector = false)}
	/>
{/if}

<style>
	.analysis-page {
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

	/* Date Range Selector */
	.range-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.range-label {
		font-weight: 500;
		color: #333;
	}

	.range-button {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		background: white;
		font-size: 1rem;
		cursor: pointer;
	}

	.range-button:hover {
		background: #f5f5f5;
		border-color: #999;
	}

	/* Period List */
	.period-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.no-periods {
		text-align: center;
		color: #888;
		padding: 2rem;
	}

	.period-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: white;
		border: 1px solid #eee;
		border-radius: 8px;
	}

	.period-label {
		font-weight: 600;
		color: #333;
	}

	.period-hours {
		display: flex;
		gap: 0.25rem;
		font-size: 0.9rem;
		color: #666;
	}

	.period-hours .ist {
		color: #333;
	}

	.period-hours .separator {
		color: #999;
	}

	.period-hours .soll {
		color: #666;
	}

	.period-hours .saldo.positive {
		color: #16a34a;
	}

	.period-hours .saldo.negative {
		color: #dc2626;
	}

	/* Category Breakdown */
	.category-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.section-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: #333;
	}

	.category-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: white;
		border: 1px solid #eee;
		border-radius: 6px;
	}

	.category-name {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #333;
	}

	.no-work-badge {
		font-size: 0.7rem;
		padding: 2px 6px;
		background: #f3f4f6;
		color: #6b7280;
		border-radius: 4px;
	}

	.section-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.column-headers {
		display: flex;
		gap: 1rem;
	}

	.header-label {
		font-size: 0.75rem;
		color: #666;
		min-width: 60px;
		text-align: right;
	}

	.category-values {
		display: flex;
		gap: 1rem;
	}

	.category-hours {
		font-weight: 600;
		color: #333;
		min-width: 60px;
		text-align: right;
	}

	.category-average {
		font-weight: 500;
		color: #666;
		min-width: 60px;
		text-align: right;
	}
</style>
