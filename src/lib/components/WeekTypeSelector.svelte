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
	import { put } from '$lib/storage/db';
	import { formatDate, getWeekDates } from '$lib/utils/date';
	import type { DayType, DayTypeValue } from '$lib/types';

	interface Props {
		/** The reference date for the week (any date within the week) */
		weekDate: Date;
		/** Callback when week type changes (to reload day types) */
		onchange?: () => void;
	}

	let { weekDate, onchange }: Props = $props();

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

	async function handleChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const weekType = select.value as WeekTypeValue;

		// Confirmation dialog
		const confirmed = confirm('Dies setzt die Tagesart für alle 7 Tage dieser Woche. Fortfahren?');

		if (!confirmed) {
			// Reset select to default
			select.value = 'arbeitswoche';
			return;
		}

		const dayType = weekTypeToDayType(weekType);
		const weekDates = getWeekDates(weekDate);

		// Update all 7 days in IndexedDB
		for (const date of weekDates) {
			const dateKey = formatDate(date, 'ISO');
			const record: DayType = {
				date: dateKey,
				type: dayType,
				updatedAt: Date.now()
			};
			await put('dayTypes', record);
		}

		// Reset select to default (it's a one-time action)
		select.value = 'arbeitswoche';

		// Notify parent to reload day types
		onchange?.();
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
