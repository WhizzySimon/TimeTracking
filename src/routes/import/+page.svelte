<!--
  AI Import Page
  
  State machine: upload -> processing -> review -> commit -> report
  Spec ref: Docs/Specs/ai-import.md Section 6 (UX Flow)
  
  Premium-only feature (requires Premium plan)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Paywall from '$lib/components/Paywall.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ImportUpload from '$lib/components/import/ImportUpload.svelte';
	import { isPremium } from '$lib/stores/user';
	import type { TimeEntryCandidate, ImportSource } from '$lib/import/types';

	type ImportStep = 'upload' | 'processing' | 'review' | 'commit' | 'report';

	let currentStep: ImportStep = $state('upload');
	let loading = $state(true);
	let showUpgradeDialog = $state(false);

	let sources: ImportSource[] = $state([]);
	let candidates: TimeEntryCandidate[] = $state([]);
	let processingProgress = $state(0);
	let processingFile = $state('');

	function handleUpgrade() {
		showUpgradeDialog = true;
	}

	function handleSourcesChange(newSources: ImportSource[]) {
		sources = newSources;
	}

	function handleStartProcessing() {
		if (sources.length === 0) return;
		currentStep = 'processing';
		processingProgress = 0;
	}

	function handleCancelProcessing() {
		currentStep = 'upload';
		processingProgress = 0;
	}

	function handleCommit() {
		currentStep = 'commit';
	}

	function handleReset() {
		currentStep = 'upload';
		sources = [];
		candidates = [];
		processingProgress = 0;
	}

	onMount(() => {
		loading = false;
	});
</script>

<svelte:head>
	<title>Import | TimeTracker</title>
</svelte:head>

{#if loading}
	<div class="loading">Laden...</div>
{:else if !$isPremium}
	<Paywall onupgrade={handleUpgrade} />
	{#if showUpgradeDialog}
		<ConfirmDialog
			type="alert"
			title="Premium-Version"
			message="Die Premium-Version mit AI Import kommt bald! Aktuell kannst du alle anderen Funktionen nutzen."
			confirmLabel="OK"
			onconfirm={() => (showUpgradeDialog = false)}
		/>
	{/if}
{:else}
	<div class="import-page">
		<header class="import-header">
			<h1>Daten importieren</h1>
			<p class="subtitle">Importiere Zeitdaten aus CSV, Excel oder Text</p>
		</header>

		{#if currentStep === 'upload'}
			<section class="upload-section">
				<ImportUpload onfileschange={handleSourcesChange} onstart={handleStartProcessing} />
			</section>
		{:else if currentStep === 'processing'}
			<section class="processing-section">
				<div class="progress-container">
					<div class="progress-bar">
						<div class="progress-fill" style="width: {processingProgress}%"></div>
					</div>
					<p class="progress-text">{processingFile || 'Verarbeite...'}</p>
					<button class="btn-secondary" onclick={handleCancelProcessing}> Abbrechen </button>
				</div>
			</section>
		{:else if currentStep === 'review'}
			<section class="review-section">
				<div class="review-header">
					<h2>Einträge prüfen</h2>
					<span class="count">{candidates.length} Einträge gefunden</span>
				</div>
				<div class="review-placeholder">
					<p>Review-Tabelle wird in Task 11.8 implementiert</p>
				</div>
				<div class="review-actions">
					<button class="btn-secondary" onclick={handleReset}>Zurück</button>
					<button class="btn-primary" onclick={handleCommit}>Importieren</button>
				</div>
			</section>
		{:else if currentStep === 'commit'}
			<section class="commit-section">
				<p>Importiere Einträge...</p>
			</section>
		{:else if currentStep === 'report'}
			<section class="report-section">
				<div class="report-icon">✓</div>
				<h2>Import abgeschlossen</h2>
				<p>{candidates.filter((c) => c.selected).length} Einträge importiert</p>
				<button class="btn-primary" onclick={handleReset}>Neuer Import</button>
			</section>
		{/if}
	</div>
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
		color: var(--text-secondary);
	}

	.import-page {
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.import-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.import-header h1 {
		font-size: 1.5rem;
		margin: 0;
		color: var(--text-primary);
	}

	.subtitle {
		color: var(--text-secondary);
		margin: 0.5rem 0 0;
	}

	.upload-section {
		margin-top: 1rem;
	}

	.upload-zone {
		border: 2px dashed var(--border-color);
		border-radius: 12px;
		padding: 3rem 2rem;
		text-align: center;
		background: var(--bg-secondary);
		transition: border-color 0.2s;
	}

	.upload-zone:hover {
		border-color: var(--accent-color);
	}

	.upload-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.upload-hint {
		font-size: 0.875rem;
		color: var(--text-tertiary);
		margin-top: 0.5rem;
	}

	.btn-primary {
		background: var(--accent-color);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		margin-top: 1.5rem;
	}

	.btn-secondary {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
	}

	.processing-section {
		text-align: center;
		padding: 3rem;
	}

	.progress-container {
		max-width: 400px;
		margin: 0 auto;
	}

	.progress-bar {
		height: 8px;
		background: var(--bg-tertiary);
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent-color);
		transition: width 0.3s;
	}

	.progress-text {
		margin: 1rem 0;
		color: var(--text-secondary);
	}

	.review-section {
		margin-top: 1rem;
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.review-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.count {
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.review-placeholder {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 3rem;
		text-align: center;
		color: var(--text-tertiary);
	}

	.review-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 1.5rem;
		gap: 1rem;
	}

	.commit-section,
	.report-section {
		text-align: center;
		padding: 3rem;
	}

	.report-icon {
		font-size: 4rem;
		color: var(--success-color, #22c55e);
		margin-bottom: 1rem;
	}

	.report-section h2 {
		margin: 0 0 0.5rem;
	}

	.report-section p {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}
</style>
