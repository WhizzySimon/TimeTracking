<!--
  AnalogTimePicker component - Material Design-style analog clock time picker
  
  Features:
  - Click to select hours (0-23), then auto-switch to minutes
  - Touch and mouse support
  - Smooth animations
  - Material Design 3 styling
-->
<script lang="ts">
	import Modal from './Modal.svelte';

	interface Props {
		value: string; // Format: "HH:mm"
		onchange: (value: string) => void;
		onclose: () => void;
		label?: string;
	}

	let { value, onchange, onclose, label = 'Zeit wählen' }: Props = $props();

	type Mode = 'hours' | 'minutes';
	let mode = $state<Mode>('hours');

	// Parse initial value
	function parseTime(timeStr: string): { hour: number; minute: number } {
		if (!timeStr) return { hour: 0, minute: 0 };
		const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
		if (!match) return { hour: 0, minute: 0 };
		return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
	}

	const initialTime = parseTime(value);
	let selectedHour = $state(initialTime.hour);
	let selectedMinute = $state(initialTime.minute);

	// Clock dimensions
	const clockRadius = 120;
	const centerX = 140;
	const centerY = 140;
	const outerNumberRadius = 100; // For 12-23 in hour mode, or all minutes
	const innerNumberRadius = 65; // For 0-11 in hour mode

	// Calculate position for clock numbers
	function getNumberPosition(index: number, total: number, radius: number) {
		const angle = (index * 360) / total - 90; // Start at top (12 o'clock)
		const rad = (angle * Math.PI) / 180;
		return {
			x: centerX + radius * Math.cos(rad),
			y: centerY + radius * Math.sin(rad)
		};
	}

	// Calculate angle from center for a point
	function getAngleFromPoint(x: number, y: number): number {
		const dx = x - centerX;
		const dy = y - centerY;
		let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
		if (angle < 0) angle += 360;
		return angle;
	}

	// Handle click/touch on clock face
	function handleClockClick(event: MouseEvent | TouchEvent) {
		const svg = (event.currentTarget as SVGElement).getBoundingClientRect();
		const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

		const x = ((clientX - svg.left) / svg.width) * 280;
		const y = ((clientY - svg.top) / svg.height) * 280;

		const angle = getAngleFromPoint(x, y);

		if (mode === 'hours') {
			// Determine if click is on inner (0-11) or outer (12-23) circle
			const dx = x - centerX;
			const dy = y - centerY;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const isInner = distance < (innerNumberRadius + outerNumberRadius) / 2;

			// Select hour based on circle and angle
			const hourIn12 = Math.round((angle / 360) * 12) % 12;
			selectedHour = isInner ? hourIn12 : hourIn12 + 12;

			// Auto-switch to minutes after selecting hour
			setTimeout(() => {
				mode = 'minutes';
			}, 300);
		} else {
			// Select minute (0-55 in 5-minute steps)
			const minuteValue = Math.round((angle / 360) * 12) * 5;
			selectedMinute = minuteValue % 60;
		}
	}

	// Confirm selection
	function handleConfirm() {
		const hourStr = String(selectedHour).padStart(2, '0');
		const minuteStr = String(selectedMinute).padStart(2, '0');
		onchange(`${hourStr}:${minuteStr}`);
		onclose();
	}

	// Get hand rotation angle
	let handAngle = $derived(() => {
		if (mode === 'hours') {
			return ((selectedHour % 12) / 12) * 360;
		} else {
			return (selectedMinute / 60) * 360;
		}
	});

	// Get hand end position
	let handPosition = $derived(() => {
		const angle = handAngle() - 90;
		const rad = (angle * Math.PI) / 180;
		// For hours: use inner radius for 0-11, outer for 12-23
		let radius: number;
		if (mode === 'hours') {
			radius = selectedHour < 12 ? innerNumberRadius : outerNumberRadius;
		} else {
			radius = outerNumberRadius;
		}
		return {
			x: centerX + radius * Math.cos(rad),
			y: centerY + radius * Math.sin(rad)
		};
	});
</script>

