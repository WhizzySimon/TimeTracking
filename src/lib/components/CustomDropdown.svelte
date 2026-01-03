<!--
  CustomDropdown component - reusable custom dropdown with full styling control
  
  Features:
  - Consistent styling across all dropdowns
  - Full control over hover and pressed states
  - Chevron icon always visible
  - Proper accessibility with ARIA attributes
  - Options with hover (blue bg, white text) and pressed states
  
  Usage:
  <CustomDropdown
    options={[{ value: 'a', label: 'Option A' }, ...]}
    value={selectedValue}
    onchange={(value) => handleChange(value)}
    disabled={false}
  />
-->
<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value: string;
		onchange: (value: string) => void;
		disabled?: boolean;
		placeholder?: string;
	}

	let { options, value, onchange, disabled = false, placeholder = 'Auswählen...' }: Props = $props();

	let isOpen = $state(false);
	let dropdownElement: HTMLDivElement | null = $state(null);

	let selectedOption = $derived(options.find((opt) => opt.value === value));
	let displayText = $derived(selectedOption?.label ?? placeholder);

	function toggleDropdown() {
		if (!disabled) {
			isOpen = !isOpen;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	function selectOption(optionValue: string) {
		onchange(optionValue);
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

<div class="custom-dropdown" class:disabled bind:this={dropdownElement}>
	<button
		type="button"
		class="dropdown-button"
		onclick={toggleDropdown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		{disabled}
	>
		<span class="selected-text">{displayText}</span>
		<svg
			class="chevron"
			class:open={isOpen}
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>
	{#if isOpen}
		<div class="dropdown-menu" role="listbox">
			{#each options as option (option.value)}
				<button
					type="button"
					class="dropdown-option"
					class:selected={option.value === value}
					onclick={() => selectOption(option.value)}
					role="option"
					aria-selected={option.value === value}
				>
					{option.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.custom-dropdown {
		position: relative;
		display: inline-block;
	}

	.custom-dropdown.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.dropdown-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--tt-space-8);
		padding: var(--tt-space-8) var(--tt-space-12);
		min-width: 140px;
		border: var(--tt-border-touchable-width) solid var(--tt-border-touchable-color);
		border-radius: var(--tt-radius-button);
		background: var(--tt-background-card);
		color: var(--tt-text-primary);
		font-size: var(--tt-font-size-normal);
		cursor: pointer;
		transition: background var(--tt-transition-fast), border-color var(--tt-transition-fast);
	}

	@media (hover: hover) {
		.dropdown-button:hover:not(:disabled) {
			background: var(--tt-background-card-hover);
		}
	}

	.dropdown-button:active:not(:disabled) {
		background: var(--tt-background-card-pressed);
	}

	.dropdown-button:focus {
		outline: none;
		border-color: var(--tt-brand-primary-500);
		box-shadow: 0 0 0 2px var(--tt-brand-primary-800);
	}

	.dropdown-button:disabled {
		cursor: not-allowed;
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
		transition: transform var(--tt-transition-fast);
		color: var(--tt-text-muted);
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		min-width: 100%;
		width: max-content;
		max-height: 240px;
		overflow-y: auto;
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-button);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 200;
		margin-top: 4px;
	}

	.dropdown-option {
		display: block;
		width: 100%;
		padding: var(--tt-space-8) var(--tt-space-12);
		text-align: left;
		border: none;
		background: none;
		color: var(--tt-text-primary);
		cursor: pointer;
		font-size: var(--tt-font-size-normal);
		transition: background var(--tt-transition-fast), color var(--tt-transition-fast);
	}

	@media (hover: hover) {
		.dropdown-option:hover {
			background: var(--tt-brand-primary-500);
			color: white;
		}
	}

	.dropdown-option:active {
		background: var(--tt-brand-primary-600, #1e1f8a);
		color: white;
	}

	.dropdown-option.selected {
		background: var(--tt-brand-primary-800);
		color: var(--tt-brand-primary-500);
	}

	@media (hover: hover) {
		.dropdown-option.selected:hover {
			background: var(--tt-brand-primary-500);
			color: white;
		}
	}

	.dropdown-option.selected:active {
		background: var(--tt-brand-primary-600, #1e1f8a);
		color: white;
	}
</style>
