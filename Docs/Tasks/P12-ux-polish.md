# P12: UX Polish Bundle - Tasks

**Spec:** `Docs/Specs/P12-ux-polish.md`
**Status:** Ready for implementation
**Estimated:** 3-4 hours total

## Task 12.1: German Error Messages on Auth Pages

**Files:** `src/routes/login/+page.svelte`, `src/routes/signup/+page.svelte`
**Estimate:** 30 min

**Done when:**

- Supabase error codes are mapped to German messages
- "Invalid login credentials" -> "E-Mail oder Passwort falsch"
- "User already registered" -> "Diese E-Mail ist bereits registriert"
- Network errors -> "Verbindungsfehler. Bitte erneut versuchen."

**Verification:**

- Test with wrong password
- Test with existing email on signup
- Test with network disabled

---

## Task 12.2: Password Visibility Toggle

**Files:** `src/routes/login/+page.svelte`, `src/routes/signup/+page.svelte`
**Estimate:** 30 min

**Done when:**

- Password input has eye icon button to toggle visibility
- Type switches between "password" and "text"
- Works on both login and signup pages
- Signup has toggle for both password fields

**Verification:**

- Click toggle, password becomes visible
- Click again, password is hidden

---

## Task 12.3: Create Category in Add Tab

**Files:** `src/routes/add/+page.svelte` (or `src/lib/components/AddTaskModal.svelte`)
**Estimate:** 45 min

**Done when:**

- Category dropdown has "+ Neue Kategorie" option at bottom
- Selecting it opens AddCategoryModal
- After creating, new category is selected in dropdown
- Modal closes and returns to Add Task form

**Verification:**

- Open Add Task, see "+ Neue Kategorie" option
- Create category, it appears selected
- New category persists after reload

---

## Task 12.4: Landing Page After Task End

**Files:** `src/routes/+layout.svelte`, `src/lib/storage/db.ts` (or localStorage)
**Estimate:** 45 min

**Done when:**

- When a running task is stopped, a flag is set
- On next app open, if flag is set, navigate to /add instead of /day
- Flag is cleared after navigation
- Only triggers if there was a running task that was stopped

**Verification:**

- Start task, stop it, close app
- Reopen app, lands on Add tab
- Navigate away, close/reopen, lands on Day tab (normal)

---

## Task 12.5: iPhone Layout Fix for Version Buttons

**Files:** `src/routes/day/+page.svelte` or `src/routes/settings/+page.svelte` (wherever version is shown)
**Estimate:** 30 min

**Done when:**

- On screens < 375px wide, version info stacks vertically
- Text doesn't overlap with buttons
- Buttons remain tappable (44px min touch target)

**Verification:**

- Test with iPhone SE viewport (320px)
- Test with iPhone 13 mini viewport (375px)
- All text readable, buttons accessible

---

## Implementation Order

1. Task 12.1 (German errors) - Quick win, improves experience immediately
2. Task 12.2 (Password toggle) - Quick win, common UX pattern
3. Task 12.5 (iPhone layout) - Bug fix, prevents user frustration
4. Task 12.3 (Category in Add) - Feature, improves workflow
5. Task 12.4 (Landing page) - Feature, nice-to-have

## Notes

- All tasks are independent and can be done in any order
- Each task should be committed separately
- Run `npm run verify` after each task
