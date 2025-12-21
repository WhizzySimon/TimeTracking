<!--
  Root page - redirects to /day
  
  Spec refs:
  - ui-logic-spec-v1.md Section 2 (Tag is the default tab)
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(resolve('/day'), { replaceState: true });
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
