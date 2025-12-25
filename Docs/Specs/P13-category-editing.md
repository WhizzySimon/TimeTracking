# P13: Category Editing & Colors

**Created:** 2025-12-25
**Status:** Draft
**Priority:** Medium (user-requested feature)

## Problem Statement

Users cannot edit existing categories (name, properties) after creation. Additionally, users want to assign colors to categories for visual distinction in task lists and reports.

## Scope

### In Scope

1. Edit existing user-defined categories (name, countsAsWorkTime)
2. Add color property to categories
3. Display category colors in task lists
4. Color picker UI in category edit/create

### Out of Scope

- Editing system categories (they remain immutable)
- Category icons or emojis
- Category grouping/hierarchy

## Functional Requirements

**P13-FR-01: Edit Category**
User can tap a user-defined category in Settings to open an edit modal.

**P13-FR-02: Edit Modal Fields**
Edit modal shows: name (editable), countsAsWorkTime toggle, color picker.

**P13-FR-03: Category Color Property**
Each category has an optional color property (hex code or preset).

**P13-FR-04: Color Display in Task List**
Task items show a colored indicator (dot, bar, or background) matching category color.

**P13-FR-05: Color Picker UI**
Color picker offers preset colors (6-8 options) and optional custom hex input.

**P13-FR-06: System Categories Immutable**
System categories (Urlaub, Krank, etc.) cannot be edited or colored by user.

## Implementation Guarantees

**P13-IG-01:** Existing categories without color continue to work (default/no color).
**P13-IG-02:** Color data is synced to cloud backup.
**P13-IG-03:** Data model migration is backwards compatible.

## Design Decisions

**P13-DD-01:** Color is stored as hex string (e.g., "#FF5733") or null.
**P13-DD-02:** Preset colors: Blue, Green, Red, Orange, Purple, Teal, Pink, Gray.
**P13-DD-03:** Color indicator in task list is a 4px left border on TaskItem.
**P13-DD-04:** Edit modal reuses AddCategoryModal with modifications.

## Data Model Changes

```typescript
interface Category {
	id: string;
	name: string;
	isSystem: boolean;
	countsAsWorkTime: boolean;
	color?: string; // NEW: hex color code or null
}
```

IndexedDB schema version bump required.

## Acceptance Checks

- [ ] AC-01: Tapping user category opens edit modal
- [ ] AC-02: Can change category name and save
- [ ] AC-03: Can toggle countsAsWorkTime
- [ ] AC-04: Can select color from presets
- [ ] AC-05: Task list shows color indicator
- [ ] AC-06: System categories show no edit option
- [ ] AC-07: Categories without color work normally

## Change Log

**[2025-12-25 13:58]**

- Added: Initial spec from user feature request
