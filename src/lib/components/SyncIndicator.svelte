<!--
  SyncIndicator.svelte
  
  Displays sync status indicator button in the header.
  Shows SVG icon based on sync state props.
  
  States:
  - synced: Bluish-gray - all data backed up
  - pending: Yellow - changes not yet backed up
  - syncing: Bluish (animated) - sync in progress
  - error: Red - sync failed
-->
<script lang="ts">
	import { syncInProgress } from '$lib/stores';

	interface Props {
		syncNeeded: boolean;
		syncError: string | null;
		onclick: () => void;
	}

	let { syncNeeded, syncError, onclick }: Props = $props();

	// Determine current state
	let state = $derived.by(() => {
		if (syncError) return 'error';
		if ($syncInProgress) return 'syncing';
		if (syncNeeded) return 'pending';
		return 'synced';
	});

	// Determine title text
	let title = $derived.by(() => {
		if (syncError) return 'Synchronisierungsfehler';
		if ($syncInProgress) return 'Synchronisiere...';
		if (syncNeeded) return 'Synchronisierung ausstehend';
		return 'Synchronisiert';
	});
</script>

<button
	class="sync-indicator tt-interactive-dark"
	class:synced={state === 'synced'}
	class:syncing={state === 'syncing'}
	class:conflict={state === 'error'}
	class:out-of-sync={state === 'pending'}
	{onclick}
	title={title}
	aria-label="Synchronisierung"
>
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
		<polyline points="23 4 23 10 17 10"></polyline>
		<polyline points="1 20 1 14 7 14"></polyline>
		<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
	</svg>
</button>

<style>
	.sync-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: var(--tt-radius-button);
		transition:
			background 0.15s,
			color 0.15s;
	}

	.sync-indicator svg {
		width: 20px;
		height: 20px;
	}

	@media (max-width: 350px) {
		.sync-indicator {
			width: 36px;
			height: 36px;
		}

		.sync-indicator svg {
			width: 18px;
			height: 18px;
		}
	}

	@media (max-width: 300px) {
		.sync-indicator {
			width: 32px;
			height: 32px;
		}

		.sync-indicator svg {
			width: 16px;
			height: 16px;
		}
	}

	/* Hover state for header buttons (white overlay on dark bg) */
	@media (hover: hover) {
		.sync-indicator:hover {
			background: rgba(255, 255, 255, 0.12);
		}
	}

	.sync-indicator:active {
		background: rgba(255, 255, 255, 0.2);
	}

	.sync-indicator.out-of-sync {
		color: var(--tt-status-warning-500);
		opacity: 1;
	}

	.sync-indicator.syncing {
		color: var(--tt-brand-primary-300);
		opacity: 1;
		cursor: default;
	}

	.sync-indicator.syncing svg {
		animation: rotate 1.5s linear infinite;
	}

	.sync-indicator.synced {
		color: var(--tt-brand-primary-300);
		opacity: 1;
	}

	.sync-indicator.conflict {
		color: var(--tt-status-danger-500);
		opacity: 1;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
