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

	let {
		options,
		value,
		onchange,
		disabled = false,
		placeholder = 'Auswählen...'
	}: Props = $props();

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
		class="dropdown-button tt-interactive-card"
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
				{#if option.value !== value}
					<button
						type="button"
						class="dropdown-option"
						onclick={() => selectOption(option.value)}
						role="option"
						aria-selected={false}
					>
						{option.label}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.custom-dropdown {
		position: relative;
		width: fit-content;
		min-width: fit-content;
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
		width: 100%;
		min-width: fit-content;
		padding: var(--tt-space-8) var(--tt-space-12);
		border: var(--tt-border-touchable-width) solid var(--tt-border-touchable-color);
		border-radius: var(--tt-radius-button);
		color: var(--tt-text-primary);
		font-size: var(--tt-font-size-normal);
		cursor: pointer;
		transition:
			background var(--tt-transition-fast),
			border-color var(--tt-transition-fast);
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
		right: 0;
		width: 100%;
		max-height: 240px;
		overflow-y: auto;
		overflow-x: hidden;
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-button);
		box-shadow: var(--tt-shadow-dropdown);
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
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition:
			background var(--tt-transition-fast),
			color var(--tt-transition-fast);
	}

	@media (hover: hover) {
		.dropdown-option:hover {
			background: var(--tt-dropdown-option-hover-bg);
			color: var(--tt-dropdown-option-hover-text);
		}
	}

	.dropdown-option:active {
		background: var(--tt-dropdown-option-pressed-bg);
		color: var(--tt-dropdown-option-pressed-text);
	}
</style>
