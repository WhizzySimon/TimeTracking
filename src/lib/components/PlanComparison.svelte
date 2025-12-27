<script lang="ts">
	import { userPlan, setUserPlanLocal } from '$lib/stores/user';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	function handleUpgrade() {
		setUserPlanLocal('pro');
		onclose();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onclose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
		}
	}

	const plans = [
		{
			name: 'Free',
			price: '0 €',
			features: [
				{ name: 'Tag, Woche, Monat Ansichten', included: true },
				{ name: 'Auswertung', included: true },
				{ name: 'Lokale Speicherung', included: true },
				{ name: 'Cloud Backup', included: false },
				{ name: 'Export (JSON, CSV, PDF)', included: false },
				{ name: 'Import', included: false },
				{ name: 'AI Import', included: false }
			]
		},
		{
			name: 'Pro',
			price: '4,99 € / Monat',
			features: [
				{ name: 'Tag, Woche, Monat Ansichten', included: true },
				{ name: 'Auswertung', included: true },
				{ name: 'Lokale Speicherung', included: true },
				{ name: 'Cloud Backup', included: true },
				{ name: 'Export (JSON, CSV, PDF)', included: true },
				{ name: 'Import', included: true },
				{ name: 'AI Import', included: false }
			]
		},
		{
			name: 'Premium',
			price: 'Kommt bald',
			comingSoon: true,
			features: [
				{ name: 'Tag, Woche, Monat Ansichten', included: true },
				{ name: 'Auswertung', included: true },
				{ name: 'Lokale Speicherung', included: true },
				{ name: 'Cloud Backup', included: true },
				{ name: 'Export (JSON, CSV, PDF)', included: true },
				{ name: 'Import', included: true },
				{ name: 'AI Import', included: true }
			]
		}
	];
</script>

<div
	class="modal-backdrop"
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<div class="modal">
		<header class="modal-header">
			<h2>Plan wählen</h2>
			<button class="close-btn" onclick={onclose} aria-label="Schließen">×</button>
		</header>

		<div class="modal-body">
			<div class="plans-grid">
				{#each plans as plan (plan.name)}
					<div
						class="plan-card"
						class:current={$userPlan === plan.name.toLowerCase()}
						class:coming-soon={plan.comingSoon}
					>
						<div class="plan-header">
							<h3 class="plan-name">{plan.name}</h3>
							{#if $userPlan === plan.name.toLowerCase()}
								<span class="current-badge">Aktuell</span>
							{/if}
							{#if plan.comingSoon}
								<span class="coming-soon-badge">Kommt bald</span>
							{/if}
						</div>
						<div class="plan-price">{plan.price}</div>
						<ul class="features-list">
							{#each plan.features as feature (feature.name)}
								<li class:included={feature.included} class:excluded={!feature.included}>
									<span class="feature-icon">{feature.included ? '✓' : '—'}</span>
									<span class="feature-name">{feature.name}</span>
								</li>
							{/each}
						</ul>
						{#if plan.name === 'Pro' && $userPlan === 'free'}
							<button class="upgrade-btn" onclick={handleUpgrade}> Pro freischalten </button>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<footer class="modal-footer">
			<button class="close-btn-secondary" onclick={onclose}>Schließen</button>
		</footer>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: var(--card);
		border-radius: 12px;
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--fg);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--muted);
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.close-btn:hover {
		color: var(--fg);
	}

	.modal-body {
		padding: 20px;
	}

	.plans-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 16px;
	}

	.plan-card {
		padding: 20px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--bg);
	}

	.plan-card.current {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-subtle, rgba(var(--accent-rgb), 0.2));
	}

	.plan-card.coming-soon {
		opacity: 0.7;
	}

	.plan-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.plan-name {
		margin: 0;
		font-size: 1.125rem;
		color: var(--fg);
	}

	.current-badge {
		font-size: 0.75rem;
		background: var(--accent);
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.coming-soon-badge {
		font-size: 0.75rem;
		background: var(--muted);
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.plan-price {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--fg);
		margin-bottom: 16px;
	}

	.features-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.features-list li {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
	}

	.features-list li.included {
		color: var(--fg);
	}

	.features-list li.excluded {
		color: var(--muted);
	}

	.feature-icon {
		width: 20px;
		text-align: center;
	}

	.upgrade-btn {
		margin-top: 16px;
		width: 100%;
		padding: 12px;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
	}

	.upgrade-btn:hover {
		opacity: 0.9;
	}

	.modal-footer {
		padding: 16px 20px;
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: flex-end;
	}

	.close-btn-secondary {
		padding: 10px 20px;
		background: transparent;
		color: var(--muted);
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
	}

	.close-btn-secondary:hover {
		border-color: var(--muted);
	}
</style>
