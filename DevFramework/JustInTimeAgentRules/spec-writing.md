# Spec Writing Rules

**Trigger:** Before creating or updating a spec file

---

## Create Spec from Template

For any non-trivial change, create a spec file from template:

| Type              | Template                                          |
| ----------------- | ------------------------------------------------- |
| App feature       | `TempAppDevDocs/Features/Specs/_template.md`      |
| Framework feature | `DevFramework/FrameworkFeatureSpecs/_template.md` |

**The template contains all rules:** length guidelines, prefix conventions, required sections, and completeness checklist.

## Quick Checklist

Before moving to planning:

- [ ] Created from template (not blank file)
- [ ] All template sections filled
- [ ] No ambiguous terms without measurable definition
- [ ] All FR/IG/DD numbered and testable
- [ ] Completeness checklist at bottom passes

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** Create Spec from Template, Quick Checklist
- **Important:** All template sections filled
- **Standard:** Template format details

---

**Next:** When spec is approved → Read `DevFramework/JustInTimeAgentRules/planning.md`
