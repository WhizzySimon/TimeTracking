<!--
  EmailEditDialog - Edit user email address
  Supabase will send a confirmation email to the new address
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { userProfile, clearUserProfile } from '$lib/stores/user';
	import { updateEmail, logout } from '$lib/api/auth';
	import { clearSession } from '$lib/stores/auth';
	import { clearCachedPlan } from '$lib/api/profile';
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

	async function handleLogoutAndClose() {
		onclose();
		await logout();
		await clearSession();
		clearUserProfile();
		clearCachedPlan();
		goto(resolve('/login') + '?logout=1');
	}
</script>

<Modal title="E-Mail ändern" {onclose}>
	{#if success}
		<div class="success-message">
			<p>Eine Bestätigungs-E-Mail wurde an <strong>{newEmail}</strong> gesendet.</p>
			<p>Bitte klicken Sie auf den Link in der E-Mail, um die Änderung zu bestätigen.</p>
			<p class="logout-hint">
				Sie werden jetzt abgemeldet und können sich nach der Bestätigung mit der neuen
				E-Mail-Adresse anmelden.
			</p>
		</div>
		<div class="actions">
			<button class="tt-button-primary" onclick={handleLogoutAndClose}>Abmelden</button>
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
					class="tt-text-input"
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
					class="tt-text-input"
				/>
			</div>
			{#if error}
				<p class="error">{error}</p>
			{/if}
		</div>
		<div class="actions">
			<button class="tt-button-secondary" onclick={onclose} disabled={saving}>Abbrechen</button>
			<button class="tt-button-primary" onclick={handleSave} disabled={saving}>
				{saving ? 'Wird gesendet...' : 'Bestätigung senden'}
			</button>
		</div>
	{/if}
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
		font-size: 0.85rem;
		color: var(--tt-text-muted);
	}

	/* Inputs use design system class: .tt-text-input */

	.error {
		color: var(--tt-status-danger);
		font-size: 0.85rem;
		margin: 0;
	}

	.success-message {
		padding: var(--tt-space-16) 0;
		text-align: center;
	}

	.success-message p {
		margin: var(--tt-space-8) 0;
		color: var(--tt-text-primary);
	}

	.success-message .logout-hint {
		margin-top: var(--tt-space-16);
		font-size: 0.85rem;
		color: var(--tt-text-muted);
	}

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
		padding-top: var(--tt-space-16);
		border-top: 1px solid var(--tt-border-default);
	}

	/* Buttons use design system classes: .tt-button-primary, .tt-button-secondary */
</style>
