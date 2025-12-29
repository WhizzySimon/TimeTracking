<!--
  ImportUpload.svelte
  
  Upload component for AI Import with:
  - Drag-and-drop zone
  - File picker
  - Text paste area
  - File list with remove buttons
  - File type and size validation
  
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
	let isDragging = $state(false);
	let showTextInput = $state(false);
	let textContent = $state('');

	const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json', '.txt', '.png', '.jpg', '.jpeg'];
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
		if (ext === '.xlsx' || ext === '.xls') return 'excel';
		if (ext === '.json') return 'json';
		if (['.png', '.jpg', '.jpeg'].includes(ext)) return 'image';
		return 'text';
	}

	async function readFileContent(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			if (file.type.startsWith('image/')) {
				reader.readAsDataURL(file);
			} else {
				reader.readAsText(file);
			}
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

	function addTextSource() {
		if (!textContent.trim()) return;

		const source: ImportSource = {
			id: generateSourceId(),
			type: 'text',
			filename: `text-${Date.now()}.txt`,
			content: textContent.trim(),
			sizeBytes: new Blob([textContent]).size,
			addedAt: Date.now()
		};
		sources = [...sources, source];
		textContent = '';
		showTextInput = false;
		onfileschange?.(sources);
	}

	function removeSource(id: string) {
		sources = sources.filter((s) => s.id !== id);
		onfileschange?.(sources);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			addFiles(e.dataTransfer.files);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
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
	<div
		class="drop-zone"
		class:dragging={isDragging}
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		role="button"
		tabindex="0"
	>
		<div class="drop-icon">📄</div>
		<p class="drop-text">Dateien hierher ziehen</p>
		<p class="drop-hint">oder</p>
		<div class="drop-actions">
			<label class="btn-file">
				Dateien auswählen
				<input
					type="file"
					multiple
					accept={ALLOWED_EXTENSIONS.join(',')}
					onchange={handleFileInput}
					hidden
				/>
			</label>
			<button class="btn-text" onclick={() => (showTextInput = !showTextInput)}>
				Text einfügen
			</button>
		</div>
		<p class="drop-formats">CSV, Excel (.xlsx), JSON, Text, Bilder</p>
	</div>

	{#if showTextInput}
		<div class="text-input-section">
			<textarea
				bind:value={textContent}
				placeholder="Text hier einfügen (z.B. kopierte Tabelle, Zeitliste...)"
				rows="6"
			></textarea>
			<div class="text-actions">
				<button class="btn-cancel" onclick={() => (showTextInput = false)}>Abbrechen</button>
				<button class="btn-add" onclick={addTextSource} disabled={!textContent.trim()}>
					Hinzufügen
				</button>
			</div>
		</div>
	{/if}

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

	.drop-zone {
		border: 2px dashed var(--border-color);
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		background: var(--bg-secondary);
		transition: all 0.2s;
		cursor: pointer;
	}

	.drop-zone:hover,
	.drop-zone.dragging {
		border-color: var(--accent-color);
		background: var(--bg-tertiary);
	}

	.drop-icon {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.drop-text {
		font-size: 1rem;
		color: var(--text-primary);
		margin: 0;
	}

	.drop-hint {
		color: var(--text-tertiary);
		font-size: 0.875rem;
		margin: 0.5rem 0;
	}

	.drop-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin: 1rem 0;
	}

	.btn-file,
	.btn-text {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		border: 1px solid var(--border-color);
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.btn-file:hover,
	.btn-text:hover {
		background: var(--bg-tertiary);
	}

	.drop-formats {
		font-size: 0.75rem;
		color: var(--text-tertiary);
		margin: 0;
	}

	.text-input-section {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 1rem;
	}

	.text-input-section textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.875rem;
		resize: vertical;
	}

	.text-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.btn-cancel,
	.btn-add {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		border: none;
	}

	.btn-cancel {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.btn-add {
		background: var(--accent-color);
		color: white;
	}

	.btn-add:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
		background: var(--accent-color);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-start:hover {
		opacity: 0.9;
	}
</style>
