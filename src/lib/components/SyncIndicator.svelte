<!--
  SyncIndicator.svelte
  
  Displays sync status indicator in the app.
  Shows icon based on syncStatus store.
  
  States:
  - synced: ✅ Green - all data backed up
  - pending: ⚠️ Yellow - changes not yet backed up
  - syncing: 🔄 Blue - sync in progress
  - error: ❌ Red - sync failed
  
  Spec refs:
  - technical-guideline-v1.md Section 4.6 (Planned UI Feedback)
  - Task 4.5 (Create sync status indicator component)
-->
<script lang="ts">
	import { syncStatus } from '$lib/stores';

	const statusConfig = {
		synced: {
			icon: '✓',
			label: 'Gesichert',
			color: 'var(--tt-status-success-500)',
			bgColor: 'var(--tt-status-success-50)'
		},
		pending: {
			icon: '!',
			label: 'Nicht gesichert',
			color: 'var(--tt-status-warning-500)',
			bgColor: 'var(--tt-status-warning-50)'
		},
		syncing: {
			icon: '↻',
			label: 'Synchronisiere...',
			color: 'var(--tt-status-info)',
			bgColor: 'var(--tt-status-info-faded)'
		},
		error: {
			icon: '✕',
			label: 'Sync-Fehler',
			color: 'var(--tt-status-danger-500)',
			bgColor: 'var(--tt-status-danger-50)'
		}
	} as const;

	let config = $derived(statusConfig[$syncStatus]);
</script>

<div
	class="tt-sync-indicator"
	style="--indicator-color: {config.color}; --indicator-bg: {config.bgColor}"
	title={config.label}
	role="status"
	aria-label={config.label}
	data-testid="sync-indicator"
	data-sync-status={$syncStatus}
>
	<span class="tt-sync-indicator__icon" class:tt-sync-indicator__icon--spinning={$syncStatus === 'syncing'}>{config.icon}</span>
	<span class="tt-sync-indicator__label">{config.label}</span>
</div>

<style>
	/* Visual styles use design system classes: .tt-sync-indicator, .tt-sync-indicator__icon, .tt-sync-indicator__icon--spinning, .tt-sync-indicator__label */
	/* Media queries and animations are in design system */
</style>
