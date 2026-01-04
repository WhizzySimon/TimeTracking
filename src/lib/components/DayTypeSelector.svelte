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
	import CustomDropdown from './CustomDropdown.svelte';

	interface Props {
		date: Date;
		onchange?: (type: DayTypeValue) => void;
	}

	let { date, onchange }: Props = $props();

	let value: DayTypeValue = $state('arbeitstag');
	let loading = $state(true);
	let showNotification = $state(false);
	let notificationMessage = $state('');

	const dayTypeOptions = [
		{ value: 'arbeitstag', label: 'Arbeitstag' },
		{ value: 'urlaub', label: 'Urlaub' },
		{ value: 'krank', label: 'Krank' },
		{ value: 'feiertag', label: 'Feiertag' }
	];

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

	async function handleChange(newValue: string) {
		const typedValue = newValue as DayTypeValue;

		// If changing to non-work type, check for existing tasks
		if (typedValue !== 'arbeitstag') {
			const dateKey = formatDate(date, 'ISO');
			const allEntries = await getAll<TimeEntry>('timeEntries');
			const dayEntries = allEntries.filter((e) => e.date === dateKey);
			const dayIst = calculateIst(dayEntries, $categories);

			if (dayIst > 0) {
				notificationMessage = `Dieser Tag hat bereits ${dayIst.toFixed(1)} Stunden Arbeitszeit erfasst. Bitte zuerst die Einträge löschen, um die Tagesart zu ändern.`;
				showNotification = true;
				return;
			}
		}

		value = typedValue;

		// Save to IndexedDB
		const dateKey = formatDate(date, 'ISO');
		const dayType: DayType = {
			date: dateKey,
			type: typedValue,
			updatedAt: Date.now()
		};
		await saveDayType(dayType);

		// Notify parent
		onchange?.(typedValue);
	}

	function dismissNotification() {
		showNotification = false;
		notificationMessage = '';
	}
</script>

<div class="tt-labeled-dropdown">
	<span class="tt-labeled-dropdown__label">Tagesart</span>
	<CustomDropdown options={dayTypeOptions} {value} onchange={handleChange} disabled={loading} />
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
	/* Uses design system .tt-labeled-dropdown class and CustomDropdown component */
</style>
