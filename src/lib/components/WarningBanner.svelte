<!--
  WarningBanner component - displays warning for running tasks
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.1 (Hinweisbanner)
  
  Shows: "⚠ Aufgabe läuft noch (keine Endzeit)"
  - Persistent (not dismissible)
  - Disappears immediately when running task gets end time
-->
<script lang="ts">
	import type { Category, Employer } from '$lib/types';

	interface Props {
		message: string;
		onclick?: () => void;
		actionLabel?: string;
		onaction?: () => void;
		taskDetails?: {
			startTime: string;
			category?: Category;
			employer?: Employer;
		};
	}

	let { message, onclick, actionLabel, onaction, taskDetails }: Props = $props();

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
		<div class="banner-content">
			<div class="banner-main">
				<span class="warning-icon">⚠</span>
				<span class="warning-message">{message}</span>
			</div>
			{#if taskDetails}
				<div class="task-details">
					<span class="task-time">{taskDetails.startTime} – laufend</span>
					<span class="task-category">{taskDetails.category?.name ?? 'Unbekannt'}</span>
					{#if taskDetails.category?.countsAsWorkTime && taskDetails.employer}
						<span class="task-employer">{taskDetails.employer.name}</span>
					{/if}
				</div>
			{/if}
		</div>
		{#if actionLabel && onaction}
			<button class="action-btn" onclick={handleActionClick} data-testid="warning-banner-action">
				{actionLabel}
			</button>
		{/if}
	</div>
{:else}
	<div class="warning-banner" role="alert" data-testid="warning-banner">
		<div class="banner-content">
			<div class="banner-main">
				<span class="warning-icon">⚠</span>
				<span class="warning-message">{message}</span>
			</div>
			{#if taskDetails}
				<div class="task-details">
					<span class="task-time">{taskDetails.startTime} – laufend</span>
					<span class="task-category">{taskDetails.category?.name ?? 'Unbekannt'}</span>
					{#if taskDetails.category?.countsAsWorkTime && taskDetails.employer}
						<span class="task-employer">{taskDetails.employer.name}</span>
					{/if}
				</div>
			{/if}
		</div>
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
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--warning-light);
		border: 1px solid var(--warning);
		border-radius: var(--r-banner);
		color: var(--warning);
	}

	.banner-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.banner-main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.warning-icon {
		font-size: 1.1rem;
	}

	.warning-message {
		font-size: 0.9rem;
		font-weight: 500;
	}

	.task-details {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		margin-left: 1.6rem;
		color: var(--text);
	}

	.task-time {
		font-weight: 600;
	}

	.task-category {
		color: var(--muted);
	}

	.task-employer {
		padding: 0.125rem 0.4rem;
		background: var(--accent-light, #eff6ff);
		color: var(--accent-dark, #1e40af);
		border: 1px solid var(--accent, #3b82f6);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.clickable {
		cursor: pointer;
	}

	.clickable:hover {
		background: var(--warning-hover, var(--warning-light));
		filter: brightness(0.95);
	}

	.action-btn {
		margin-left: auto;
		padding: 0.25rem 0.75rem;
		border: 1px solid var(--accent);
		background: var(--accent);
		color: white;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		border-radius: var(--r-btn);
		white-space: nowrap;
	}

	.action-btn:hover {
		background: var(--accent-dark, #0056b3);
	}
</style>
