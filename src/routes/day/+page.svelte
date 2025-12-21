<!--
  Day Tab - Main daily time tracking view
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3 (Tab: Tag)
  
  Order (per spec):
  1. Warning banner (if running task exists)
  2. Day type selector
  3. Inline summary (Ist/Soll/Saldo)
  4. Task list (newest first)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeCategories } from '$lib/storage/categories';
	import { currentDate, activeWorkTimeModel } from '$lib/stores';
	import { formatDate, isToday, addDays } from '$lib/utils/date';
	import { calculateSoll, calculateSaldo } from '$lib/utils/calculations';
	import { getByKey } from '$lib/storage/db';
	import type { DayType, DayTypeValue } from '$lib/types';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import DayTypeSelector from '$lib/components/DayTypeSelector.svelte';

	let loading = $state(true);

	// Day type for current date (loaded from IndexedDB)
	let dayType: DayTypeValue = $state('arbeitstag');

	// Ist is 0 for now (Task 2.13 will calculate from time entries)
	let ist = $state(0);

	// Soll calculated from day type and work time model
	let soll = $derived(calculateSoll($currentDate, dayType, $activeWorkTimeModel));

	// Saldo = Ist - Soll
	let saldo = $derived(calculateSaldo(ist, soll));

	// Reactive date display
	let dateDisplay = $derived(isToday($currentDate) ? 'Heute' : formatDate($currentDate, 'DE'));

	// Load day type when date changes
	$effect(() => {
		loadDayType($currentDate);
	});

	async function loadDayType(date: Date) {
		const dateKey = formatDate(date, 'ISO');
		const record = await getByKey<DayType>('dayTypes', dateKey);
		dayType = record?.type ?? 'arbeitstag';
	}

	// Handle day type change from selector
	function handleDayTypeChange(newType: DayTypeValue) {
		dayType = newType;
	}

	// Date navigation functions
	function goToPreviousDay() {
		currentDate.set(addDays($currentDate, -1));
	}

	function goToNextDay() {
		currentDate.set(addDays($currentDate, 1));
	}

	function goToToday() {
		currentDate.set(new Date());
	}

	onMount(async () => {
		await initializeCategories();
		loading = false;
	});
</script>

<div class="day-page">
	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Date Navigation -->
		<header class="date-nav">
			<button class="nav-btn" onclick={goToPreviousDay} aria-label="Vorheriger Tag">←</button>
			<button class="date-title" onclick={goToToday}>{dateDisplay}</button>
			<button class="nav-btn" onclick={goToNextDay} aria-label="Nächster Tag">→</button>
		</header>

		<!-- Day Type Selector -->
		<DayTypeSelector date={$currentDate} onchange={handleDayTypeChange} />

		<!-- Inline Summary -->
		<InlineSummary {ist} {soll} {saldo} />

		<!-- Add Task Button -->
		<div class="add-task-section">
			<button class="add-task-btn">+ Aufgabe hinzufügen</button>
		</div>

		<!-- Task List (empty for now) -->
		<div class="task-list">
			<p class="empty-state">Keine Aufgaben für diesen Tag</p>
		</div>
	{/if}
</div>

<style>
	.day-page {
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

	/* Date Navigation */
	.date-nav {
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

	.date-title {
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

	.date-title:hover {
		background: #f5f5f5;
	}

	/* Add Task Button */
	.add-task-section {
		margin-top: 0.5rem;
	}

	.add-task-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px dashed #ddd;
		border-radius: 8px;
		background: transparent;
		color: #666;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-task-btn:hover {
		border-color: #3b82f6;
		color: #3b82f6;
		background: rgba(59, 130, 246, 0.05);
	}

	/* Task List */
	.task-list {
		min-height: 100px;
	}

	.empty-state {
		text-align: center;
		color: #888;
		padding: 2rem;
		font-style: italic;
	}
</style>
