<!--
  PlanSelector.svelte
  
  Modal for comparing Free vs Pro plans.
  Spec refs: P10-FR-019 to P10-FR-024
-->
<script lang="ts">
	import Modal from './Modal.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { userPlan } from '$lib/stores/user';
	import type { UserPlan } from '$lib/types';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let currentPlan: UserPlan = $derived($userPlan);
	let showUpgradeDialog = $state(false);

	function handleUpgrade() {
		showUpgradeDialog = true;
	}
</script>

<Modal title="Plan auswählen" {onclose}>
	<div class="plan-selector">
		<div class="plans">
			<!-- Free Plan -->
			<div class="plan-card" class:current={currentPlan === 'free'}>
				<div class="plan-header">
					<h3 class="plan-name">Free</h3>
					<span class="plan-price">Kostenlos</span>
				</div>
				<ul class="plan-features">
					<li><span class="check">✓</span> Tag-Ansicht</li>
					<li><span class="check">✓</span> Wochen-Ansicht</li>
					<li><span class="check">✓</span> Unbegrenzte Historie</li>
					<li><span class="check">✓</span> Cloud-Backup</li>
				</ul>
				{#if currentPlan === 'free'}
					<div class="current-badge">Aktueller Plan</div>
				{/if}
			</div>

			<!-- Pro Plan -->
			<div class="plan-card pro" class:current={currentPlan === 'pro'}>
				<div class="plan-header">
					<h3 class="plan-name">Pro</h3>
					<span class="plan-price">10 € / Monat</span>
				</div>
				<ul class="plan-features">
					<li><span class="check">✓</span> Alles aus Free</li>
					<li><span class="check highlight">✓</span> Monats-Übersicht</li>
					<li><span class="check highlight">✓</span> Auswertungen</li>
					<li><span class="check highlight">✓</span> Tätigkeiten-Analyse</li>
				</ul>
				{#if currentPlan === 'pro'}
					<div class="current-badge">Aktueller Plan</div>
				{:else}
					<button class="upgrade-btn" onclick={handleUpgrade} data-testid="upgrade-to-pro-btn">
						Pro freischalten
					</button>
				{/if}
			</div>
		</div>
	</div>
</Modal>

{#if showUpgradeDialog}
	<ConfirmDialog
		type="alert"
		title="Pro-Version"
		message="Die Pro-Version kommt bald! Aktuell kannst du alle Funktionen kostenlos testen."
		confirmLabel="OK"
		onconfirm={() => (showUpgradeDialog = false)}
	/>
{/if}

<style>
	.plan-selector {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.plans {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	@media (max-width: 420px) {
		.plans {
			grid-template-columns: 1fr;
		}
	}

	.plan-card {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		border: 2px solid var(--border);
		border-radius: var(--r-card);
		background: var(--surface);
		position: relative;
	}

	.plan-card.current {
		border-color: var(--accent);
		background: var(--accent-light);
	}

	.plan-card.pro {
		border-color: var(--accent);
	}

	.plan-header {
		text-align: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.plan-name {
		margin: 0 0 0.25rem 0;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--text);
	}

	.plan-price {
		font-size: 0.9rem;
		color: var(--muted);
		font-weight: 500;
	}

	.plan-card.pro .plan-price {
		color: var(--accent);
		font-weight: 600;
	}

	.plan-features {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
		flex: 1;
	}

	.plan-features li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0;
		font-size: 0.85rem;
		color: var(--text);
	}

	.check {
		color: var(--pos);
		font-weight: bold;
		flex-shrink: 0;
	}

	.check.highlight {
		color: var(--accent);
	}

	.current-badge {
		text-align: center;
		padding: 0.5rem;
		background: var(--accent);
		color: white;
		border-radius: var(--r-btn);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.upgrade-btn {
		width: 100%;
		padding: 0.625rem 1rem;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: var(--r-btn);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.upgrade-btn:hover {
		background: var(--accent-dark);
	}
</style>
