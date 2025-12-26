# Decision Log

Significant design, architecture, and policy decisions. Newest first.

**Update rule:** Add an entry when a meaningful decision is made. See "What counts as a decision" below.

---

## DEC-2025-003: Simple dev/main Git workflow without PRs

**Date:** 2025-12-26  
**Context:** CI pipeline and PR-based workflow added friction without proportional benefit for a single-maintainer project.  
**Decision:** Remove CI workflow, use simple dev/main model with direct commits and push.  
**Alternatives:** Keep PR workflow (rejected — overhead), trunk-based with feature flags (overkill).  
**Consequences:** Faster iteration; relies on `npm run verify` before push; no automated CI gate.  
**Source:** 1e6d95b, f7fdd55

---

## DEC-2025-002: Centralized time rounding in saveTimeEntry

**Date:** 2025-12-23  
**Context:** Time rounding logic was scattered across multiple UI components, causing inconsistency.  
**Decision:** All time rounding (to 5-minute increments) happens in `saveTimeEntry()` at the data layer.  
**Alternatives:** Per-component rounding (rejected — easy to forget), middleware (overkill).  
**Consequences:** Single source of truth; new entry points automatically get rounding.  
**Source:** DL-20251224-0419

---

## DEC-2025-001: Use Math.floor for 5-minute rounding

**Date:** 2025-12-23  
**Context:** User expects 23:02 to become 23:00, not 23:05.  
**Decision:** Use `Math.floor` instead of `Math.round` for time rounding.  
**Alternatives:** `Math.round` (rejected — unexpected UX when time rounds up).  
**Consequences:** Times always round down to nearest 5 minutes.  
**Source:** DL-20251224-0419

---

## What Counts as a Decision?

Add an entry when:

- **Architecture/data model changes** — how data flows or is stored
- **Policy decisions** — sync behavior, pricing logic, UX navigation rules
- **Technology choices** — library X over Y, framework patterns
- **Deliberate rejections** — explicitly deciding NOT to do something

Do NOT add entries for:

- Routine bug fixes
- Minor refactors
- UI tweaks (unless establishing a pattern)
- Anything already captured in a Spec's Design Decisions (DD) section

---

## Template

```markdown
## DEC-YYYY-NNN: Short title

**Date:** YYYY-MM-DD  
**Context:** What situation or problem prompted this decision?  
**Decision:** What was decided?  
**Alternatives:** What other options were considered and why rejected?  
**Consequences:** What are the implications of this decision?  
**Source:** Commit hash, DL-xxx, or Spec reference
```
