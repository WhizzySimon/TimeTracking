<!--
  NameEditDialog - Edit user first name and last name
-->
<script lang="ts">
	import { userProfile, setUserName } from '$lib/stores/user';
	import Modal from './Modal.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let firstName = $state($userProfile?.firstName ?? '');
	let lastName = $state($userProfile?.lastName ?? '');

	async function handleSave() {
		await setUserName(firstName.trim(), lastName.trim());
		onclose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSave();
		}
	}
</script>

<Modal title="Name bearbeiten" {onclose}>
	<div class="form">
		<div class="field">
			<label for="firstName">Vorname</label>
			<input
				id="firstName"
				type="text"
				bind:value={firstName}
				placeholder="Vorname"
				onkeydown={handleKeydown}
				class="tt-text-input"
			/>
		</div>
		<div class="field">
			<label for="lastName">Nachname</label>
			<input
				id="lastName"
				type="text"
				bind:value={lastName}
				placeholder="Nachname"
				onkeydown={handleKeydown}
				class="tt-text-input"
			/>
		</div>
	</div>
	<div class="actions">
		<button class="tt-button-secondary" onclick={onclose}>Abbrechen</button>
		<button class="tt-button-primary" onclick={handleSave}>Speichern</button>
	</div>
</Modal>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
		padding: var(--tt-space-16) 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.field label {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-muted);
	}

	/* Inputs use design system class: .tt-text-input */

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
		padding-top: var(--tt-space-16);
		border-top: 1px solid var(--tt-border-default);
	}

	/* Buttons use design system classes: .tt-button-primary, .tt-button-secondary */
</style>
