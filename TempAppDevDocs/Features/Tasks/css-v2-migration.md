# css-v2-migration - Tasks

**Phase:** CSS-v2  
**Created:** 2026-01-02  
**Last Updated:** 2026-01-02  
**Based on Spec:** `TempAppDevDocs/Features/Specs/css-v2-migration.md`  
**Based on Plan:** `TempAppDevDocs/Features/Plans/css-v2-migration.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task 1 - Day Page Migration

- **Files:**
  - `src/routes/day/+page.svelte`
  - `src/lib/components/TaskItem.svelte` (time entry row)
- **Done when:**
  - All time entry rows use `.tt-list-row-clickable`
  - Summary display uses `.tt-list-row-static` or `.tt-summary-display`
  - Action buttons use `.tt-symbol-button`
  - Inline labels use `.tt-inline-label-*`
  - Component `<style>` block reduced to layout-only CSS
- **Verify:**
  - `npm run check`
  - Manual: Compare Day page before/after screenshot
  - Manual: Click entry → pressed state visible
  - Manual: Tab focus → focus ring visible
- **Guardrails:**
  - Must not change component logic
  - Must preserve all existing functionality
- **Parallel:**
- **Estimated:** 1.5h

---

## Task 2 - Week Page Migration

- **Files:**
  - `src/routes/week/+page.svelte`
- **Done when:**
  - Day rows use `.tt-list-row-clickable`
  - Summary uses `.tt-summary-display`
  - Navigation uses existing `.tt-nav-direction` or `.tt-button-secondary`
  - Component `<style>` block reduced to layout-only CSS
- **Verify:**
  - `npm run check`
  - Manual: Compare Week page before/after screenshot
  - Manual: Click day row → pressed state visible
- **Guardrails:**
  - Must not change navigation logic
- **Parallel:**
- **Estimated:** 1h

---

## Task 3 - Month Page Migration

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/routes/month/+page.svelte`
- **Done when:**
  - Week rows use `.tt-list-row-clickable`
  - Summary uses `.tt-summary-display`
  - Component `<style>` block reduced to layout-only CSS
- **Verify:**
  - `npm run check`
  - Manual: Compare Month page before/after screenshot
- **Guardrails:**
  - Must not change navigation logic
- **Parallel:**
- **Estimated:** 1h

---

## Task 4 - Add Page Migration

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/routes/add/+page.svelte`
  - `src/lib/components/CategorySelect.svelte`
- **Done when:**
  - Category chips use `.tt-chip` with `.is-selected` state
  - Suggestion rows use `.tt-list-row-clickable`
  - Primary action button uses `.tt-button-primary`
  - Text input uses `.tt-text-input`
  - Component `<style>` blocks reduced to layout-only CSS
- **Verify:**
  - `npm run check`
  - Manual: Compare Add page before/after screenshot
  - Manual: Click chip → selected state toggles correctly
  - Manual: Click suggestion → pressed state visible
- **Guardrails:**
  - Must preserve chip selection logic
  - Must preserve form submission
- **Parallel:**
- **Estimated:** 1.5h

---

## Task 5 - Settings Page Migration (Part 1: Categories)

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/routes/settings/+page.svelte`
  - `src/lib/components/CategoryList.svelte`
- **Done when:**
  - Category items use `.tt-list-row-clickable` or `.tt-list-row-static`
  - Delete buttons use `.tt-symbol-button` or `.tt-btn-delete`
  - Section titles use `.tt-section-title` or `.tt-section-title-expandable`
  - Inline labels use `.tt-inline-label-*`
- **Verify:**
  - `npm run check`
  - Manual: Categories section renders correctly
  - Manual: Click category → pressed state / dialog opens
- **Guardrails:**
  - Must preserve edit/delete functionality
- **Parallel:**
- **Estimated:** 1.5h

---

## Task 6 - Settings Page Migration (Part 2: Employers & Models)

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/routes/settings/+page.svelte`
  - `src/lib/components/EmployerDialog.svelte`
  - `src/lib/components/AddWorkTimeModelModal.svelte`
- **Done when:**
  - Employer rows use `.tt-list-row-clickable`
  - Work time model rows use `.tt-list-row-clickable`
  - Dialog buttons use `.tt-button-*` classes
  - Form inputs use `.tt-text-input` and `.tt-dropdown`
- **Verify:**
  - `npm run check`
  - Manual: Employer section renders correctly
  - Manual: Work time model section renders correctly
  - Manual: Dialogs open and function correctly
- **Guardrails:**
  - Must preserve all CRUD operations
- **Parallel:**
- **Estimated:** 1.5h

---

## Task 7 - Settings Page Migration (Part 3: Account & Cleanup)

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/routes/settings/+page.svelte`
- **Done when:**
  - Account section uses `.tt-section-title`
  - Danger buttons use `.tt-button-danger`
  - All remaining component styles moved to design system
  - Remove unused CSS selectors flagged by svelte-check
