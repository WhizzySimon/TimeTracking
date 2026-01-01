<!--
  EmailEditDialog - Edit user email address
  Supabase will send a confirmation email to the new address
-->
<script lang="ts">
	import { userProfile } from '$lib/stores/user';
	import { updateEmail } from '$lib/api/auth';
	import Modal from './Modal.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let newEmail = $state($userProfile?.email ?? '');
	let error = $state('');
	let success = $state(false);
	let saving = $state(false);

	async function handleSave() {
		error = '';

		if (!newEmail.trim()) {
			error = 'Bitte geben Sie eine E-Mail-Adresse ein.';
			return;
		}

		if (newEmail.trim() === $userProfile?.email) {
			error = 'Die neue E-Mail-Adresse ist identisch mit der aktuellen.';
			return;
		}

		saving = true;
		try {
			await updateEmail(newEmail.trim());
			success = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten.';
		} finally {
			saving = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !saving) {
			handleSave();
		}
	}
</script>

<Modal title="E-Mail ändern" {onclose}>
	{#if success}
		<div class="success-message">
			<p>Eine Bestätigungs-E-Mail wurde an <strong>{newEmail}</strong> gesendet.</p>
			<p>Bitte klicken Sie auf den Link in der E-Mail, um die Änderung zu bestätigen.</p>
		</div>
		<div class="actions">
			<button class="save-btn" onclick={onclose}>Schließen</button>
		</div>
	{:else}
		<div class="form">
			<div class="field">
				<label for="currentEmail">Aktuelle E-Mail</label>
				<input
					id="currentEmail"
					type="email"
					value={$userProfile?.email ?? ''}
					disabled
					class="disabled"
				/>
			</div>
			<div class="field">
				<label for="newEmail">Neue E-Mail</label>
				<input
					id="newEmail"
					type="email"
					bind:value={newEmail}
					placeholder="neue@email.de"
					onkeydown={handleKeydown}
				/>
			</div>
			{#if error}
				<p class="error">{error}</p>
			{/if}
		</div>
		<div class="actions">
			<button class="cancel-btn" onclick={onclose} disabled={saving}>Abbrechen</button>
			<button class="save-btn" onclick={handleSave} disabled={saving}>
				{saving ? 'Wird gesendet...' : 'Bestätigung senden'}
			</button>
		</div>
	{/if}
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

	.field input.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.field input:focus:not(.disabled) {
		outline: none;
		border-color: var(--accent);
	}

	.error {
		color: var(--neg);
		font-size: 0.85rem;
		margin: 0;
	}

	.success-message {
		padding: 1rem 0;
		text-align: center;
	}

	.success-message p {
		margin: 0.5rem 0;
		color: var(--text);
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

	.cancel-btn:hover:not(:disabled) {
		background: var(--surface-hover);
	}

	.cancel-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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

	.save-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.save-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
