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

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onclose();
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
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="dialog">
			<header class="dialog-header">
				<h2>Daten exportieren</h2>
				<button class="close-btn" onclick={onclose} aria-label="Schließen">×</button>
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
							<span class="format-desc">Druckbare Übersicht (kommt bald)</span>
						</div>
					</label>
				</div>

				{#if error}
					<div class="error-message">{error}</div>
				{/if}
			</div>

			<footer class="dialog-footer">
				<button class="btn-secondary" onclick={onclose} disabled={exporting}>Abbrechen</button>
				<button class="btn-primary" onclick={handleExport} disabled={exporting}>
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
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog {
		background: var(--card-bg, var(--surface, #ffffff));
		border-radius: 12px;
		width: 90%;
		max-width: 400px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
	}

	.dialog-header h2 {
		margin: 0;
		font-size: 1.125rem;
		color: var(--fg);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--muted);
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.close-btn:hover {
		color: var(--fg);
	}

	.dialog-body {
		padding: 20px;
	}

	.description {
		margin: 0 0 16px;
		color: var(--muted);
		font-size: 0.875rem;
	}

	.format-options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.format-option {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.format-option:hover {
		border-color: var(--accent);
	}

	.format-option:has(input:checked) {
		border-color: var(--accent);
		background: var(--accent-subtle, rgba(var(--accent-rgb), 0.1));
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
		color: var(--fg);
	}

	.format-desc {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.error-message {
		margin-top: 12px;
		padding: 8px 12px;
		background: var(--danger-subtle, #fee2e2);
		color: var(--danger, #dc2626);
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.dialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 16px 20px;
		border-top: 1px solid var(--border);
	}

	.btn-primary,
	.btn-secondary {
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-primary {
		background: var(--accent);
		color: white;
		border: none;
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: transparent;
		color: var(--muted);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover:not(:disabled) {
		border-color: var(--muted);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
