<!--
  WeekTypeSelector component - sets day type for all days in a week
  
  Spec refs:
  - ui-logic-spec-v1.md Section 4.1 (Wochenart)
  
  Behavior:
  - Dropdown with 4 options: Arbeitswoche, Urlaub, Krank, Feiertag
  - On change, sets day type for all 7 days of week in IndexedDB
  - Shows confirmation dialog before applying
-->
<script lang="ts">
	import { saveDayType } from '$lib/storage/operations';
	import { formatDate, getWeekDates } from '$lib/utils/date';
	import type { DayType, DayTypeValue } from '$lib/types';
	import ConfirmDialog from './ConfirmDialog.svelte';

	interface Props {
		/** The reference date for the week (any date within the week) */
		weekDate: Date;
		/** Callback when week type changes (to reload day types) */
		onchange?: () => void;
	}

	let { weekDate, onchange }: Props = $props();

	// Dialog state
	let showConfirm = $state(false);
	let pendingWeekType: WeekTypeValue | null = $state(null);
	let selectElement: HTMLSelectElement | null = $state(null);

	// Map week type to day type
	type WeekTypeValue = 'arbeitswoche' | 'urlaub' | 'krank' | 'feiertag';

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

	function handleChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		selectElement = select;
		pendingWeekType = select.value as WeekTypeValue;
		showConfirm = true;
	}

	async function confirmChange() {
		if (!pendingWeekType) return;

		const dayType = weekTypeToDayType(pendingWeekType);
		const weekDates = getWeekDates(weekDate);

		// Update all 7 days in IndexedDB
		for (const date of weekDates) {
			const dateKey = formatDate(date, 'ISO');
			const record: DayType = {
				date: dateKey,
				type: dayType,
				updatedAt: Date.now()
			};
			await saveDayType(record);
		}

		// Reset select to default (it's a one-time action)
		if (selectElement) selectElement.value = 'arbeitswoche';

		showConfirm = false;
		pendingWeekType = null;

		// Notify parent to reload day types
		onchange?.();
	}

	function cancelChange() {
		// Reset select to default
		if (selectElement) selectElement.value = 'arbeitswoche';
		showConfirm = false;
		pendingWeekType = null;
	}
</script>

<div class="week-type-section">
	<label for="week-type">Wochenart:</label>
	<select id="week-type" class="week-type-select" onchange={handleChange}>
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
