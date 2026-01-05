# Single-Use Component Styles

**Purpose:** Track component-specific CSS that remains local (not extracted to design system)

**Guidelines:**
- Single-use layouts unique to one component
- Must use CSS variables (prefer semantic variables like `--tt-space-16`, `--tt-text-primary`)
- Must include comment marking as "Single-use" or "Component-specific"
- Helps identify potential siblings when creating similar components

## Components with Single-Use Styles

### ImportExcelModal
**File:** `src/lib/components/ImportExcelModal.svelte`
**Single-use styles:**
- `.import-grid` - 3-column grid layout for import preview
- `.preview-table` - Table structure for data preview
- `.column-mapping` - Unique column mapping interface

**Comment example:**
```css
/* Single-use: Import modal grid layout - unique to ImportExcelModal */
.import-grid {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: var(--tt-space-16);
}
```

### StundenzettelExport
**File:** `src/lib/components/StundenzettelExport.svelte`
**Single-use styles:**
- `.export-form-grid` - Form layout specific to export modal
- `.column-selector` - Checkbox grid for column selection

### (Add more as discovered during Phase 1)

---

**Note:** If a pattern appears in 3+ components, consider extracting to design system in Phase 2.
