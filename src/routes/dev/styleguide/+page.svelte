<!--
  StyleGuide - Dev-only page to validate design system components
  
  Route: /dev/styleguide
  
  Shows all design system components in their variants:
  - Row variants (nav/action/select/info/summary)
  - Badge variants (label/chip/employer/no-work)
  - Button variants (primary/secondary/danger/ghost)
-->
<script lang="ts">
	let selectedItem = $state<string | null>(null);
</script>

<div class="styleguide">
	<header class="styleguide-header">
		<h1>TimeTracker Design System</h1>
		<p class="tt-muted">Component reference for consistent UI development</p>
	</header>

	<!-- Row Variants -->
	<section class="section">
		<h2>Row Variants</h2>
		<p class="tt-muted">Rows are the primary container for list items. Each variant has specific affordances.</p>

		<h3>Nav Row</h3>
		<p class="tt-muted">Navigational rows with chevron signifier. Used for list navigation.</p>
		<div class="demo-stack">
			<div class="tt-row tt-row--nav" role="button" tabindex="0">
				<div class="tt-row__content">
					<span class="tt-row__title">Week 52 · 2025</span>
					<span class="tt-row__detail">23.12 – 29.12 · 40h worked</span>
				</div>
				<div class="tt-row__end">
					<span class="tt-row__chevron">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					</span>
				</div>
			</div>
			<div class="tt-row tt-row--nav" role="button" tabindex="0">
				<div class="tt-row__content">
					<span class="tt-row__title">Einstellungen</span>
				</div>
				<div class="tt-row__end">
					<span class="tt-row__chevron">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					</span>
				</div>
			</div>
		</div>

		<h3>Action Row</h3>
		<p class="tt-muted">Entry rows with play/edit actions. Used for time entries.</p>
		<div class="demo-stack">
			<div class="tt-row tt-row--action" role="button" tabindex="0">
				<div class="tt-row__content">
					<span class="tt-row__title">08:00 – 12:30</span>
					<span class="tt-row__detail">Entwicklung</span>
					<span class="tt-badge tt-badge--employer">Kirche</span>
				</div>
				<div class="tt-row__end">
					<button class="tt-row__action" aria-label="Fortsetzen">
						<span class="tt-icon-play"></span>
					</button>
					<button class="tt-btn-delete" aria-label="Löschen">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"></polyline>
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
						</svg>
					</button>
				</div>
			</div>
			<div class="tt-row tt-row--action" role="button" tabindex="0">
				<div class="tt-row__content">
					<span class="tt-row__title">13:00 – 14:00</span>
					<span class="tt-row__detail">Pause</span>
					<span class="tt-badge tt-badge--no-work">Keine Arbeitszeit</span>
				</div>
				<div class="tt-row__end">
					<button class="tt-row__action" aria-label="Fortsetzen">
						<span class="tt-icon-play"></span>
					</button>
					<button class="tt-btn-delete" aria-label="Löschen">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"></polyline>
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<h3>Select Row</h3>
		<p class="tt-muted">Selectable rows with check/radio signifier. Used for category selection.</p>
		<div class="demo-stack">
			<div 
				class="tt-row tt-row--select" 
				class:is-selected={selectedItem === 'dev'}
				role="button" 
				tabindex="0"
				onclick={() => selectedItem = selectedItem === 'dev' ? null : 'dev'}
			>
				<div class="tt-row__content">
					<span class="tt-row__title">Entwicklung</span>
				</div>
				<div class="tt-row__end">
					<span class="tt-row__selectmark">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</span>
				</div>
			</div>
			<div 
				class="tt-row tt-row--select"
				class:is-selected={selectedItem === 'meeting'}
				role="button" 
				tabindex="0"
				onclick={() => selectedItem = selectedItem === 'meeting' ? null : 'meeting'}
			>
				<div class="tt-row__content">
					<span class="tt-row__title">Meeting</span>
				</div>
				<div class="tt-row__end">
					<span class="tt-row__selectmark">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</span>
				</div>
			</div>
		</div>

		<h3>Info Row</h3>
		<p class="tt-muted">Read-only display rows. No signifier, not clickable. Used for Ist/Soll/Haben.</p>
		<div class="demo-stack">
			<div class="tt-row tt-row--info">
				<span class="summary-item"><span class="tt-muted">Ist:</span> <strong>8,5</strong></span>
				<span class="summary-item"><span class="tt-muted">Soll:</span> <strong>8,0</strong></span>
				<span class="summary-item"><span class="tt-muted">Haben:</span> <strong class="tt-text-success">+0,5</strong></span>
			</div>
		</div>

		<h3>Summary Row</h3>
		<p class="tt-muted">Summary totals row. Not clickable, slightly emphasized.</p>
		<div class="demo-stack">
			<div class="tt-row tt-row--summary">
				<div class="tt-row__content">
					<span class="tt-row__title">Summe Dezember</span>
				</div>
				<div class="tt-row__end">
					<span><strong>168,0h</strong></span>
				</div>
			</div>
		</div>
	</section>

	<!-- Badge Variants -->
	<section class="section">
		<h2>Badge / Chip Variants</h2>
		<p class="tt-muted">Badges are small inline indicators. Chips are interactive selections.</p>

		<h3>Label Badge (read-only)</h3>
		<div class="demo-inline">
			<span class="tt-badge tt-badge--label">Standard</span>
			<span class="tt-badge tt-badge--employer">Kirche</span>
			<span class="tt-badge tt-badge--no-work">Keine Arbeitszeit</span>
		</div>

		<h3>Semantic Badges</h3>
		<div class="demo-inline">
			<span class="tt-badge tt-badge--success">Erfolg</span>
			<span class="tt-badge tt-badge--warning">Warnung</span>
			<span class="tt-badge tt-badge--danger">Fehler</span>
		</div>

		<h3>Chips (interactive)</h3>
		<div class="demo-inline">
			<button class="tt-badge tt-badge--chip">Entwicklung</button>
			<button class="tt-badge tt-badge--chip">Meeting</button>
			<button class="tt-badge tt-badge--chip is-selected">Pause</button>
		</div>
	</section>

	<!-- Button Variants -->
	<section class="section">
		<h2>Button Variants</h2>

		<h3>Standard Sizes</h3>
		<div class="demo-inline">
			<button class="tt-btn tt-btn--primary">Primary</button>
			<button class="tt-btn tt-btn--secondary">Secondary</button>
			<button class="tt-btn tt-btn--danger">Danger</button>
			<button class="tt-btn tt-btn--ghost">Ghost</button>
		</div>

		<h3>Small Size</h3>
		<div class="demo-inline">
			<button class="tt-btn tt-btn--primary tt-btn--sm">Primary SM</button>
			<button class="tt-btn tt-btn--secondary tt-btn--sm">Secondary SM</button>
			<button class="tt-btn tt-btn--danger tt-btn--sm">Danger SM</button>
		</div>

		<h3>Disabled State</h3>
		<div class="demo-inline">
			<button class="tt-btn tt-btn--primary" disabled>Disabled</button>
			<button class="tt-btn tt-btn--secondary" disabled>Disabled</button>
		</div>

		<h3>Icon Buttons</h3>
		<div class="demo-inline">
			<button class="tt-row__action" aria-label="Play">
				<span class="tt-icon-play"></span>
			</button>
			<button class="tt-btn-delete" aria-label="Delete">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="3 6 5 6 21 6"></polyline>
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
				</svg>
			</button>
		</div>
	</section>

	<!-- Utilities -->
	<section class="section">
		<h2>Utilities</h2>

		<h3>Card</h3>
		<div class="tt-card">
			<p>This is a card container with padding and border.</p>
		</div>

		<h3>Divider</h3>
		<div class="tt-card">
			<p>Content above</p>
			<div class="tt-divider"></div>
			<p>Content below</p>
		</div>

		<h3>Text Colors</h3>
		<div class="demo-inline">
			<span>Default text</span>
			<span class="tt-muted">Muted text</span>
			<span class="tt-text-primary">Primary text</span>
			<span class="tt-text-success">Success text</span>
			<span class="tt-text-danger">Danger text</span>
		</div>
	</section>

	<!-- Color Tokens -->
	<section class="section">
		<h2>Color Tokens</h2>
		<div class="color-grid">
			<div class="color-swatch" style="background: var(--tt-color-primary);">
				<span>Primary</span>
				<code>#2526A9</code>
			</div>
			<div class="color-swatch" style="background: var(--tt-color-accent);">
				<span>Accent</span>
				<code>#37BDF6</code>
			</div>
			<div class="color-swatch" style="background: var(--tt-color-bg);">
				<span style="color: var(--tt-color-text);">Background</span>
				<code style="color: var(--tt-color-text);">#E8F0F8</code>
			</div>
			<div class="color-swatch" style="background: var(--tt-color-surface); border: 1px solid var(--tt-color-border);">
				<span style="color: var(--tt-color-text);">Surface</span>
				<code style="color: var(--tt-color-text);">#FFFFFF</code>
			</div>
			<div class="color-swatch" style="background: var(--tt-color-danger);">
				<span>Danger</span>
				<code>#C53030</code>
			</div>
			<div class="color-swatch" style="background: var(--tt-color-success);">
				<span>Success</span>
				<code>#2F855A</code>
			</div>
		</div>
	</section>
</div>

<style>
	.styleguide {
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.styleguide-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--tt-color-border);
	}

	.styleguide-header h1 {
		margin: 0 0 0.5rem;
		color: var(--tt-color-primary);
	}

	.section {
		margin-bottom: 2rem;
	}

	.section h2 {
		color: var(--tt-color-text);
		border-bottom: 2px solid var(--tt-color-primary);
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
	}

	.section h3 {
		color: var(--tt-color-text-secondary);
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

	.summary-item {
		display: inline-flex;
		gap: 0.25rem;
		margin-right: 1rem;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1rem;
	}

	.color-swatch {
		padding: 1rem;
		border-radius: var(--tt-r-card);
		color: white;
		text-align: center;
	}

	.color-swatch span {
		display: block;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.color-swatch code {
		font-size: 0.75rem;
		opacity: 0.9;
	}
</style>
