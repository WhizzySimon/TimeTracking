<!--
  PresetSelector.svelte
  
  Preset selection and management for import:
  - Load existing preset
  - Save current mapping as preset
  - Delete presets
  
  Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 7
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getPresets,
		savePreset,
		deletePreset,
		validatePresetName,
		type ImportPreset
	} from '$lib/import/presets';
	import type { ColumnMapping } from '$lib/import/parsers/csv';

	interface Props {
		currentMapping?: ColumnMapping;
		onselect?: (preset: ImportPreset) => void;
		onsave?: (preset: ImportPreset) => void;
	}

	let { currentMapping, onselect, onsave }: Props = $props();

	let presets: ImportPreset[] = $state([]);
	let showSaveDialog = $state(false);
	let newPresetName = $state('');
	let saveError = $state<string | null>(null);
	let loading = $state(true);

	onMount(async () => {
		presets = await getPresets();
		loading = false;
	});

	async function handleSave() {
		const error = validatePresetName(newPresetName, presets);
		if (error) {
			saveError = error;
			return;
		}

		const preset = await savePreset({
			name: newPresetName.trim(),
			columnMapping: currentMapping || {},
			categoryMappings: {}
		});

		presets = [...presets, preset];
		onsave?.(preset);
		showSaveDialog = false;
		newPresetName = '';
		saveError = null;
	}

	async function handleDelete(id: string) {
		await deletePreset(id);
		presets = presets.filter((p) => p.id !== id);
	}

	function handleSelect(preset: ImportPreset) {
		onselect?.(preset);
	}
</script>

<div class="preset-selector">
	<div class="preset-header">
		<h3>Presets</h3>
		<button class="btn-add" onclick={() => (showSaveDialog = true)} disabled={!currentMapping}>
			+ Speichern
		</button>
	</div>

	{#if loading}
		<p class="loading">Lade Presets...</p>
	{:else if presets.length === 0}
		<p class="empty">Keine gespeicherten Presets</p>
	{:else}
		<ul class="preset-list">
			{#each presets as preset (preset.id)}
				<li class="preset-item">
					<button class="preset-btn tt-interactive" onclick={() => handleSelect(preset)}>
						{preset.name}
					</button>
					<button class="delete-btn" onclick={() => handleDelete(preset.id)} title="Löschen">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="3 6 5 6 21 6"></polyline>
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							></path>
						</svg>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if showSaveDialog}
		<div
			class="save-dialog-overlay"
			role="button"
			tabindex="-1"
			onclick={() => (showSaveDialog = false)}
			onkeydown={(e) => e.key === 'Escape' && (showSaveDialog = false)}
		>
			<div
				class="save-dialog"
				role="dialog"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<button
					class="tt-symbol-button close-btn-pos"
					onclick={() => (showSaveDialog = false)}
					aria-label="Schließen"
				>
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
				<h4>Preset speichern</h4>
				<input
					type="text"
					bind:value={newPresetName}
					placeholder="Preset Name"
					class:error={saveError}
				/>
				{#if saveError}
					<p class="error-text">{saveError}</p>
				{/if}
				<div class="dialog-actions">
					<button class="btn-cancel" onclick={() => (showSaveDialog = false)}>Abbrechen</button>
					<button class="btn-save" onclick={handleSave}>Speichern</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.preset-selector {
		background: var(--tt-background-card-hover);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		padding: var(--tt-space-16);
	}

	.preset-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.preset-header h3 {
		font-size: var(--tt-font-size-small);
		margin: 0;
		color: var(--tt-text-secondary);
	}

	.btn-add {
		padding: 0.25rem 0.5rem;
		background: var(--tt-brand-primary-500);
		color: white;
		border: none;
		border-radius: var(--tt-radius-badge);
		font-size: var(--tt-font-size-tiny);
		cursor: pointer;
	}

	.btn-add:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.loading,
	.empty {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-muted);
		margin: 0;
	}

	.preset-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.preset-item {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
	}

	.preset-btn {
		flex: 1;
		padding: var(--tt-space-8);
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-badge);
		text-align: left;
		font-size: var(--tt-font-size-small);
		cursor: pointer;
	}


	.delete-btn {
		width: 24px;
		height: 24px;
		padding: 0;
		background: none;
		border: none;
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-title);
		cursor: pointer;
		line-height: 1;
	}

	.delete-btn:hover {
		color: var(--tt-status-danger-500);
	}

	.save-dialog-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.save-dialog {
		background: var(--tt-background-card);
		padding: var(--tt-space-24);
		border-radius: var(--tt-radius-card);
		width: 300px;
		position: relative;
	}

	.close-btn-pos {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 1;
	}

	.save-dialog h4 {
		margin: 0 0 1rem;
		font-size: var(--tt-font-size-normal);
	}

	.save-dialog input {
		width: 100%;
		padding: var(--tt-space-8);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-badge);
		font-size: var(--tt-font-size-small);
		background: var(--tt-background-card-hover);
		color: var(--tt-text-primary);
	}

	.save-dialog input.error {
		border-color: var(--tt-status-danger-500);
	}

	.error-text {
		color: var(--tt-status-danger-500);
		font-size: var(--tt-font-size-tiny);
		margin: 0.25rem 0 0;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--tt-space-8);
		margin-top: 1rem;
	}

	.btn-cancel,
	.btn-save {
		padding: 0.5rem 1rem;
		border-radius: var(--tt-radius-badge);
		font-size: var(--tt-font-size-small);
		cursor: pointer;
		border: none;
	}

	.btn-cancel {
		background: var(--tt-background-card-pressed);
		color: var(--tt-text-primary);
	}

	.btn-save {
		background: var(--tt-brand-primary-500);
		color: white;
	}
</style>
