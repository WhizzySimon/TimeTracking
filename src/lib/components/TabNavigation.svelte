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
		{ href: '/add', label: '+', isPlus: true, icon: null, colorClass: null },
		{ href: '/day', label: 'Tag', isPlus: false, icon: null, colorClass: 'tt-footer-tab--day' },
		{ href: '/week', label: 'Woche', isPlus: false, icon: null, colorClass: 'tt-footer-tab--week' },
		{
			href: '/month',
			label: 'Monat',
			isPlus: false,
			icon: null,
			colorClass: 'tt-footer-tab--month'
		},
		{
			href: '/analysis',
			label: null,
			isPlus: false,
			icon: 'chart',
			colorClass: 'tt-footer-tab--analysis'
		}
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
			class="tt-footer-tab {tab.colorClass || ''}"
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
					<path d="M3 3v18h18M7 16l4-4 4 4 6-6" />
				</svg>
			{:else}
				{tab.label}
			{/if}
		</a>
	{/each}
</nav>

<style>
	/* All styling handled by .tt-footer-nav in design system */
</style>
