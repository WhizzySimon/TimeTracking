<script lang="ts">
	import { isPro } from '$lib/stores/user';
	import { exportToJson, exportToCsv, exportToPdf } from '$lib/export';
	import Paywall from './Paywall.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	type ExportFormat = 'json' | 'csv' | 'pdf';
	let selectedFormat = $state<ExportFormat>('json');
	let exporting = $state(false);
	let error = $state<string | null>(null);

	async function handleExport() {
		exporting = true;
		error = null;

		try {
			switch (selectedFormat) {
				case 'json':
					await exportToJson();
					break;
				case 'csv':
					await exportToCsv();
					break;
				case 'pdf':
					await exportToPdf();
					break;
			}
			onclose();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Export fehlgeschlagen';
		} finally {
			exporting = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
		}
	}
</script>

{#if !$isPro}
	<Paywall feature="export" {onclose} />
{:else}
	<div
		class="dialog-backdrop"
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="dialog">
			<header class="dialog-header">
				<h2>Daten exportieren</h2>
				<button class="tt-symbol-button" onclick={onclose} aria-label="Schließen">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</header>

			<div class="dialog-body">
				<p class="description">Wähle ein Format für den Export deiner Zeitdaten.</p>

				<div class="format-options">
					<label class="format-option">
						<input type="radio" name="format" value="json" bind:group={selectedFormat} />
						<div class="format-info">
							<span class="format-name">JSON</span>
							<span class="format-desc">Vollständiges Backup (alle Daten)</span>
						</div>
					</label>

					<label class="format-option">
						<input type="radio" name="format" value="csv" bind:group={selectedFormat} />
						<div class="format-info">
							<span class="format-name">CSV</span>
							<span class="format-desc">Für Excel/Sheets (nur Zeiteinträge)</span>
						</div>
					</label>

					<label class="format-option">
						<input type="radio" name="format" value="pdf" bind:group={selectedFormat} />
						<div class="format-info">
							<span class="format-name">PDF</span>
							<span class="format-desc">Druckbare Übersicht</span>
						</div>
					</label>
				</div>

				{#if error}
					<div class="error-message">{error}</div>
				{/if}
			</div>

			<footer class="dialog-footer">
				<button class="tt-button-secondary" onclick={onclose} disabled={exporting}>Abbrechen</button
				>
				<button class="tt-button-primary" onclick={handleExport} disabled={exporting}>
					{#if exporting}
						Exportiere...
					{:else}
						Exportieren
					{/if}
				</button>
			</footer>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		background: var(--tt-backdrop-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog {
		background: var(--tt-background-card);
		border-radius: var(--tt-radius-modal);
		width: 90%;
		max-width: 400px;
		box-shadow: var(--tt-shadow-modal);
	}

	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--tt-border-default);
	}

	.dialog-header h2 {
		margin: 0;
		font-size: 1.125rem;
		color: var(--tt-text-primary);
	}

	/* Close button uses .tt-symbol-button from design system */

	.dialog-body {
		padding: 20px;
	}

	.description {
		margin: 0 0 16px;
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-small);
	}

	.format-options {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.format-option {
		display: flex;
		align-items: center;
		gap: var(--tt-space-12);
		padding: 12px;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.format-option:hover {
		border-color: var(--tt-brand-primary-500);
		background: var(--tt-state-hover);
	}

	.format-option:has(input:checked) {
		border-color: var(--tt-brand-primary-500);
		background: var(--tt-brand-primary-800);
	}

	.format-option input {
		margin: 0;
	}

	.format-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.format-name {
		font-weight: 600;
		color: var(--tt-text-primary);
	}

	.format-desc {
		font-size: var(--tt-font-size-tiny);
		color: var(--tt-text-muted);
	}

	.error-message {
		margin-top: 12px;
		padding: 8px 12px;
		background: var(--tt-status-danger-800);
		color: var(--tt-status-danger-500);
		border-radius: var(--tt-radius-button);
		font-size: var(--tt-font-size-small);
	}

	.dialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--tt-space-8);
		padding: 16px 20px;
		border-top: 1px solid var(--tt-border-default);
	}
</style>
