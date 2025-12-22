<!--
  WeekTypeSelector component - sets day type for all days in a week
  
  Spec refs:
  - ui-logic-spec-v1.md Section 4.1 (Wochenart)
  
  Behavior:
  - Dropdown with 4 options: Arbeitswoche, Urlaub, Krank, Feiertag
  - On change, sets day type for all 7 days of week in IndexedDB
  - Shows confirmation dialog before applying
  - Prevents changing to non-work type if hours already logged
-->
<script lang="ts">
	import { saveDayType } from '$lib/storage/operations';
	import { formatDate, getWeekDates } from '$lib/utils/date';
	import { getAll } from '$lib/storage/db';
	import { calculateIst } from '$lib/utils/calculations';
	import { categories } from '$lib/stores';
	import type { DayType, DayTypeValue, TimeEntry } from '$lib/types';
	import ConfirmDialog from './ConfirmDialog.svelte';

	interface Props {
		weekDate: Date;
		onchange?: () => void;
	}

	let { weekDate, onchange }: Props = $props();

	type WeekTypeValue = 'arbeitswoche' | 'urlaub' | 'krank' | 'feiertag';

	let showConfirm = $state(false);
	let showWarning = $state(false);
	let warningMessage = $state('');
	let pendingWeekType: WeekTypeValue | null = $state(null);
	let selectedValue: WeekTypeValue = $state('arbeitswoche');

	function weekTypeToDayType(weekType: WeekTypeValue): DayTypeValue {
		switch (weekType) {
			case 'arbeitswoche':
				return 'arbeitstag';
			case 'urlaub':
				return 'urlaub';
			case 'krank':
				return 'krank';
			case 'feiertag':
				return 'feiertag';
		}
	}

	async function handleChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newValue = select.value as WeekTypeValue;
		pendingWeekType = newValue;

		// If changing to non-work type, check for existing hours
		if (newValue !== 'arbeitswoche') {
			const weekDates = getWeekDates(weekDate);
			const allEntries = await getAll<TimeEntry>('timeEntries');

			// Check each day for logged hours
			const daysWithHours: string[] = [];
			for (const date of weekDates) {
				const dateKey = formatDate(date, 'ISO');
				const dayEntries = allEntries.filter((e) => e.date === dateKey);
				const dayIst = calculateIst(dayEntries, $categories);
				if (dayIst > 0) {
					daysWithHours.push(formatDate(date, 'DE'));
				}
			}

			if (daysWithHours.length > 0) {
				warningMessage = `Folgende Tage haben bereits erfasste Arbeitszeit: ${daysWithHours.join(', ')}. Bitte zuerst die Einträge löschen.`;
				showWarning = true;
				// Reset dropdown to current value
				select.value = selectedValue;
				pendingWeekType = null;
				return;
			}
		}

		showConfirm = true;
	}

	async function confirmChange() {
		if (!pendingWeekType) return;

		const dayType = weekTypeToDayType(pendingWeekType);
		const weekDates = getWeekDates(weekDate);

		for (const date of weekDates) {
			const dateKey = formatDate(date, 'ISO');
			const record: DayType = {
				date: dateKey,
				type: dayType,
				updatedAt: Date.now()
			};
			await saveDayType(record);
		}

		// Keep the selected value (don't reset to arbeitswoche)
		selectedValue = pendingWeekType;
		showConfirm = false;
		pendingWeekType = null;

		onchange?.();
	}

	function cancelChange() {
		// Reset dropdown to previous value
		selectedValue = selectedValue;
		showConfirm = false;
		pendingWeekType = null;
	}

	function dismissWarning() {
		showWarning = false;
		warningMessage = '';
	}
</script>

<div class="week-type-section">
	<label for="week-type">Wochenart:</label>
	<select
		id="week-type"
		class="week-type-select"
		bind:value={selectedValue}
		onchange={handleChange}
	>
		<option value="arbeitswoche">Arbeitswoche</option>
		<option value="urlaub">Urlaub</option>
		<option value="krank">Krank</option>
		<option value="feiertag">Feiertag</option>
	</select>
</div>

{#if showConfirm}
	<ConfirmDialog
		title="Wochenart ändern"
		message="Dies setzt die Tagesart für alle 7 Tage dieser Woche. Fortfahren?"
		confirmLabel="Fortfahren"
		onconfirm={confirmChange}
		oncancel={cancelChange}
	/>
{/if}

{#if showWarning}
	<ConfirmDialog
		title="Nicht möglich"
		message={warningMessage}
		confirmLabel="OK"
		onconfirm={dismissWarning}
		oncancel={dismissWarning}
	/>
{/if}

<style>
	.week-type-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.week-type-section label {
		font-weight: 500;
		color: #333;
	}

	.week-type-select {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
		background: white;
		min-width: 150px;
		cursor: pointer;
	}

	.week-type-select:hover {
		border-color: #999;
	}

	.week-type-select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}
</style>
