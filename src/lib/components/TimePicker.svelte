<script lang="ts">
	interface Props {
		value: string;
		onchange: (value: string) => void;
		id?: string;
		required?: boolean;
		placeholder?: string;
	}

	let { value, onchange, id = '', required = false, placeholder = 'HH:mm' }: Props = $props();

	function formatTimeValue(hours: number, minutes: number): string {
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
	}

	function generateTimeOptions(): string[] {
		const options: string[] = [];
		for (let h = 0; h < 24; h++) {
			for (let m = 0; m < 60; m += 5) {
				options.push(formatTimeValue(h, m));
			}
		}
		return options;
	}

	const timeOptions = generateTimeOptions();

	function handleSelectChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		onchange(select.value);
	}
</script>

<select {id} class="time-picker" value={value || ''} onchange={handleSelectChange} {required}>
	<option value="" disabled>{placeholder}</option>
	{#each timeOptions as time (time)}
		<option value={time}>{time}</option>
	{/each}
</select>

<style>
	.time-picker {
		padding: 0.5rem 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
		cursor: pointer;
		min-width: 100px;
	}

	.time-picker:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}
</style>
