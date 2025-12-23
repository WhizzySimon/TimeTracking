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
		<p class="message">{message}</p>
		<div class="actions">
			{#if type === 'confirm'}
				<button type="button" class="btn-secondary" onclick={handleCancel}>
					{cancelLabel}
				</button>
			{/if}
			<button
				type="button"
				class="btn-confirm"
				class:danger={confirmStyle === 'danger'}
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
		gap: 1.5rem;
	}

	.message {
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
		color: var(--text);
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.btn-secondary,
	.btn-confirm {
		padding: 0.625rem 1.25rem;
		border-radius: var(--r-btn);
		font-size: 1rem;
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.btn-secondary {
		background: var(--btn-secondary-bg);
		color: var(--btn-secondary-text);
		border: 1px solid var(--btn-secondary-border);
	}

	.btn-secondary:hover {
		background: var(--btn-secondary-hover);
	}

	.btn-confirm {
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		border: none;
	}

	.btn-confirm:hover {
		background: var(--btn-primary-hover);
	}

	.btn-confirm.danger {
		background: var(--btn-danger-bg);
	}

	.btn-confirm.danger:hover {
		background: var(--btn-danger-hover);
	}
</style>
