<script lang="ts">
	interface Props {
		value: string;
		onchange: (value: string) => void;
		id?: string;
		required?: boolean;
	}

	let { value, onchange, id = '', required = false }: Props = $props();

	// Parse current value into hour and minute
	function parseValue(val: string): { hour: string; minute: string } {
		if (!val) return { hour: '', minute: '' };
		const match = val.match(/^(\d{1,2}):(\d{2})$/);
		if (!match) return { hour: '', minute: '' };
		return { hour: match[1].padStart(2, '0'), minute: match[2] };
	}

	let parsed = $derived(parseValue(value));

	// Generate hour options (00-23)
	const hours: string[] = [];
	for (let h = 0; h < 24; h++) {
		hours.push(String(h).padStart(2, '0'));
	}

	// Generate minute options (00, 05, 10, ..., 55)
	const minutes: string[] = [];
	for (let m = 0; m < 60; m += 5) {
		minutes.push(String(m).padStart(2, '0'));
	}

	function handleHourChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newHour = select.value;
		if (newHour) {
			const newMinute = parsed.minute || '00';
			onchange(`${newHour}:${newMinute}`);
		}
	}

	function handleMinuteChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newMinute = select.value;
		if (newMinute) {
			const newHour = parsed.hour || '00';
			onchange(`${newHour}:${newMinute}`);
		}
	}
</script>

<div class="time-picker-container" {id}>
	<select
		class="time-select hour-select"
		value={parsed.hour}
		onchange={handleHourChange}
		{required}
		aria-label="Stunde"
	>
		<option value="" disabled>--</option>
		{#each hours as hour (hour)}
			<option value={hour}>{hour}</option>
		{/each}
	</select>
	<span class="separator">:</span>
	<select
		class="time-select minute-select"
		value={parsed.minute}
		onchange={handleMinuteChange}
		{required}
		aria-label="Minute"
	>
		<option value="" disabled>--</option>
		{#each minutes as minute (minute)}
			<option value={minute}>{minute}</option>
		{/each}
	</select>
</div>

<style>
	.time-picker-container {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.time-select {
		padding: 0.5rem 0.5rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
		cursor: pointer;
		min-width: 60px;
		text-align: center;
	}

	.time-select:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: 0 0 0 2px var(--accent-light);
	}

	.separator {
		font-size: 1.25rem;
		font-weight: 500;
		color: var(--text);
	}
</style>
