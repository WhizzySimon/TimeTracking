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
			color: '#22c55e',
			bgColor: '#dcfce7'
		},
		pending: {
			icon: '!',
			label: 'Nicht gesichert',
			color: '#eab308',
			bgColor: '#fef9c3'
		},
		syncing: {
			icon: '↻',
			label: 'Synchronisiere...',
			color: '#3b82f6',
			bgColor: '#dbeafe'
		},
		error: {
			icon: '✕',
			label: 'Sync-Fehler',
			color: '#ef4444',
			bgColor: '#fee2e2'
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
		border-radius: 16px;
		background-color: var(--indicator-bg);
		color: var(--indicator-color);
		font-size: 0.75rem;
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
		font-size: 0.875rem;
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
