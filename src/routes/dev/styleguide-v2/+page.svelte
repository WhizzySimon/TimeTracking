<!--
  StyleGuide v2 - Design System Reference
  
  Route: /dev/styleguide-v2
  
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

	<!-- Touchable vs Non-Touchable -->
	<section class="section">
		<h2>Touchable vs Non-Touchable Design</h2>
		<p class="tt-text-muted">
			Clickable items are ALWAYS visually distinct (left accent border). No hover needed to discover
			clickability.
		</p>

		<h3>Clickable Row (tt-list-row-clickable)</h3>
		<p class="tt-text-muted">
			Used for: Time entries, navigation items, editable settings. Border = touchable, background
			changes on touch.
		</p>
		<p class="tt-text-muted">
			<strong>Important:</strong> Buttons inside rows must use <code>onclick|stopPropagation</code> to
			prevent row highlight when clicking buttons.
		</p>
		<div class="demo-stack">
			<div class="tt-list-row-clickable" role="button" tabindex="0">
				<div class="tt-list-row__content-compact">
					<span class="tt-list-row__time">08:00 – 12:30</span>
					<span class="tt-list-row__separator"></span>
					<span class="tt-list-row__category">Entwicklung</span>
					<span class="tt-inline-label-employer">Kirche</span>
				</div>
				<div class="tt-list-row__actions">
					<button
						class="tt-symbol-button"
						aria-label="Fortsetzen"
						onclick={(e) => e.stopPropagation()}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polygon points="5 3 19 12 5 21 5 3"></polygon>
						</svg>
					</button>
					<button
						class="tt-symbol-button"
						aria-label="Löschen"
						onclick={(e) => e.stopPropagation()}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"></polyline>
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							></path>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<h3>Non-Clickable Row (tt-list-row-static)</h3>
		<p class="tt-text-muted">Used for: Ist/Soll/Haben summary, Summe totals. No hover effect.</p>
		<div class="demo-stack">
			<div class="tt-list-row-static">
				<div class="tt-list-row__content-compact">
					<span class="tt-text-muted"
						>This row does not respond to hover — it's read-only information</span
					>
				</div>
			</div>
		</div>
	</section>

	<!-- Compact Row Layout -->
	<section class="section">
		<h2>Compact Row Layout (Single Line)</h2>
		<p class="tt-text-muted">
			Content flows horizontally: Time · Category · Employer — all on one line when space allows.
		</p>

		<h3>Time Entry Row (Eintrag)</h3>
		<div class="demo-stack">
			<div class="tt-list-row-clickable" role="button" tabindex="0">
				<div class="tt-list-row__content-compact">
					<span class="tt-list-row__time">08:00 – 12:30</span>
					<span class="tt-list-row__separator"></span>
					<span class="tt-list-row__category">Entwicklung</span>
					<span class="tt-inline-label-employer">Kirche</span>
				</div>
				<div class="tt-list-row__actions">
					<button
						class="tt-symbol-button"
						aria-label="Fortsetzen"
						onclick={(e) => e.stopPropagation()}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polygon points="5 3 19 12 5 21 5 3"></polygon>
						</svg>
					</button>
					<button
						class="tt-symbol-button"
						aria-label="Löschen"
						onclick={(e) => e.stopPropagation()}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"></polyline>
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							></path>
						</svg>
					</button>
				</div>
			</div>
			<div class="tt-list-row-clickable" role="button" tabindex="0">
				<div class="tt-list-row__content-compact">
					<span class="tt-list-row__time">13:00 – 14:00</span>
					<span class="tt-list-row__separator"></span>
					<span class="tt-list-row__category">Pause</span>
					<span class="tt-inline-label-no-work">Keine Arbeitszeit</span>
				</div>
				<div class="tt-list-row__actions">
					<button
						class="tt-symbol-button"
						aria-label="Fortsetzen"
						onclick={(e) => e.stopPropagation()}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polygon points="5 3 19 12 5 21 5 3"></polygon>
						</svg>
					</button>
					<button
						class="tt-symbol-button"
						aria-label="Löschen"
						onclick={(e) => e.stopPropagation()}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"></polyline>
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							></path>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<h3>Navigation Row (Tag/Woche/Monat List Item)</h3>
		<p class="tt-text-muted">
			Clickable, leads to detail view. NO chevron — clickability shown via hover.
		</p>
		<div class="demo-stack">
			<div class="tt-list-row-clickable" role="button" tabindex="0">
				<div class="tt-list-row__content-compact">
					<span class="tt-list-row__time">Mo 23.12</span>
					<span class="tt-list-row__separator"></span>
					<span class="tt-list-row__category">8,5h gearbeitet</span>
				</div>
			</div>
			<div class="tt-list-row-clickable" role="button" tabindex="0">
				<div class="tt-list-row__content-compact">
					<span class="tt-list-row__time">KW 52</span>
					<span class="tt-list-row__separator"></span>
					<span class="tt-list-row__category">23.12 – 29.12</span>
					<span class="tt-list-row__separator"></span>
					<span class="tt-list-row__detail">40h</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Summary Display (Non-Clickable) -->
	<section class="section">
		<h2>Summary Display (Non-Clickable)</h2>
		<p class="tt-text-muted">Ist/Soll/Haben and Summe elements — read-only, no interaction.</p>

		<h3>Ist/Soll/Haben Summary</h3>
		<div class="demo-stack">
			<div class="tt-summary-display">
				<span class="tt-summary-display__item">
					<span class="tt-summary-display__label">Ist:</span>
					<span class="tt-summary-display__value">8,5</span>
				</span>
				<span class="tt-summary-display__item">
					<span class="tt-summary-display__label">Soll:</span>
					<span class="tt-summary-display__value">8,0</span>
				</span>
				<span class="tt-summary-display__item">
					<span class="tt-summary-display__label">Haben:</span>
					<span class="tt-summary-display__value tt-summary-display__value-positive">+0,5</span>
				</span>
			</div>
		</div>

		<h3>Summe Row (Auswertung)</h3>
		<div class="demo-stack">
			<div class="tt-list-row-static">
				<div class="tt-list-row__content-compact">
					<span class="tt-list-row__time" style="font-weight: 600;">Summe Dezember</span>
				</div>
				<div class="tt-list-row__actions">
					<span style="font-weight: 600;">168,0h</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Per-Page Component Mapping -->
	<section class="section">
		<h2>Component Usage by Page</h2>
		<div class="tt-card">
			<table class="usage-table">
				<thead>
					<tr>
						<th>Page</th>
						<th>Element</th>
						<th>Class</th>
						<th>Clickable?</th>
					</tr>
				</thead>
				<tbody>
					<tr
						><td>Tag</td><td>Einträge</td><td><code>tt-list-row-clickable</code></td><td>✓ Yes</td
						></tr
					>
					<tr
						><td>Tag</td><td>Ist/Soll/Haben</td><td><code>tt-summary-display</code></td><td>✗ No</td
						></tr
					>
					<tr
						><td>Woche</td><td>Tage</td><td><code>tt-list-row-clickable</code></td><td>✓ Yes</td
						></tr
					>
					<tr
						><td>Woche</td><td>Summary</td><td><code>tt-summary-display</code></td><td>✗ No</td></tr
					>
					<tr
						><td>Monat</td><td>Wochen</td><td><code>tt-list-row-clickable</code></td><td>✓ Yes</td
						></tr
					>
					<tr
						><td>Monat</td><td>Summary</td><td><code>tt-summary-display</code></td><td>✗ No</td></tr
					>
					<tr
						><td>Auswertung</td><td>Datum-Picker</td><td><code>tt-list-row-clickable</code></td><td
							>✓ Yes</td
						></tr
					>
					<tr
						><td>Auswertung</td><td>Zeiten-Einträge</td><td><code>tt-list-row-clickable</code></td
						><td>✓ Yes</td></tr
					>
					<tr
						><td>Auswertung</td><td>Summe</td><td><code>tt-list-row-static</code></td><td>✗ No</td
						></tr
					>
					<tr
						><td>Settings</td><td>Default Abwesenheit</td><td><code>tt-list-row-static</code></td
						><td>✗ No</td></tr
					>
					<tr
						><td>Settings</td><td>Custom Abwesenheit</td><td><code>tt-list-row-clickable</code></td
						><td>✓ Yes</td></tr
					>
					<tr
						><td>Settings</td><td>Tätigkeiten</td><td><code>tt-list-row-clickable</code></td><td
							>✓ Yes</td
						></tr
					>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Inline Labels (Badges) -->
	<section class="section">
		<h2>Inline Labels (Fit Content Width)</h2>
		<p class="tt-text-muted">
			Labels are inline-flex with width: fit-content — they don't stretch.
		</p>

		<h3>Label Variants</h3>
		<div class="demo-inline">
			<span class="tt-inline-label-neutral">Neutral</span>
			<span class="tt-inline-label-employer">Kirche</span>
			<span class="tt-inline-label-no-work">Keine Arbeitszeit</span>
			<span class="tt-inline-label-success">Erfolg</span>
			<span class="tt-inline-label-warning">Warnung</span>
			<span class="tt-inline-label-danger">Fehler</span>
		</div>

		<h3>In Context (Single Line)</h3>
		<div class="demo-stack">
			<div class="tt-list-row-clickable">
				<div class="tt-list-row__content-compact">
					<span class="tt-list-row__time">08:00 – 12:30</span>
					<span class="tt-list-row__separator"></span>
					<span class="tt-list-row__category">Entwicklung</span>
					<span class="tt-inline-label-employer">Kirche</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Interactive Chips -->
	<section class="section">
		<h2>Interactive Chips (Add Screen)</h2>
		<p class="tt-text-muted">Chips are interactive selection elements for the Add screen.</p>

		<div class="demo-inline">
			<button class="tt-chip">Entwicklung</button>
			<button class="tt-chip">Meeting</button>
			<button class="tt-chip is-selected">Pause</button>
			<button class="tt-chip">Admin</button>
		</div>
	</section>

	<!-- Buttons -->
	<section class="section">
		<h2>Buttons</h2>

		<h3>Standard</h3>
		<div class="demo-inline">
			<button class="tt-button-primary">Primary</button>
			<button class="tt-button-secondary">Secondary</button>
			<button class="tt-button-danger">Danger</button>
			<button class="tt-button-ghost">Ghost</button>
		</div>

		<h3>Small</h3>
		<div class="demo-inline">
			<button class="tt-button-primary tt-button-small">Primary Small</button>
			<button class="tt-button-secondary tt-button-small">Secondary Small</button>
		</div>

		<h3>Symbol Buttons (With Border)</h3>
		<p class="tt-text-muted">
			All symbol buttons have border for touchable affordance (mobile-first). Gray icons, color on
			touch.
		</p>
		<div class="demo-inline">
			<button class="tt-symbol-button" aria-label="Sync">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="23 4 23 10 17 10"></polyline>
					<polyline points="1 20 1 14 7 14"></polyline>
					<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
				</svg>
			</button>
			<button class="tt-symbol-button" aria-label="Profile">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
					<circle cx="12" cy="7" r="4"></circle>
				</svg>
			</button>
			<button class="tt-symbol-button" aria-label="Resume">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polygon points="5 3 19 12 5 21 5 3"></polygon>
				</svg>
			</button>
			<button class="tt-symbol-button" aria-label="Add">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
			</button>
			<button class="tt-symbol-button" aria-label="More options">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="1"></circle>
					<circle cx="12" cy="5" r="1"></circle>
					<circle cx="12" cy="19" r="1"></circle>
				</svg>
			</button>
			<button class="tt-symbol-button" aria-label="Delete">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="3 6 5 6 21 6"></polyline>
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
					></path>
				</svg>
			</button>
			<button class="tt-symbol-button" aria-label="Import">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="7 10 12 15 17 10"></polyline>
					<line x1="12" y1="15" x2="12" y2="3"></line>
				</svg>
			</button>
			<button class="tt-symbol-button" aria-label="Export">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="17 8 12 3 7 8"></polyline>
					<line x1="12" y1="3" x2="12" y2="15"></line>
				</svg>
			</button>
			<button class="tt-symbol-button" aria-label="Edit">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
					<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
				</svg>
			</button>
		</div>
	</section>

	<!-- Settings List Items -->
	<section class="section">
		<h2>Settings List Items</h2>

		<h3>Default Abwesenheit (Non-Clickable)</h3>
		<p class="tt-text-muted">System defaults don't open dialogs — they're static.</p>
		<div class="demo-stack">
			<div class="tt-list-row-static">
				<div class="tt-list-row__content-compact">
					<span>Feiertag</span>
					<span class="tt-inline-label-no-work">Keine Arbeitszeit</span>
				</div>
			</div>
			<div class="tt-list-row-static">
				<div class="tt-list-row__content-compact">
					<span>Krank</span>
					<span class="tt-inline-label-no-work">Keine Arbeitszeit</span>
				</div>
			</div>
		</div>

		<h3>Custom Abwesenheit (Clickable)</h3>
		<p class="tt-text-muted">User-created items open edit dialogs.</p>
		<div class="demo-stack">
			<div class="tt-list-row-clickable" role="button" tabindex="0">
				<div class="tt-list-row__content-compact">
					<span>Joggen</span>
					<span class="tt-inline-label-no-work">Keine Arbeitszeit</span>
				</div>
				<div class="tt-list-row__actions">
					<button
						class="tt-symbol-button"
						aria-label="Löschen"
						onclick={(e) => e.stopPropagation()}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"></polyline>
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							></path>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<h3>Tätigkeiten (Clickable)</h3>
		<div class="demo-stack">
			<div class="tt-list-row-clickable" role="button" tabindex="0">
				<div class="tt-list-row__content-compact">
					<span>Entwicklung</span>
					<span class="tt-inline-label-employer">Kirche</span>
				</div>
				<div class="tt-list-row__actions">
					<button
						class="tt-symbol-button"
						aria-label="Löschen"
						onclick={(e) => e.stopPropagation()}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"></polyline>
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							></path>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Action Title (Date Picker Trigger) -->
	<section class="section">
		<h2>Action Title (Excel: ActionTitle)</h2>
		<p class="tt-text-muted">Clickable date/period header that opens picker dialogs.</p>

		<p class="tt-text-muted" style="font-style: italic;">
			Note: Action Title is NOT a dropdown. It opens a date picker dialog.
		</p>
		<div class="demo-inline">
			<button class="tt-action-title">
				<span>Montag, 23. Dezember 2024</span>
			</button>
		</div>
		<div class="demo-inline" style="margin-top: 0.5rem;">
			<button class="tt-action-title">
				<span>KW 52 · 23.12 – 29.12</span>
			</button>
		</div>
	</section>

	<!-- Section Titles -->
	<section class="section">
		<h2>Section Titles (Excel: Section-title)</h2>

		<h3>Simple Section Title</h3>
		<div class="demo-stack">
			<div class="tt-section-title">
				<span>VORSCHLÄGE</span>
			</div>
			<div class="tt-section-title">
				<span>ARBEITGEBER</span>
				<button class="tt-section-title__action" aria-label="Hinzufügen">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
				</button>
			</div>
		</div>

		<h3>Expandable Section Title</h3>
		<p class="tt-text-muted">
			Simple text with chevron — no card background, like simple section title.
		</p>
		<div class="demo-stack">
			<button class="tt-section-title-expandable">
				<svg
					class="tt-section-title-expandable__icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
				<span>ZEITEN</span>
			</button>
			<button class="tt-section-title-expandable is-expanded">
				<svg
					class="tt-section-title-expandable__icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
				<span>EINTRÄGE</span>
			</button>
		</div>
	</section>

	<!-- Navigation Components -->
	<section class="section">
		<h2>Navigation Components</h2>

		<h3>Direction Buttons (Zurück/Vor)</h3>
		<p class="tt-text-muted">Navigate between days, weeks, months. Same style as symbol buttons.</p>
		<div class="demo-inline">
			<button class="tt-nav-direction" aria-label="Zurück">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
			<button class="tt-nav-direction" aria-label="Vor">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</div>

		<h3>Period Navigation - Variant A: Text Next to Buttons</h3>
		<p class="tt-text-muted">Icon buttons with text label between them.</p>
		<div class="demo-inline">
			<button class="tt-symbol-button" aria-label="Vorheriger Tag">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
			<span style="padding: 0 var(--tt-space-8); font-weight: 600;">Mo 23.12</span>
			<button class="tt-symbol-button" aria-label="Nächster Tag">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</div>

		<h3>Period Navigation - Variant B: Text Inside Buttons (Preferred)</h3>
		<p class="tt-text-muted">Icon + text combined. Day = "Mo", Week = "52", Month = "Dez".</p>
		<div class="demo-inline">
			<button
				class="tt-button-secondary"
				style="gap: var(--tt-space-4); padding: var(--tt-space-8) var(--tt-space-12);"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				<span>Mo</span>
			</button>
			<button
				class="tt-button-secondary"
				style="gap: var(--tt-space-4); padding: var(--tt-space-8) var(--tt-space-12);"
			>
				<span>Mo</span>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</div>
		<div class="demo-inline" style="margin-top: var(--tt-space-8);">
			<button
				class="tt-button-secondary"
				style="gap: var(--tt-space-4); padding: var(--tt-space-8) var(--tt-space-12);"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				<span>52</span>
			</button>
			<button
				class="tt-button-secondary"
				style="gap: var(--tt-space-4); padding: var(--tt-space-8) var(--tt-space-12);"
			>
				<span>52</span>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</div>
		<div class="demo-inline" style="margin-top: var(--tt-space-8);">
			<button
				class="tt-button-secondary"
				style="gap: var(--tt-space-4); padding: var(--tt-space-8) var(--tt-space-12);"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				<span>Dez</span>
			</button>
			<button
				class="tt-button-secondary"
				style="gap: var(--tt-space-4); padding: var(--tt-space-8) var(--tt-space-12);"
			>
				<span>Dez</span>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</div>

		<h3>Footer Tab Navigation</h3>
		<p class="tt-text-muted">
			Dark background footer with tab-style links. Uses <code>aria-current="page"</code> for current tab.
		</p>
		<p class="tt-text-muted" style="font-style: italic;">
			States: Default (border visible) → Pressed (lightest) → Current (lighter, persistent)
		</p>
		<div class="demo-stack">
			<nav class="tt-footer-nav" style="border-radius: var(--tt-radius-card);">
				<a href="#" class="tt-footer-tab tt-footer-tab--plus">+</a>
				<a href="#" class="tt-footer-tab">Tag</a>
				<a href="#" class="tt-footer-tab" aria-current="page">Woche</a>
				<a href="#" class="tt-footer-tab">Monat</a>
				<a href="#" class="tt-footer-tab">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="20" x2="18" y2="10"></line>
						<line x1="12" y1="20" x2="12" y2="4"></line>
						<line x1="6" y1="20" x2="6" y2="14"></line>
					</svg>
				</a>
			</nav>
		</div>
	</section>

	<!-- Form Elements -->
	<section class="section">
		<h2>Form Elements (Excel: Dropdown, TextInput)</h2>

		<h3>Dropdown</h3>
		<div class="demo-inline">
			<select class="tt-dropdown">
				<option>Kirche</option>
				<option>Privat</option>
				<option>Freelance</option>
			</select>
			<select class="tt-dropdown">
				<option>Arbeitstag</option>
				<option>Feiertag</option>
				<option>Urlaub</option>
			</select>
		</div>

		<h3>Text Input</h3>
		<div style="max-width: 300px;">
			<input type="text" class="tt-text-input" placeholder="Einträge filtern..." />
		</div>

		<h3>Dropdown Layout Options (Tagesart Example)</h3>
		<p class="tt-text-muted">
			Different ways to handle label + dropdown alignment. Which one works best for the Day page?
		</p>

		<h4>Option A: Fixed-Width Label</h4>
		<p class="tt-text-muted">Label has fixed width, dropdown aligns consistently.</p>
		<div class="demo-stack" style="max-width: 400px;">
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="width: 80px; flex-shrink: 0; color: var(--tt-text-secondary);">Tagesart:</span>
				<select class="tt-dropdown" style="flex: 1;">
					<option>Arbeitstag</option>
					<option>Urlaub</option>
					<option>Krank</option>
					<option>Feiertag</option>
				</select>
			</div>
		</div>

		<h4>Option B: Label Left, Dropdown Right</h4>
		<p class="tt-text-muted">Label and dropdown at opposite ends, space between.</p>
		<div class="demo-stack" style="max-width: 400px;">
			<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
				<span style="color: var(--tt-text-secondary);">Tagesart</span>
				<select class="tt-dropdown" style="width: auto;">
					<option>Arbeitstag</option>
					<option>Urlaub</option>
					<option>Krank</option>
					<option>Feiertag</option>
				</select>
			</div>
		</div>

		<h4>Option C: No Label (Self-Explanatory)</h4>
		<p class="tt-text-muted">Dropdown spans full width, selected value is self-explanatory.</p>
		<div class="demo-stack" style="max-width: 400px;">
			<select class="tt-dropdown" style="width: 100%;">
				<option>Arbeitstag</option>
				<option>Urlaub</option>
				<option>Krank</option>
				<option>Feiertag</option>
			</select>
		</div>

		<h4>Option D: Label Inside Options</h4>
		<p class="tt-text-muted">Label is part of each option text, no separate label needed.</p>
		<div class="demo-stack" style="max-width: 400px;">
			<select class="tt-dropdown" style="width: 100%;">
				<option>Tagesart: Arbeitstag</option>
				<option>Tagesart: Urlaub</option>
				<option>Tagesart: Krank</option>
				<option>Tagesart: Feiertag</option>
			</select>
		</div>

		<h4>Option E: Label + Dropdown Inside Card Row</h4>
		<p class="tt-text-muted">
			Both label and dropdown wrapped in a static row with background. Looks like a settings row.
		</p>
		<div class="demo-stack" style="max-width: 400px;">
			<div class="tt-list-row-static" style="justify-content: space-between;">
				<span>Tagesart</span>
				<select class="tt-dropdown" style="width: auto;">
					<option>Arbeitstag</option>
					<option>Urlaub</option>
					<option>Krank</option>
					<option>Feiertag</option>
				</select>
			</div>
		</div>
	</section>

	<!-- Color Tokens -->
	<section class="section">
		<h2>Color Tokens</h2>

		<h3>Brand Primary (Blue) — Full Scale</h3>
		<p class="tt-text-muted">Used for: header, footer, primary buttons, links, focus rings.</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-brand-primary-50);">
				<span style="color: var(--tt-text-primary);">50</span>
				<code style="color: var(--tt-text-muted);">#e8e8f8</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-100);">
				<span style="color: var(--tt-text-primary);">100</span>
				<code style="color: var(--tt-text-muted);">#c5c5ed</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-200);">
				<span style="color: var(--tt-text-primary);">200</span>
				<code style="color: var(--tt-text-muted);">#9e9fe0</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-300);">
				<span>300</span>
				<code>#7475d3</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-pressed);">
				<span>Pressed</span>
				<code>#4a4bc5</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary);">
				<span>Base</span>
				<code>#2526a9</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-darker);">
				<span>Darker</span>
				<code>#1e1f8a</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-primary-darkest);">
				<span>Darkest</span>
				<code>#171868</code>
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
				<code style="color: var(--tt-text-muted);">#e6f7fe</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-100);">
				<span style="color: var(--tt-text-primary);">100</span>
				<code style="color: var(--tt-text-muted);">#b8e9fc</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-200);">
				<span style="color: var(--tt-text-primary);">200</span>
				<code style="color: var(--tt-text-muted);">#8adafa</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent);">
				<span style="color: var(--tt-text-primary);">Base</span>
				<code style="color: var(--tt-text-muted);">#37bdf6</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-darker);">
				<span>Darker</span>
				<code>#1aa8e6</code>
			</div>
			<div class="color-scale-item" style="background: var(--tt-brand-accent-darkest);">
				<span>Darkest</span>
				<code>#0d8ac4</code>
			</div>
		</div>

		<h3>Semantic States</h3>
		<p class="tt-text-muted">Each semantic color has base + pressed + faded variants.</p>

		<p class="tt-text-muted" style="margin-top: 1rem;">
			<strong>Danger</strong> — Destructive actions (delete), errors, validation failures
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-status-danger-faded);">
				<span style="color: var(--tt-status-danger);">Faded</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-danger-pressed);">
				<span>Pressed</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-danger);">
				<span>Base</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-danger-darker);">
				<span>Darker</span>
			</div>
		</div>

		<p class="tt-text-muted" style="margin-top: 1rem;">
			<strong>Negative</strong> — Soft red for indicators (minus hours, deficits, badges)
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-status-negative-faded);">
				<span style="color: var(--tt-status-negative-text);">Faded</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-negative);">
				<span>Base</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-negative-text);">
				<span>Text</span>
			</div>
		</div>

		<p class="tt-text-muted" style="margin-top: 1rem;">
			<strong>Success</strong> — Positive outcomes, confirmations
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-status-success-faded);">
				<span style="color: var(--tt-status-success);">Faded</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-success-pressed);">
				<span>Pressed</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-success);">
				<span>Base</span>
			</div>
		</div>

		<p class="tt-text-muted" style="margin-top: 1rem;">
			<strong>Warning</strong> — Caution, attention needed
		</p>
		<div class="color-scale">
			<div class="color-scale-item" style="background: var(--tt-status-warning-faded);">
				<span style="color: var(--tt-status-warning);">Faded</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-warning-pressed);">
				<span>Pressed</span>
			</div>
			<div class="color-scale-item" style="background: var(--tt-status-warning);">
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
</div>

<style>
	.styleguide {
		padding: 1rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.styleguide-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--tt-border-default);
	}

	.styleguide-header h1 {
		margin: 0 0 0.5rem;
		color: var(--tt-brand-primary);
	}

	.section {
		margin-bottom: 2.5rem;
	}

	.section h2 {
		color: var(--tt-text-primary);
		border-bottom: 2px solid var(--tt-brand-primary);
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
