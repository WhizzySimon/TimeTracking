<!--
  Plus-Tab - Quick task start view
  
  Spec refs:
  - Docs/Features/Specs/P07-20251223-quick-start-ux.md (Phase 8)
  
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
		filteredCategories
	} from '$lib/stores';
	import { initializeCategories, getAllCategories } from '$lib/storage/categories';
	import { getAll } from '$lib/storage/db';
	import { saveTimeEntry } from '$lib/storage/operations';
	import { getAllEmployers } from '$lib/storage/employers';
	import { formatDate, formatTime } from '$lib/utils/date';
	import type { TimeEntry } from '$lib/types';
	import CategoryList from '$lib/components/CategoryList.svelte';

	let loading = $state(true);

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
		// AG-FR-040: New entry inherits current employer selection
		const currentEmployerId = $selectedEmployerId;
		const newEntry: TimeEntry = {
			id: `entry-${crypto.randomUUID()}`,
			date: currentDateStr,
			categoryId,
			startTime: currentTimeStr,
			endTime: null,
			description: null,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			employerId: currentEmployerId
		};
		await saveTimeEntry(newEntry);

		// Reload all entries from IndexedDB to update the store
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);

		// Phase 8: Redirect to Day tab after starting task
		goto(resolve('/day'));
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
	<h1>Aufgabe starten</h1>

	{#if loading}
		<p class="loading">Laden...</p>
	{:else}
		<CategoryList
			categories={$filteredCategories}
			entries={$timeEntries}
			onselect={handleCategorySelect}
			employers={$activeEmployers}
			selectedEmployerId={$selectedEmployerId}
		/>
	{/if}
</div>

<style>
	.add-page {
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
		min-height: calc(100vh - 120px);
	}

	h1 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary, #1f2937);
	}

	.loading {
		color: var(--text-secondary, #6b7280);
		text-align: center;
		padding: 2rem;
	}

	:global(.dark) h1 {
		color: var(--text-primary-dark, #f3f4f6);
	}

	:global(.dark) .loading {
		color: var(--text-secondary-dark, #9ca3af);
	}
</style>
