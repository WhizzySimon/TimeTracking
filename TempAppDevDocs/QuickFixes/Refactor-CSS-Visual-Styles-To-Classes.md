# Refactor: Extract Visual Styles to CSS Classes

**Status:** Ready to start  
**Created:** 2026-01-05  
**Type:** Architecture refactoring (2 phases)  
**Estimated Effort:** Large (all components)  

---

## Context & Problem

The TimeTracker app currently has visual styling split between two locations:
1. **Global CSS** (`src/lib/styles/tt-design-system.css`) — Design system classes
2. **Component `<style>` tags** — Mix of layout AND visual styling

**Problem:** This creates a "where do I look?" issue. Developers don't know if styling is in the component or the CSS file.

**Recent work:** We just completed a hover state refactoring that introduced unified classes (`.tt-interactive-card`, `.tt-interactive-dark`, `.tt-interactive-accent`) to solve CSS specificity issues with Svelte's scoped styles.

---

## Decision: Unified CSS Architecture

After researching industry best practices (ITCSS, BEM + Utility Classes, design systems), we decided:

### **Rule: All Visual Styling → CSS Classes**

**Visual styling includes:**
- Colors (text, background, border)
- Typography (font-size, font-weight, line-height)
- Borders, shadows, border-radius
- Hover/active/focus states
- Transitions and animations
- Visual decorations

**Component `<style>` tags keep only:**
- Layout (flex, grid, positioning)
- Spacing (padding, margin, gap) — *can be extracted later if needed*
- Structural CSS (display, overflow, z-index)

### Benefits
1. **Single source of truth** — All visual styling in one place
2. **Searchable** — `grep .tt-button` finds all button styling
3. **Consistent** — Same pattern everywhere
4. **Documentable** — CSS file IS the visual documentation
5. **No "where do I look?" confusion**

---

## Two-Phase Approach

### Phase 1: Extract Visual Styles (Component by Component)
**Goal:** Move visual styles from component `<style>` tags to `.tt-*` classes

**Process per component:**
1. Read component file
2. Identify visual styles in `<style>` tag
3. Create/update `.tt-component-name` class in `tt-design-system.css`
4. Replace local styles with class in component HTML
5. Remove extracted styles from `<style>` tag
6. Test in browser

**Recommended model:** Sonnet 4 (mechanical extraction, systematic file editing)

**Output:** All components use CSS classes for visual styling

### Phase 2: Refactor CSS Organization
**Goal:** Optimize and organize classes within `tt-design-system.css`

**Actions:**
- Group similar patterns (buttons, cards, rows, etc.)
- Extract common patterns into shared classes
- Identify and remove duplication
- Add documentation comments
- Organize by ITCSS-like layers (if beneficial)

**Recommended model:** Opus 4 Thinking (pattern recognition, architectural decisions)

**Output:** Clean, organized, well-documented design system CSS

---

## Current State

### Design System Classes Already Exist
The following patterns are already implemented as CSS classes:

| Pattern | Class | Status |
|---------|-------|--------|
| Interactive hover (transparent) | `.tt-interactive` | ✓ Working |
| Interactive hover (card bg) | `.tt-interactive-card` | ✓ Working |
| Interactive hover (dark bg) | `.tt-interactive-dark` | ✓ Working |
| Interactive hover (accent bg) | `.tt-interactive-accent` | ✓ Working |
| Interactive hover (danger) | `.tt-interactive-danger` | ✓ Working |
| Clickable list row | `.tt-list-row-clickable` | ✓ Working |
| List row content | `.tt-list-row__content-compact` | ✓ Working |
| List row time | `.tt-list-row__time` | ✓ Working |
| List row category | `.tt-list-row__category` | ✓ Working |
| List row actions | `.tt-list-row__actions` | ✓ Working |
| Primary button | `.tt-button-primary` | ✓ Working |
| Small button | `.tt-button-small` | ✓ Working |
| Symbol button | `.tt-symbol-button` | ⚠️ Needs hover audit |
| Delete button | `.tt-delete-button` | ⚠️ Needs hover audit |
| Chip/pill | `.tt-chip` | ✓ Working |
| Summary display | `.tt-summary-display` | ✓ Working |
| Labeled dropdown | `.tt-labeled-dropdown` | ✓ Working |
| Date selector button | `.tt-date-selector-button` | ⚠️ Verify exists |
| Inline employer label | `.tt-inline-label-employer` | ✓ Working |
| Inline no-work label | `.tt-inline-label-no-work` | ✓ Working |

