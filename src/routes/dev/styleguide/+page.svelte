<!--
  StyleGuide v2 - Design System Reference
  
  Route: /dev/styleguide
  
  Changes from v1:
  - Compact single-line layout for rows
  - No chevron signifier (clickability via hover/cursor)
  - Badge width fits content (not stretched)
  - Clear touchable vs non-touchable distinction
  - Self-explanatory class names
  
  COMPONENT SYSTEM:
  Classes are applied to HTML elements. Variants modify behavior/appearance.
  Example: <div class="tt-list-row tt-list-row-clickable">
           <div class="tt-list-row-clickable"> (shorthand)
-->
<script lang="ts">
	// No state needed - all demos are static
</script>

<div class="styleguide">
	<header class="styleguide-header">
		<h1>TimeTracker Design System v2</h1>
		<p class="tt-text-muted">
			Mobile-first design — no hover states, touchability via visual affordances (border/background)
		</p>
	</header>

	<!-- Color schemes -->
	<section class="section">
		<h2>Color schemes</h2>

		<!-- Brand Primary Blue — Full Scale (Responds to Scheme Changes) -->
		<p class="tt-text-muted">
			<strong>Dynamic:</strong> This scale changes when you switch color schemes in Settings → Entwicklung.
			The colors shown below reflect the currently active scheme.
		</p>

		<h3>Brand Primary — Numbered Scale (25-700)</h3>
		<p class="tt-text-muted">
			Numbers represent lightness levels in the Material Design convention.
			Switch schemes to see how these colors adapt.
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
		<p class="tt-text-muted">
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
			<div class="color-scale-item" style="background: var(--tt-brand-accent);">
				<span style="color: var(--tt-text-primary);">Base</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-darker);">
				<span>Darker</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-darkest);">
				<span>Darkest</span>
			</div>
		</div>

		<h3>Semantic States</h3>
		<p class="tt-text-muted">Each semantic color has base + pressed + faded variants.</p>

		<p class="tt-text-muted" style="margin-top: 1rem;">
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

		<p class="tt-text-muted" style="margin-top: 1rem;">
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

		<p class="tt-text-muted" style="margin-top: 1rem;">
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

		<p class="tt-text-muted" style="margin-top: 1rem;">
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
		<div class="tt-card explanation-card">
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

</div>

<style>
	:global(body) {
		background: var(--tt-background-outside);
	}

	.styleguide {
		padding: 1rem;
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

	.demo-stack {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.demo-inline {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.explanation-card {
		font-size: 0.9rem;
	}

	.explanation-card h3 {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: var(--tt-text-primary);
	}

	.explanation-card pre {
		background: var(--tt-background-card-pressed);
		padding: 0.75rem;
		border-radius: var(--tt-radius-button);
		overflow-x: auto;
		font-size: 0.8rem;
	}

	.explanation-card ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.explanation-card li {
		margin: 0.25rem 0;
	}

	.usage-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	.usage-table th,
	.usage-table td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--tt-border-subtle);
	}

	.usage-table th {
		background: var(--tt-background-card-pressed);
		font-weight: 600;
	}

	.usage-table code {
		font-size: 0.75rem;
		background: var(--tt-brand-primary-faded);
		padding: 2px 4px;
		border-radius: 3px;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1rem;
	}

	.color-swatch {
		padding: 1rem;
		border-radius: var(--tt-radius-card);
		color: white;
		text-align: center;
	}

	.color-swatch span {
		display: block;
		font-weight: 600;
		margin-bottom: 0.25rem;
		font-size: 0.85rem;
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
		font-size: 0.75rem;
		margin-bottom: 0.25rem;
	}

	.color-scale-item code {
		font-size: 0.6rem;
		opacity: 0.9;
	}
</style>
