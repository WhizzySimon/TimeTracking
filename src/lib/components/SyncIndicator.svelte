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
	class="sync-indicator"
	style="--indicator-color: {config.color}; --indicator-bg: {config.bgColor}"
	title={config.label}
	role="status"
	aria-label={config.label}
	data-testid="sync-indicator"
	data-sync-status={$syncStatus}
>
	<span class="icon" class:spinning={$syncStatus === 'syncing'}>{config.icon}</span>
	<span class="label">{config.label}</span>
</div>

<style>
	.sync-indicator {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: var(--tt-radius-pill);
		background-color: var(--indicator-bg);
		color: var(--indicator-color);
		font-size: var(--tt-font-size-tiny);
		font-weight: 500;
		cursor: default;
		user-select: none;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		font-size: var(--tt-font-size-small);
		font-weight: 700;
	}

	.icon.spinning {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.label {
		white-space: nowrap;
	}

	@media (max-width: 360px) {
		.label {
			display: none;
		}

		.sync-indicator {
			padding: 4px 8px;
		}
	}

	@media (prefers-color-scheme: dark) {
		.sync-indicator {
			background-color: color-mix(in srgb, var(--indicator-bg) 30%, #1f1f1f);
		}
	}
</style>
