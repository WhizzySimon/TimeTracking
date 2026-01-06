<script lang="ts">
	import AnalogTimePicker from './AnalogTimePicker.svelte';

	interface Props {
		value: string;
		onchange: (value: string) => void;
		id?: string;
	}

	let { value, onchange, id = '' }: Props = $props();

	let showPicker = $state(false);

	// Format display value
	let displayValue = $derived(() => {
		if (!value) return '--:--';
		return value;
	});

	function handlePickerChange(newValue: string) {
		onchange(newValue);
	}
</script>

<button
	type="button"
	class="time-picker-button"
	{id}
	onclick={() => (showPicker = true)}
	aria-label="Zeit auswählen"
>
	{displayValue()}
</button>

{#if showPicker}
	<AnalogTimePicker
		{value}
		onchange={handlePickerChange}
		onclose={() => (showPicker = false)}
		label="Zeit wählen"
	/>
{/if}

<style>
	.time-picker-button {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: var(--tt-font-size-normal);
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
		cursor: pointer;
		min-width: 100px;
		text-align: center;
		font-weight: 500;
		transition: all 0.2s;
	}

	.time-picker-button:hover {
		background: var(--tt-background-hover);
		border-color: var(--tt-border-hover);
	}

	.time-picker-button:focus {
		outline: none;
		border-color: var(--tt-border-focus);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-800);
	}
</style>
