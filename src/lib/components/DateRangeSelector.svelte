<!--
  DateRangeSelector component - modal for selecting date range
  
  Spec refs:
  - ui-logic-spec-v1.md Section 5.2 (Zeitraum-Selector)
  
  Features:
  - Schnellwahl: "Aktuelles Jahr" button
  - Manuell: Two date fields (Von, Bis) with DD.MM.YYYY format
  - Validation: Von <= Bis
-->
<script lang="ts">
	import { formatDate, parseDate } from '$lib/utils/date';
	import Modal from './Modal.svelte';

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

	// Local state for editing
	let startInput = $state('');
	let endInput = $state('');
	let error = $state('');

	// Initialize inputs from props
	$effect(() => {
		const start = parseDate(startDate);
		const end = parseDate(endDate);
		if (start) startInput = formatDate(start, 'DE');
		if (end) endInput = formatDate(end, 'DE');
	});

	// Quick select: current year
	function selectCurrentYear() {
		const now = new Date();
		const yearStart = new Date(now.getFullYear(), 0, 1);
		startInput = formatDate(yearStart, 'DE');
		endInput = formatDate(now, 'DE');
		error = '';
	}

	// Quick select: last year
	function selectLastYear() {
		const now = new Date();
		const lastYear = now.getFullYear() - 1;
		const yearStart = new Date(lastYear, 0, 1);
		const yearEnd = new Date(lastYear, 11, 31);
		startInput = formatDate(yearStart, 'DE');
		endInput = formatDate(yearEnd, 'DE');
		error = '';
	}

	// Quick select: current month (1st to today)
	function selectCurrentMonth() {
		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		startInput = formatDate(monthStart, 'DE');
		endInput = formatDate(now, 'DE');
		error = '';
	}

	// Quick select: last month (full month)
	function selectLastMonth() {
		const now = new Date();
		const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
		const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
		startInput = formatDate(lastMonthStart, 'DE');
		endInput = formatDate(lastMonthEnd, 'DE');
		error = '';
	}

	// Validate and save
	function handleSave() {
		const start = parseDate(startInput);
		const end = parseDate(endInput);

		if (!start) {
			error = 'Ungültiges Startdatum (Format: TT.MM.JJJJ)';
			return;
		}

		if (!end) {
			error = 'Ungültiges Enddatum (Format: TT.MM.JJJJ)';
			return;
		}

		if (start > end) {
			error = 'Startdatum muss vor Enddatum liegen';
			return;
		}

		error = '';
		onsave?.(formatDate(start, 'ISO'), formatDate(end, 'ISO'));
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
				<button type="button" class="quick-btn" onclick={selectCurrentYear}>Aktuelles Jahr</button>
				<button type="button" class="quick-btn" onclick={selectLastYear}>Letztes Jahr</button>
				<button type="button" class="quick-btn" onclick={selectCurrentMonth}>Aktueller Monat</button
				>
				<button type="button" class="quick-btn" onclick={selectLastMonth}>Letzter Monat</button>
			</div>
		</div>

		<!-- Manual Input -->
		<div class="section">
			<h3 class="section-title">Manuell</h3>
			<div class="date-fields">
				<div class="field">
					<label for="range-start">Von:</label>
					<input
						type="text"
						id="range-start"
						bind:value={startInput}
						placeholder="TT.MM.JJJJ"
						class="date-input"
					/>
				</div>
				<div class="field">
					<label for="range-end">Bis:</label>
					<input
						type="text"
						id="range-end"
						bind:value={endInput}
						placeholder="TT.MM.JJJJ"
						class="date-input"
					/>
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

	.quick-btn:hover {
		background: var(--tt-background-card-hover);
		border-color: var(--tt-brand-primary-500);
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

	.field label {
		font-size: var(--tt-font-size-body);
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.date-input {
		padding: var(--tt-space-12);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		font-size: var(--tt-font-size-normal);
		background: var(--tt-background-input);
		color: var(--tt-text-primary);
	}

	.date-input:focus {
		outline: none;
		border-color: var(--tt-border-focus);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-800);
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
