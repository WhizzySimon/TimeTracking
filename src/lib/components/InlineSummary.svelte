<!--
  InlineSummary component - displays Ist/Soll/Saldo in a single line
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.3 (Day tab inline summary)
  - ui-logic-spec-v1.md Section 4.2 (Week tab inline summary)
  
  Format: "Ist: X,X    Soll: X,X    Saldo: ±X,X"
-->
<script lang="ts">
	import { formatHours } from '$lib/utils/calculations';

	interface Props {
		ist: number;
		soll: number;
		saldo: number;
	}

	let { ist, soll, saldo }: Props = $props();
</script>

<div class="tt-summary-display">
	<span class="summary-label">Zusammenfassung</span>
	<span class="tt-summary-display__item">
		<span class="tt-summary-display__label">Ist:</span>
		<span class="tt-summary-display__value">{formatHours(ist)}</span>
	</span>
	<span class="tt-summary-display__item">
		<span class="tt-summary-display__label">Soll:</span>
		<span class="tt-summary-display__value">{formatHours(soll)}</span>
	</span>
	<span class="tt-summary-display__item">
		<span class="tt-summary-display__label">Haben:</span>
		<span
			class="tt-summary-display__value"
			class:tt-summary-display__value-positive={saldo > 0}
			class:tt-summary-display__value-negative={saldo < 0}
		>
			{formatHours(saldo, true)}
		</span>
	</span>
</div>

<style>
	.summary-label {
		color: var(--tt-text-secondary);
		font-size: var(--tt-font-size-small);
		font-weight: var(--tt-font-weight-medium);
		white-space: nowrap;
		margin-right: auto;
	}

	/* Layout override for narrow screens */
	@media (max-width: 360px) {
		.tt-summary-display {
			flex-direction: column;
			gap: var(--tt-space-8);
		}

		.tt-summary-display__item {
			justify-content: space-between;
			width: 100%;
		}
	}
</style>
