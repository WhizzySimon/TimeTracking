# Decision Log

Significant design, architecture, and policy decisions. Newest first.

**Update rule:** Add an entry when a meaningful decision is made. See "What counts as a decision" below.

---

## DEC-2025-008: No hardcoded URLs/paths rule for LLM code quality

**Date:** 2025-12-29  
**Context:** Research on LLM code quality assurance identified common issues: hardcoded URLs, file system paths, secrets, and magic numbers. These make code less portable, less secure, and harder to maintain.  
**Decision:** Add explicit rules to code-quality.md prohibiting hardcoded service URLs (except standard API endpoints), absolute file paths, secrets, and unexplained magic numbers. Use environment variables and named constants instead.  
**Alternatives:** Static analysis only (rejected — needs rule documentation for LLM guidance), ESLint rules only (rejected — doesn't cover all cases, LLM needs explicit guidance).  
**Consequences:** Clearer expectations for LLM-generated code; easier to catch violations in review; improved security posture.  
**Source:** This commit

---

## DEC-2025-007: Deterministic staged-only audit policy (Auditor System)

**Date:** 2025-12-28  
**Context:** Designed an Auditor system for evidence-first code review. Needed to define how the audit input is frozen and whether Evidence Bundle/Audit Report must be staged.  
**Decision:** Option A — Evidence Bundle MUST be staged alongside code; Audit Report is generated post-verdict (not staged during preconditions). Preconditions use `git diff --name-only` (empty), `git ls-files --others --exclude-standard` (empty), `git diff --staged --name-only` (non-empty + includes Evidence Bundle).  
**Alternatives:** Option B (Evidence Bundle untracked, explicit exception) — rejected for complexity; ACP as separate file — rejected to avoid duplication.  
**Consequences:** Single source of truth (Evidence Bundle with embedded ACP fields); deterministic audit input via `STAGED_DIFF_HASH`; X-High escalation reruns must use exact same staged diff.  
**Source:** This commit

---

## DEC-2025-006: Single always-on pointer to JIT rule map (D5)

**Date:** 2025-12-27  
**Context:** D4's JIT system still had 4 always-on rules in .windsurf/rules/ that were context-specific (code-quality, command-execution, ui-design, implementation-specification). Pre-commit checklist was still being skipped (3rd violation).  
**Decision:** Reduce to ONE always-on file (always-on.md) that points to editable jit-rule-map.md in DevFramework/JustInTimeAgentRules/. Delete all other .windsurf/rules/ files.  
**Alternatives:** Add more always-on rules (rejected — context overload), hardcode jit-rule-map in workflows (rejected — loses Windsurf native loading).  
**Consequences:** Minimal always-on context; jit-rule-map is editable; Windsurf auto-loads the pointer which chains to trigger table.  
**Source:** This commit

---

## DEC-2025-005: Just-in-time rules system (D4)

**Date:** 2025-12-27  
**Context:** AGENTS.md was 282 lines. Rules loaded at session start were forgotten by commit time (violations on 2025-12-26, 2025-12-27). Research confirmed: "context rot" — LLMs lose focus as context grows.  
**Decision:** Replace AGENTS.md with \_entrypoint-jit-rule-map.md (50 lines) + DevFramework/JustInTimeAgentRules/ (7 trigger-based files). Load rules at trigger points, not upfront.  
**Alternatives:** Keep growing AGENTS.md (rejected — proven to fail), use only .windsurf/rules/ (rejected — can't edit those files).  
**Consequences:** Reduced cognitive load; rules fresh when needed; easier to maintain and extend.  
**Source:** c76e30d, 5113584

---

## DEC-2025-004: Use git describe format for versioning

**Date:** 2025-12-27  
**Context:** Needed a versioning system that auto-increments, resets on version bumps, and allows tracing builds to commits.  
**Decision:** Use standard `git describe --tags --long` format: `v1.0.0-N-ghash` (tag, commits since tag, commit hash).  
**Alternatives:** Separate version + hash fields (rejected — requires parsing), commit count only (rejected — no reset on bump), manual version (rejected — error-prone).  
**Consequences:** Full traceability; version bumps via `scripts/git/bump-version.js`; releases via `scripts/git/release.js`.  
**Source:** 12e0bd9

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
