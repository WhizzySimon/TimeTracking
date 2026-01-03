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
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		timeEntries,
		categories,
		workTimeModels,
		dayTypes,
		currentDate,
		filteredEntries,
		filteredCategories,
		filteredModels,
		filteredDayTypes,
		selectedEmployerId
	} from '$lib/stores';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll, getByKey, put } from '$lib/storage/db';
	import { markLocalChanged } from '$lib/backup/cloud';
	import { formatDate, parseDate, getWeekNumber, addDays } from '$lib/utils/date';
	import {
		calculateIst,
		calculateSoll,
		calculateSaldo,
		formatHours
	} from '$lib/utils/calculations';
	import type {
		Category,
		DayType,
		DayTypeValue,
		TimeEntry,
		WorkTimeModel,
		UserPreference
	} from '$lib/types';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import DateRangeSelector from '$lib/components/DateRangeSelector.svelte';

	const PREF_KEY = 'analysis-date-range';

	let loading = $state(true);
	let showRangeSelector = $state(false);
	let rangeLoaded = $state(false);
	// Collapsible sections state
	let expandedSections = $state({
		zeiten: true,
		taetigkeiten: true
	});

	function toggleSection(section: 'zeiten' | 'taetigkeiten') {
		expandedSections[section] = !expandedSections[section];
	}

	// Default range: 01.01.current year to today
	const defaultRange = {
		start: formatDate(new Date(new Date().getFullYear(), 0, 1), 'ISO'),
		end: formatDate(new Date(), 'ISO')
	};

	let rangeStartStr = $state(defaultRange.start);
	let rangeEndStr = $state(defaultRange.end);

	// Load range from IndexedDB
	async function loadSavedRange() {
		try {
			const pref = await getByKey<UserPreference>('userPreferences', PREF_KEY);
			if (pref?.value) {
				const parsed = JSON.parse(pref.value);
				if (parsed.start && parsed.end) {
					rangeStartStr = parsed.start;
					rangeEndStr = parsed.end;
				}
			}
		} catch {
			// Use defaults on error
		}
		rangeLoaded = true;
	}

	// Save range to IndexedDB when it changes (after initial load)
	$effect(() => {
		if (browser && rangeLoaded && rangeStartStr && rangeEndStr) {
			const pref: UserPreference = {
				key: PREF_KEY,
				value: JSON.stringify({ start: rangeStartStr, end: rangeEndStr }),
				updatedAt: Date.now()
			};
			put('userPreferences', pref).then(() => markLocalChanged());
		}
	});

	// Day types cache for the range
	const dayTypesCache = new SvelteMap<string, DayTypeValue>();

	// Parse range strings to dates for calculations
	let rangeStart = $derived(parseDate(rangeStartStr) ?? new Date());
	let rangeEnd = $derived(parseDate(rangeEndStr) ?? new Date());

	// Format range for display
	let rangeDisplay = $derived(`${formatDate(rangeStart, 'DE')} – ${formatDate(rangeEnd, 'DE')}`);

	// Filter entries within date range, respecting employer filter
	let rangeEntries = $derived(
		$filteredEntries.filter((entry) => {
			return entry.date >= rangeStartStr && entry.date <= rangeEndStr;
		})
	);

	// Calculate totals for the range
	let totalIst = $derived(calculateIst(rangeEntries, $filteredCategories));
	let totalSoll = $derived(calculateTotalSoll());
	let totalSaldo = $derived(calculateSaldo(totalIst, totalSoll));

	// ============================================================================
	// DEBUG: Analysis diagnostic logging (remove after verification)
	// Set to false to disable logging
	// ============================================================================
	const ANALYSIS_DEBUG = true;

	$effect(() => {
		if (!ANALYSIS_DEBUG || !browser || loading) return;

		console.group('[Analysis Debug]');

		// 1. Employer filter state
		const employerLabel = $selectedEmployerId === null ? 'ALL' : $selectedEmployerId;
		console.log(`selectedEmployerId: ${employerLabel}`);

		// 2. Counts BEFORE employer filtering (all data)
		console.log('BEFORE employer filter:', {
			entries: $timeEntries.length,
			categories: $categories.length,
			dayTypes: $dayTypes.length,
			models: $workTimeModels.length
		});

		// 3. Counts AFTER employer filtering
		console.log('AFTER employer filter:', {
			entries: $filteredEntries.length,
			categories: $filteredCategories.length,
			dayTypes: $filteredDayTypes.length,
			models: $filteredModels.length
		});

		// 4. Range entries analysis
		const categoryMap = new Map($filteredCategories.map((cat) => [cat.id, cat]));
		let matchedCount = 0,
			unmatchedCount = 0,
			notWorkTimeCount = 0;
		const unmatchedCategoryIds = new Set<string>();

		for (const entry of rangeEntries) {
			if (!entry.endTime) continue;
			const category = categoryMap.get(entry.categoryId);
			if (!category) {
				unmatchedCount++;
				unmatchedCategoryIds.add(entry.categoryId);
			} else if (!category.countsAsWorkTime) {
				notWorkTimeCount++;
			} else {
				matchedCount++;
			}
		}

		console.log('rangeEntries:', {
			total: rangeEntries.length,
			matchedToCategory: matchedCount,
			countsAsWorkTimeFalse: notWorkTimeCount,
			unmatchedCategoryId: unmatchedCount,
			unmatchedIds: unmatchedCategoryIds.size > 0 ? [...unmatchedCategoryIds] : '(none)'
		});

		// 5. Soll calculation details
		let totalDaysInRange = 0,
			arbeitstagsCount = 0,
			nonWorkDayCount = 0;
		const dayTypeSamples: string[] = [];
		let modelUsed: string | null = null;
		let modelNullCount = 0;

		let current = parseDate(rangeStartStr);
		const end = parseDate(rangeEndStr);
		if (current && end) {
			while (current <= end) {
				totalDaysInRange++;
				const dateKey = formatDate(current, 'ISO');
				const dayType = dayTypesCache.get(dateKey) ?? 'arbeitstag';
				const model = getActiveModelForDate(current);

				if (model && !modelUsed) modelUsed = model.name;
				if (!model) modelNullCount++;

				if (dayType === 'arbeitstag') {
					arbeitstagsCount++;
				} else {
					nonWorkDayCount++;
					if (dayTypeSamples.length < 5) dayTypeSamples.push(`${dateKey}:${dayType}`);
				}
				current = addDays(current, 1);
			}
		}

		console.log('Soll calculation:', {
			totalDays: totalDaysInRange,
			arbeitstags: arbeitstagsCount,
			nonWorkDays: nonWorkDayCount,
			nonWorkSamples: dayTypeSamples.length > 0 ? dayTypeSamples : '(none)',
			modelUsed: modelUsed ?? '(none)',
			daysWithNoModel: modelNullCount,
			totalSoll: totalSoll.toFixed(2) + 'h'
		});

		// 6. Ø/Woche denominator
		const workDays = countWorkDaysInRange();
		const effectiveWeeks = calculateEffectiveWeeks();
		console.log('Ø/Woche denominator:', {
			workDaysInRange: workDays,
			effectiveWeeks: effectiveWeeks.toFixed(2)
		});

		// 7. Missing employerId counts (should be 0 after migration)
		const entriesMissingEmployerId = rangeEntries.filter(
			(e) => e.employerId === null || e.employerId === undefined
		).length;
		const categoriesMissingEmployerId = $filteredCategories.filter(
			(c) => c.type !== 'system' && (c.employerId === null || c.employerId === undefined)
		).length;
		const modelsMissingEmployerId = $filteredModels.filter(
			(m) => m.employerId === null || m.employerId === undefined
		).length;
		const dayTypesMissingEmployerId = $filteredDayTypes.filter(
			(d) => d.employerId === null || d.employerId === undefined
		).length;

		if (
			entriesMissingEmployerId > 0 ||
			categoriesMissingEmployerId > 0 ||
			modelsMissingEmployerId > 0 ||
			dayTypesMissingEmployerId > 0
		) {
			console.warn('MISSING employerId (should be 0 after migration):', {
				entries: entriesMissingEmployerId,
				categories: categoriesMissingEmployerId,
				models: modelsMissingEmployerId,
				dayTypes: dayTypesMissingEmployerId
			});
		} else {
			console.log('employerId coverage: ✓ all records have employerId');
		}

		// 8. Final totals
		console.log('TOTALS:', {
			Ist: totalIst.toFixed(2) + 'h',
			Soll: totalSoll.toFixed(2) + 'h',
			Saldo: totalSaldo.toFixed(2) + 'h'
		});

		console.groupEnd();
	});
	// ============================================================================
	// END DEBUG
	// ============================================================================

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

	// Get active work time model for a specific date, respecting employer filter
	function getActiveModelForDate(date: Date): WorkTimeModel | null {
		const dateStr = formatDate(date, 'ISO');
		const validModels = $filteredModels
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
		key: string;
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

	// Get the weekday key for a Date (0=Sunday, 1=Monday, etc.)
	function getWeekdayKey(date: Date): keyof WorkTimeModel {
		const dayIndex = date.getDay();
		const keys: (keyof WorkTimeModel)[] = [
			'sunday',
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday'
		];
		return keys[dayIndex];
	}

	// Check if a weekday is active in a WorkTimeModel (hours > 0)
	function isWeekdayActiveInModel(date: Date, model: WorkTimeModel | null): boolean {
		if (!model) return false;
		const key = getWeekdayKey(date);
		const hours = model[key];
		return typeof hours === 'number' && hours > 0;
	}

	// Count work days per week in a WorkTimeModel
	function getWorkDaysPerWeekFromModel(model: WorkTimeModel | null): number {
		if (!model) return 5; // Default fallback
		let count = 0;
		const days: (keyof WorkTimeModel)[] = [
			'monday',
			'tuesday',
			'wednesday',
			'thursday',
			'friday',
			'saturday',
			'sunday'
		];
		for (const day of days) {
			const hours = model[day];
			if (typeof hours === 'number' && hours > 0) {
				count++;
			}
		}
		return count || 5; // Fallback to 5 if no days configured
	}

	// Count actual work days in range, considering:
	// 1. WorkTimeModel (which weekdays are active)
	// 2. DayTypes (urlaub, krank, feiertag exclude the day)
	function countWorkDaysInRange(): number {
		let workDays = 0;
		let current = parseDate(rangeStartStr);
		const end = parseDate(rangeEndStr);
		if (!current || !end) return 0;

		while (current <= end) {
			const dateKey = formatDate(current, 'ISO');
			const dayType = dayTypesCache.get(dateKey) ?? 'arbeitstag';
			const model = getActiveModelForDate(current);

			// Only count if:
			// 1. This weekday is active in the WorkTimeModel (has hours > 0)
			// 2. The day is not marked as urlaub/krank/feiertag
			const isActiveWeekday = isWeekdayActiveInModel(current, model);
			const isWorkDay = dayType === 'arbeitstag';

			if (isActiveWeekday && isWorkDay) {
				workDays++;
			}
			current = addDays(current, 1);
		}
		return workDays;
	}

	// Calculate effective weeks based on work days and work days per week from model
	// This handles multiple WorkTimeModels across the date range by using weighted average
	function calculateEffectiveWeeks(): number {
		const workDays = countWorkDaysInRange();
		if (workDays === 0) return 0;

		// Get the predominant model (model active for most days in range)
		// For simplicity, use the model at range start - could be enhanced for multi-model ranges
		const startDate = parseDate(rangeStartStr);
		if (!startDate) return workDays / 5;

		const model = getActiveModelForDate(startDate);
		const daysPerWeek = getWorkDaysPerWeekFromModel(model);

		return workDays / daysPerWeek;
	}

	let effectiveWeeks = $derived(calculateEffectiveWeeks());

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
			const category = $filteredCategories.find((cat) => cat.id === categoryId);
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

	// Calculate totals for work-time categories only (excluding Pause, etc.)
	let totalCategoryHours = $derived(
		categoryBreakdown.filter((cat) => cat.countsAsWorkTime).reduce((sum, cat) => sum + cat.hours, 0)
	);
	let totalCategoryAverage = $derived(
		effectiveWeeks > 0 ? totalCategoryHours / effectiveWeeks : totalCategoryHours
	);

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
			const ist = calculateIst(group.entries, $filteredCategories);

			let soll = 0;
			for (const dateStr of group.dates) {
				const date = parseDate(dateStr);
				if (!date) continue;
				const dayType = dayTypesCache.get(dateStr) ?? 'arbeitstag';
				const model = getActiveModelForDate(date);
				soll += calculateSoll(date, dayType, model);
			}

			const label = getPeriodLabel(key, byMonth);
			result.push({ key, label, ist, soll });
		}

		return result;
	}

	let periodGroups = $derived(calculatePeriodGroups());

	/**
	 * Navigate to week or month tab based on period key.
	 * Key format: "2025-01" for month, "2025-W01" for week
	 */
	function navigateToPeriod(key: string) {
		const isMonth = !key.includes('-W');

		if (isMonth) {
			// Month key format: "2025-01"
			const [year, month] = key.split('-').map(Number);
			// Set currentDate to first day of the month
			currentDate.set(new Date(year, month - 1, 1));
			// Mark that we're navigating (so target page doesn't load saved date)
			sessionStorage.setItem('date-navigation', 'true');
			goto(resolve('/month'));
		} else {
			// Week key format: "2025-W01"
			const [yearPart, weekPart] = key.split('-W');
			const year = parseInt(yearPart);
			const week = parseInt(weekPart);
			// Get a date in that week (use Thursday as it's always in the correct ISO week)
			const jan4 = new Date(year, 0, 4);
			const dayOfWeek = jan4.getDay() || 7; // Convert Sunday from 0 to 7
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local variable in non-reactive function
			const firstThursday = new Date(jan4);
			firstThursday.setDate(jan4.getDate() - dayOfWeek + 4);
			// Calculate the target Thursday
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local variable in non-reactive function
			const targetDate = new Date(firstThursday);
			targetDate.setDate(firstThursday.getDate() + (week - 1) * 7);
			currentDate.set(targetDate);
			// Mark that we're navigating (so target page doesn't load saved date)
			sessionStorage.setItem('date-navigation', 'true');
			goto(resolve('/week'));
		}
	}

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

	// Refresh data from database when page becomes visible (handles navigation back)
	async function refreshData() {
		await initializeCategories();
		const allCategories = await getAll<Category>('categories');
		categories.set(allCategories);
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);
		const allModels = await getAll<WorkTimeModel>('workTimeModels');
		workTimeModels.set(allModels);
	}

	onMount(() => {
		// Initial data load
		(async () => {
			await refreshData();
			await loadSavedRange();
			await loadDayTypesForRange();
			loading = false;
		})();

		// Refresh data when page becomes visible again (e.g., after navigating back from settings)
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				refreshData();
			}
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	});
</script>