<Modal title={label} {onclose}>
	<div class="time-picker-content">
		<!-- Display selected time -->
		<div class="time-display">
			<button
				class="time-segment"
				class:active={mode === 'hours'}
				onclick={() => (mode = 'hours')}
				type="button"
			>
				{String(selectedHour).padStart(2, '0')}
			</button>
			<span class="separator">:</span>
			<button
				class="time-segment"
				class:active={mode === 'minutes'}
				onclick={() => (mode = 'minutes')}
				type="button"
			>
				{String(selectedMinute).padStart(2, '0')}
			</button>
		</div>

		<!-- Clock face -->
		<div class="clock-container">
			<svg
				viewBox="0 0 280 280"
				class="clock-face"
				onclick={handleClockClick}
				ontouchstart={handleClockClick}
				onkeydown={(e) => e.key === 'Enter' && handleClockClick(e as any)}
				role="button"
				tabindex="0"
				aria-label={mode === 'hours' ? 'Stunde wählen' : 'Minute wählen'}
			>
				<!-- Clock circle background -->
				<circle cx={centerX} cy={centerY} r={clockRadius} class="clock-bg" />

				<!-- Clock hand (drawn before numbers so it appears behind) -->
				<line
					x1={centerX}
					y1={centerY}
					x2={handPosition().x}
					y2={handPosition().y}
					class="clock-hand"
				/>

				<!-- Clock numbers (drawn on top of hand) -->
				{#if mode === 'hours'}
					<!-- Inner circle: 0-11 -->
					{#each Array(12) as _, i}
						{@const pos = getNumberPosition(i, 12, innerNumberRadius)}
						{@const isSelected = i === selectedHour}
						<g>
							<circle cx={pos.x} cy={pos.y} r="16" class="number-bg" class:selected={isSelected} />
							<text
								x={pos.x}
								y={pos.y}
								class="clock-number"
								class:selected={isSelected}
								text-anchor="middle"
								dominant-baseline="middle"
							>
								{i}
							</text>
						</g>
					{/each}
					<!-- Outer circle: 12-23 -->
					{#each Array(12) as _, i}
						{@const hour = i + 12}
						{@const pos = getNumberPosition(i, 12, outerNumberRadius)}
						{@const isSelected = hour === selectedHour}
						<g>
							<circle cx={pos.x} cy={pos.y} r="16" class="number-bg" class:selected={isSelected} />
							<text
								x={pos.x}
								y={pos.y}
								class="clock-number"
								class:selected={isSelected}
								text-anchor="middle"
								dominant-baseline="middle"
							>
								{hour}
							</text>
						</g>
					{/each}
				{:else}
					{#each Array(12) as _, i}
						{@const minute = i * 5}
						{@const pos = getNumberPosition(i, 12, outerNumberRadius)}
						{@const isSelected = minute === selectedMinute}
						<g>
							<circle cx={pos.x} cy={pos.y} r="18" class="number-bg" class:selected={isSelected} />
							<text
								x={pos.x}
								y={pos.y}
								class="clock-number"
								class:selected={isSelected}
								text-anchor="middle"
								dominant-baseline="middle"
							>
								{String(minute).padStart(2, '0')}
							</text>
						</g>
					{/each}
				{/if}

				<!-- Center dot (drawn last, on top of everything) -->
				<circle cx={centerX} cy={centerY} r="6" class="hand-center" />
			</svg>
		</div>

		<!-- Action buttons -->
		<div class="actions">
			<button type="button" class="tt-button-secondary" onclick={onclose}>Abbrechen</button>
			<button type="button" class="tt-button-primary" onclick={handleConfirm}>OK</button>
		</div>
	</div>
</Modal>

<style>
	.time-picker-content {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-24);
		padding: var(--tt-space-8) 0;
	}

	.time-display {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--tt-space-8);
		font-size: 48px;
		font-weight: 500;
		color: var(--tt-text-primary);
	}

	.time-segment {
		background: none;
		border: none;
		color: var(--tt-text-secondary);
		font-size: 48px;
		font-weight: 500;
		padding: var(--tt-space-8);
		border-radius: var(--tt-radius-button);
		cursor: pointer;
		transition: all 0.2s;
		min-width: 80px;
		text-align: center;
	}

	.time-segment:hover {
		background: var(--tt-background-hover);
	}

	.time-segment.active {
		color: var(--tt-brand-primary-500);
		background: var(--tt-brand-primary-800);
	}

	.separator {
		color: var(--tt-text-secondary);
		font-weight: 500;
	}

	.clock-container {
		display: flex;
		justify-content: center;
		padding: var(--tt-space-16) 0;
	}

	.clock-face {
		width: 280px;
		height: 280px;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
	}

	.clock-bg {
		fill: var(--tt-background-card);
		stroke: var(--tt-border-subtle);
		stroke-width: 2;
	}

	.number-bg {
		fill: transparent;
		transition: fill 0.2s;
	}

	.number-bg.selected {
		fill: var(--tt-brand-primary-500);
	}

	.clock-number {
		font-size: 14px;
		font-weight: 500;
		fill: var(--tt-text-primary);
		pointer-events: none;
		transition: fill 0.2s;
	}

	.clock-number.selected {
		fill: white;
		font-weight: 600;
	}

	.clock-hand {
		stroke: var(--tt-brand-primary-500);
		stroke-width: 2;
		stroke-linecap: round;
		transition: all 0.3s ease;
	}

	.hand-center {
		fill: var(--tt-brand-primary-500);
	}

	.actions {
		display: flex;
		gap: var(--tt-space-12);
		justify-content: flex-end;
		padding-top: var(--tt-space-8);
	}
</style>
