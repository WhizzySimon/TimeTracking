<!--
  StyleGuide - Design System Reference
  
  Route: /dev/styleguide
  
  COMPONENT SYSTEM:
  Classes are applied to HTML elements. Variants modify behavior/appearance.
  Example: <div class="tt-list-row tt-list-row-clickable">
           <div class="tt-list-row-clickable"> (shorthand)
-->
<script lang="ts">
	let selectedTab = $state('week');
	let selectedTab2 = $state('week');
	let selectedEmployer = $state<string | null>(null);
	let selectedEmployerGradient = $state<string | null>(null);

	function selectTab(tab: string) {
		selectedTab = tab;
	}

	function selectTab2(tab: string) {
		selectedTab2 = tab;
	}

	function selectEmployer(id: string | null, event?: Event) {
		selectedEmployer = id;

		// Scroll selected tab to center (clamped to scroll limits)
		if (event) {
			const button = event.currentTarget as HTMLElement;
			const container = button.closest('.title-bar-center') as HTMLElement;
			if (container && button) {
				// Get button's bounding rect relative to the container
				const containerRect = container.getBoundingClientRect();
				const buttonRect = button.getBoundingClientRect();

				// Calculate the button's center position relative to container's center
				const buttonCenter = buttonRect.left + buttonRect.width / 2;
				const containerCenter = containerRect.left + containerRect.width / 2;
				const offset = buttonCenter - containerCenter;

				// Calculate target scroll position
				const targetScroll = container.scrollLeft + offset;

				// Get max scroll (total scrollable width - visible width)
				const maxScroll = container.scrollWidth - container.clientWidth;

				// Clamp scroll position to valid range [0, maxScroll]
				const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

				// Scroll to the clamped position
				container.scrollTo({ left: clampedScroll, behavior: 'smooth' });
			}
		}
	}

	function selectEmployerGradient(id: string | null, event?: Event) {
		selectedEmployerGradient = id;

		// Scroll selected tab to center (clamped to scroll limits)
		if (event) {
			const button = event.currentTarget as HTMLElement;
			const container = button.closest('.title-bar-center-gradient') as HTMLElement;
			if (container && button) {
				// Get button's bounding rect relative to the container
				const containerRect = container.getBoundingClientRect();
				const buttonRect = button.getBoundingClientRect();

				// Calculate the button's center position relative to container's center
				const buttonCenter = buttonRect.left + buttonRect.width / 2;
				const containerCenter = containerRect.left + containerRect.width / 2;
				const offset = buttonCenter - containerCenter;

				// Calculate target scroll position
				const targetScroll = container.scrollLeft + offset;

				// Get max scroll (total scrollable width - visible width)
				const maxScroll = container.scrollWidth - container.clientWidth;

				// Clamp scroll position to valid range [0, maxScroll]
				const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

				// Scroll to the clamped position
				container.scrollTo({ left: clampedScroll, behavior: 'smooth' });
			}
		}
	}

	// Mock employer data for demo
	const mockEmployers = [
		{ id: '1', name: 'Arbeitgeber A' },
		{ id: '2', name: 'Arbeitgeber B' },
		{ id: '3', name: 'Arbeitgeber C' }
	];

	// Mouse drag scrolling for employer tabs
	let isDragging = $state(false);
	let startX = $state(0);
	let scrollLeft = $state(0);

	function handleMouseDown(e: MouseEvent) {
		const container = (e.currentTarget as HTMLElement).querySelector(
			'.title-bar-center'
		) as HTMLElement;
		if (!container) return;
		isDragging = true;
		startX = e.pageX - container.offsetLeft;
		scrollLeft = container.scrollLeft;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		e.preventDefault();
		const container = (e.currentTarget as HTMLElement).querySelector(
			'.title-bar-center'
		) as HTMLElement;
		if (!container) return;
		const x = e.pageX - container.offsetLeft;
		const walk = (x - startX) * 2; // Scroll speed multiplier
		container.scrollLeft = scrollLeft - walk;
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleMouseLeave() {
		isDragging = false;
	}
</script>

<div class="styleguide">
	<header class="styleguide-header">
		<h1>TimeTracker Design System</h1>
	</header>

	<!-- Color schemes -->
	<section class="section">
		<h2>Color schemes</h2>

		<!-- Brand Primary Blue — Full Scale (Responds to Scheme Changes) -->
		<p style="color: var(--tt-text-muted);">
			<strong>Dynamic:</strong> This scale changes when you switch color schemes in Settings → Entwicklung.
			The colors shown below reflect the currently active scheme.
		</p>

		<h3>Brand Primary — Numbered Scale (25-700)</h3>
		<p style="color: var(--tt-text-muted);">
			Numbers represent lightness levels in the Material Design convention. Switch schemes to see
			how these colors adapt.
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-brand-primary-25, #e8f0f8);">
				<span style="color: var(--tt-text-primary);">25</span>
				<code style="color: var(--tt-text-muted);">Page BG</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-50, #dce2f2);">
				<span style="color: var(--tt-text-primary);">50</span>
				<code style="color: var(--tt-text-muted);">Very Light</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-100);">
				<span style="color: var(--tt-text-primary);">100</span>
				<code style="color: var(--tt-text-muted);">Light</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-200);">
				<span style="color: var(--tt-text-primary);">200</span>
				<code style="color: var(--tt-text-muted);">Med-Light</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-300);">
				<span>300</span>
				<code>Medium</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-400);">
				<span>400</span>
				<code>Pressed</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-500);">
				<span>500</span>
				<code>Base</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-600);">
				<span>600</span>
				<code>Darker</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-700);">
				<span>700</span>
				<code>Darkest</code>
			</div>
		</div>

		<h3>Brand Accent (Cyan) — Full Scale</h3>
		<p style="color: var(--tt-text-muted);">
			Currently unused. Potential uses: info states, highlights, accent badges, running task
			indicator?
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-brand-accent-50);">
				<span style="color: var(--tt-text-primary);">50</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-100);">
				<span style="color: var(--tt-text-primary);">100</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-200);">
				<span style="color: var(--tt-text-primary);">200</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-300);">
				<span style="color: var(--tt-text-primary);">Base</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-400);">
				<span>Darker</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-500);">
				<span>Darkest</span>
			</div>
		</div>

		<h3>Semantic States</h3>
		<p style="color: var(--tt-text-muted);">
			Each semantic color has base + pressed + faded variants.
		</p>

		<p style="color: var(--tt-text-muted); margin-top: 1rem;">
			<strong>Danger</strong> — Destructive actions (delete), errors, validation failures
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-status-danger-800);">
				<span style="color: var(--tt-status-danger-500);">Faded</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-danger-300);">
				<span>Pressed</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-danger-500);">
				<span>Base</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-danger-600);">
				<span>Darker</span>
			</div>
		</div>

		<p style="color: var(--tt-text-muted); margin-top: 1rem;">
			<strong>Success</strong> — Positive outcomes, confirmations
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-status-success-800);">
				<span style="color: var(--tt-status-success-500);">Faded</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-success-300);">
				<span>Pressed</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-success-500);">
				<span>Base</span>
			</div>
		</div>

		<p style="color: var(--tt-text-muted); margin-top: 1rem;">
			<strong>Warning</strong> — Caution, attention needed
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-status-warning-50);">
				<span style="color: var(--tt-status-warning-500);">Faded</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-warning-300);">
				<span>Pressed</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-warning-500);">
				<span>Base</span>
			</div>
		</div>

		<p style="color: var(--tt-text-muted); margin-top: 1rem;">
			<strong>Info</strong> — Running tasks, progress, informational highlights (uses brand-accent)
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-status-info-faded);">
				<span style="color: var(--tt-status-info-text);">Faded</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-info);">
				<span style="color: var(--tt-text-primary);">Base</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-info-pressed);">
				<span>Pressed</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-info-text);">
				<span>Text</span>
			</div>
		</div>

		<h3>Backgrounds & Borders</h3>
		<div class="color-grid">
			<div class="color-swatch" style="background: var(--tt-background-page);">
				<span style="color: var(--tt-text-primary);">Page</span>
				<code style="color: var(--tt-text-muted);">#e8f0f8</code>
			</div>
			<div
				class="color-swatch"
				style="background: var(--tt-background-card); border: 1px solid var(--tt-border-default);"
			>
				<span style="color: var(--tt-text-primary);">Card</span>
				<code style="color: var(--tt-text-muted);">#ffffff</code>
			</div>
			<div
				class="color-swatch"
				style="background: var(--tt-background-card-pressed); border: 1px solid var(--tt-border-default);"
			>
				<span style="color: var(--tt-text-primary);">Card Pressed</span>
				<code style="color: var(--tt-text-muted);">#edf2f7</code>
			</div>
			<div class="color-swatch" style="background: var(--tt-border-touchable-color);">
				<span>Touchable Border</span>
				<code>#b8c4d4</code>
			</div>
		</div>
	</section>

	<!-- Component System Explanation -->
	<section class="section">
		<h2>How the CSS Component System Works</h2>
		<div class="explanation-card">
			<h3>Classes + Variants</h3>
			<p>
				Components are built with <strong>base classes</strong> and
				<strong>variant modifiers</strong>:
			</p>
			<pre><code
					>&lt;div class="tt-list-row-clickable"&gt;  &lt;!-- Clickable row --&gt;
