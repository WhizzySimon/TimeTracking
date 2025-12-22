<!--
  TabNavigation.svelte
  
  Bottom tab navigation for the TimeTracker app.
  Renders 4 tabs: Tag, Woche, Auswertung, Einstellungen
  
  Spec refs:
  - ui-logic-spec-v1.md Section 2 (Tabs & Navigation)
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';

	const tabs = [
		{ href: '/day', label: 'Tag' },
		{ href: '/week', label: 'Woche' },
		{ href: '/analysis', label: 'Auswertung' }
	] as const;

	function isActive(href: string, pathname: string): boolean {
		if (href === '/day') {
			return pathname === '/' || pathname === '/day' || pathname.startsWith('/day/');
		}
		return pathname === href || pathname.startsWith(href + '/');
	}
</script>

<nav class="tab-navigation" aria-label="Hauptnavigation">
	{#each tabs as tab (tab.href)}
		<a
			href={resolve(tab.href)}
			class="tab"
			class:active={isActive(tab.href, $page.url.pathname)}
			aria-current={isActive(tab.href, $page.url.pathname) ? 'page' : undefined}
		>
			{tab.label}
		</a>
	{/each}
</nav>

<style>
	.tab-navigation {
		display: flex;
		flex-wrap: nowrap;
		justify-content: stretch;
		align-items: stretch;
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 600px;
		background: #ffffff;
		border-top: 1px solid #e0e0e0;
		padding: 0;
		z-index: 100;
	}

	.tab {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50px;
		padding: 10px 8px;
		text-decoration: none;
		color: #666666;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.tab:hover {
		background-color: #f5f5f5;
	}

	.tab.active {
		color: #2563eb;
		background-color: #eff6ff;
	}

	@media (prefers-color-scheme: dark) {
		.tab-navigation {
			background: #1f1f1f;
			border-top-color: #333333;
		}

		.tab {
			color: #a0a0a0;
		}

		.tab:hover {
			background-color: #2a2a2a;
		}

		.tab.active {
			color: #60a5fa;
			background-color: #1e3a5f;
		}
	}
</style>
