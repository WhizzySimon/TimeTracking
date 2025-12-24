<!--
  Paywall.svelte
  
  Displays paywall for Pro features (Monat, Auswertung).
  Spec refs: P10-FR-007 to P10-FR-014
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	interface Props {
		onupgrade?: () => void;
	}

	let { onupgrade }: Props = $props();

	function handleContinueFree() {
		goto(resolve('/day'));
	}

	function handleUpgrade() {
		if (onupgrade) {
			onupgrade();
		}
	}
</script>

<div class="paywall">
	<div class="paywall-icon">🔒</div>
	<h2 class="paywall-title">Pro-Funktionen</h2>
	<p class="paywall-subtitle">Monatsübersicht und Auswertungen sind in Pro enthalten.</p>

	<ul class="feature-list">
		<li>
			<span class="check">✓</span>
			Monat: Überblick über Wochen und Summen
		</li>
		<li>
			<span class="check">✓</span>
			Auswertung: Zeiträume vergleichen und Schwerpunkte erkennen
		</li>
		<li>
			<span class="check">✓</span>
			Tätigkeiten: Verteilung nach Kategorien über längere Zeit
		</li>
	</ul>

	<div class="price">
		<span class="amount">10 € / Monat</span>
		<span class="note">jederzeit kündbar</span>
	</div>

	<div class="actions">
		<button class="btn-primary" onclick={handleUpgrade}> Pro freischalten </button>
		<button class="btn-secondary" onclick={handleContinueFree}> Weiter mit Free </button>
	</div>

	<p class="free-note">Tag- und Wochenansicht bleiben kostenlos verfügbar.</p>
</div>

<style>
	.paywall {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem 1rem;
		max-width: 400px;
		margin: 0 auto;
	}

	.paywall-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.paywall-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--text);
	}

	.paywall-subtitle {
		font-size: 1rem;
		color: var(--muted);
		margin: 0 0 1.5rem 0;
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem 0;
		text-align: left;
		width: 100%;
	}

	.feature-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.5rem 0;
		color: var(--text);
		font-size: 0.95rem;
	}

	.check {
		color: var(--pos);
		font-weight: bold;
		flex-shrink: 0;
	}

	.price {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.amount {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text);
	}

	.note {
		font-size: 0.85rem;
		color: var(--muted);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
		max-width: 280px;
	}

	.btn-primary {
		padding: 0.875rem 1.5rem;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: var(--r-btn);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.btn-primary:hover {
		background: var(--accent-dark);
	}

	.btn-secondary {
		padding: 0.875rem 1.5rem;
		background: transparent;
		color: var(--muted);
		border: 1px solid var(--border);
		border-radius: var(--r-btn);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.btn-secondary:hover {
		background: var(--surface-hover);
		border-color: var(--border);
	}

	.free-note {
		margin-top: 1.5rem;
		font-size: 0.85rem;
		color: var(--muted);
	}
</style>