<div class="analysis-page">
	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Date Range Selector -->
		<div class="range-selector-row">
			<span class="range-label">Zeitraum</span>
			<button class="range-button" onclick={() => (showRangeSelector = true)}>
				{rangeDisplay}
			</button>
		</div>

		<!-- Inline Summary -->
		<InlineSummary ist={totalIst} soll={totalSoll} saldo={totalSaldo} />

		<!-- Zeiten Section (Period List) -->
		<section class="collapsible-section">
			<button
				class="section-toggle"
				onclick={() => (expandedSections.zeiten = !expandedSections.zeiten)}
				aria-expanded={expandedSections.zeiten}
			>
				<span class="toggle-icon" class:expanded={expandedSections.zeiten}>▶</span>
				<h3 class="section-title">Zeiten</h3>
			</button>
			{#if expandedSections.zeiten}
				<div class="period-list">
					{#if periodGroups.length === 0}
						<p class="no-periods">Keine Daten im ausgewählten Zeitraum</p>
					{:else}
						{#each periodGroups as period (period.key)}
							{@const periodSaldo = period.ist - period.soll}
							<button class="tt-list-row-clickable" onclick={() => navigateToPeriod(period.key)}>
								<div class="tt-list-row__content">
									<span class="tt-list-row__title">{period.label}</span>
								</div>
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
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		</section>

		<!-- Einträge Section (Category Breakdown) -->
		{#if categoryBreakdown.length > 0}
			<section class="collapsible-section">
				<div class="section-header-row">
					<button
						class="section-toggle"
						onclick={() => toggleSection('taetigkeiten')}
						aria-expanded={expandedSections.taetigkeiten}
					>
						<span class="toggle-icon" class:expanded={expandedSections.taetigkeiten}>▶</span>
						<h3 class="section-title">Einträge</h3>
					</button>
					<div class="column-headers">
						<span class="header-label">Gesamt</span>
						<span class="header-label">Ø/Woche</span>
					</div>
				</div>
				<!-- Total Sum Row - Always visible -->
				<div class="tt-list-row-static summary-total-row">
					<span class="summary-label">Summe</span>
					<div class="summary-values">
						<span class="summary-value summary-value--secondary"
							>{formatHours(totalCategoryHours)}</span
						>
						<span class="summary-value summary-value--primary"
							>{formatHours(totalCategoryAverage)}</span
						>
					</div>
				</div>
				<!-- Category list - Collapsible -->
				{#if expandedSections.taetigkeiten}
					{#each categoryBreakdown as cat (cat.name)}
						<div class="tt-list-row-static category-row">
							<span class="category-name">
								{cat.name}
								{#if !cat.countsAsWorkTime}
									<span class="no-work-badge">Keine Arbeitszeit</span>
								{/if}
							</span>
							<div class="summary-values">
								<span class="summary-value summary-value--secondary">{formatHours(cat.hours)}</span>
								<span class="summary-value summary-value--primary">{formatHours(cat.averagePerWeek)}</span>
							</div>
						</div>
					{/each}
				{/if}
			</section>
		{/if}
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

	/* Date Range Selector - right-aligned with auto-width */
	.range-selector-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--tt-space-12);
		padding: var(--tt-space-12) var(--tt-space-16);
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
	}

	.range-label {
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.range-button {
		padding: 0.5rem 1rem;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		background: var(--tt-background-card);
		color: var(--tt-text-primary);
		font-size: 1rem;
		cursor: pointer;
		text-align: left;
		white-space: nowrap;
		transition: background var(--tt-transition-fast), border-color var(--tt-transition-fast);
	}

	@media (hover: hover) {
		.range-button:hover {
			background: var(--tt-background-card-hover);
			border-color: var(--tt-border-default);
		}
	}

	/* Period List */
	.period-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.no-periods {
		text-align: center;
		color: var(--tt-text-muted);
		padding: 2rem;
	}

	.period-hours {
		display: flex;
		gap: 0.25rem;
		font-size: 0.9rem;
		color: var(--tt-text-muted);
		margin-left: auto;
	}

	.period-hours .ist {
		color: var(--tt-text-primary);
	}

	.period-hours .separator {
		color: var(--tt-text-muted);
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

	/* Collapsible Sections */
	.collapsible-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
	}

	.toggle-icon {
		display: inline-block;
		font-size: 0.7rem;
		color: #666;
		transition: transform 0.2s ease;
	}

	.toggle-icon.expanded {
		transform: rotate(90deg);
	}

	.section-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--tt-text-primary);
	}

	.no-work-badge {
		font-size: 0.7rem;
		padding: 2px 6px;
		background: var(--tt-background-card-hover);
		color: var(--tt-text-muted);
		border-radius: var(--tt-radius-input);
	}

	.section-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.column-headers {
		display: flex;
		gap: var(--tt-space-16);
	}

	.header-label {
		font-size: 0.75rem;
		color: var(--tt-text-muted);
		min-width: 60px;
		text-align: right;
	}

	/* Summary row styling - info row, not clickable */
	.summary-total-row {
		background: var(--tt-background-info);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		padding: var(--tt-space-12) var(--tt-space-16);
		margin-bottom: var(--tt-space-8);
		justify-content: space-between;
		display: flex;
		align-items: center;
	}

	.summary-label {
		font-weight: 700;
		color: var(--tt-brand-primary);
	}

	.category-row {
		justify-content: space-between;
	}

	.category-name {
		flex: 1;
		min-width: 0;
		color: var(--tt-text-primary);
	}

	.summary-values {
		display: flex;
		gap: var(--tt-space-16);
		flex-shrink: 0;
	}

	.summary-value {
		font-weight: 600;
		color: var(--tt-text-primary);
		min-width: 60px;
		text-align: right;
	}

	.summary-value--primary {
		font-weight: 700;
		color: var(--tt-brand-primary);
	}

	.summary-value--secondary {
		font-weight: 500;
		color: var(--tt-text-muted);
	}
</style>
