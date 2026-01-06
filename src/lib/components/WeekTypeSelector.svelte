<!--
  WeekTypeSelector component - sets day type for all days in a week
  
  Spec refs:
  - ui-logic-spec-v1.md Section 4.1 (Wochenart)
  
  Behavior:
  - Dropdown with 4 options: Arbeitswoche, Urlaub, Krank, Feiertag
  - On change to non-work type: only changes days WITHOUT tasks
  - Days WITH tasks remain as Arbeitstag
  - If any day has tasks, dropdown shows Arbeitswoche (mixed week)
-->
<script lang="ts">
	import { saveDayType } from '$lib/storage/operations';
	import { formatDate, getWeekDates } from '$lib/utils/date';
	import { getAll } from '$lib/storage/db';
	import { calculateIst } from '$lib/utils/calculations';
	import { categories } from '$lib/stores';
	import type { DayType, DayTypeValue, TimeEntry } from '$lib/types';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import CustomDropdown from './CustomDropdown.svelte';

	interface Props {
		weekDate: Date;
		onchange?: () => void;
	}

	let { weekDate, onchange }: Props = $props();

	type WeekTypeValue = 'arbeitswoche' | 'urlaub' | 'krank' | 'feiertag';

	let showConfirm = $state(false);
	let showNotification = $state(false);
	let notificationMessage = $state('');
	let pendingWeekType: WeekTypeValue | null = $state(null);
	let selectedValue: WeekTypeValue = $state('arbeitswoche');
	let daysToChange: Date[] = $state([]);
	let hasMixedWeek = $state(false);

	const weekTypeOptions = [
		{ value: 'arbeitswoche', label: 'Arbeitswoche' },
		{ value: 'urlaub', label: 'Urlaub' },
		{ value: 'krank', label: 'Krank' },
		{ value: 'feiertag', label: 'Feiertag' }
	];

	// Reset selectedValue when week changes so the same option can be selected again
	$effect(() => {
		// Track weekDate changes
		void weekDate;
		// Reset to default so user can select same type for new week
		selectedValue = 'arbeitswoche';
	});

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

	async function handleChange(newValue: string) {
		const typedValue = newValue as WeekTypeValue;
		pendingWeekType = typedValue;

		const weekDates = getWeekDates(weekDate);
		const allEntries = await getAll<TimeEntry>('timeEntries');

		// Check which days have hours
		const daysWithHours: string[] = [];
		const daysWithoutHours: Date[] = [];
		for (const date of weekDates) {
			const dateKey = formatDate(date, 'ISO');
			const dayEntries = allEntries.filter((e) => e.date === dateKey);
			const dayIst = calculateIst(dayEntries, $categories);
			if (dayIst > 0) {
				// Format as weekday name instead of full date
				const weekdayName = date.toLocaleDateString('de-DE', { weekday: 'long' });
				daysWithHours.push(weekdayName);
			} else {
				daysWithoutHours.push(date);
			}
		}

		daysToChange = daysWithoutHours;
		hasMixedWeek = daysWithHours.length > 0;

		// If changing to non-work type and some days have hours, show notification
		if (typedValue !== 'arbeitswoche' && daysWithHours.length > 0) {
			notificationMessage = `Folgende Tage haben bereits Arbeitszeit und bleiben Arbeitstag: ${daysWithHours.join(', ')}. Die restlichen Tage werden auf "${getWeekTypeLabel(typedValue)}" gesetzt.`;
			showNotification = true;
		} else {
			// All days can be changed, or changing to Arbeitswoche
			daysToChange = weekDates;
			showConfirm = true;
		}
	}

	function getWeekTypeLabel(weekType: WeekTypeValue): string {
		switch (weekType) {
			case 'arbeitswoche':
				return 'Arbeitswoche';
			case 'urlaub':
				return 'Urlaub';
			case 'krank':
				return 'Krank';
			case 'feiertag':
				return 'Feiertag';
		}
	}

	async function confirmNotification() {
		showNotification = false;
		// User already confirmed in notification dialog, apply change directly
		await confirmChange();
	}

	function cancelNotification() {
		showNotification = false;
		notificationMessage = '';
		pendingWeekType = null;
		daysToChange = [];
		hasMixedWeek = false;
	}

	async function confirmChange() {
		if (!pendingWeekType) return;

		const dayType = weekTypeToDayType(pendingWeekType);

		// Only change the days that don't have tasks
		for (const date of daysToChange) {
			const dateKey = formatDate(date, 'ISO');
			const record: DayType = {
				date: dateKey,
				type: dayType,
				updatedAt: Date.now()
			};
			await saveDayType(record);
		}

		// If mixed week (some days have tasks), dropdown stays on Arbeitswoche
		// Otherwise, show the selected type
		selectedValue = hasMixedWeek ? 'arbeitswoche' : pendingWeekType;

		showConfirm = false;
		pendingWeekType = null;
		daysToChange = [];
		hasMixedWeek = false;

		onchange?.();
	}

	function cancelChange() {
		showConfirm = false;
		pendingWeekType = null;
		daysToChange = [];
		hasMixedWeek = false;
	}
</script>

<div class="tt-labeled-dropdown">
	<span class="tt-labeled-dropdown__label">Wochenart</span>
	<CustomDropdown options={weekTypeOptions} value={selectedValue} onchange={handleChange} />
</div>

{#if showNotification}
	<ConfirmDialog
		title="Hinweis"
		message={notificationMessage}
		confirmLabel="OK"
		onconfirm={confirmNotification}
		oncancel={cancelNotification}
	/>
{/if}

{#if showConfirm}
	<ConfirmDialog
		title="Wochenart ändern"
		message={daysToChange.length === 7
			? 'Dies setzt die Tagesart für alle 7 Tage dieser Woche. Fortfahren?'
			: `Dies setzt die Tagesart für ${daysToChange.length} Tage ohne Arbeitszeit. Fortfahren?`}
		confirmLabel="Fortfahren"
		onconfirm={confirmChange}
		oncancel={cancelChange}
	/>
{/if}

<style>
	/* Uses design system .tt-labeled-dropdown class and CustomDropdown component */
</style>