- **Verify:**
  - `npm run check` — no unused CSS warnings for settings page
  - Manual: Account section renders correctly
  - Manual: Danger buttons show correct pressed state
- **Guardrails:**
  - Must preserve logout/delete functionality
- **Parallel:**
- **Estimated:** 1h

---

## Task 8 - Analysis Page Migration

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/routes/analysis/+page.svelte`
- **Done when:**
  - Expandable sections use `.tt-section-title-expandable`
  - Time entries use `.tt-list-row-clickable`
  - Summary row uses `.tt-list-row-static`
  - Date picker trigger uses `.tt-action-title`
- **Verify:**
  - `npm run check`
  - Manual: Compare Analysis page before/after screenshot
  - Manual: Expandable sections toggle correctly
- **Guardrails:**
  - Must preserve date range selection
  - Must preserve expandable section state
- **Parallel:**
- **Estimated:** 1.5h

---

## Task 9 - Layout Migration (Header)

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/routes/+layout.svelte`
  - `src/lib/components/EmployerSelector.svelte`
- **Done when:**
  - Header uses design system colors and spacing
  - Employer selector dropdown uses `.tt-dropdown` or custom header styling
  - Sync/Profile buttons use `.tt-symbol-button`
  - Back button uses `.tt-symbol-button` or `.tt-nav-direction`
- **Verify:**
  - `npm run check`
  - Manual: Header renders correctly on all pages
  - Manual: Employer selector works correctly
- **Guardrails:**
  - Must preserve navigation functionality
  - Must preserve employer filtering
- **Parallel:**
- **Estimated:** 1h

---

## Task 10 - Layout Migration (Footer TabNavigation)

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/lib/components/TabNavigation.svelte`
- **Done when:**
  - Footer uses `.tt-footer-nav` container
  - Tabs use `.tt-footer-tab` with `aria-current="page"`
  - Plus tab uses `.tt-footer-tab--plus` variant
  - Remove component-scoped CSS, use design system only
- **Verify:**
  - `npm run check`
  - Manual: Footer renders correctly
  - Manual: Current tab shows persistent highlight
  - Manual: Press tab → pressed state visible
- **Guardrails:**
  - Must preserve navigation functionality
  - Must preserve accessibility (aria-current)
- **Parallel:**
- **Estimated:** 0.5h

---

## Task 11 - Cleanup & Verification

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `src/lib/styles/theme.css` (remove deprecated styles)
  - All migrated components
- **Done when:**
  - theme.css contains only global resets and CSS variables
  - No component uses both old and new CSS systems
  - `npm run check` shows no unused CSS warnings for migrated files
  - All E2E tests pass
- **Verify:**
  - `npm run check`
  - `npm run test:e2e` (if available)
  - Manual: Full app walkthrough on mobile viewport
- **Guardrails:**
  - Only remove CSS that has been replaced
  - Keep CSS variables that are still referenced
- **Parallel:**
- **Estimated:** 1h

---

## Summary

| Task | Page/Area    | Estimated |
| ---- | ------------ | --------- |
| 1    | Day          | 1.5h      |
| 2    | Week         | 1h        |
| 3    | Month        | 1h        |
| 4    | Add          | 1.5h      |
| 5    | Settings (1) | 1.5h      |
| 6    | Settings (2) | 1.5h      |
| 7    | Settings (3) | 1h        |
| 8    | Analysis     | 1.5h      |
| 9    | Header       | 1h        |
| 10   | Footer       | 0.5h      |
| 11   | Cleanup      | 1h        |
|      | **Total**    | **13h**   |

---

## How to Start a Task

1. Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
2. Open the target page in browser, take "before" screenshot
3. Read current component CSS to understand what needs mapping
4. Apply tt-\* classes per COMPONENT-MAPPING-CSS.md
5. Remove replaced component CSS
6. Verify visually, run `npm run check`
7. Commit when page is complete
