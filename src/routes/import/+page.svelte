<!--
  Import Page
  
  State machine: upload -> processing -> review -> commit -> report
  Spec ref: Docs/Features/Specs/subscription-plans.md (Pro feature)
  
  Pro-only feature (requires Pro plan)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Paywall from '$lib/components/Paywall.svelte';
	import ImportUpload from '$lib/components/import/ImportUpload.svelte';
	import ImportProgress from '$lib/components/import/ImportProgress.svelte';
	import ImportReview from '$lib/components/import/ImportReview.svelte';
	import { isPro } from '$lib/stores/user';
	import type { TimeEntryCandidate, ImportSource } from '$lib/import/types';

	type ImportStep = 'upload' | 'processing' | 'review' | 'commit' | 'report';

	let currentStep: ImportStep = $state('upload');
	let loading = $state(true);

	let sources: ImportSource[] = $state([]);
	let candidates: TimeEntryCandidate[] = $state([]);
	let processingProgress = $state(0);
	let processingFile = $state('');

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
{:else if !$isPro}
	<Paywall feature="import" onclose={() => history.back()} />
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
				<ImportProgress
					progress={processingProgress}
					currentFile={processingFile}
					oncancel={handleCancelProcessing}
				/>
			</section>
		{:else if currentStep === 'review'}
			<section class="review-section">
				<ImportReview {candidates} oncancel={handleReset} oncommit={handleCommit} />
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

	.processing-section {
		padding: 2rem;
	}

	.review-section {
		margin-top: 1rem;
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
