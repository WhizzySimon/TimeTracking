<!--
  Plus-Tab - Quick task start view
  
  Spec refs:
  - Docs/Specs/P07-20251223-quick-start-ux.md (Phase 8)
  
  Features:
  1. Smart suggestions (Top 5 based on context)
  2. Full category list (A-Z)
  3. One-click task start
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { categories, timeEntries } from '$lib/stores';
	import { initializeCategories, getAllCategories } from '$lib/storage/categories';
	import { getAll } from '$lib/storage/db';
	import type { TimeEntry } from '$lib/types';
	import CategoryList from '$lib/components/CategoryList.svelte';

	let loading = $state(true);

	// Placeholder for Task 8.4 - Ein-Klick-Start Logik
	function handleCategorySelect(categoryId: string) {
		console.log('Category selected:', categoryId);
		// TODO: Implement in Task 8.4
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

		loading = false;
	});
</script>

<div class="add-page">
	<h1>Aufgabe starten</h1>

	{#if loading}
		<p class="loading">Laden...</p>
	{:else}
		<CategoryList categories={$categories} entries={$timeEntries} onselect={handleCategorySelect} />
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
