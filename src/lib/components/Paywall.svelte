<!--
  Paywall.svelte
  
  Reusable paywall for Pro features (Cloud Backup, Export, Import).
  Shows all available plans with contextual messaging.
  Spec refs: SP-FR-060 to SP-FR-064
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import PlanGrid from './PlanGrid.svelte';

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

	function handlePlanSelect() {
		if (onclose) {
			onclose();
		}
		dispatch('close');
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
	{#if isModal}
		<button
			class="tt-symbol-button close-btn-pos"
			onclick={handleContinueFree}
			aria-label="Schließen"
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	{/if}
	<div class="paywall-header">
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
	</div>

	<PlanGrid onselect={handlePlanSelect} showCurrentBadge={false} />

	<div class="actions">
		<button class="btn-secondary" onclick={handleContinueFree}>Weiter mit Free</button>
	</div>

	<p class="free-note">Alle anderen Funktionen bleiben kostenlos verfügbar.</p>
{/snippet}

<style>
	.paywall {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 2rem 1rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.paywall-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		margin-bottom: 2rem;
	}

	.paywall-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		color: var(--accent);
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

	.actions {
		display: flex;
		justify-content: center;
		margin-top: 1.5rem;
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
		margin-top: 1rem;
		font-size: 0.85rem;
		color: var(--muted);
		text-align: center;
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
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
		position: relative;
	}

	.close-btn-pos {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 1;
	}
</style>
