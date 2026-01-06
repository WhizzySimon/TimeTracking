<!--
  ReviewFilters.svelte
  
  Filter controls for import review:
  - Show only uncertain toggle
  - Confidence threshold slider
  
  Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 6 (Screen C)
-->
<script lang="ts">
	interface Props {
		showOnlyUncertain: boolean;
		confidenceThreshold: number;
		onshowuncertainchange?: (value: boolean) => void;
		onthresholdchange?: (value: number) => void;
	}

	let { showOnlyUncertain, confidenceThreshold, onshowuncertainchange, onthresholdchange }: Props =
		$props();

	function handleToggle() {
		onshowuncertainchange?.(!showOnlyUncertain);
	}

	function handleSlider(e: Event) {
		const input = e.target as HTMLInputElement;
		onthresholdchange?.(parseFloat(input.value));
	}
</script>

<div class="review-filters">
	<label class="filter-toggle">
		<input type="checkbox" checked={showOnlyUncertain} onchange={handleToggle} />
		<span>Nur unsichere anzeigen</span>
	</label>

	<div class="confidence-slider">
		<label for="confidence">Schwelle: {(confidenceThreshold * 100).toFixed(0)}%</label>
		<input
			type="range"
			id="confidence"
			min="0.5"
			max="1.0"
			step="0.05"
			value={confidenceThreshold}
			oninput={handleSlider}
		/>
	</div>
</div>

<style>
	.review-filters {
		display: flex;
		align-items: center;
		gap: var(--tt-space-24);
		padding: 0.75rem 1rem;
		background: var(--tt-background-card-hover);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		flex-wrap: wrap;
	}

	.filter-toggle {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-primary);
		cursor: pointer;
	}

	.filter-toggle input {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
	}

	.confidence-slider {
		display: flex;
		align-items: center;
		gap: var(--tt-space-12);
	}

	.confidence-slider label {
		font-size: var(--tt-font-size-small);
		color: var(--tt-text-secondary);
		white-space: nowrap;
	}

	.confidence-slider input[type='range'] {
		width: 120px;
		height: 6px;
		-webkit-appearance: none;
		appearance: none;
		background: var(--tt-background-card-pressed);
		border-radius: 3px;
		cursor: pointer;
	}

	.confidence-slider input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		background: var(--tt-brand-primary-500);
		border-radius: 50%;
		cursor: pointer;
	}

	.confidence-slider input[type='range']::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background: var(--tt-brand-primary-500);
		border-radius: 50%;
		cursor: pointer;
		border: none;
	}
</style>
