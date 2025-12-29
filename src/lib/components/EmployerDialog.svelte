<!--
  EmployerDialog component - modal for adding/editing employers (Arbeitgeber)
  
  Spec refs:
  - multi-arbeitgeber.md AG-FR-001 to AG-FR-004
  
  Features:
  - Name input (required)
  - Create or edit mode (determined by employer prop)
-->
<script lang="ts">
	import { saveEmployer, createEmployer } from '$lib/storage/employers';
	import type { Employer } from '$lib/types';
	import Modal from './Modal.svelte';

	interface Props {
		/** Existing employer for edit mode, undefined for create mode */
		employer?: Employer;
		/** Callback when employer is saved */
		onsave?: (employer: Employer) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { employer, onsave, onclose }: Props = $props();

	// Form state - use function to capture initial value intentionally
	function getInitialName() {
		return employer?.name ?? '';
	}
	let name = $state(getInitialName());
	let error = $state('');
	let saving = $state(false);

	// Determine if we're in edit mode - use derived for reactivity
	let isEditMode = $derived(employer !== undefined);
	let title = $derived(isEditMode ? 'Arbeitgeber bearbeiten' : 'Neuer Arbeitgeber');

	async function handleSave() {
		const trimmedName = name.trim();

		if (!trimmedName) {
			error = 'Name ist erforderlich';
			return;
		}

		error = '';
		saving = true;

		try {
			let savedEmployer: Employer;

			if (isEditMode && employer) {
				savedEmployer = await saveEmployer({
					...employer,
					name: trimmedName
				});
			} else {
				savedEmployer = await createEmployer(trimmedName);
			}

			onsave?.(savedEmployer);
		} catch (err) {
			error = 'Fehler beim Speichern';
			console.error('[EmployerDialog] Save failed:', err);
		} finally {
			saving = false;
		}
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal {title} onclose={handleClose}>
	<div class="employer-form">
		<div class="field">
			<label for="employer-name">Name:</label>
			<input
				type="text"
				id="employer-name"
				data-testid="employer-name-input"
				bind:value={name}
				placeholder="z.B. Firma GmbH"
				class="text-input"
				disabled={saving}
			/>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="actions">
			<button type="button" class="btn-secondary" onclick={handleClose} disabled={saving}>
				Abbrechen
			</button>
			<button
				type="button"
				class="btn-primary"
				data-testid="save-employer-btn"
				onclick={handleSave}
				disabled={saving}
			>
				{saving ? 'Speichern...' : 'Speichern'}
			</button>
		</div>
	</div>
</Modal>

<style>
	.employer-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
	}

	.text-input {
		padding: 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
	}

	.text-input::placeholder {
		color: var(--input-placeholder);
	}

	.text-input:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: 0 0 0 2px var(--accent-light);
	}

	.text-input:disabled {
		background: var(--surface-hover);
		color: var(--muted);
	}

	.error {
		margin: 0;
		padding: 0.5rem;
		background: var(--neg-light);
		border: 1px solid var(--neg);
		border-radius: var(--r-input);
		color: var(--neg);
		font-size: 0.9rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
	}

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--btn-secondary-border);
		border-radius: var(--r-btn);
		background: var(--btn-secondary-bg);
		color: var(--btn-secondary-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--btn-secondary-hover);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: var(--r-btn);
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		font-size: 1rem;
		cursor: pointer;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--btn-primary-hover);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
