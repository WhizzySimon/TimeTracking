<!--
  PasswordInput component - password field with visibility toggle
  
  Spec refs:
  - kleine-aenderungen.md A3.5 (PasswordInput with toggle)
  
  Features:
  - Toggle between password/text input type
  - Eye icon button for visibility toggle
  - Supports standard input attributes
-->
<script lang="ts">
	interface Props {
		/** Input value (two-way binding) */
		value: string;
		/** Input ID for label association */
		id?: string;
		/** Placeholder text */
		placeholder?: string;
		/** Disabled state */
		disabled?: boolean;
		/** Required field */
		required?: boolean;
		/** Autocomplete attribute */
		autocomplete?: string;
		/** CSS class for input */
		class?: string;
	}

	let {
		value = $bindable(''),
		id,
		placeholder,
		disabled = false,
		required = false,
		autocomplete = 'current-password',
		class: className = ''
	}: Props = $props();

	let visible = $state(false);

	function toggleVisibility() {
		visible = !visible;
	}
</script>

<div class="password-input-wrapper">
	<input
		type={visible ? 'text' : 'password'}
		{id}
		bind:value
		{placeholder}
		{disabled}
		{required}
		autocomplete={autocomplete as 'current-password' | 'new-password' | 'off'}
		class="password-input {className}"
	/>
	<button
		type="button"
		class="toggle-btn"
		onclick={toggleVisibility}
		aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
		tabindex="-1"
	>
		{#if visible}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path
					d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
				/>
				<line x1="1" y1="1" x2="23" y2="23" />
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
		{/if}
	</button>
</div>

<style>
	.password-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.password-input {
		width: 100%;
		padding: 0.75rem;
		padding-right: 2.75rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
	}

	.password-input:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: 0 0 0 2px var(--accent-light);
	}

	.password-input:disabled {
		background: var(--surface-hover);
		color: var(--muted);
	}

	.toggle-btn {
		position: absolute;
		right: 0.5rem;
		padding: 0.25rem;
		border: none;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--r-input);
	}

	.toggle-btn:hover {
		color: var(--text);
		background: var(--surface-hover);
	}

	.toggle-btn:focus {
		outline: none;
	}
</style>
