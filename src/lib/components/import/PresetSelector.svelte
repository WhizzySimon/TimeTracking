<!--
  PresetSelector.svelte
  
  Preset selection and management for import:
  - Load existing preset
  - Save current mapping as preset
  - Delete presets
  
  Spec ref: Docs/Features/Specs/ai-import.md Section 7
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
					<button class="preset-btn" onclick={() => handleSelect(preset)}>
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
				<button class="close-btn" onclick={() => (showSaveDialog = false)} aria-label="Schließen"
					>×</button
				>
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
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 1rem;
	}

	.preset-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.preset-header h3 {
		font-size: 0.875rem;
		margin: 0;
		color: var(--text-secondary);
	}

	.btn-add {
		padding: 0.25rem 0.5rem;
		background: var(--accent-color);
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.btn-add:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.loading,
	.empty {
		font-size: 0.875rem;
		color: var(--text-tertiary);
		margin: 0;
	}

	.preset-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preset-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.preset-btn {
		flex: 1;
		padding: 0.5rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		text-align: left;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.preset-btn:hover {
		background: var(--bg-tertiary);
	}

	.delete-btn {
		width: 24px;
		height: 24px;
		padding: 0;
		background: none;
		border: none;
		color: var(--text-tertiary);
		font-size: 1.25rem;
		cursor: pointer;
		line-height: 1;
	}

	.delete-btn:hover {
		color: var(--error-color, #ef4444);
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
		background: var(--bg-primary);
		padding: 1.5rem;
		border-radius: 8px;
		width: 300px;
		position: relative;
	}

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--text-tertiary);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		z-index: 1;
	}

	.close-btn:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.save-dialog h4 {
		margin: 0 0 1rem;
		font-size: 1rem;
	}

	.save-dialog input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		font-size: 0.875rem;
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.save-dialog input.error {
		border-color: var(--error-color, #ef4444);
	}

	.error-text {
		color: var(--error-color, #ef4444);
		font-size: 0.75rem;
		margin: 0.25rem 0 0;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.btn-cancel,
	.btn-save {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		cursor: pointer;
		border: none;
	}

	.btn-cancel {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.btn-save {
		background: var(--accent-color);
		color: white;
	}
</style>
