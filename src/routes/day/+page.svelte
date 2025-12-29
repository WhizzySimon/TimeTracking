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
	import {
		currentDate,
		timeEntries,
		categories,
		filteredEntries,
		filteredCategories,
		filteredActiveWorkTimeModel,
		filteredRunningEntry,
		selectedEmployerId
	} from '$lib/stores';
	import { formatDate, isToday, addDays, formatTime } from '$lib/utils/date';
	import { calculateSoll, calculateSaldo, calculateIst } from '$lib/utils/calculations';
	import { getByKey, getAll } from '$lib/storage/db';
	import { deleteTimeEntry, saveTimeEntry } from '$lib/storage/operations';
	import type { Category, DayType, DayTypeValue, TimeEntry } from '$lib/types';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import DayTypeSelector from '$lib/components/DayTypeSelector.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import AddTaskModal from '$lib/components/AddTaskModal.svelte';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import DayPicker from '$lib/components/DayPicker.svelte';

	let loading = $state(true);

	// Day type for current date (loaded from IndexedDB)
	let dayType: DayTypeValue = $state('arbeitstag');

	// Modal state
	let showAddModal = $state(false);
	let editingEntry: TimeEntry | null = $state(null);
	let showDeleteConfirm = $state(false);
	let entryToDelete: TimeEntry | null = $state(null);
	let showDayPicker = $state(false);

	// Filter entries for current date (respects employer filter)
	let dayEntries = $derived(
		$filteredEntries.filter((entry) => entry.date === formatDate($currentDate, 'ISO'))
	);

	// Calculate Ist from day entries (only completed tasks with countsAsWorkTime categories)
	let ist = $derived(calculateIst(dayEntries, $filteredCategories));

	// Soll calculated from day type and work time model (respects employer filter)
	let soll = $derived(calculateSoll($currentDate, dayType, $filteredActiveWorkTimeModel));

	// Saldo = Ist - Soll
	let saldo = $derived(calculateSaldo(ist, soll));

	// Weekday names in German (short form)
	const weekdayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

	// Reactive date display with weekday
	let dateDisplay = $derived(() => {
		const weekday = weekdayNames[$currentDate.getDay()];
		if (isToday($currentDate)) {
			return `Heute, ${weekday} ${formatDate($currentDate, 'DE')}`;
		}
		return `${weekday} ${formatDate($currentDate, 'DE')}`;
	});

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

	function openDayPicker() {
		showDayPicker = true;
	}

	function handleDaySelect(date: Date) {
		currentDate.set(date);
		showDayPicker = false;
	}

	// Modal handlers
	function openEditModal(entry: TimeEntry) {
		editingEntry = entry;
		showAddModal = true;
	}

	function closeModal() {
		showAddModal = false;
		editingEntry = null;
	}

	async function handleSaveEntry() {
		// Reload all entries from IndexedDB
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);
	}

	function handleDeleteEntry(entry: TimeEntry) {
		entryToDelete = entry;
		showDeleteConfirm = true;
	}

	async function confirmDeleteEntry() {
		if (!entryToDelete) return;
		await deleteTimeEntry(entryToDelete.id);
		// Reload all entries from IndexedDB
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);
		showDeleteConfirm = false;
		entryToDelete = null;
	}

	function cancelDeleteEntry() {
		showDeleteConfirm = false;
		entryToDelete = null;
	}

	/**
	 * End a running task immediately.
	 * Spec ref: TT-FR-011 (tap "Beenden" sets endTime=now, saves immediately)
	 * Full implementation in Task 7.5
	 */
	async function handleEndEntry(entry: TimeEntry) {
		const now = new Date();
		const currentTimeStr = formatTime(now);

		const endedEntry: TimeEntry = {
			...entry,
			endTime: currentTimeStr,
			updatedAt: Date.now()
		};
		await saveTimeEntry(endedEntry);

		// Reload all entries from IndexedDB to update the store
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);
	}

	/**
	 * Resume a completed task (create new task with same category).
	 * Spec refs: TT-FR-014 (creates new task with same category)
	 *            TT-FR-015 (auto-end running task first)
	 * Full implementation in Task 7.6
	 */
	async function handleResumeEntry(entry: TimeEntry) {
		const now = new Date();
		const currentTimeStr = formatTime(now);
		const currentDateStr = formatDate(now, 'ISO');

		// TT-FR-015: If a task is already running, end it first
		if ($filteredRunningEntry) {
			const endedEntry: TimeEntry = {
				...$filteredRunningEntry,
				endTime: currentTimeStr,
				updatedAt: Date.now()
			};
			await saveTimeEntry(endedEntry);
		}

		// TT-FR-014: Create new task with same category
		// Inherit employerId from original entry or current selection
		const newEntry: TimeEntry = {
			id: `entry-${crypto.randomUUID()}`,
			date: currentDateStr,
			categoryId: entry.categoryId,
			employerId: entry.employerId ?? $selectedEmployerId,
			startTime: currentTimeStr,
			endTime: null,
			description: null,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};
		await saveTimeEntry(newEntry);

		// Reload all entries from IndexedDB to update the store
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);
	}

	// Watch for editEntryId in page state (from running task banner click via pushState)
	$effect(() => {
		const pageState = $page.state as { editEntryId?: string } | undefined;
		const editEntryId = pageState?.editEntryId;
		if (editEntryId && !loading) {
			const entryToEdit = $timeEntries.find((e) => e.id === editEntryId);
			if (entryToEdit) {
				editingEntry = entryToEdit;
				showAddModal = true;
			}
			// Clear the state after opening modal
			replaceState(resolve('/day'), {});
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
			<button class="date-title" onclick={openDayPicker}>{dateDisplay()}</button>
			<button class="nav-btn" onclick={goToNextDay} aria-label="Nächster Tag">→</button>
		</header>

		<!-- Day Type Selector -->
		<DayTypeSelector date={$currentDate} onchange={handleDayTypeChange} />

		<!-- Inline Summary -->
		<InlineSummary {ist} {soll} {saldo} />

		<!-- Task List -->
		<TaskList
			entries={dayEntries}
			onselect={openEditModal}
			ondelete={handleDeleteEntry}
			onend={handleEndEntry}
			onresume={handleResumeEntry}
		/>
	{/if}
</div>

<!-- Add/Edit Task Modal -->
{#if showAddModal}
	<AddTaskModal
		date={$currentDate}
		entry={editingEntry}
		onclose={closeModal}
		onsave={handleSaveEntry}
	/>
{/if}

<!-- Delete Confirmation Dialog -->
{#if showDeleteConfirm}
	<ConfirmDialog
		title="Aufgabe löschen"
		message="Aufgabe wirklich löschen?"
		confirmLabel="Löschen"
		confirmStyle="danger"
		onconfirm={confirmDeleteEntry}
		oncancel={cancelDeleteEntry}
	/>
{/if}

<!-- Day Picker Modal -->
{#if showDayPicker}
	<DayPicker
		currentDate={$currentDate}
		timeEntries={$timeEntries}
		onselect={handleDaySelect}
		onclose={() => (showDayPicker = false)}
	/>
{/if}

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
		color: var(--muted);
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
		border: 1px solid var(--border);
		border-radius: var(--r-btn);
		background: var(--surface);
		color: var(--text);
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-btn:hover {
		background: var(--surface-hover);
	}

	.nav-btn:active {
		background: var(--surface-active);
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
		border-radius: var(--r-btn);
		color: var(--text);
	}

	.date-title:hover {
		background: var(--surface-hover);
	}
</style>
