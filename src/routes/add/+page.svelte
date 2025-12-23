<!--
  Plus-Tab - Quick task start view
  
  Spec refs:
  - Docs/Specs/P07-20251223-quick-start-ux.md (Phase 8)
  
  Features:
  1. Smart suggestions (Top 5 based on context)
  2. Full category list (A-Z)
  3. One-click task start
-->
<script lang="ts">
	// Placeholder - will be implemented in subsequent tasks
</script>

<div class="add-page">
	<h1>Aufgabe starten</h1>
	<p class="placeholder">Plus-Tab Inhalt wird in den folgenden Tasks implementiert.</p>
</div>

<style>
	.add-page {
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	h1 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: var(--text-primary, #1f2937);
	}

	.placeholder {
		color: var(--text-secondary, #6b7280);
		font-style: italic;
	}

	:global(.dark) h1 {
		color: var(--text-primary-dark, #f3f4f6);
	}

	:global(.dark) .placeholder {
		color: var(--text-secondary-dark, #9ca3af);
	}
</style>
