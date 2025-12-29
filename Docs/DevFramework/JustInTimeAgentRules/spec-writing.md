# Spec Writing Rules

**Trigger:** Before creating or updating a spec file

---

## When to Create a Spec

For any non-trivial change, create/update a spec file:

- Location: `Docs/AppDocs/Specs/<feature-slug>.md` or `Docs/DevFramework/ToolSetup
Framework/FrameworkFeatureSpecs
/<feature-slug>.md`
- Template: `Docs/AppDocs/Specs/_template.md` or `Docs/DevFramework/ToolSetup
Framework/FrameworkFeatureSpecs
/_template.md`
- Rules: `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards/IMPLEMENTATION_SPECIFICATION_RULES.md`

## Required Sections

Each spec MUST contain:

- **Problem statement** (1–3 sentences)
- **Explicit scope** (in scope / out of scope)
- **Functional Requirements (FR)** — user-observable behavior (TT-FR-001, TT-FR-002, ...)
- **Implementation Guarantees (IG)** — constraints/outcomes that must hold (TT-IG-001, TT-IG-002, ...)
- **Design Decisions (DD)** — deliberate choices to lock in (TT-DD-001, TT-DD-002, ...) (optional)
- **Edge cases + failure states**
- **Data & privacy notes** (what is stored, where, retention)
- **Acceptance checks** (testable, mapped to FR/IG/DD)
- **Change log**

## Checkpoint to Proceed

Before moving to planning:

- [ ] No ambiguous terms remain (e.g., "fast", "simple", "works offline") without a measurable definition
- [ ] All FR/IG/DD are numbered and testable

---

**Next:** When spec is approved → Read `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/planning.md`
