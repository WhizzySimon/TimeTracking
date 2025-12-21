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
	import { currentDate } from '$lib/stores';
	import { formatDate, isToday } from '$lib/utils/date';
	import InlineSummary from '$lib/components/InlineSummary.svelte';

	let loading = $state(true);

	// Dummy data for now (Task 2.9+ will load real data)
	let ist = $state(0);
	let soll = $state(8);
	let saldo = $state(-8);

	// Reactive date display
	let dateDisplay = $derived(isToday($currentDate) ? 'Heute' : formatDate($currentDate, 'DE'));

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
			<button class="nav-btn" aria-label="Vorheriger Tag">←</button>
			<h1 class="date-title">{dateDisplay}</h1>
			<button class="nav-btn" aria-label="Nächster Tag">→</button>
		</header>

		<!-- Day Type Selector (placeholder) -->
		<div class="day-type-section">
			<label for="day-type">Tagesart:</label>
			<select id="day-type" class="day-type-select">
				<option value="arbeitstag">Arbeitstag</option>
				<option value="urlaub">Urlaub</option>
				<option value="krank">Krank</option>
				<option value="feiertag">Feiertag</option>
			</select>
		</div>

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
	}

	/* Day Type Selector */
	.day-type-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.day-type-section label {
		font-weight: 500;
		color: #666;
	}

	.day-type-select {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
		cursor: pointer;
	}

	.day-type-select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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
