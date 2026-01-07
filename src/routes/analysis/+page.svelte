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
		const debugEffectiveWeeks = calculateEffectiveWeeks(totalSoll);
		console.log('Ø/Woche denominator:', {
			workDaysInRange: workDays,
			effectiveWeeks: debugEffectiveWeeks.toFixed(2)
		});

		// 7. Missing employerId counts (should be 0 after migration)
		const entriesMissingEmployerId = rangeEntries.filter(
			(e) => e.employerId === null || e.employerId === undefined
		).length;
		const categoriesMissingEmployerId = $filteredCategories.filter(
			(c) =>
				c.type !== 'system' &&
				c.countsAsWorkTime === true && // Absence categories (countsAsWorkTime=false) correctly have null employerId
				(c.employerId === null || c.employerId === undefined)
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
			// Sum Soll from all active models (important for "Alle Arbeitgeber")
			const models = getActiveModelsForDate(current);
			for (const model of models) {
				total += calculateSoll(current, dayType, model);
			}
			current = addDays(current, 1);
		}
		return total;
	}

	// Get active work time model for a specific date, respecting employer filter
	// When "Alle Arbeitgeber" is selected, returns ALL active models (one per employer)
	function getActiveModelsForDate(date: Date): WorkTimeModel[] {
		const dateStr = formatDate(date, 'ISO');
		
		// Group models by employer, then get the most recent valid one per employer
		const modelsByEmployer = new Map<string, WorkTimeModel>();
		
		for (const model of $filteredModels) {
			if (model.validFrom <= dateStr && model.employerId) {
				const existing = modelsByEmployer.get(model.employerId);
				if (!existing || model.validFrom > existing.validFrom) {
					modelsByEmployer.set(model.employerId, model);
				}
			}
		}
		
		return Array.from(modelsByEmployer.values());
	}
	
	// Legacy function for single model (kept for backwards compatibility if needed)
	function getActiveModelForDate(date: Date): WorkTimeModel | null {
		const models = getActiveModelsForDate(date);
		return models[0] ?? null;
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

	// Calculate weekly target from active models (sum of all employers' weekly hours)
	function calculateWeeklyTarget(): number {
		// Sample a few dates to get the average weekly target
		// We use dates where models are active to get a representative weekly target
		let current = parseDate(rangeStartStr);
		const end = parseDate(rangeEndStr);
		if (!current || !end) return 40; // Fallback
		
		let totalWeeklyHours = 0;
		let weeksWithModels = 0;
		let lastWeekKey = '';
		
		while (current <= end) {
			const weekKey = `${current.getFullYear()}-W${getWeekNumber(current)}`;
			
			// Only calculate once per week (on Monday or first day of range in that week)
			if (weekKey !== lastWeekKey) {
				const models = getActiveModelsForDate(current);
				if (models.length > 0) {
					let weekHours = 0;
					for (const model of models) {
						weekHours += (model.monday ?? 0) + (model.tuesday ?? 0) + 
							(model.wednesday ?? 0) + (model.thursday ?? 0) + 
							(model.friday ?? 0) + (model.saturday ?? 0) + (model.sunday ?? 0);
					}
					if (weekHours > 0) {
						totalWeeklyHours += weekHours;
						weeksWithModels++;
					}
				}
				lastWeekKey = weekKey;
			}
			current = addDays(current, 1);
		}
		
		return weeksWithModels > 0 ? totalWeeklyHours / weeksWithModels : 40;
	}

	// Calculate effective weeks - ensures Ø/Woche is consistent with Soll
	// For "Alle Arbeitgeber": derive from Soll / weeklyTarget (same basis as Soll calculation)
	// For single employer: model-based (work days / days per week)
	function calculateEffectiveWeeks(sollValue: number): number {
		// For "Alle Arbeitgeber", derive from Soll to ensure consistency
		// If Haben is positive, Ø/Woche will be > weekly target (as expected)
		if ($selectedEmployerId === null) {
			const weeklyTarget = calculateWeeklyTarget();
			if (weeklyTarget <= 0 || sollValue <= 0) return 1; // Avoid division by zero
			return sollValue / weeklyTarget;
		}
		
		// For single employer: model-based calculation (work days / days per week)
		let current = parseDate(rangeStartStr);
		const end = parseDate(rangeEndStr);
		if (!current || !end) return 0;
		
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local variable in non-reactive function
		const workDaysByDaysPerWeek = new Map<number, number>();
		
		while (current <= end) {
			const dateKey = formatDate(current, 'ISO');
			const dayType = dayTypesCache.get(dateKey) ?? 'arbeitstag';
			const isWorkDay = dayType === 'arbeitstag';
			
			if (!isWorkDay) {
				current = addDays(current, 1);
				continue;
			}
			
			const model = getActiveModelForDate(current);
			if (model && isWeekdayActiveInModel(current, model)) {
				const daysPerWeek = getWorkDaysPerWeekFromModel(model);
				workDaysByDaysPerWeek.set(
					daysPerWeek,
					(workDaysByDaysPerWeek.get(daysPerWeek) ?? 0) + 1
				);
			}
			current = addDays(current, 1);
		}
		
		// Calculate effective weeks by summing (workDays / daysPerWeek)
		let totalEffectiveWeeks = 0;
		for (const [daysPerWeek, workDays] of workDaysByDaysPerWeek) {
			totalEffectiveWeeks += workDays / daysPerWeek;
		}
		
		return totalEffectiveWeeks;
	}

	let effectiveWeeks = $derived(calculateEffectiveWeeks(totalSoll));

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
				// Sum Soll from all active models (important for "Alle Arbeitgeber")
				const models = getActiveModelsForDate(date);
				for (const model of models) {
					soll += calculateSoll(date, dayType, model);
				}
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
			<button class="tt-range-button tt-interactive" onclick={() => (showRangeSelector = true)}>
				<span class="tt-range-button__date">{rangeDisplay}</span>
			</button>
		</div>

		<!-- Inline Summary -->
		<InlineSummary ist={totalIst} soll={totalSoll} saldo={totalSaldo} />

		<!-- Zeiten Section (Period List) -->
		<section class="collapsible-section">
			<button
				class="tt-section-toggle"
				onclick={() => (expandedSections.zeiten = !expandedSections.zeiten)}
				aria-expanded={expandedSections.zeiten}
			>
				<span
					class="tt-section-toggle__icon"
					class:tt-section-toggle__icon--expanded={expandedSections.zeiten}>▶</span
				>
				<h3 class="tt-section-toggle__title">Zeiten</h3>
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
								<div class="tt-period-hours">
									<span class="tt-period-hours__ist">{formatHours(period.ist)}</span>
									<span class="tt-period-hours__separator">/</span>
									<span class="tt-period-hours__soll">{formatHours(period.soll)}</span>
									<span class="tt-period-hours__separator">/</span>
									<span
										class="tt-period-hours__saldo"
										class:tt-period-hours__saldo--positive={periodSaldo >= 0}
										class:tt-period-hours__saldo--negative={periodSaldo < 0}
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
						class="tt-section-toggle"
						onclick={() => toggleSection('taetigkeiten')}
						aria-expanded={expandedSections.taetigkeiten}
					>
						<span
							class="tt-section-toggle__icon"
							class:tt-section-toggle__icon--expanded={expandedSections.taetigkeiten}>▶</span
						>
						<h3 class="tt-section-toggle__title">Einträge</h3>
					</button>
					<div class="column-headers">
						<span class="tt-column-header-label">Gesamt</span>
						<span class="tt-column-header-label">Ø/Woche</span>
					</div>
				</div>
				<!-- Total Sum Row - Always visible -->
				<div class="tt-list-row-static tt-summary-total-row">
					<span class="tt-summary-total-row__label">Summe</span>
					<div class="summary-values">
						<span class="tt-summary-value tt-summary-value--secondary"
							>{formatHours(totalCategoryHours)}</span
						>
						<span class="tt-summary-value tt-summary-value--primary"
							>{formatHours(totalCategoryAverage)}</span
						>
					</div>
				</div>
				<!-- Category list - Collapsible -->
				{#if expandedSections.taetigkeiten}
					{#each categoryBreakdown as cat (cat.name)}
						<div class="tt-list-row-static category-row">
							<span class="tt-category-name">
								{cat.name}
								{#if !cat.countsAsWorkTime}
									<span class="tt-no-work-badge">Keine Arbeitszeit</span>
								{/if}
							</span>
							<div class="summary-values">
								<span class="tt-summary-value tt-summary-value--secondary"
									>{formatHours(cat.hours)}</span
								>
								<span class="tt-summary-value tt-summary-value--primary"
									>{formatHours(cat.averagePerWeek)}</span
								>
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
		padding: var(--tt-space-16);
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
	}

	/* Loading uses .tt-loading-text from design system */

	/* Date Range Selector - centered with no extra padding */
	.range-selector-row {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tt-range-button {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--tt-space-4);
	}

	/* Period List */
	.period-list {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	/* No periods uses .tt-empty-state from design system */

	.tt-period-hours {
		display: flex;
		gap: var(--tt-space-4);
		margin-left: auto;
	}

	/* Collapsible Sections */
	.collapsible-section {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.tt-section-toggle {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		padding: 0;
	}

	/* Visual styles use design system classes: .tt-section-toggle, .tt-section-toggle__icon, .tt-section-toggle__title, .tt-no-work-badge */

	.section-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.column-headers {
		display: flex;
		gap: var(--tt-space-16);
	}

	/* Header labels use .tt-column-header-label from design system */

	.tt-summary-total-row {
		margin-bottom: var(--tt-space-8);
		justify-content: space-between;
		display: flex;
		align-items: center;
	}

	.category-row {
		justify-content: space-between;
	}

	.tt-category-name {
		flex: 1;
		min-width: 0;
	}

	.summary-values {
		display: flex;
		gap: var(--tt-space-16);
		flex-shrink: 0;
	}

	/* Summary values use .tt-summary-value, .tt-summary-value--primary, .tt-summary-value--secondary from design system */
</style>
