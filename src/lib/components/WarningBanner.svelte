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
		class="tt-warning-banner tt-warning-banner--clickable"
		role="button"
		tabindex="0"
		data-testid="warning-banner"
		{onclick}
		onkeydown={(e) => e.key === 'Enter' && onclick?.()}
	>
		<span class="tt-warning-banner__icon">⚠</span>
		<span class="tt-warning-banner__message">{message}</span>
		{#if actionLabel && onaction}
			<button class="tt-warning-banner__action" onclick={handleActionClick} data-testid="warning-banner-action">
				{actionLabel}
			</button>
		{/if}
	</div>
{:else}
	<div class="tt-warning-banner" role="alert" data-testid="warning-banner">
		<span class="tt-warning-banner__icon">⚠</span>
		<span class="tt-warning-banner__message">{message}</span>
		{#if actionLabel && onaction}
			<button class="tt-warning-banner__action" onclick={handleActionClick} data-testid="warning-banner-action">
				{actionLabel}
			</button>
		{/if}
	</div>
{/if}

<style>
	.tt-warning-banner {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
	}

	/* Visual styles use design system classes: .tt-warning-banner, .tt-warning-banner--clickable, .tt-warning-banner__icon, .tt-warning-banner__message, .tt-warning-banner__action */
</style>
