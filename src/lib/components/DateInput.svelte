<!--
  DateInput component - unified date input with consistent styling
  
  Features:
  - Native browser date picker for reliability
  - Consistent styling via tt-date-input
  - Optional label
  - German locale display where supported
-->
<script lang="ts">
	interface Props {
		/** Date value in ISO format (YYYY-MM-DD) */
		value: string;
		/** Optional label text */
		label?: string;
		/** Input id for label association */
		id?: string;
		/** Whether input is disabled */
		disabled?: boolean;
		/** Minimum date (ISO format) */
		min?: string;
		/** Maximum date (ISO format) */
		max?: string;
		/** Callback when value changes */
		onchange?: (value: string) => void;
	}

	let { value = $bindable(), label, id, disabled = false, min, max, onchange }: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onchange?.(target.value);
	}
</script>

{#if label}
	<div class="tt-date-field">
		<label for={id} class="tt-date-field__label">{label}</label>
		<input
			type="date"
			{id}
			class="tt-date-input"
			{value}
			{disabled}
			{min}
			{max}
			onchange={handleChange}
		/>
	</div>
{:else}
	<input
		type="date"
		{id}
		class="tt-date-input"
		{value}
		{disabled}
		{min}
		{max}
		onchange={handleChange}
	/>
{/if}

<style>
	.tt-date-field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.tt-date-field__label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}
</style>
