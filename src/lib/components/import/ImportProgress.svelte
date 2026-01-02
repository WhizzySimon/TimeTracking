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
			<button class="btn-cancel" onclick={oncancel}>Abbrechen</button>
		</div>
	{/if}
</div>

<style>
	.progress-container {
		max-width: 500px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	.progress-header h2 {
		font-size: 1.25rem;
		margin: 0 0 1.5rem;
		color: var(--text-primary);
	}

	.progress-bar-wrapper {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.progress-bar {
		flex: 1;
		height: 12px;
		background: var(--bg-tertiary);
		border-radius: 6px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent-color);
		border-radius: 6px;
		transition: width 0.3s ease;
	}

	.progress-percent {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		min-width: 3rem;
		text-align: right;
	}

	.progress-info {
		margin-top: 1.5rem;
		min-height: 3rem;
	}

	.current-file {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0 0 0.5rem;
	}

	.current-file .label {
		color: var(--text-tertiary);
	}

	.current-file .value {
		font-weight: 500;
	}

	.current-step {
		font-size: 0.875rem;
		color: var(--text-tertiary);
		margin: 0;
	}

	.progress-actions {
		margin-top: 2rem;
	}

	.btn-cancel {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
		padding: 0.625rem 1.25rem;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.btn-cancel:hover {
		background: var(--bg-secondary);
	}
</style>
