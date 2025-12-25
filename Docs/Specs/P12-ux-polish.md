# P12: UX Polish Bundle

**Created:** 2025-12-25
**Status:** Draft
**Priority:** High (user-reported issues)

## Problem Statement

Multiple small UX issues reported by users that degrade the experience but are individually small fixes. Bundling them into one spec for efficient implementation.

## Scope

### In Scope

1. German error messages on login/signup screens
2. Password visibility toggle on login/signup
3. "Create category" option in Add Task tab (not just Settings)
4. Landing page routing after task completion
5. iPhone layout fix for version buttons on Day tab

### Out of Scope

- Category editing (see P13)
- Sync improvements (see P14)
- AI features (see P11)

## Functional Requirements

**P12-FR-01: German Error Messages**
Login and signup error messages must be in German, matching the app's language.

**P12-FR-02: Password Visibility Toggle**
Login and signup forms must have a toggle button to show/hide password.

**P12-FR-03: Create Category in Add Tab**
The Add Task screen must allow creating a new category inline, not requiring navigation to Settings.

**P12-FR-04: Landing Page After Task End**
When a running task is stopped (endTime set) and app is closed, next app open should land on Add tab (not Day tab).

**P12-FR-05: iPhone Layout Fix**
On small iPhone screens (Day tab), version info buttons must stack properly without text overlap.

## Implementation Guarantees

**P12-IG-01:** No existing functionality is broken by these changes.
**P12-IG-02:** All changes are purely UI/UX - no data model changes required.
**P12-IG-03:** Changes work on all supported browsers (Chrome, Safari, Firefox).

## Design Decisions

**P12-DD-01:** Error message translations are hardcoded in the component (no i18n library for now).
**P12-DD-02:** Password toggle uses an eye icon (show) / crossed eye icon (hide).
**P12-DD-03:** "Create category" in Add tab opens a minimal inline form or the existing AddCategoryModal.
**P12-DD-04:** Landing page preference is stored in localStorage (simple key: `landing_after_task`).

## Acceptance Checks

- [ ] AC-01: Login with wrong password shows German error message
- [ ] AC-02: Signup validation errors are in German
- [ ] AC-03: Password field has visibility toggle on login page
- [ ] AC-04: Password field has visibility toggle on signup page
- [ ] AC-05: Add Task screen has "New category" option
- [ ] AC-06: After stopping a task and reopening app, lands on Add tab
- [ ] AC-07: Version buttons display correctly on iPhone SE (320px width)

## Change Log

**[2025-12-25 13:58]**

- Added: Initial spec from user bug reports
