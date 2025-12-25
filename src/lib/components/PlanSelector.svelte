<!--
  PlanSelector Modal - Shows Free vs Pro plan comparison
  
  Features:
  - Free vs Pro feature comparison
  - Current plan highlighted
  - Pro unlock button (placeholder for payment)
-->
<script lang="ts">
	import Modal from './Modal.svelte';
	import { userPlan } from '$lib/stores/user';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	function handleUpgrade() {
		alert('Kommt bald');
	}
</script>

<Modal title="Plan wählen" {onclose}>
	<div class="plan-selector" data-testid="plan-selector-modal">
		<div class="plans">
			<!-- Free Plan -->
			<div class="plan-card" class:current={$userPlan === 'free'} data-testid="plan-free">
				<div class="plan-header">
					<h3>Free</h3>
					<div class="plan-price">0 €</div>
				</div>
				<ul class="plan-features">
					<li class="included">Tag-Ansicht</li>
					<li class="included">Wochen-Ansicht</li>
					<li class="included">Unbegrenzte Historie</li>
					<li class="included">Cloud-Backup</li>
					<li class="excluded">Monats-Ansicht</li>
					<li class="excluded">Auswertungen</li>
				</ul>
				{#if $userPlan === 'free'}
					<div class="current-badge">Aktueller Plan</div>
				{/if}
			</div>

			<!-- Pro Plan -->
			<div class="plan-card pro" class:current={$userPlan === 'pro'} data-testid="plan-pro">
				<div class="plan-header">
					<h3>Pro</h3>
					<div class="plan-price">10 € <span class="period">/ Monat</span></div>
				</div>
				<ul class="plan-features">
					<li class="included">Tag-Ansicht</li>
					<li class="included">Wochen-Ansicht</li>
					<li class="included">Unbegrenzte Historie</li>
					<li class="included">Cloud-Backup</li>
					<li class="included highlight">Monats-Ansicht</li>
					<li class="included highlight">Auswertungen</li>
				</ul>
				{#if $userPlan === 'pro'}
					<div class="current-badge">Aktueller Plan</div>
				{:else}
					<button class="upgrade-btn" onclick={handleUpgrade} data-testid="upgrade-btn">
						Pro freischalten
					</button>
				{/if}
			</div>
		</div>
	</div>
</Modal>

<style>
	.plan-selector {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.plans {
		display: flex;
		gap: 1rem;
	}

	.plan-card {
		flex: 1;
		padding: 1rem;
		background: var(--card-bg);
		border: 2px solid var(--card-border);
		border-radius: var(--r-card);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.plan-card.current {
		border-color: var(--accent);
	}

	.plan-card.pro {
		background: linear-gradient(135deg, var(--card-bg) 0%, var(--accent-light) 100%);
	}

	.plan-header {
		text-align: center;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.plan-header h3 {
		margin: 0 0 0.25rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text);
	}

	.plan-price {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--accent);
	}

	.plan-price .period {
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--muted);
	}

	.plan-features {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.plan-features li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: var(--text);
	}

	.plan-features li::before {
		content: '';
		width: 16px;
		height: 16px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.plan-features li.included::before {
		background: var(--pos);
		content: '';
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E");
		background-size: 12px;
		background-repeat: no-repeat;
		background-position: center;
	}

	.plan-features li.excluded::before {
		background: var(--muted);
		content: '';
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E");
		background-size: 10px;
		background-repeat: no-repeat;
		background-position: center;
	}

	.plan-features li.excluded {
		color: var(--muted);
	}

	.plan-features li.highlight {
		font-weight: 500;
		color: var(--accent);
	}

	.current-badge {
		text-align: center;
		padding: 0.5rem;
		background: var(--accent);
		color: white;
		border-radius: var(--r-btn);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.upgrade-btn {
		width: 100%;
		padding: 0.75rem;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: var(--r-btn);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.upgrade-btn:hover {
		background: var(--accent-hover);
	}

	@media (max-width: 480px) {
		.plans {
			flex-direction: column;
		}
	}
</style>
