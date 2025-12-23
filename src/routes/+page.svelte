<!--
  Root page - redirects based on running task state
  
  Spec refs:
  - Phase 8: Default-Tab-Logik
  - If running task exists → /day
  - If no running task → /add (Plus-Tab)
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getAll } from '$lib/storage/db';
	import { isToday } from '$lib/utils/date';
	import type { TimeEntry } from '$lib/types';

	onMount(async () => {
		// Load all time entries to check for running task
		const allEntries = await getAll<TimeEntry>('timeEntries');

		// Check if there's a running task (no end time) for today
		const hasRunningTask = allEntries.some(
			(e) => e.endTime === null && isToday(new Date(e.date + 'T00:00:00'))
		);

		// Redirect based on running task state
		if (hasRunningTask) {
			goto(resolve('/day'), { replaceState: true });
		} else {
			goto(resolve('/add'), { replaceState: true });
		}
	});
</script>

<div class="loading">
	<p>Laden...</p>
</div>

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 50vh;
		color: #666;
	}
</style>
