<!--
  ImportUpload.svelte
  
  Upload component for CSV/JSON import with file picker and file list.
  
  Spec ref: Docs/Features/Specs/ai-import.md Section 6 (Screen A)
-->
<script lang="ts">
	import type { ImportSource } from '$lib/import/types';

	interface Props {
		onfileschange?: (sources: ImportSource[]) => void;
		onstart?: () => void;
	}

	let { onfileschange, onstart }: Props = $props();

	let sources: ImportSource[] = $state([]);

	const ALLOWED_EXTENSIONS = ['.csv', '.json'];
	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	const MAX_FILES = 10;

	function generateSourceId(): string {
		return `src_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
	}

	function getFileExtension(filename: string): string {
		const idx = filename.lastIndexOf('.');
		return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
	}

	function isValidFile(file: File): { valid: boolean; error?: string } {
		const ext = getFileExtension(file.name);
		if (!ALLOWED_EXTENSIONS.includes(ext)) {
			return { valid: false, error: `Nicht unterstützt: ${ext}` };
		}
		if (file.size > MAX_FILE_SIZE) {
			return { valid: false, error: 'Datei zu groß (max 10MB)' };
		}
		return { valid: true };
	}

	function getSourceType(filename: string): ImportSource['type'] {
		const ext = getFileExtension(filename);
		if (ext === '.csv') return 'csv';
		if (ext === '.json') return 'json';
		return 'text';
	}

	async function readFileContent(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsText(file);
		});
	}

	async function addFiles(files: FileList | File[]) {
		const fileArray = Array.from(files);
		const remaining = MAX_FILES - sources.length;
		const toAdd = fileArray.slice(0, remaining);

		for (const file of toAdd) {
			const validation = isValidFile(file);
			if (!validation.valid) {
				console.warn(`Skipping file ${file.name}: ${validation.error}`);
				continue;
			}

			const content = await readFileContent(file);
			const source: ImportSource = {
				id: generateSourceId(),
				type: getSourceType(file.name),
				filename: file.name,
				content,
				sizeBytes: file.size,
				addedAt: Date.now()
			};
			sources = [...sources, source];
		}

		onfileschange?.(sources);
	}

	function removeSource(id: string) {
		sources = sources.filter((s) => s.id !== id);
		onfileschange?.(sources);
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			addFiles(input.files);
			input.value = '';
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function handleStart() {
		if (sources.length > 0) {
			onstart?.();
		}
	}
</script>

<div class="upload-container">
	<div class="upload-section">
		<label class="btn-file-primary">
			Dateien auswählen
			<input type="file" multiple accept=".csv,.json" onchange={handleFileInput} hidden />
		</label>
	</div>

	{#if sources.length > 0}
		<div class="file-list">
			<h3>Dateien ({sources.length})</h3>
			{#each sources as source (source.id)}
				<div class="file-item">
					<span class="file-icon">
						{#if source.type === 'excel'}📊{:else if source.type === 'csv'}📋{:else if source.type === 'image'}🖼️{:else if source.type === 'json'}📦{:else}📝{/if}
					</span>
					<span class="file-name">{source.filename}</span>
					<span class="file-size">{formatFileSize(source.sizeBytes)}</span>
					<button class="btn-remove" onclick={() => removeSource(source.id)} aria-label="Entfernen">
						×
					</button>
				</div>
			{/each}
		</div>

		<div class="start-section">
			<button class="btn-start" onclick={handleStart}>Verarbeitung starten</button>
		</div>
	{/if}
</div>

<style>
	.upload-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.upload-section {
		display: flex;
		justify-content: center;
		padding: 2rem;
	}

	.btn-file-primary {
		background: var(--accent, var(--accent-color, #3b82f6));
		color: var(--btn-primary-text, white);
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		display: inline-block;
	}

	.btn-file-primary:hover {
		opacity: 0.9;
	}

	.file-list {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 1rem;
	}

	.file-list h3 {
		font-size: 0.875rem;
		margin: 0 0 0.75rem;
		color: var(--text-secondary);
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--bg-primary);
		border-radius: 6px;
		margin-bottom: 0.5rem;
	}

	.file-item:last-child {
		margin-bottom: 0;
	}

	.file-icon {
		font-size: 1.25rem;
	}

	.file-name {
		flex: 1;
		font-size: 0.875rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.file-size {
		font-size: 0.75rem;
		color: var(--text-tertiary);
	}

	.btn-remove {
		width: 24px;
		height: 24px;
		border: none;
		background: transparent;
		color: var(--text-tertiary);
		font-size: 1.25rem;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-remove:hover {
		background: var(--bg-tertiary);
		color: var(--error-color, #ef4444);
	}

	.start-section {
		display: flex;
		justify-content: flex-end;
	}

	.btn-start {
		background: var(--accent, var(--accent-color, #3b82f6));
		color: var(--btn-primary-text, white);
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 500;
	}

	.btn-start:hover {
		opacity: 0.9;
	}
</style>
