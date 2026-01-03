<!--
  Import Page
  
  State machine: upload -> processing -> review -> commit -> report
  Spec ref: TempAppDevDocs/Features/Specs/subscription-plans.md (Pro feature)
  
  Pro-only feature (requires Pro plan)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Paywall from '$lib/components/Paywall.svelte';
	import ImportUpload from '$lib/components/import/ImportUpload.svelte';
	import ImportProgress from '$lib/components/import/ImportProgress.svelte';
	import ImportReview from '$lib/components/import/ImportReview.svelte';
	import CustomDropdown from '$lib/components/CustomDropdown.svelte';
	import { isPro } from '$lib/stores/user';
	import { categories, timeEntries } from '$lib/stores';
	import { getAll } from '$lib/storage/db';
	import { processImportSources } from '$lib/import/orchestrator';
	import { saveTimeEntry } from '$lib/storage/operations';
	import { getActiveEmployers } from '$lib/storage/employers';
	import type { TimeEntry, Employer } from '$lib/types';
	import type { TimeEntryCandidate, ImportSource } from '$lib/import/types';

	type ImportStep = 'upload' | 'processing' | 'review' | 'commit' | 'report';

	let currentStep: ImportStep = $state('upload');
	let loading = $state(true);
	let employers = $state<Employer[]>([]);
	let selectedEmployerId = $state<string>('');

	// Convert employers to dropdown options
	let employerOptions = $derived(
		employers.map((e) => ({ value: e.id, label: e.name }))
	);

	let sources: ImportSource[] = $state([]);
	let candidates: TimeEntryCandidate[] = $state([]);
	let processingProgress = $state(0);
	let processingFile = $state('');
	let processingError = $state<string | null>(null);

	function handleSourcesChange(newSources: ImportSource[]) {
		sources = newSources;
	}

	async function handleStartProcessing() {
		if (sources.length === 0) return;
		currentStep = 'processing';
		processingProgress = 0;
		processingError = null;

		try {
			const result = await processImportSources(sources, {
				userCategories: $categories,
				onProgress: (progress) => {
					processingProgress = (progress.current / progress.total) * 100;
					processingFile = progress.currentFile;
				}
			});

			candidates = result.candidates;
			currentStep = 'review';
		} catch (e) {
			processingError = e instanceof Error ? e.message : 'Verarbeitung fehlgeschlagen';
			currentStep = 'upload';
		}
	}

	function handleCancelProcessing() {
		currentStep = 'upload';
		processingProgress = 0;
	}

	let importedCount = $state(0);

	async function handleCommit() {
		currentStep = 'commit';
		importedCount = 0;

		// Get selected candidates (those with valid data)
		const selectedCandidates = candidates.filter(
			(c) => !c.flags.includes('hard_block') && c.date && c.startTime
		);

		// Filter categories by selected employer
		const employerCategories = $categories.filter(
			(c) => c.employerId === selectedEmployerId
		);

		// Find matching category IDs (only from selected employer)
		const categoryMap = new Map(employerCategories.map((c) => [c.name.toLowerCase(), c.id]));

		for (const candidate of selectedCandidates) {
			// Find category ID by name (only from selected employer's categories)
			let categoryId = candidate.categoryId;
			if (!categoryId && candidate.categoryGuess) {
				categoryId = categoryMap.get(candidate.categoryGuess.toLowerCase()) || null;
			}

			// Skip if no valid category found for this employer
			if (!categoryId) {
				// Use first category of selected employer as fallback
				categoryId = employerCategories[0]?.id || null;
			}

			if (!categoryId || !candidate.date || !candidate.startTime) continue;

			const entry: TimeEntry = {
				id: `import_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
				date: candidate.date,
				startTime: candidate.startTime,
				endTime: candidate.endTime,
				categoryId,
				employerId: selectedEmployerId,
				description: candidate.note || null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			};

			try {
				await saveTimeEntry(entry);
				importedCount++;
			} catch (e) {
				console.error('Failed to import entry:', e);
			}
		}

		// Refresh timeEntries store from database
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);

		currentStep = 'report';
	}

	function handleReset() {
		currentStep = 'upload';
		sources = [];
		candidates = [];
		processingProgress = 0;
	}

	onMount(async () => {
		employers = await getActiveEmployers();
		if (employers.length > 0) {
			selectedEmployerId = employers[0].id;
		}
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
			<p class="subtitle">Importiere Zeitdaten aus CSV oder JSON</p>
		</header>

		<!-- Employer Selection -->
		<div class="employer-selection">
			<div class="tt-labeled-dropdown">
				<span class="tt-labeled-dropdown__label">Arbeitgeber</span>
				{#if employers.length === 0}
					<p class="no-employers">
						Keine Arbeitgeber vorhanden. Erstelle zuerst einen Arbeitgeber in den Einstellungen.
					</p>
				{:else}
					<CustomDropdown
						options={employerOptions}
						value={selectedEmployerId}
						onchange={(id) => (selectedEmployerId = id)}
					/>
				{/if}
			</div>
		</div>

		{#if currentStep === 'upload'}
			<section class="upload-section">
				{#if processingError}
					<div class="error-message">{processingError}</div>
				{/if}
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
				<p>{importedCount} Einträge importiert</p>
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

	.employer-selection {
		margin-bottom: 1.5rem;
	}

	.no-employers {
		color: var(--tt-text-muted);
		font-size: 0.9rem;
		margin: 0;
		padding: 0.5rem;
		background: var(--tt-status-warning-50);
		border-radius: var(--tt-radius-card);
	}

	.upload-section {
		margin-top: 1rem;
	}

	.error-message {
		background: var(--error-bg, #fef2f2);
		color: var(--error-color, #dc2626);
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		text-align: center;
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
