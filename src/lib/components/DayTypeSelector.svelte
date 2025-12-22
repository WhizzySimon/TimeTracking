<!--
  DayTypeSelector component - dropdown for selecting day type
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.2 (Day type dropdown)
  - ui-logic-spec-v1.md Section 10 (Day type affects Soll calculation)
  
  Options: Arbeitstag, Urlaub, Krank, Feiertag
  Default: Arbeitstag if no record exists
  Saves to IndexedDB dayTypes store on change
-->
<script lang="ts">
	import type { DayType, DayTypeValue } from '$lib/types';
	import { formatDate } from '$lib/utils/date';
	import { getByKey } from '$lib/storage/db';
	import { saveDayType } from '$lib/storage/operations';

	interface Props {
		date: Date;
		onchange?: (type: DayTypeValue) => void;
	}

	let { date, onchange }: Props = $props();

	let value: DayTypeValue = $state('arbeitstag');
	let loading = $state(true);

	// Load day type when date changes
	$effect(() => {
		loadDayType(date);
	});

	async function loadDayType(d: Date) {
		loading = true;
		const dateKey = formatDate(d, 'ISO');
		const record = await getByKey<DayType>('dayTypes', dateKey);
		value = record?.type ?? 'arbeitstag';
		loading = false;
	}

	async function handleChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newValue = select.value as DayTypeValue;
		value = newValue;

		// Save to IndexedDB
		const dateKey = formatDate(date, 'ISO');
		const dayType: DayType = {
			date: dateKey,
			type: newValue,
			updatedAt: Date.now()
		};
		await saveDayType(dayType);

		// Notify parent
		onchange?.(newValue);
	}
</script>

<div class="day-type-selector">
	<label for="day-type">Tagesart:</label>
	<select id="day-type" class="day-type-select" {value} onchange={handleChange} disabled={loading}>
		<option value="arbeitstag">Arbeitstag</option>
		<option value="urlaub">Urlaub</option>
		<option value="krank">Krank</option>
		<option value="feiertag">Feiertag</option>
	</select>
</div>

<style>
	.day-type-selector {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.day-type-selector label {
		font-weight: 500;
		color: #666;
	}

	.day-type-select {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
		cursor: pointer;
	}

	.day-type-select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.day-type-select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