&lt;div class="tt-list-row-static"&gt;     &lt;!-- Non-clickable row --&gt;
&lt;span class="tt-inline-label-employer"&gt;  &lt;!-- Employer badge --&gt;</code
				></pre>

			<h3>Naming Convention</h3>
			<p>
				<code>.tt-{'{component}'}-{'{variant}'}</code> — Names describe behavior, not implementation.
			</p>
			<ul>
				<li><code>tt-list-row-clickable</code> — Row that can be tapped/clicked</li>
				<li><code>tt-list-row-static</code> — Row that is read-only</li>
				<li><code>tt-inline-label</code> — Small inline badge that fits its content</li>
			</ul>
		</div>
	</section>

	<!-- Title Bar Gradient Experiment -->
	<section class="section">
		<h2>Title Bar Gradient Experiment</h2>
		<p style="color: var(--tt-text-muted);">
			Gradient from tab's original color (top) to app background color (bottom), opening below the
			tabs.
		</p>

		<div
			class="title-bar-demo-gradient"
			onmousedown={handleMouseDown}
			onmousemove={handleMouseMove}
			onmouseup={handleMouseUp}
			onmouseleave={handleMouseLeave}
		>
			<div class="title-bar-left-gradient">
				<button class="nav-btn-gradient" aria-label="Zurück">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
				<button class="nav-btn-gradient" disabled aria-label="Vorwärts">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
			</div>

			<div class="title-bar-center-gradient">
				<div class="employer-tabs-gradient">
					<button
						class="employer-tab-gradient"
						onclick={(e) => selectEmployerGradient(null, e)}
						aria-current={selectedEmployerGradient === null ? 'page' : undefined}
					>
						Alle Arbeitgeber
					</button>
					{#each mockEmployers as employer}
						<button
							class="employer-tab-gradient"
							onclick={(e) => selectEmployerGradient(employer.id, e)}
							aria-current={selectedEmployerGradient === employer.id ? 'page' : undefined}
						>
							{employer.name}
						</button>
					{/each}
				</div>
			</div>

			<div class="title-bar-right-gradient">
				<button class="icon-btn-gradient" aria-label="Synchronisierung">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<polyline points="23 4 23 10 17 10" stroke-width="2" />
						<polyline points="1 20 1 14 7 14" stroke-width="2" />
						<path
							d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button class="icon-btn-gradient" aria-label="Einstellungen">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<circle cx="12" cy="12" r="3" stroke-width="2" />
						<path
							d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
							stroke-width="2"
						/>
					</svg>
				</button>
			</div>
		</div>

		<div class="explanation-card" style="margin-top: 1rem;">
			<p><strong>Current selection:</strong> {selectedEmployerGradient ?? 'Alle Arbeitgeber'}</p>
			<p>
				The employer tabs have a gradient that opens downward from the tab's color to the app
				background, creating a smooth visual blend below the tabs.
			</p>
		</div>
	</section>

	<!-- Footer Button Gradient Experiment -->
	<section class="section">
		<h2>Footer Button Gradient Experiment</h2>
		<p style="color: var(--tt-text-muted);">
			Gradient from button's original color (bottom) to app background color (top).
		</p>

		<div class="footer-demo-container">
			<div class="footer-demo">
				<button
					class="footer-btn footer-btn--plus"
					onclick={() => selectTab('add')}
					aria-current={selectedTab === 'add' ? 'page' : undefined}
				>
					+
				</button>
				<button
					class="footer-btn footer-btn--day"
					onclick={() => selectTab('day')}
					aria-current={selectedTab === 'day' ? 'page' : undefined}
				>
					Tag
				</button>
				<button
					class="footer-btn footer-btn--week"
					onclick={() => selectTab('week')}
					aria-current={selectedTab === 'week' ? 'page' : undefined}
				>
					Woche
				</button>
				<button
					class="footer-btn footer-btn--month"
					onclick={() => selectTab('month')}
					aria-current={selectedTab === 'month' ? 'page' : undefined}
				>
					Monat
				</button>
				<button
					class="footer-btn footer-btn--analysis"
					onclick={() => selectTab('analysis')}
					aria-current={selectedTab === 'analysis' ? 'page' : undefined}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 3v18h18M7 16l4-4 4 4 6-6" />
					</svg>
				</button>
			</div>
		</div>

		<div class="explanation-card" style="margin-top: 1rem;">
			<p><strong>Current selection:</strong> {selectedTab}</p>
			<p>
				The button now has a gradient from its original color at the bottom to the app background
				color at the top, creating a smooth visual blend.
			</p>
		</div>
	</section>

	<!-- Title Bar Experiment -->
	<section class="section">
		<h2>Title Bar Experiment v1</h2>
		<p style="color: var(--tt-text-muted);">
			Phase 1: Title bar matching current implementation, but with employer selector as tabs instead
			of dropdown.
		</p>

		<div
			class="title-bar-demo"
			onmousedown={handleMouseDown}
			onmousemove={handleMouseMove}
			onmouseup={handleMouseUp}
			onmouseleave={handleMouseLeave}
		>
			<div class="title-bar-left">
				<button class="nav-btn" aria-label="Zurück">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
				<button class="nav-btn" disabled aria-label="Vorwärts">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
			</div>

			<div class="title-bar-center">
				<div class="employer-tabs">
					<button
						class="employer-tab"
						onclick={(e) => selectEmployer(null, e)}
						aria-current={selectedEmployer === null ? 'page' : undefined}
					>
						Alle Arbeitgeber
					</button>
					{#each mockEmployers as employer}
						<button
							class="employer-tab"
							onclick={(e) => selectEmployer(employer.id, e)}
							aria-current={selectedEmployer === employer.id ? 'page' : undefined}
						>
							{employer.name}
						</button>
					{/each}
				</div>
			</div>

			<div class="title-bar-right">
				<button class="icon-btn" aria-label="Synchronisierung">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<polyline points="23 4 23 10 17 10" stroke-width="2" />
						<polyline points="1 20 1 14 7 14" stroke-width="2" />
						<path
							d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button class="icon-btn" aria-label="Einstellungen">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<circle cx="12" cy="12" r="3" stroke-width="2" />
						<path
							d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
							stroke-width="2"
						/>
					</svg>
				</button>
			</div>
		</div>

		<div class="explanation-card" style="margin-top: 1rem;">
			<p><strong>Current selection:</strong> {selectedEmployer ?? 'Alle Arbeitgeber'}</p>
			<p>
				The employer selector is now displayed as tabs instead of a dropdown. Tabs use
				brand-accent-300 color in normal state. Scrollbar is hidden but you can still scroll with
				mouse wheel or touch.
			</p>
		</div>
	</section>

	<!-- Footer Button Experiment v1 -->
	<section class="section">
		<h2>Footer Button Experiment v1</h2>
		<p style="color: var(--tt-text-muted);">
			Functional footer demo matching current implementation exactly (no design changes yet).
		</p>

		<div class="footer-demo-container-v2">
			<div class="footer-demo-v2">
				<button
					class="footer-btn-v2 footer-btn-v2--plus"
					onclick={() => selectTab2('add')}
					aria-current={selectedTab2 === 'add' ? 'page' : undefined}
				>
					+
				</button>
				<button
					class="footer-btn-v2 footer-btn-v2--day"
					onclick={() => selectTab2('day')}
					aria-current={selectedTab2 === 'day' ? 'page' : undefined}
				>
					Tag
				</button>
				<button
					class="footer-btn-v2 footer-btn-v2--week"
					onclick={() => selectTab2('week')}
					aria-current={selectedTab2 === 'week' ? 'page' : undefined}
				>
					Woche
				</button>
				<button
					class="footer-btn-v2 footer-btn-v2--month"
					onclick={() => selectTab2('month')}
					aria-current={selectedTab2 === 'month' ? 'page' : undefined}
				>
					Monat
				</button>
				<button
					class="footer-btn-v2 footer-btn-v2--analysis"
					onclick={() => selectTab2('analysis')}
					aria-current={selectedTab2 === 'analysis' ? 'page' : undefined}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 3v18h18M7 16l4-4 4 4 6-6" />
					</svg>
				</button>
			</div>
		</div>

		<div class="explanation-card" style="margin-top: 1rem;">
			<p><strong>Current selection:</strong> {selectedTab2}</p>
			<p>
				This is a baseline implementation matching the current footer exactly. Ready for Phase 2
				experiments.
			</p>
		</div>
	</section>
</div>

<style>
	:global(body) {
		background: var(--tt-background-outside);
	}

	.styleguide {
		padding: var(--tt-space-16);
		max-width: var(--tt-app-max-width);
		margin: 0 auto;
		background: var(--tt-background-page);
		min-height: 100vh;
	}

	.styleguide-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--tt-border-default);
	}

	.styleguide-header h1 {
		margin: 0 0 0.5rem;
		color: var(--tt-brand-primary-500);
	}

	.section {
		margin-bottom: 2.5rem;
	}

	.section h2 {
		color: var(--tt-text-primary);
		border-bottom: 2px solid var(--tt-brand-primary-500);
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
	}

	.section h3 {
		color: var(--tt-text-secondary);
		margin: 1.5rem 0 0.5rem;
		font-size: 0.95rem;
	}

	.explanation-card {
		font-size: var(--tt-font-size-body);
	}

	.explanation-card h3 {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: var(--tt-text-primary);
	}

	.explanation-card pre {
		background: var(--tt-background-card-pressed);
		padding: var(--tt-space-12);
		border-radius: var(--tt-radius-button);
		overflow-x: auto;
		font-size: var(--tt-font-size-small);
	}

	.explanation-card ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.explanation-card li {
		margin: 0.25rem 0;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--tt-space-16);
	}

	.color-swatch {
		padding: var(--tt-space-16);
		border-radius: var(--tt-radius-card);
		color: white;
		text-align: center;
	}

	.color-swatch span {
		display: block;
		font-weight: 600;
		margin-bottom: 0.25rem;
		font-size: var(--tt-font-size-small);
	}

	.color-swatch code {
		font-size: 0.7rem;
		opacity: 0.9;
	}

	.color-scale {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		border-radius: var(--tt-radius-card);
		overflow: hidden;
	}

	.color-scale-item {
		flex: 1 1 80px;
		min-width: 80px;
		padding: 1rem 0.5rem;
		text-align: center;
		color: white;
	}

	.color-scale-item span {
		display: block;
		font-weight: 600;
		font-size: var(--tt-font-size-tiny);
		margin-bottom: 0.25rem;
	}

	.color-scale-item code {
		font-size: 0.6rem;
		opacity: 0.9;
	}

	/* Footer Button Experiment - Phase 2: Selected button extends upward */
	.footer-demo-container {
		background: var(--tt-brand-primary-500);
		padding: var(--tt-space-8);
		border-radius: var(--tt-radius-card) var(--tt-radius-card) 0 0;
		margin-top: 1rem;
		position: relative;
		overflow: visible;
	}

	.footer-demo {
		display: flex;
		gap: var(--tt-space-4);
		justify-content: stretch;
	}

	.footer-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 38px;
		padding: var(--tt-space-8) var(--tt-space-12);
		border: none;
		border-radius: var(--tt-radius-button);
		font-size: var(--tt-font-size-small);
		font-weight: var(--tt-font-weight-normal);
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.footer-btn--plus {
		font-size: 1.5rem;
		font-weight: var(--tt-font-weight-bold);
		background: var(--tt-brand-primary-600);
		color: var(--tt-white);
	}

	.footer-btn--day {
		background: var(--tt-brand-accent-100);
		color: var(--tt-brand-primary-700);
	}

	.footer-btn--week {
		background: var(--tt-brand-accent-200);
		color: var(--tt-brand-primary-700);
	}

	.footer-btn--month {
		background: var(--tt-brand-accent-300);
		color: var(--tt-brand-primary-700);
	}

	.footer-btn--analysis {
		background: var(--tt-brand-primary-600);
		color: var(--tt-white);
	}

	.footer-btn svg {
		width: 20px;
		height: 20px;
		stroke-width: 2;
	}

	/* Hover states */
	@media (hover: hover) {
		.footer-btn--plus:hover {
			background: color-mix(in srgb, var(--tt-white) 8%, var(--tt-brand-primary-600));
		}

		.footer-btn--day:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-100));
		}

		.footer-btn--week:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-200));
		}

		.footer-btn--month:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-300));
		}

		.footer-btn--analysis:hover {
			background: color-mix(in srgb, var(--tt-white) 8%, var(--tt-brand-primary-600));
		}
	}

	/* Pressed states */
	.footer-btn--plus:active {
		background: color-mix(in srgb, var(--tt-white) 12%, var(--tt-brand-primary-600));
	}

	.footer-btn--day:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-100));
	}

	.footer-btn--week:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-200));
	}

	.footer-btn--month:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-300));
	}

	.footer-btn--analysis:active {
		background: color-mix(in srgb, var(--tt-white) 12%, var(--tt-brand-primary-600));
	}

	/* Selected state - gradient from original color to app background */
	.footer-btn[aria-current='page'] {
		color: var(--tt-brand-primary-700);
		font-weight: var(--tt-font-weight-bold);
		position: relative;
		overflow: visible;
		border-radius: 0 0 var(--tt-radius-button) var(--tt-radius-button);
	}

	/* Day button gradient: accent-100 to page background */
	.footer-btn--day[aria-current='page'] {
		background: linear-gradient(
			to top,
			var(--tt-brand-accent-100) 0%,
			var(--tt-background-page) 100%
		) !important;
	}

	/* Week button gradient: accent-200 to page background */
	.footer-btn--week[aria-current='page'] {
		background: linear-gradient(
			to top,
			var(--tt-brand-accent-200) 0%,
			var(--tt-background-page) 100%
		) !important;
	}

	/* Month button gradient: accent-300 to page background */
	.footer-btn--month[aria-current='page'] {
		background: linear-gradient(
			to top,
			var(--tt-brand-accent-300) 0%,
			var(--tt-background-page) 100%
		) !important;
	}

	/* Plus and Analysis buttons: primary-600 to page background */
	.footer-btn--plus[aria-current='page'],
	.footer-btn--analysis[aria-current='page'] {
		background: linear-gradient(
			to top,
			var(--tt-brand-primary-600) 0%,
			var(--tt-background-page) 100%
		) !important;
		color: var(--tt-white);
	}

	/* Extension above button to blend into app background */
	.footer-btn[aria-current='page']::before {
		content: '';
		position: absolute;
		top: -20px;
		left: 0;
		right: 0;
		height: 20px;
		background: var(--tt-background-page);
		border-radius: var(--tt-radius-button) var(--tt-radius-button) 0 0;
		z-index: 1;
	}

	/* Ensure button text stays above the extension */
	.footer-btn[aria-current='page'] {
		z-index: 2;
	}

	.footer-btn[aria-current='page'] svg {
		stroke-width: 3;
	}

	/* Selected hover - use same gradient with slight darkening */
	@media (hover: hover) {
		.footer-btn--day[aria-current='page']:hover {
			background: linear-gradient(
				to top,
				color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-100)) 0%,
				var(--tt-background-page) 100%
			) !important;
		}

		.footer-btn--week[aria-current='page']:hover {
			background: linear-gradient(
				to top,
				color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-200)) 0%,
				var(--tt-background-page) 100%
			) !important;
		}

		.footer-btn--month[aria-current='page']:hover {
			background: linear-gradient(
				to top,
				color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-300)) 0%,
				var(--tt-background-page) 100%
			) !important;
		}

		.footer-btn--plus[aria-current='page']:hover,
		.footer-btn--analysis[aria-current='page']:hover {
			background: linear-gradient(
				to top,
				color-mix(in srgb, var(--tt-white) 8%, var(--tt-brand-primary-600)) 0%,
				var(--tt-background-page) 100%
			) !important;
		}
	}

	/* Selected pressed - use same gradient with more darkening */
	.footer-btn--day[aria-current='page']:active {
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-100)) 0%,
			var(--tt-background-page) 100%
		) !important;
	}

	.footer-btn--week[aria-current='page']:active {
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-200)) 0%,
			var(--tt-background-page) 100%
		) !important;
	}

	.footer-btn--month[aria-current='page']:active {
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-300)) 0%,
			var(--tt-background-page) 100%
		) !important;
	}

	.footer-btn--plus[aria-current='page']:active,
	.footer-btn--analysis[aria-current='page']:active {
		background: linear-gradient(
			to top,
			color-mix(in srgb, var(--tt-white) 12%, var(--tt-brand-primary-600)) 0%,
			var(--tt-background-page) 100%
		) !important;
	}

	/* Footer Button Experiment v2 - Phase 1: Match current implementation */
	.footer-demo-container-v2 {
		background: var(--tt-brand-primary-500);
		padding: var(--tt-space-8);
		border-radius: var(--tt-radius-card) var(--tt-radius-card) 0 0;
		margin-top: 1rem;
	}

	.footer-demo-v2 {
		display: flex;
		gap: var(--tt-space-4);
		justify-content: stretch;
	}

	.footer-btn-v2 {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 38px;
		padding: var(--tt-space-8) var(--tt-space-12);
		border: none;
		border-radius: var(--tt-radius-button);
		font-size: var(--tt-font-size-small);
		font-weight: var(--tt-font-weight-normal);
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.footer-btn-v2--plus {
		font-size: 1.5rem;
		font-weight: var(--tt-font-weight-bold);
		background: var(--tt-brand-primary-600);
		color: var(--tt-white);
	}

	.footer-btn-v2--day {
		background: var(--tt-brand-accent-100);
		color: var(--tt-brand-primary-700);
	}

	.footer-btn-v2--week {
		background: var(--tt-brand-accent-200);
		color: var(--tt-brand-primary-700);
	}

	.footer-btn-v2--month {
		background: var(--tt-brand-accent-300);
		color: var(--tt-brand-primary-700);
	}

	.footer-btn-v2--analysis {
		background: var(--tt-brand-primary-600);
		color: var(--tt-white);
	}

	.footer-btn-v2 svg {
		width: 20px;
		height: 20px;
		stroke-width: 2;
	}

	/* Hover states */
	@media (hover: hover) {
		.footer-btn-v2--plus:hover {
			background: color-mix(in srgb, var(--tt-white) 8%, var(--tt-brand-primary-600));
		}

		.footer-btn-v2--day:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-100));
		}

		.footer-btn-v2--week:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-200));
		}

		.footer-btn-v2--month:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-300));
		}

		.footer-btn-v2--analysis:hover {
			background: color-mix(in srgb, var(--tt-white) 8%, var(--tt-brand-primary-600));
		}
	}

	/* Pressed states */
	.footer-btn-v2--plus:active {
		background: color-mix(in srgb, var(--tt-white) 12%, var(--tt-brand-primary-600));
	}

	.footer-btn-v2--day:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-100));
	}

	.footer-btn-v2--week:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-200));
	}

	.footer-btn-v2--month:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-300));
	}

	.footer-btn-v2--analysis:active {
		background: color-mix(in srgb, var(--tt-white) 12%, var(--tt-brand-primary-600));
	}

	/* Selected state - white background for day/week/month */
	.footer-btn-v2--day[aria-current='page'],
	.footer-btn-v2--week[aria-current='page'],
	.footer-btn-v2--month[aria-current='page'] {
		background: var(--tt-white) !important;
		color: var(--tt-brand-primary-700);
		font-weight: var(--tt-font-weight-bold);
	}

	/* Selected state - semi-transparent for plus/analysis */
	.footer-btn-v2--plus[aria-current='page'],
	.footer-btn-v2--analysis[aria-current='page'] {
		background: color-mix(in srgb, var(--tt-white) 50%, var(--tt-brand-primary-600)) !important;
		color: var(--tt-white);
		font-weight: var(--tt-font-weight-bold);
	}

	.footer-btn-v2[aria-current='page'] svg {
		stroke-width: 3;
	}

	/* Selected hover - day/week/month */
	@media (hover: hover) {
		.footer-btn-v2--day[aria-current='page']:hover,
		.footer-btn-v2--week[aria-current='page']:hover,
		.footer-btn-v2--month[aria-current='page']:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-white)) !important;
		}

		/* Selected hover - plus/analysis */
		.footer-btn-v2--plus[aria-current='page']:hover,
		.footer-btn-v2--analysis[aria-current='page']:hover {
			background: color-mix(in srgb, var(--tt-white) 58%, var(--tt-brand-primary-600)) !important;
		}
	}

	/* Selected pressed - day/week/month */
	.footer-btn-v2--day[aria-current='page']:active,
	.footer-btn-v2--week[aria-current='page']:active,
	.footer-btn-v2--month[aria-current='page']:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-white)) !important;
	}

	/* Selected pressed - plus/analysis */
	.footer-btn-v2--plus[aria-current='page']:active,
	.footer-btn-v2--analysis[aria-current='page']:active {
		background: color-mix(in srgb, var(--tt-white) 62%, var(--tt-brand-primary-600)) !important;
	}

	/* Title Bar Experiment v1 */
	.title-bar-demo {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--tt-space-8) var(--tt-space-12);
		background: var(--tt-brand-primary-500);
		border-radius: var(--tt-radius-card);
		gap: var(--tt-space-12);
		margin-top: 1rem;
	}

	.title-bar-left,
	.title-bar-right {
		display: flex;
		gap: var(--tt-space-8);
		align-items: center;
	}

	.title-bar-center {
		flex: 1;
		display: flex;
		justify-content: flex-start; /* Changed from center to allow proper scrolling */
		overflow-x: auto;
		/* Hide scrollbar but keep scroll functionality */
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE/Edge */
		cursor: grab;
	}

	.title-bar-center:active {
		cursor: grabbing;
	}

	/* Hide scrollbar for Chrome/Safari/Opera */
	.title-bar-center::-webkit-scrollbar {
		display: none;
	}

	.nav-btn,
	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--tt-space-8);
		border: none;
		border-radius: var(--tt-radius-button);
		background: transparent;
		color: var(--tt-white);
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (hover: hover) {
		.nav-btn:not(:disabled):hover,
		.icon-btn:hover {
			background: color-mix(in srgb, var(--tt-white) 15%, transparent);
		}
	}

	.nav-btn:not(:disabled):active,
	.icon-btn:active {
		background: color-mix(in srgb, var(--tt-white) 25%, transparent);
	}

	.employer-tabs {
		display: flex;
		gap: var(--tt-space-4);
		flex-wrap: nowrap;
		user-select: none; /* Prevent text selection when dragging */
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		margin: 0 auto; /* Center the tabs within the scrollable area */
	}

	.employer-tab {
		padding: var(--tt-space-8) var(--tt-space-12);
		border: none;
		border-radius: var(--tt-radius-button);
		background: var(--tt-brand-accent-300);
		color: var(--tt-brand-primary-700);
		font-size: var(--tt-font-size-small);
		font-weight: var(--tt-font-weight-normal);
		cursor: pointer;
		transition: background 0.2s ease;
		white-space: nowrap;
	}

	@media (hover: hover) {
		.employer-tab:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-300));
		}
	}

	.employer-tab:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-300));
	}

	.employer-tab[aria-current='page'] {
		background: var(--tt-white);
		font-weight: var(--tt-font-weight-bold);
	}

	@media (hover: hover) {
		.employer-tab[aria-current='page']:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-white));
		}
	}

	.employer-tab[aria-current='page']:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-white));
	}

	/* Title Bar Gradient Experiment Styles */
	.title-bar-demo-gradient {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--tt-space-8) var(--tt-space-12);
		border-radius: var(--tt-radius-card);
		gap: var(--tt-space-12);
		margin-top: 1rem;
		position: relative;
		overflow: visible;
		background: var(--tt-brand-primary-500);
	}

	.title-bar-left-gradient,
	.title-bar-right-gradient {
		display: flex;
		gap: var(--tt-space-8);
		align-items: center;
	}

	.title-bar-center-gradient {
		flex: 1;
		display: flex;
		justify-content: flex-start;
		overflow-x: auto;
		overflow-y: visible;
		scrollbar-width: none;
		-ms-overflow-style: none;
		cursor: grab;
	}

	.title-bar-center-gradient:active {
		cursor: grabbing;
	}

	.title-bar-center-gradient::-webkit-scrollbar {
		display: none;
	}

	.nav-btn-gradient,
	.icon-btn-gradient {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--tt-space-8);
		border: none;
		border-radius: var(--tt-radius-button);
		background: transparent;
		color: var(--tt-white);
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.nav-btn-gradient:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (hover: hover) {
		.nav-btn-gradient:not(:disabled):hover,
		.icon-btn-gradient:hover {
			background: color-mix(in srgb, var(--tt-white) 15%, transparent);
		}
	}

	.nav-btn-gradient:not(:disabled):active,
	.icon-btn-gradient:active {
		background: color-mix(in srgb, var(--tt-white) 25%, transparent);
	}

	.employer-tabs-gradient {
		display: flex;
		gap: var(--tt-space-4);
		flex-wrap: nowrap;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		margin: 0 auto;
	}

	.employer-tab-gradient {
		padding: var(--tt-space-8) var(--tt-space-12);
		border: none;
		border-radius: var(--tt-radius-button);
		background: var(--tt-brand-accent-300);
		color: var(--tt-brand-primary-700);
		font-size: var(--tt-font-size-small);
		font-weight: var(--tt-font-weight-normal);
		cursor: pointer;
		transition: background 0.2s ease;
		white-space: nowrap;
	}

	@media (hover: hover) {
		.employer-tab-gradient:hover {
			background: color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-300));
		}
	}

	.employer-tab-gradient:active {
		background: color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-300));
	}

	/* Selected state - gradient opens downward (opposite of footer) */
	.employer-tab-gradient[aria-current='page'] {
		color: var(--tt-brand-primary-700);
		font-weight: var(--tt-font-weight-bold);
		position: relative;
		overflow: visible;
		border-radius: var(--tt-radius-button) var(--tt-radius-button) 0 0;
		background: linear-gradient(
			to bottom,
			var(--tt-brand-accent-300) 0%,
			var(--tt-background-page) 100%
		) !important;
	}

	/* Create transparent cutout in title bar background under selected tab */
	.employer-tab-gradient[aria-current='page']::before {
		content: '';
		position: absolute;
		top: -16px;
		left: -16px;
		right: -16px;
		height: 16px;
		background: var(--tt-background-page);
		z-index: 100;
	}

	/* Ensure button text stays above the extension */
	.employer-tab-gradient[aria-current='page'] {
		z-index: 101;
	}

	/* Extension below button to blend into app background */
	.employer-tab-gradient[aria-current='page']::after {
		content: '';
		position: absolute;
		bottom: -20px;
		left: 0;
		right: 0;
		height: 20px;
		background: var(--tt-background-page);
		border-radius: 0 0 var(--tt-radius-button) var(--tt-radius-button);
		z-index: 1;
	}

	.employer-tab-gradient[aria-current='page'] {
		z-index: 2;
	}

	/* Selected hover - gradient with slight darkening */
	@media (hover: hover) {
		.employer-tab-gradient[aria-current='page']:hover {
			background: linear-gradient(
				to bottom,
				color-mix(in srgb, var(--tt-brand-primary-700) 8%, var(--tt-brand-accent-300)) 0%,
				var(--tt-background-page) 100%
			) !important;
		}
	}

	.employer-tab-gradient[aria-current='page']:active {
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--tt-brand-primary-700) 12%, var(--tt-brand-accent-300)) 0%,
			var(--tt-background-page) 100%
		) !important;
	}
</style>
