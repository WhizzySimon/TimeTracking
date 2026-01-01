---
description: UX/UI wireframe and clickable prototype ping-pong loop
---

# Wireframe-Prototype Loop

**Manual trigger workflow** — invoke explicitly when designing a new feature's UI/UX before implementation.

---

## When to Use

- Before implementing a new feature that involves significant UI
- When exploring multiple UX approaches
- When user wants to visualize flows before committing to implementation

**Not for:** Small UI tweaks, bug fixes, or features with already-defined UI specs.

---

## Workflow Steps

### Step 1: Gather UX/UI Requirements

Ask targeted questions to understand:

1. **User goal:** What is the user trying to accomplish?
2. **Entry points:** How does the user reach this feature?
3. **Key actions:** What are the 1-3 most important actions?
4. **Data displayed:** What information must be visible?
5. **Edge cases:** Empty state, error state, loading state?
6. **Device context:** Mobile-first? Desktop? Both?

Output a brief summary of requirements before proceeding.

### Step 2: Propose Flows + Screen List

Based on requirements, propose:

- **1-2 user flows** (happy path + one alternative if needed)
- **Screen list** with names and brief descriptions
- **Navigation map** showing how screens connect

Example:

```
Flow A: Add New Entry (Happy Path)
1. Dashboard → 2. Add Form → 3. Confirmation → 4. Dashboard (updated)

Flow B: Add Entry with Validation Error
1. Dashboard → 2. Add Form → 3. Inline Error → 2. Add Form (corrected) → 4. Dashboard

Screens:
- dashboard.svg: Main view with entry list, FAB for add
- add-form.svg: Form with date, time, category fields
- confirmation.svg: Success state (or inline feedback)
```

**Wait for user approval before proceeding.**

### Step 3: Generate SVG Wireframes

Create wireframes as SVG files:

- Location: `Docs/Prototypes/<feature-slug>/assets/screens/`
- Naming: `<screen-name>.svg`
- Style: Grayscale wireframe (boxes, lines, placeholder text)
- Size: Mobile-first (375×667) or desktop (1280×800) per context

Wireframe elements:

- Rectangles for content areas
- Circles/rounded rects for buttons
- Lines for text (with labels like "[Title]", "[Description]")
- Simple icons as placeholders

### Step 4: Generate Clickable Prototype

Create `index.html` in `Docs/Prototypes/<feature-slug>/`:

- Embeds SVG wireframes as clickable areas
- Click regions navigate between screens
- No build step — opens directly in browser
- Uses the template from `Docs/Prototypes/_template/`

```html
<!-- Example structure -->
<div id="screen-dashboard" class="screen active">
	<img src="assets/screens/dashboard.svg" usemap="#dashboard-map" />
	<map name="dashboard-map">
		<area shape="rect" coords="x1,y1,x2,y2" onclick="showScreen('add-form')" />
	</map>
</div>
```

### Step 5: User Feedback

Present prototype to user:

1. Provide path to open: `Docs/Prototypes/<feature-slug>/index.html`
2. Ask for specific feedback on:
   - Flow correctness
   - Missing screens/states
   - Layout preferences
   - Any concerns

### Step 6: Iterate Until Approved

Based on feedback:

- Update SVGs and/or flow
- Regenerate affected screens
- Update prototype navigation
- Return to Step 5

**Repeat until user approves.**

### Step 7: Finalize and Transition

When approved:

1. Mark prototype as APPROVED in `Docs/Prototypes/<feature-slug>/README.md`
2. Create or update feature spec in `Docs/Features/Specs/<feature-slug>.md`
   - Reference approved wireframes
   - Include final flow description
   - Link to prototype for visual reference
3. Continue with normal implementation workflow (`/new-feature` Phase 2+)

---

## Prototype Template Location

```
Docs/Prototypes/_template/
├── index.html          # Clickable prototype shell
├── assets/
│   └── screens/        # SVG wireframes go here
│       └── .gitkeep
└── README.md           # Template for prototype docs
```

---

## Definition of Done

Prototype is **APPROVED** when:

- [ ] All screens for happy path exist as SVGs
- [ ] Clickable prototype navigates through full flow
- [ ] User has explicitly approved the UX flow
- [ ] README.md marked with approval date and user confirmation
- [ ] Feature spec created/updated with wireframe references

---

## Output Format

After each iteration, report:

```
## Prototype Status: <feature-slug>

**Iteration:** N
**Screens:** X of Y complete
**Flow coverage:** Happy path / All flows

**Files:**
- Docs/Prototypes/<feature-slug>/index.html
- Docs/Prototypes/<feature-slug>/assets/screens/*.svg

**Open in browser:** file:///<full-path>/index.html

**Awaiting:** User feedback / Approved
```

---
