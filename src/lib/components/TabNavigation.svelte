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
		{ href: '/add', label: '+', isPlus: true, icon: null },
		{ href: '/day', label: 'Tag', isPlus: false, icon: null },
		{ href: '/week', label: 'Woche', isPlus: false, icon: null },
		{ href: '/month', label: 'Monat', isPlus: false, icon: null },
		{ href: '/analysis', label: null, isPlus: false, icon: 'chart' }
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

<nav class="tt-footer-nav" aria-label="Hauptnavigation">
	{#each tabs as tab (tab.href)}
		<a
			href={resolve(tab.href)}
			class="tt-footer-tab"
			class:tt-footer-tab--plus={tab.isPlus}
			aria-current={isActive(tab.href, $page.url.pathname) ? 'page' : undefined}
			aria-label={tab.isPlus
				? 'Aufgabe hinzufügen'
				: tab.icon === 'chart'
					? 'Auswertung'
					: undefined}
		>
			{#if tab.icon === 'chart'}
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="20" x2="18" y2="10"></line>
					<line x1="12" y1="20" x2="12" y2="4"></line>
					<line x1="6" y1="20" x2="6" y2="14"></line>
				</svg>
			{:else}
				{tab.label}
			{/if}
		</a>
	{/each}
</nav>

<style>
	/* Layout positioning only - styling handled by .tt-footer-nav in design system */
	.tt-footer-nav {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 600px;
		z-index: 100;
	}
</style>
