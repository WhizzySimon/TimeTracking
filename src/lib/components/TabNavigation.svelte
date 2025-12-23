<!--
  TabNavigation.svelte
  
  Bottom tab navigation for the TimeTracker app.
  Renders 5 tabs: + (Plus-Tab), Tag, Woche, Monat, Auswertung
  
  Spec refs:
  - ui-logic-spec-v1.md Section 2 (Tabs & Navigation)
  - Phase 8: Plus-Tab as first tab
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';

	const tabs = [
		{ href: '/add', label: '+', isPlus: true },
		{ href: '/day', label: 'Tag', isPlus: false },
		{ href: '/week', label: 'Woche', isPlus: false },
		{ href: '/month', label: 'Monat', isPlus: false },
		{ href: '/analysis', label: 'Auswertung', isPlus: false }
	] as const;

	function isActive(href: string, pathname: string): boolean {
		if (href === '/add') {
			return pathname === '/add';
		}
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
			class:plus-tab={tab.isPlus}
			aria-current={isActive(tab.href, $page.url.pathname) ? 'page' : undefined}
			aria-label={tab.isPlus ? 'Aufgabe hinzufügen' : undefined}
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
		align-items: center;
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 600px;
		background: var(--nav-bg);
		border-top: 1px solid var(--header-border);
		border-radius: var(--r-tab) var(--r-tab) 0 0;
		padding: 6px 4px;
		z-index: 100;
		gap: 4px;
	}

	.tab {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 38px;
		padding: 8px 12px;
		text-decoration: none;
		color: var(--nav-text);
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		border-radius: var(--r-pill);
		transition:
			color var(--transition-fast),
			background-color var(--transition-fast),
			border-radius var(--transition-fast);
	}

	.tab:hover {
		background-color: var(--nav-active-bg);
		color: var(--nav-text-active);
		border-radius: var(--r-pill);
	}

	.tab.active {
		color: var(--nav-text-active);
		background-color: var(--nav-active-bg);
		border-radius: var(--r-pill);
	}

	/* Plus-Tab base: smaller fixed width, larger font */
	.tab.plus-tab {
		flex: 0 0 auto;
		min-width: 48px;
		max-width: 48px;
		font-size: 1.5rem;
		font-weight: 700;
	}

	/* Plus-Tab active: white background with accent text for clear visibility */
	.tab.plus-tab.active {
		color: var(--accent);
		background-color: white;
	}
</style>