### Components Needing Extraction

**Pages:**
- `src/routes/day/+page.svelte` — Nav buttons, date title
- `src/routes/week/+page.svelte` — Similar nav pattern
- `src/routes/month/+page.svelte` — Similar nav pattern
- `src/routes/add/+page.svelte` — Category list, suggestions
- `src/routes/analysis/+page.svelte` — Charts, summaries
- `src/routes/settings/+page.svelte` — Form controls, sections
- `src/routes/+layout.svelte` — Header, footer tabs

**Components (all in `src/lib/components/`):**
- `AddTaskModal.svelte`
- `ConfirmDialog.svelte`
- `DayPicker.svelte`
- `CustomDropdown.svelte` — Already partially refactored
- `BackButton.svelte` — Already refactored
- `ForwardButton.svelte` — Already refactored
- `TaskItem.svelte` — Already refactored
- All import flow components (`src/lib/components/import/`)
- All other components

---

## Audit Started

An audit document was started at `TempAppDevDocs/Audits/ui-element-audit.md` covering the Day page. It documents:
- All UI elements on the page
- Current styling approach (local CSS, design system class, or both)
- Status (✓ OK, ⚠️ Needs attention, ❌ Broken)
- Recommendations

**Format example:**
```markdown
| Element | Type | Current Styling | Design System Class | Status | Notes |
|---------|------|-----------------|---------------------|--------|-------|
| `.nav-btn` | Button | Local CSS + `.tt-interactive-card` | `.tt-interactive-card` | ⚠️ Partial | Has local border/sizing, hover via class |
```

The audit should be completed for all pages and components to identify all extraction work needed.

---

## Key Architectural Decisions

### 1. Svelte CSS Scoping Issue
**Problem:** Svelte adds hash classes (`.my-btn.svelte-abc123`) which increases specificity, causing local CSS to override global classes.

**Solution:** Use composite classes that bundle base background + hover states:
- `.tt-interactive-card` = white background + hover overlay
- `.tt-interactive-dark` = transparent + white overlay (for dark headers)
- `.tt-interactive-accent` = accent-100 + accent-200 hover

**Rule:** When using `.tt-interactive-*` classes, **never set local `background`** in component CSS.

**Documented in:** `DevFramework/JustInTimeAgentRules/frontend-ui-standards.md` (section "Svelte-Specific: CSS Scoping & Hover States")

### 2. CSS Variables Are Orthogonal
CSS variables (`--tt-*`) are a separate system that works at a lower level:
- Used inside classes, components, and one-off styles
- Provide semantic tokens (colors, spacing, typography, etc.)
- Already well-established in the project

### 3. Component Naming Convention
All design system classes use `.tt-*` prefix:
- `.tt-button-primary` — Component class
- `.tt-interactive-card` — Behavior class
- `.tt-list-row__time` — BEM element class
- `.tt-summary-display__value-positive` — BEM modifier class

---

## Testing Strategy

After each component extraction:
1. **Visual test in browser** — Does it look the same?
2. **Hover test** — Do interactive states work?
3. **Responsive test** — Does it work on mobile?

After Phase 1 complete:
1. **Full app walkthrough** — Test all pages and flows
2. **Compare before/after screenshots** — Verify no visual regressions

---

## Files to Reference

### Design System
- `src/lib/styles/tt-design-system.css` — All CSS classes

### Documentation
- `DevFramework/JustInTimeAgentRules/frontend-ui-standards.md` — UI standards, Svelte CSS scoping
- `TempAppDevDocs/Audits/ui-element-audit.md` — Element inventory (in progress)
- `TempAppDevDocs/Refactoring/hover-state-refactoring.md` — Previous hover refactoring notes

### Key Components Already Refactored
- `src/lib/components/BackButton.svelte`
- `src/lib/components/ForwardButton.svelte`
- `src/lib/components/TaskItem.svelte`
- `src/lib/components/CustomDropdown.svelte`
- `src/routes/+layout.svelte` (header buttons)

