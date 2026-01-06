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
		<div class="tt-form-field">
			<label for="employer-name" class="tt-form-field__label">Name:</label>
			<input
				type="text"
				id="employer-name"
				data-testid="employer-name-input"
				bind:value={name}
				placeholder="z.B. Firma GmbH"
				class="tt-text-input"
				disabled={saving}
			/>
		</div>

		{#if error}
			<p class="tt-error-message">{error}</p>
		{/if}

		<div class="tt-form-actions">
			<button type="button" class="tt-button-secondary" onclick={handleClose} disabled={saving}>
				Abbrechen
			</button>
			<button
				type="button"
				class="tt-button-primary"
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
		gap: var(--tt-space-16);
	}

	/* Form elements use design system classes: .tt-form-field, .tt-form-field__label, .tt-error-message, .tt-form-actions */
	/* Input uses design system class: .tt-text-input */
	/* Buttons use design system classes: .tt-button-primary, .tt-button-secondary */
</style>
