<!--
  ImportProgress.svelte
  
  Progress component for AI Import processing:
  - Progress bar with percentage
  - Current file/step indicator
  - Cancel button
  
  Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 6 (Screen B)
-->
<script lang="ts">
	interface Props {
		progress: number;
		currentFile?: string;
		currentStep?: string;
		oncancel?: () => void;
	}

	let { progress, currentFile = '', currentStep = '', oncancel }: Props = $props();

	let displayProgress = $derived(Math.min(100, Math.max(0, progress)));
</script>

<div class="progress-container">
	<div class="progress-header">
		<h2>Verarbeitung läuft...</h2>
	</div>

	<div class="progress-bar-wrapper">
		<div class="progress-bar">
			<div class="progress-fill" style="width: {displayProgress}%"></div>
		</div>
		<span class="progress-percent">{Math.round(displayProgress)}%</span>
	</div>

	<div class="progress-info">
		{#if currentFile}
			<p class="current-file">
				<span class="label">Datei:</span>
				<span class="value">{currentFile}</span>
			</p>
		{/if}
		{#if currentStep}
			<p class="current-step">{currentStep}</p>
		{/if}
	</div>

	{#if oncancel}
		<div class="progress-actions">
			<button class="btn-cancel tt-interactive" onclick={oncancel}>Abbrechen</button>
		</div>
	{/if}
</div>

<style>
	.progress-container {
		max-width: 500px;
		margin: 0 auto;
		padding: var(--tt-space-32);
		text-align: center;
	}

	.progress-header h2 {
		font-size: var(--tt-font-size-title);
		margin: 0 0 1.5rem;
		color: var(--tt-text-primary);
	}

	.progress-bar-wrapper {
		display: flex;
		align-items: center;
		gap: var(--tt-space-16);
	}

	.progress-bar {
		flex: 1;
		height: 12px;
		background: var(--tt-background-card-pressed);
		border-radius: var(--tt-radius-button);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--tt-brand-primary-500);
		border-radius: var(--tt-radius-button);
		transition: width 0.3s ease;
	}

	.progress-percent {
		font-size: var(--tt-font-size-normal);
		font-weight: 600;
		color: var(--tt-text-primary);
		min-width: 3rem;
		text-align: right;
	}

	.progress-info {
		margin-top: 1.5rem;
		min-height: 3rem;
	}

	.current-file {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-secondary);
		margin: 0 0 0.5rem;
	}

	.current-file .label {
		color: var(--tt-text-muted);
	}

	.current-file .value {
		font-weight: 500;
	}

	.current-step {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-muted);
		margin: 0;
	}

	.progress-actions {
		margin-top: 2rem;
	}

	.btn-cancel {
		background: var(--tt-background-card-pressed);
		color: var(--tt-text-primary);
		border: 1px solid var(--tt-border-default);
		padding: 0.625rem 1.25rem;
		border-radius: var(--tt-radius-button);
		font-size: var(--tt-font-size-small);
		cursor: pointer;
	}
</style>
