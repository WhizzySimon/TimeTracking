<script lang="ts">
	import type { Employer } from '$lib/types';

	interface Props {
		employers: Employer[];
		value: string | null;
		onchange: (employerId: string | null) => void;
		compact?: boolean;
	}

	let { employers, value, onchange, compact = false }: Props = $props();

	let isOpen = $state(false);
	let dropdownElement: HTMLDivElement | null = $state(null);

	let activeEmployers = $derived(employers.filter((emp) => emp.isActive));

	let selectedEmployer = $derived(value ? activeEmployers.find((emp) => emp.id === value) : null);

	let displayText = $derived(selectedEmployer?.name ?? 'Alle Arbeitgeber');

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	function selectEmployer(employerId: string | null) {
		onchange(employerId);
		isOpen = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeyDown);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<div class="employer-selector" class:compact bind:this={dropdownElement}>
	<button
		type="button"
		class="selector-button tt-interactive"
		onclick={toggleDropdown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<span class="selected-text">{displayText}</span>
		<svg
			class="chevron"
			class:open={isOpen}
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M3 4.5L6 7.5L9 4.5"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
	{#if isOpen}
		<div class="dropdown" role="listbox">
			{#if value !== null}
				<button
					type="button"
					class="option tt-interactive"
					onclick={() => selectEmployer(null)}
					role="option"
					aria-selected={false}
				>
					Alle Arbeitgeber
				</button>
			{/if}
			{#each activeEmployers as employer (employer.id)}
				{#if employer.id !== value}
					<button
						type="button"
						class="option tt-interactive"
						onclick={() => selectEmployer(employer.id)}
						role="option"
						aria-selected={false}
					>
						{employer.name}
					</button>
				{/if}
			{/each}
			{#if activeEmployers.length === 0 && value !== null}
				<div class="no-employers">Keine Arbeitgeber vorhanden</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.employer-selector {
		position: relative;
		display: inline-block;
	}

	.selector-button {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		padding: 0.5rem 0.75rem;
		border: none;
		border-radius: var(--tt-radius-input);
		background: var(--tt-brand-accent-300);
		color: var(--tt-brand-primary-700);
		font-size: var(--tt-font-size-body);
		font-weight: var(--tt-font-weight-normal);
		cursor: pointer;
		transition:
			background 0.15s ease,
			box-shadow 0.15s ease;
		min-width: 160px;
	}

	.compact .selector-button {
		padding: 0.375rem 0.5rem;
		font-size: var(--tt-font-size-small);
		min-width: 120px;
	}

	.selector-button:focus {
		outline: none;
		box-shadow: 0 0 0 2px var(--tt-brand-accent-600);
	}

	.selected-text {
		flex: 1;
		text-align: left;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chevron {
		flex-shrink: 0;
		transition: transform 0.15s ease;
		color: var(--tt-brand-primary-700);
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		min-width: 100%;
		max-height: 240px;
		overflow-y: auto;
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-input);
		box-shadow: var(--tt-shadow-modal);
		z-index: 200;
		margin-top: 4px;
	}

	.option {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		text-align: left;
		border: none;
		background: none;
		color: var(--tt-text-primary);
		cursor: pointer;
		font-size: var(--tt-font-size-body);
	}

	.compact .option {
		padding: 0.375rem 0.5rem;
		font-size: var(--tt-font-size-small);
	}

	.no-employers {
		padding: var(--tt-space-12);
		color: var(--tt-text-muted);
		text-align: center;
		font-size: var(--tt-font-size-small);
	}
</style>
