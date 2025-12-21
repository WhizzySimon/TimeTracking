<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import TabNavigation from '$lib/components/TabNavigation.svelte';

	let { children } = $props();

	onMount(() => {
		if (!dev && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-container">
	<main class="main-content">
		{@render children()}
	</main>
	<TabNavigation />
</div>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		height: 100%;
	}

	:global(body) {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
	}

	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		padding-bottom: 60px;
	}
</style>
