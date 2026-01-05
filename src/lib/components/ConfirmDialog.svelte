<!--
  ConfirmDialog component - styled replacement for browser confirm/alert dialogs
  
  Usage:
  - For confirmations: <ConfirmDialog message="..." onconfirm={...} oncancel={...} />
  - For alerts: <ConfirmDialog message="..." onconfirm={...} type="alert" />
  
  Design: Matches app styling, uses Modal component internally
-->
<script lang="ts">
	import Modal from './Modal.svelte';

	interface Props {
		/** Dialog title */
		title?: string;
		/** Message to display */
		message: string;
		/** Type: 'confirm' shows Cancel+Confirm, 'alert' shows only OK */
		type?: 'confirm' | 'alert';
		/** Label for confirm/OK button */
		confirmLabel?: string;
		/** Label for cancel button (confirm type only) */
		cancelLabel?: string;
		/** Confirm button style: 'primary' (blue) or 'danger' (red) */
		confirmStyle?: 'primary' | 'danger';
		/** Called when user confirms */
		onconfirm: () => void;
		/** Called when user cancels (confirm type only) */
		oncancel?: () => void;
	}

	let {
		title = '',
		message,
		type = 'confirm',
		confirmLabel = 'OK',
		cancelLabel = 'Abbrechen',
		confirmStyle = 'primary',
		onconfirm,
		oncancel
	}: Props = $props();

	function handleConfirm() {
		onconfirm();
	}

	function handleCancel() {
		oncancel?.();
	}

	function handleClose() {
		if (type === 'alert') {
			onconfirm();
		} else {
			oncancel?.();
		}
	}

	let dialogTitle = $derived(title || (type === 'alert' ? 'Hinweis' : 'Bestätigung'));
</script>

<Modal title={dialogTitle} onclose={handleClose}>
	<div class="confirm-dialog">
		<p class="tt-dialog-message">{message}</p>
		<div class="actions">
			{#if type === 'confirm'}
				<button type="button" class="tt-button-secondary" onclick={handleCancel}>
					{cancelLabel}
				</button>
			{/if}
			<button
				type="button"
				class={confirmStyle === 'danger' ? 'tt-button-danger' : 'tt-button-primary'}
				onclick={handleConfirm}
			>
				{confirmLabel}
			</button>
		</div>
	</div>
</Modal>

<style>
	.confirm-dialog {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-24);
	}

	/* Message text uses .tt-dialog-message from design system */

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
	}

	/* Buttons use design system classes: .tt-button-primary, .tt-button-secondary, .tt-button-danger */
</style>
