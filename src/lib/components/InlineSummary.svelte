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

<div class="inline-summary">
	<span class="summary-item">
		<span class="label">Ist:</span>
		<span class="value">{formatHours(ist)}</span>
	</span>
	<span class="summary-item">
		<span class="label">Soll:</span>
		<span class="value">{formatHours(soll)}</span>
	</span>
	<span class="summary-item">
		<span class="label">Haben:</span>
		<span class="value" class:positive={saldo > 0} class:negative={saldo < 0}>
			{formatHours(saldo, true)}
		</span>
	</span>
</div>

<style>
	.inline-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background-color: var(--summary-bg);
		border-radius: var(--r-card);
		font-size: 0.9rem;
		border: 1px solid var(--border);
	}

	.summary-item {
		display: flex;
		gap: 0.25rem;
		align-items: baseline;
	}

	.label {
		color: var(--summary-label);
		font-weight: 500;
	}

	.value {
		font-weight: 600;
		color: var(--summary-value);
	}

	.value.positive {
		color: var(--pos);
	}

	.value.negative {
		color: var(--neg);
	}

	@media (max-width: 360px) {
		.inline-summary {
			flex-direction: column;
			gap: 0.5rem;
		}

		.summary-item {
			justify-content: space-between;
			width: 100%;
		}
	}
</style>
