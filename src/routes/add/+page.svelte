<!--
  Plus-Tab - Quick task start view
  
  Spec refs:
  - TempAppDevDocs/Features/Specs/P07-20251223-quick-start-ux.md (Phase 8)
  
  Features:
  1. Smart suggestions (Top 5 based on context)
  2. Full category list (A-Z)
  3. One-click task start
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		categories,
		timeEntries,
		employers,
		activeEmployers,
		selectedEmployerId,
		filteredCategories,
		currentDate
	} from '$lib/stores';
	import { initializeCategories, getAllCategories } from '$lib/storage/categories';
	import { getAll } from '$lib/storage/db';
	import { saveTimeEntry } from '$lib/storage/operations';
	import { getAllEmployers } from '$lib/storage/employers';
	import { formatDate, formatTime } from '$lib/utils/date';
	import type { TimeEntry } from '$lib/types';
	import CategoryList from '$lib/components/CategoryList.svelte';
	import CategoryDialog from '$lib/components/CategoryDialog.svelte';
	import { setNeverAddedAnEntry, neverAddedAnEntry } from '$lib/stores/user';

	let loading = $state(true);
	let showCreateCategoryDialog = $state(false);

	// Check if there's a running task (no end time)
	let runningEntry = $derived($timeEntries.find((e) => e.endTime === null) ?? null);

	/**
	 * Ein-Klick-Start: creates a new task immediately with the selected category.
	 * Spec refs: TT-FR-003 (create with startTime=now, endTime=null)
	 *            TT-FR-005 (auto-end running task first)
	 *            Phase 8: Redirect to /day after start
	 */
	async function handleCategorySelect(categoryId: string) {
		const now = new Date();
		const currentTimeStr = formatTime(now);
		const currentDateStr = formatDate(now, 'ISO');

		// TT-FR-005: If a task is already running, end it first
		if (runningEntry) {
			const endedEntry: TimeEntry = {
				...runningEntry,
				endTime: currentTimeStr,
				updatedAt: Date.now()
			};
			await saveTimeEntry(endedEntry);
		}

		// TT-FR-003: Create new task with startTime=now, endTime=null (running)
		// AG-FR-040: Entry always inherits the category's employer
		// (header filter is just for display, not for assigning properties)
		const category = $filteredCategories.find((c) => c.id === categoryId);
		const entryEmployerId = category?.employerId ?? null;
		const newEntry: TimeEntry = {
			id: `entry-${crypto.randomUUID()}`,
			date: currentDateStr,
			categoryId,
			startTime: currentTimeStr,
			endTime: null,
			description: null,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			employerId: entryEmployerId
		};
		await saveTimeEntry(newEntry);

		// Mark that user has added their first entry
		setNeverAddedAnEntry(false);

		// Reload all entries from IndexedDB to update the store
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);

		// Set current date to today so Day tab shows the newly started task
		currentDate.set(now);

		// Mark navigation so day-page doesn't load saved date
		sessionStorage.setItem('date-navigation', 'true');

		// Phase 8: Redirect to Day tab after starting task
		goto(resolve('/day'));
	}

	function handleCategoryCreated() {
		showCreateCategoryDialog = false;
	}

	onMount(async () => {
		// Initialize categories if needed
		await initializeCategories();

		// Load all categories into store
		const allCategories = await getAllCategories();
		categories.set(allCategories);

		// Load all time entries
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);

		// Load all employers into store
		const allEmployers = await getAllEmployers();
		employers.set(allEmployers);

		loading = false;
	});
</script>

<div class="add-page">
	{#if $neverAddedAnEntry}
		<div class="first-time-hint">Klicke auf einen Eintrag, um die Zeit zu starten</div>
	{/if}
	{#if loading}
		<p class="loading">Laden...</p>
	{:else}
		<CategoryList
			categories={$filteredCategories}
			entries={$timeEntries}
			onselect={handleCategorySelect}
			employers={$activeEmployers}
			selectedEmployerId={$selectedEmployerId}
			oncreatecategory={() => (showCreateCategoryDialog = true)}
		/>
	{/if}
</div>

{#if showCreateCategoryDialog}
	<CategoryDialog
		mode="create"
		categoryType="user"
		defaultEmployerId={$selectedEmployerId ?? undefined}
		onsave={handleCategoryCreated}
		onclose={() => (showCreateCategoryDialog = false)}
	/>
{/if}

<style>
	.add-page {
		padding: var(--tt-space-16);
		max-width: 600px;
		margin: 0 auto;
		min-height: calc(100vh - 120px);
	}

	.first-time-hint {
		background: var(--tt-status-info-faded);
		color: var(--tt-primary);
		padding: var(--tt-space-12) var(--tt-space-16);
		border-radius: var(--tt-radius-card);
		font-size: 0.875rem;
		text-align: center;
		margin-bottom: var(--tt-space-16);
		border: 1px solid var(--tt-primary);
	}

	.loading {
		color: var(--tt-text-muted);
		text-align: center;
		padding: var(--tt-space-32);
	}
</style>
