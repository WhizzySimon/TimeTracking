# P13: Category Editing & Colors - Tasks

**Spec:** `Docs/Specs/P13-category-editing.md`
**Status:** Ready for implementation
**Estimated:** 4-5 hours total

## Task 13.1: Add Color Field to Category Data Model

**Files:** `src/lib/types.ts`, `src/lib/storage/db.ts`
**Estimate:** 30 min

**Done when:**

- Category type has optional `color?: string` field
- IndexedDB schema version bumped
- Migration handles existing categories (color = undefined)

**Verification:**

- `npm run verify` passes
- Existing categories load without error
- New categories can have color field

---

## Task 13.2: Create EditCategoryModal Component

**Files:** `src/lib/components/EditCategoryModal.svelte`
**Estimate:** 45 min

**Done when:**

- Modal shows category name (editable input)
- Toggle for "Zahlt als Arbeitszeit"
- Save and Cancel buttons
- Only for user categories (isSystem = false)

**Verification:**

- Open modal, edit name, save
- Category name updated in list
- Toggle persists correctly

---

## Task 13.3: Add Color Picker to Edit Modal

**Files:** `src/lib/components/EditCategoryModal.svelte`, `src/lib/components/ColorPicker.svelte`
**Estimate:** 45 min

**Done when:**

- Color picker component with 8 preset colors
- Selected color shown with checkmark
- "No color" option available
- Color saved with category

**Verification:**

- Select color, save, color persists
- Select "no color", color cleared

---

## Task 13.4: Wire Edit Modal to Settings Page

**Files:** `src/routes/settings/+page.svelte`
**Estimate:** 30 min

**Done when:**

- Clicking user category opens EditCategoryModal
- System categories show no edit affordance
- After save, list updates immediately

**Verification:**

- Click category -> modal opens
- Edit and save -> list reflects change
- System category not editable

---

## Task 13.5: Display Category Color in Task List

**Files:** `src/lib/components/TaskItem.svelte`
**Estimate:** 30 min

**Done when:**

- TaskItem has colored left border if category has color
- Border is 4px wide, category color
- No border if category has no color

**Verification:**

- Task with colored category shows border
- Task with uncolored category shows no border

---

## Task 13.6: Add Color to AddCategoryModal

**Files:** `src/lib/components/AddCategoryModal.svelte`
**Estimate:** 20 min

**Done when:**

- New category form includes color picker
- Default is "no color"
- Color saved on create

**Verification:**

- Create category with color
- Color appears in settings list

---

## Task 13.7: Sync Color to Cloud Backup

**Files:** `src/lib/backup/snapshot.ts`
**Estimate:** 15 min

**Done when:**

- Color field included in category export
- Color field restored on import

**Verification:**

- Backup includes color data
- Restore preserves colors

---

## Implementation Order

1. Task 13.1 (Data model) - Foundation
2. Task 13.2 (Edit modal) - Core feature
3. Task 13.3 (Color picker) - Enhancement
4. Task 13.4 (Wire to settings) - Integration
5. Task 13.5 (Task list display) - Visual feedback
6. Task 13.6 (Add modal color) - Consistency
7. Task 13.7 (Cloud sync) - Data integrity

## Notes

- Tasks 13.1-13.4 are the core feature
- Tasks 13.5-13.7 are polish
- Each task should be committed separately
