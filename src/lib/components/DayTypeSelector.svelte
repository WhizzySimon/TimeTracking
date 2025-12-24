<!--
  DayTypeSelector component - dropdown for selecting day type
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.2 (Day type dropdown)
  - ui-logic-spec-v1.md Section 10 (Day type affects Soll calculation)
  
  Options: Arbeitstag, Urlaub, Krank, Feiertag
  Default: Arbeitstag if no record exists
  Saves to IndexedDB dayTypes store on change
  Prevents non-work type if tasks exist for that day
-->
<script lang="ts">
	import type { DayType, DayTypeValue, TimeEntry } from '$lib/types';
	import { formatDate } from '$lib/utils/date';
	import { getByKey, getAll } from '$lib/storage/db';
	import { saveDayType } from '$lib/storage/operations';
	import { calculateIst } from '$lib/utils/calculations';
	import { categories } from '$lib/stores';
	import ConfirmDialog from './ConfirmDialog.svelte';

	interface Props {
		date: Date;
		onchange?: (type: DayTypeValue) => void;
	}

	let { date, onchange }: Props = $props();

	let value: DayTypeValue = $state('arbeitstag');
	let loading = $state(true);
	let showNotification = $state(false);
	let notificationMessage = $state('');

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

		// If changing to non-work type, check for existing tasks
		if (newValue !== 'arbeitstag') {
			const dateKey = formatDate(date, 'ISO');
			const allEntries = await getAll<TimeEntry>('timeEntries');
			const dayEntries = allEntries.filter((e) => e.date === dateKey);
			const dayIst = calculateIst(dayEntries, $categories);

			if (dayIst > 0) {
				notificationMessage = `Dieser Tag hat bereits ${dayIst.toFixed(1)} Stunden Arbeitszeit erfasst. Bitte zuerst die Einträge löschen, um die Tagesart zu ändern.`;
				showNotification = true;
				// Reset dropdown to Arbeitstag
				select.value = value;
				return;
			}
		}

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

	function dismissNotification() {
		showNotification = false;
		notificationMessage = '';
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

{#if showNotification}
	<ConfirmDialog
		title="Nicht möglich"
		message={notificationMessage}
		confirmLabel="OK"
		onconfirm={dismissNotification}
		oncancel={dismissNotification}
	/>
{/if}

<style>
	.day-type-selector {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.day-type-selector label {
		font-weight: 500;
		color: var(--muted);
	}

	.day-type-select {
		flex: 1;
		padding: 0.5rem 0.75rem 0.5rem 2rem;
		border: 1px solid var(--input-border);
		border-radius: var(--r-input);
		font-size: 1rem;
		background: var(--input-bg);
		color: var(--input-text);
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: 0.75rem center;
		background-size: 12px;
	}

	.day-type-select:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: 0 0 0 2px var(--accent-light);
	}

	.day-type-select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