---

## Phase 1 Execution Plan

### Step 1: Start Small (Test the Process)
Pick a simple component to validate the extraction process:
- **Candidate:** `InlineSummary.svelte` (already mostly uses classes)
- Extract any remaining visual styles
- Document the process
- Get user approval before continuing

### Step 2: Systematic Extraction
Work through components in order of complexity:
1. **Simple components** (buttons, labels, chips)
2. **Medium components** (dropdowns, modals, cards)
3. **Complex components** (pickers, import flow, analysis charts)
4. **Pages** (Day, Week, Month, Add, Analysis, Settings)
5. **Layout** (header, footer)

### Step 3: Track Progress
Update a checklist in this document or the audit document showing:
- [ ] Component name
- [ ] Visual styles extracted
- [ ] Tested in browser
- [ ] Status (✓ Done, ⚠️ Issues, ❌ Blocked)

---

## Phase 2 Execution Plan

### Step 1: Analyze Patterns
Read all classes in `tt-design-system.css` and identify:
- Duplicate patterns
- Similar classes that could be unified
- Missing abstractions
- Inconsistent naming

### Step 2: Group and Organize
Reorganize the CSS file into logical sections:
```css
/* ==========================================================================
   DESIGN SYSTEM FOUNDATION
   ========================================================================== */

/* CSS Variables (already organized) */

/* ==========================================================================
   INTERACTIVE STATES
   ========================================================================== */

/* .tt-interactive-* classes */

/* ==========================================================================
   BUTTONS
   ========================================================================== */

/* .tt-button-* classes */

/* ==========================================================================
   FORM CONTROLS
   ========================================================================== */

/* .tt-input-*, .tt-dropdown-*, etc. */

/* ... and so on ... */
```

### Step 3: Refactor and Optimize
- Merge duplicate classes
- Extract common patterns
- Add documentation comments
- Ensure consistent naming

### Step 4: Update Documentation
Update `frontend-ui-standards.md` with:
- Complete class reference
- Usage guidelines
- When to create new classes vs. use existing

---

## Success Criteria

### Phase 1 Complete When:
- [ ] All components have visual styles extracted to CSS classes
- [ ] No visual styling remains in component `<style>` tags (except layout/spacing)
- [ ] All components tested and working in browser
- [ ] No visual regressions

### Phase 2 Complete When:
- [ ] CSS classes are organized into logical sections
- [ ] No duplicate or redundant classes
- [ ] All classes documented with comments
- [ ] Design system is easy to navigate and understand
- [ ] Documentation updated

---

## Notes for Next Agent

1. **Start with Phase 1** — Don't jump to Phase 2
2. **Work component by component** — Don't try to do everything at once
3. **Test after each component** — Catch issues early
4. **Use the audit document** — It has the inventory of what needs extraction
5. **Follow the existing patterns** — Look at already-refactored components as examples
6. **When in doubt, create a class** — Even for "one-off" elements
7. **Preserve layout CSS** — Don't extract flex/grid/positioning to classes (unless it's a reusable pattern)
8. **Watch for Svelte scoping issues** — Remember the composite class pattern for hover states

---

## Questions to Resolve

1. Should spacing (padding, margin, gap) be extracted to utility classes or stay in components?
   - **Current decision:** Keep in components for now, can extract later if needed
2. Should we create a `.tt-nav-button` class for the prev/next buttons that appear on Day/Week/Month pages?
   - **Pending:** Wait for audit to confirm they're identical
3. Should we adopt a strict ITCSS layer structure or keep the current flat organization?
   - **Decision:** Decide in Phase 2 after seeing all classes

---

## Related Work

- **Hover state refactoring** (completed 2026-01-04) — Created `.tt-interactive-*` classes
- **UI element audit** (in progress) — Inventorying all elements and their styling
- **Frontend UI standards documentation** (updated) — Added Svelte CSS scoping section

---

## Commit Strategy

- **After Phase 1:** Commit with message like "refactor(css): Extract visual styles to design system classes"
- **After Phase 2:** Commit with message like "refactor(css): Organize and optimize design system classes"

Do NOT commit in the middle of Phase 1 unless there's a natural breaking point (e.g., all simple components done).
