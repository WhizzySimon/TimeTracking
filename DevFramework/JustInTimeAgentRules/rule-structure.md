# Rule Structure Guidelines

**Trigger:** When creating, editing, or analyzing JIT rule files

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] rule-structure guidelines loaded

---

## Core Principle: Mid-Level Rules with Examples

**Rules should be mid-level principles, not low-level prescriptions.**

| Level | What It Is | Example |
|-------|-----------|---------|
| High-level | Too abstract to apply | "Be good" |
| **Mid-level** | Principle that guides decisions | "Fix warnings properly, do not suppress them" |
| Low-level | Too specific, becomes noise | "Use `--fix` flag with eslint" |

**Pattern:** Mid-level rule → Examples underneath showing application

---

## What NOT to Add as Rules

- ❌ Rules for things agent already does correctly — only add for behaviors that FAIL without the rule
- ❌ Task documentation ("we did X") — that's changelog, not rules
- ❌ Low-level details without mid-level parent — find or create the principle first
- ❌ Speculation presented as fact — label uncertainty
- ❌ First-abstraction principles without goal connection

---

## Goal-Tracing Requirement

Every rule must trace to the ultimate goal:

```
Main goal:        Quality + Speed + Human time saved
                         ↑
Mid-level rule:   [the principle]
                         ↑
Example:          [specific application]
```

**Test:** Can you explain WHY this rule serves quality/speed/time? If not, it may not belong.

---

## Priority Sections (Optional Structure)

For larger rule files, organize by priority:

```markdown
## Critical (Always Apply)
[Rules that must fire on every decision]

## Important (Context-Dependent)
[Rules that apply in specific situations]

## Standard
[Good practices, lower priority]

## See Also
[Link to FactsToUnderstand.md for background knowledge]
```

---

## Rule vs Fact

| Type | Definition | Location |
|------|-----------|----------|
| **Rule** | Actionable instruction that changes behavior | JIT rule file |
| **Fact** | Background knowledge that explains WHY | `FactsToUnderstand.md` |

**Example:**
- Rule: "Label speculation as speculation" (actionable)
- Fact: "AI cannot introspect its own training" (explains why rule exists)

---

## Adding Examples to Existing Rules

Before creating a new rule, check:

1. Does an existing mid-level rule cover this? → **Add as example**
2. Is this genuinely new principle not covered? → **Create new rule**
3. Default to example — new rules should be rare

**Check example value:**
- Is this example different enough from existing examples?
- Does it illustrate a distinct aspect of the rule?
- If too similar → Skip (reduce noise)

---

## Questions > Statements

When possible, frame rules as questions that trigger thinking:

| Statement | Question |
|-----------|----------|
| "Always verify before acting" | "Have I verified this before acting?" |
| "Check for existing helpers" | "Does a helper for this already exist?" |

Questions activate consideration; statements can be skimmed.

---
