# UX Flow Design Rules

**Trigger:** Designing UX flows for multi-screen features (before implementation)

---

## Canary

**When you read this file, output exactly:**

> [CANARY] ux-flow-design rules loaded

---

## When to Use

- Before implementing a feature with **multiple screens or states**
- When exploring **navigation patterns** between views
- When user wants to **visualize flows** before coding

**Not for:** Single-screen changes, bug fixes, styling updates.

---

## Approach: Text-Based Flow Design

**Focus on FLOW, not visuals.** Use text descriptions instead of wireframes.

### Step 1: Define Screens

List each screen with its key elements:

```markdown
## Screen: add-entry

- Header: "Neuer Eintrag"
- Field: Date picker (today default)
- Field: Time inputs (start/end)
- Field: Category dropdown
- Button: "Speichern" [→ dashboard]
- Button: "Abbrechen" [→ dashboard]
- State: Error inline if validation fails
```

### Step 2: Define Flows

Map the navigation between screens:

```markdown
## Flow: Add Entry (Happy Path)

dashboard → add-entry → [save] → dashboard (with success toast)

## Flow: Add Entry (Validation Error)

dashboard → add-entry → [save with error] → add-entry (error shown) → [fix & save] → dashboard
```

### Step 3: Identify States

For each screen, list relevant states:

- **Empty:** No data yet
- **Loading:** Fetching data
- **Error:** Something went wrong
- **Success:** Action completed

---

## Optional: Quick HTML Mockup

If visual exploration is needed, create a **quick HTML mockup** using existing design system classes:

```html
<!-- TempAppDevDocs/Prototypes/<feature>/mockup.html -->
<div class="tt-list-row-clickable">
	<span class="tt-inline-label-muted">Example row</span>
</div>
<button class="tt-button-primary">Speichern</button>
```

**Benefits over SVG wireframes:**

- Uses real design system → pixel-accurate
- No sync issues → it IS the actual styling
- Faster to create → just HTML with existing classes

---

## Output Format

After flow design, document in the feature spec:

```markdown
## User Flows

### Happy Path: [Action Name]

1. User navigates to [screen]
2. User fills [fields]
3. User clicks [button]
4. System [response]
5. User sees [result]

### Alternative: [Scenario Name]

...
```

---

## Definition of Done

Flow design is complete when:

- [ ] All screens listed with key elements
- [ ] Happy path flow documented
- [ ] Error/edge case flows documented (if applicable)
- [ ] User has approved the flow
- [ ] Flow documented in feature spec

---
