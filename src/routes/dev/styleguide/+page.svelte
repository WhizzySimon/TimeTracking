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

	function selectTab(tab: string) {
		selectedTab = tab;
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

	<!-- Footer Button Gradient Experiment -->
	<section class="section">
		<h2>Footer Button Gradient Experiment - Phase 3</h2>
		<p style="color: var(--tt-text-muted);">
			Phase 3: Gradient from button's original color (bottom) to app background color (top).
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
</style>
