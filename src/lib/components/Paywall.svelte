<!--
  Paywall.svelte
  
  Reusable paywall for Pro features (Cloud Backup, Export, Import).
  Spec refs: SP-FR-060 to SP-FR-064
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type PaywallFeature = 'backup' | 'export' | 'import' | 'general';

	interface Props {
		feature?: PaywallFeature;
		isModal?: boolean;
		onclose?: () => void;
	}

	let { feature = 'general', isModal = true, onclose }: Props = $props();

	const dispatch = createEventDispatcher<{ close: void }>();

	const featureConfig: Record<PaywallFeature, { title: string; subtitle: string }> = {
		backup: {
			title: 'Cloud-Backup',
			subtitle: 'Sichere deine Daten in der Cloud mit Pro.'
		},
		export: {
			title: 'Daten exportieren',
			subtitle: 'Exportiere deine Daten als CSV, JSON oder PDF mit Pro.'
		},
		import: {
			title: 'Daten importieren',
			subtitle: 'Importiere Daten aus Backups oder Excel mit Pro.'
		},
		general: {
			title: 'Pro-Funktionen',
			subtitle: 'Cloud-Backup, Import und Export sind in Pro enthalten.'
		}
	};

	const config = $derived(featureConfig[feature]);

	function handleContinueFree() {
		if (onclose) {
			onclose();
		}
		dispatch('close');
	}

	function handleUpgrade() {
		alert('Kommt bald! Pro-Abonnement wird in Kürze verfügbar sein.');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget && isModal) {
			handleContinueFree();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isModal) {
			handleContinueFree();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isModal}
	<div
		class="paywall-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="paywall-modal">
			{@render paywallContent()}
		</div>
	</div>
{:else}
	<div class="paywall">
		{@render paywallContent()}
	</div>
{/if}

{#snippet paywallContent()}
	<div class="paywall-icon">
		<svg
			width="48"
			height="48"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
			<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
		</svg>
	</div>
	<h2 class="paywall-title">{config.title}</h2>
	<p class="paywall-subtitle">{config.subtitle}</p>

	<ul class="feature-list">
		<li>
			<span class="check">✓</span>
			Cloud-Backup: Daten sicher in der Cloud speichern
		</li>
		<li>
			<span class="check">✓</span>
			Export: CSV, JSON, PDF für Buchhaltung
		</li>
		<li>
			<span class="check">✓</span>
			Import: Daten aus Backup oder Excel wiederherstellen
		</li>
	</ul>

	<div class="price">
		<span class="amount">10 € / Monat</span>
		<span class="note">jederzeit kündbar</span>
	</div>

	<div class="actions">
		<button class="btn-primary" onclick={handleUpgrade}>Pro freischalten</button>
		<button class="btn-secondary" onclick={handleContinueFree}>Weiter mit Free</button>
	</div>

	<p class="free-note">Alle anderen Funktionen bleiben kostenlos verfügbar.</p>
{/snippet}

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

	.paywall-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.paywall-modal {
		background: var(--surface);
		border-radius: var(--r-card);
		padding: 2rem 1.5rem;
		max-width: 400px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
	}

	.paywall-icon {
		color: var(--accent);
	}
</style>
