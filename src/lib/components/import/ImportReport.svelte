<!--
  ImportReport.svelte
  
  Report screen after import completion:
  - Imported count, skipped count, errors
  - Navigation buttons
  
  Spec ref: Docs/Features/Specs/ai-import.md Section 6 (Screen E)
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	interface Props {
		importedCount: number;
		skippedCount: number;
		errorCount?: number;
		onnewimport?: () => void;
	}

	let { importedCount, skippedCount, errorCount = 0, onnewimport }: Props = $props();

	function handleGoToDay() {
		goto(resolve('/day'));
	}
</script>

<div class="report-container">
	<div class="report-icon">✓</div>
	<h2>Import abgeschlossen</h2>

	<dl class="report-stats">
		<div class="stat-item success">
			<dt>Importiert</dt>
			<dd>{importedCount}</dd>
		</div>
		{#if skippedCount > 0}
			<div class="stat-item skipped">
				<dt>Übersprungen</dt>
				<dd>{skippedCount}</dd>
			</div>
		{/if}
		{#if errorCount > 0}
			<div class="stat-item error">
				<dt>Fehler</dt>
				<dd>{errorCount}</dd>
			</div>
		{/if}
	</dl>

	<div class="report-actions">
		<button class="btn-secondary" onclick={onnewimport}>Neuer Import</button>
		<button class="btn-primary" onclick={handleGoToDay}>Zum Tag-Tab</button>
	</div>
</div>

<style>
	.report-container {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	.report-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--success-color, #22c55e);
		color: white;
		border-radius: 50%;
		font-size: 2rem;
	}

	h2 {
		font-size: 1.5rem;
		margin: 0 0 1.5rem;
	}

	.report-stats {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-item {
		text-align: center;
	}

	.stat-item dt {
		font-size: 0.75rem;
		color: var(--text-tertiary);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
	}

	.stat-item dd {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.stat-item.success dd {
		color: var(--success-color, #22c55e);
	}

	.stat-item.skipped dd {
		color: var(--warning-color, #f59e0b);
	}

	.stat-item.error dd {
		color: var(--error-color, #ef4444);
	}

	.report-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-secondary,
	.btn-primary {
		padding: 0.75rem 1.25rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		border: none;
	}

	.btn-secondary {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
	}

	.btn-primary {
		background: var(--accent-color);
		color: white;
	}
</style>
