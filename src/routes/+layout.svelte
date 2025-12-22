<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dev, browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import TabNavigation from '$lib/components/TabNavigation.svelte';
	import SyncIndicator from '$lib/components/SyncIndicator.svelte';
	import { syncNow, checkSyncStatus } from '$lib/sync/engine';

	let { children } = $props();

	let visibilityHandler: (() => void) | null = null;

	onMount(() => {
		if (!dev && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}

		// Check sync status on startup
		checkSyncStatus();

		// Trigger sync on startup (after a short delay to let app initialize)
		setTimeout(() => {
			syncNow().catch((err) => console.error('[Layout] Startup sync failed:', err));
		}, 1000);

		// Trigger sync when user returns to tab
		if (browser) {
			visibilityHandler = () => {
				if (document.visibilityState === 'visible') {
					syncNow().catch((err) => console.error('[Layout] Visibility sync failed:', err));
				}
			};
			document.addEventListener('visibilitychange', visibilityHandler);
		}
	});

	onDestroy(() => {
		if (browser && visibilityHandler) {
			document.removeEventListener('visibilitychange', visibilityHandler);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-container">
	<header class="app-header">
		<SyncIndicator />
	</header>
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

	.app-header {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 8px 12px;
		background: #ffffff;
		border-bottom: 1px solid #e0e0e0;
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.main-content {
		flex: 1;
		padding-bottom: 60px;
	}

	@media (prefers-color-scheme: dark) {
		.app-header {
			background: #1f1f1f;
			border-bottom-color: #333333;
		}
	}
</style>
