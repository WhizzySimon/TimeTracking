<!--
  DateRangeSelector component - modal for selecting date range
  
  Spec refs:
  - ui-logic-spec-v1.md Section 5.2 (Zeitraum-Selector)
  
  Features:
  - Schnellwahl: Quick select buttons
  - Manuell: DayPicker dialogs for Von/Bis selection
  - Validation: Von <= Bis
-->
<script lang="ts">
	import { formatDate, parseDate } from '$lib/utils/date';
	import Modal from './Modal.svelte';
	import DayPicker from './DayPicker.svelte';
	import { timeEntries } from '$lib/stores';

	interface Props {
		/** Current start date (ISO format YYYY-MM-DD) */
		startDate: string;
		/** Current end date (ISO format YYYY-MM-DD) */
		endDate: string;
		/** Callback when range is saved */
		onsave?: (start: string, end: string) => void;
		/** Callback when modal is closed */
		onclose?: () => void;
	}

	let { startDate, endDate, onsave, onclose }: Props = $props();

	// Local state for editing (as Date objects)
	let startDateObj = $state<Date>(new Date());
	let endDateObj = $state<Date>(new Date());
	let error = $state('');

	// DayPicker dialog states
	let showStartPicker = $state(false);
	let showEndPicker = $state(false);

	// Initialize from props
	$effect(() => {
		const start = parseDate(startDate);
		const end = parseDate(endDate);
		if (start) startDateObj = start;
		if (end) endDateObj = end;
	});

	// Quick select: current year
	function selectCurrentYear() {
		const now = new Date();
		startDateObj = new Date(now.getFullYear(), 0, 1);
		endDateObj = now;
		error = '';
	}

	// Quick select: last year
	function selectLastYear() {
		const now = new Date();
		const lastYear = now.getFullYear() - 1;
		startDateObj = new Date(lastYear, 0, 1);
		endDateObj = new Date(lastYear, 11, 31);
		error = '';
	}

	// Quick select: current month (1st to today)
	function selectCurrentMonth() {
		const now = new Date();
		startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
		endDateObj = now;
		error = '';
	}

	// Quick select: last month (full month)
	function selectLastMonth() {
		const now = new Date();
		const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
		startDateObj = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
		endDateObj = lastMonthEnd;
		error = '';
	}

	// DayPicker handlers
	function handleStartSelect(date: Date) {
		startDateObj = date;
		showStartPicker = false;
		error = '';
	}

	function handleEndSelect(date: Date) {
		endDateObj = date;
		showEndPicker = false;
		error = '';
	}

	// Validate and save
	function handleSave() {
		if (startDateObj > endDateObj) {
			error = 'Startdatum muss vor Enddatum liegen';
			return;
		}

		error = '';
		onsave?.(formatDate(startDateObj, 'ISO'), formatDate(endDateObj, 'ISO'));
	}

	function handleClose() {
		onclose?.();
	}
</script>

<Modal title="Zeitraum wählen" onclose={handleClose}>
	<div class="range-selector">
		<!-- Quick Select -->
		<div class="section">
			<h3 class="section-title">Schnellwahl</h3>
			<div class="quick-btns">
				<button type="button" class="quick-btn tt-interactive" onclick={selectCurrentYear}
					>Aktuelles Jahr</button
				>
				<button type="button" class="quick-btn tt-interactive" onclick={selectLastYear}
					>Letztes Jahr</button
				>
				<button type="button" class="quick-btn tt-interactive" onclick={selectCurrentMonth}
					>Aktueller Monat</button
				>
				<button type="button" class="quick-btn tt-interactive" onclick={selectLastMonth}
					>Letzter Monat</button
				>
			</div>
		</div>

		<!-- Date Selection with DayPicker -->
		<div class="section">
			<h3 class="section-title">Zeitraum</h3>
			<div class="date-fields">
				<div class="field">
					<span class="field-label">Von:</span>
					<button
						type="button"
						class="tt-date-selector-button tt-interactive-card"
						onclick={() => (showStartPicker = true)}
					>
						<span class="tt-date-selector-button__date">{formatDate(startDateObj, 'DE')}</span>
					</button>
				</div>
				<div class="field">
					<span class="field-label">Bis:</span>
					<button
						type="button"
						class="tt-date-selector-button tt-interactive-card"
						onclick={() => (showEndPicker = true)}
					>
						<span class="tt-date-selector-button__date">{formatDate(endDateObj, 'DE')}</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Error Message -->
		{#if error}
			<p class="error">{error}</p>
		{/if}

		<!-- Actions -->
		<div class="actions">
			<button type="button" class="tt-button-secondary" onclick={handleClose}> Abbrechen </button>
			<button type="button" class="tt-button-primary" onclick={handleSave}> Übernehmen </button>
		</div>
	</div>
</Modal>

<!-- Start Date Picker Dialog -->
{#if showStartPicker}
	<DayPicker
		currentDate={startDateObj}
		timeEntries={$timeEntries}
		onselect={handleStartSelect}
		onclose={() => (showStartPicker = false)}
	/>
{/if}

<!-- End Date Picker Dialog -->
{#if showEndPicker}
	<DayPicker
		currentDate={endDateObj}
		timeEntries={$timeEntries}
		onselect={handleEndSelect}
		onclose={() => (showEndPicker = false)}
	/>
{/if}

<style>
	.range-selector {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-24);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.section-title {
		margin: 0;
		font-size: var(--tt-font-size-body);
		font-weight: 600;
		color: var(--tt-text-muted);
	}

	.quick-btns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--tt-space-8);
	}

	.quick-btn {
		padding: 0.75rem 1rem;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-button);
		background: var(--tt-background-card);
		color: var(--tt-text-primary);
		font-size: var(--tt-font-size-body);
		cursor: pointer;
		text-align: center;
	}

	.date-fields {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-12);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
	}

	.field-label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.error {
		margin: 0;
		padding: var(--tt-space-8);
		background: var(--tt-status-danger-800);
		border: 1px solid var(--tt-status-danger-500);
		border-radius: var(--tt-radius-input);
		color: var(--tt-status-danger-500);
		font-size: var(--tt-font-size-body);
	}

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--tt-border-default);
	}
</style>
