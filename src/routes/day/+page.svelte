<!--
  Day Tab - Main daily time tracking view
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3 (Tab: Tag)
  
  TODO (Task 2.6+): Implement full UI structure with:
  - Warning banner
  - Day type selector
  - Inline summary
  - Task list
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeCategories } from '$lib/storage/categories';

	let loading = $state(true);

	onMount(async () => {
		await initializeCategories();
		loading = false;
	});
</script>

<div class="day-page">
	<header class="page-header">
		<h1>Tag</h1>
	</header>

	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<div class="content">
			<p class="placeholder">Tagesansicht wird implementiert...</p>
		</div>
	{/if}
</div>

<style>
	.day-page {
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 1rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: 2rem;
		color: #666;
	}

	.placeholder {
		color: #888;
		text-align: center;
		padding: 2rem;
	}
</style>
