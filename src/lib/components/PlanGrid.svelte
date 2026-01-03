<!--
  PlanGrid.svelte
  
  Reusable plan selection grid showing Free, Pro, and Premium plans.
  Used in both PlanComparison dialog and Paywall component.
-->
<script lang="ts">
	import { userPlan, setUserPlanLocal } from '$lib/stores/user';

	interface Props {
		onselect: (planName: string) => void;
		showCurrentBadge?: boolean;
	}

	let { onselect, showCurrentBadge = true }: Props = $props();

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

	function handleSelectPlan(planName: string) {
		setUserPlanLocal(planName.toLowerCase() as 'free' | 'pro');
		onselect(planName);
	}
</script>

<div class="plans-grid">
	{#each plans as plan (plan.name)}
		<div
			class="plan-card"
			class:current={showCurrentBadge && $userPlan === plan.name.toLowerCase()}
			class:coming-soon={plan.comingSoon}
		>
			<div class="plan-header">
				<h3 class="plan-name">{plan.name}</h3>
				{#if showCurrentBadge && $userPlan === plan.name.toLowerCase()}
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
			{#if !plan.comingSoon && $userPlan !== plan.name.toLowerCase()}
				<button class="select-plan-btn" onclick={() => handleSelectPlan(plan.name)}>
					{plan.name} wählen
				</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	.plans-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 16px;
	}

	.plan-card {
		padding: 20px;
		border: 1px solid var(--tt-border-default);
		border-radius: 12px;
		background: var(--tt-background-page);
	}

	.plan-card.current {
		border-color: var(--tt-brand-primary);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-faded);
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
		color: var(--tt-text-primary);
	}

	.current-badge {
		font-size: 0.75rem;
		background: var(--tt-brand-primary);
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.coming-soon-badge {
		font-size: 0.75rem;
		background: var(--tt-text-muted);
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.plan-price {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--tt-text-primary);
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
		color: var(--tt-text-primary);
	}

	.features-list li.excluded {
		color: var(--tt-text-muted);
	}

	.feature-icon {
		width: 20px;
		text-align: center;
	}

	.select-plan-btn {
		margin-top: 16px;
		width: 100%;
		padding: 12px;
		background: var(--tt-brand-primary);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
	}

	.select-plan-btn:hover {
		opacity: 0.9;
	}
</style>
