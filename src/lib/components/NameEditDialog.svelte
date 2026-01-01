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

	function handleSave() {
		setUserName(firstName.trim(), lastName.trim());
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
			/>
		</div>
	</div>
	<div class="actions">
		<button class="cancel-btn" onclick={onclose}>Abbrechen</button>
		<button class="save-btn" onclick={handleSave}>Speichern</button>
	</div>
</Modal>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field label {
		font-size: 0.85rem;
		color: var(--muted);
	}

	.field input {
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--r-btn);
		background: var(--surface);
		color: var(--text);
		font-size: 1rem;
	}

	.field input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.cancel-btn {
		padding: 0.75rem 1.5rem;
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: var(--r-btn);
		font-size: 0.9rem;
		cursor: pointer;
	}

	.cancel-btn:hover {
		background: var(--surface-hover);
	}

	.save-btn {
		padding: 0.75rem 1.5rem;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: var(--r-btn);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
	}

	.save-btn:hover {
		opacity: 0.9;
	}
</style>
