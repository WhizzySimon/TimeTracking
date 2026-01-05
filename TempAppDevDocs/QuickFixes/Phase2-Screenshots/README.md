# Phase 2 Screenshots - Visual Baseline

**Purpose:** Visual baseline screenshots taken before Phase 1 CSS refactoring

**Usage:**

- Compare against current state to detect visual regressions
- Reference for component grouping and similarity analysis
- Guide base class extraction decisions in Phase 2

---

## Screenshot Organization

### Main Pages (5 screenshots)

Place screenshots here with these filenames:

1. `01-add-page.png` - Add page with category list
2. `02-week-page.png` - Week view KW 1/2026
3. `03-analysis-page.png` - Analysis view with date range
4. `04-month-page.png` - Month view Januar 2026
5. `05-day-page.png` - Day view So 4.1.2026

### Dialogs & Settings (5 screenshots)

6. `06-settings-sections.png` - Settings with Tätigkeiten expanded
7. `07-worktime-modal.png` - AddWorkTimeModelModal dialog
8. `08-plan-selection.png` - Plan selection dialog (paywall)
9. `09-settings-account.png` - Settings account section
10. `10-settings-expanded.png` - Settings with multiple sections expanded

---

## Reference Document

See `CSS-Phase2-Visual-Reference.md` for detailed analysis of each screenshot, including:

- Visual elements identified
- Component grouping
- CSS classes to verify
- Known issues
- Phase 2 actions

---

## Instructions for Phase 2 Agent

1. **Before making changes:**
   - Review all screenshots to understand current visual state
   - Read component grouping analysis in reference document
   - Identify which classes should share base styles

2. **During refactoring:**
   - Compare browser preview against these screenshots
   - Ensure no visual regressions
   - Verify identical elements remain identical (Zusammenfassung, employer labels, etc.)

3. **After changes:**
   - Take new screenshots of same views
   - Compare side-by-side with these baseline screenshots
   - Check all regression checkpoints

---

**Note:** Screenshots should be placed in this folder by the user before starting Phase 2.
