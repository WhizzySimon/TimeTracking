<!--
  WarningBanner component - displays warning messages
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.1 (Hinweisbanner)
  
  Used for: sync errors, general warnings
  - Persistent (not dismissible)
-->
<script lang="ts">
	interface Props {
		message: string;
		onclick?: () => void;
		actionLabel?: string;
		onaction?: () => void;
	}

	let { message, onclick, actionLabel, onaction }: Props = $props();

	function handleActionClick(event: MouseEvent) {
		event.stopPropagation();
		onaction?.();
	}
</script>

{#if onclick}
	<div
		class="warning-banner clickable"
		role="button"
		tabindex="0"
		data-testid="warning-banner"
		{onclick}
		onkeydown={(e) => e.key === 'Enter' && onclick?.()}
	>
		<span class="warning-icon">⚠</span>
		<span class="warning-message">{message}</span>
		{#if actionLabel && onaction}
			<button class="action-btn" onclick={handleActionClick} data-testid="warning-banner-action">
				{actionLabel}
			</button>
		{/if}
	</div>
{:else}
	<div class="warning-banner" role="alert" data-testid="warning-banner">
		<span class="warning-icon">⚠</span>
		<span class="warning-message">{message}</span>
		{#if actionLabel && onaction}
			<button class="action-btn" onclick={handleActionClick} data-testid="warning-banner-action">
				{actionLabel}
			</button>
		{/if}
	</div>
{/if}

<style>
	.warning-banner {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		padding: 0.75rem 1rem;
		background: var(--tt-status-warning-50);
		border: 1px solid var(--tt-status-warning-500);
		border-radius: var(--tt-radius-card);
		color: var(--tt-status-warning-500);
	}

	.warning-icon {
		font-size: 1.1rem;
	}

	.warning-message {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
	}

	.clickable {
		cursor: pointer;
	}

	.clickable:hover {
		background: var(--tt-status-warning-50);
		filter: brightness(0.95);
	}

	.action-btn {
		margin-left: auto;
		padding: 0.25rem 0.75rem;
		border: 1px solid var(--tt-brand-primary-500);
		background: var(--tt-brand-primary-500);
		color: white;
		font-size: var(--tt-font-size-small);
		font-weight: 500;
		cursor: pointer;
		border-radius: var(--tt-radius-button);
		white-space: nowrap;
	}

	.action-btn:hover {
		background: var(--tt-brand-primary-dark);
	}
</style>
