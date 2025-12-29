# JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

Repo: TimeTracker

Goal: Produce a complete docs-only “Code Quality” package in one go:

- Audit report (read-only)
- Code Quality Standard (use the provided v1 text verbatim as the initial standard)
- SDD integration docs (spec/plan/tasks)
- Update the doc index to link everything
  NO refactoring, NO behavior changes, NO tooling changes in this run.

Constraints:

- Do not write to .windsurf/rules/ (restricted).
- Docs only. Keep changes small and reviewable.

Create/update these files:

1. Docs/DevFramework/Archive
/code-quality-style-audit.md
   - Tooling inventory: prettier/eslint/tsconfig/CI gates
   - Evidence-based hotspots: big functions, deep nesting, god files, and over-fragmentation
   - Each finding: severity + file paths + short excerpt + checklist recommendation

2. Docs/Standards/code-quality-standard.md
   - Set its content to the following “Code Quality Standard (v1)” text (paste verbatim; only adjust printWidth if repo already uses a different one):

----- START STANDARD (v1) -----

# Code Quality Standard (v1)

## Purpose

Make code easier to read, cheaper to change, and harder to break — without over-engineering.

## What we enforce automatically

1. Formatting via Prettier (single source of truth)
2. ESLint baseline for JS/TS/Svelte
3. TypeScript strictness (where practical)
4. Test stability rules (Playwright locator policy)
5. Complexity cap (prevents “100-line decision trees”)

## Formatting

- Prettier is the only formatter.
- Formatting changes must be produced by running Prettier, not manual style edits.

Recommended Prettier defaults (adjust only if the repo already has an established style):

- printWidth: 100
- tabWidth: 2
- singleQuote: true
- trailingComma: all

## Linting baseline

- Use official ESLint flat config.
- Use typescript-eslint recommended configs for TypeScript.
- Use eslint-plugin-svelte recommended config for Svelte.

## TypeScript baseline

Prefer:

- "strict": true
- "noUnusedLocals": true
- "noUnusedParameters": true (allow underscore prefix to ignore)

## Function and module design rules

Hard rule (enforced by reviews; optionally by lint if not too noisy):

- Prefer small, single-purpose functions. If a function has many branches, extract pure helpers.
- Avoid deep nesting; flatten logic with early returns.

Rule of thumb (not an absolute limit):

- If a function reads like a “script”, split into 2–5 named helpers.
- If you need 20 tiny files to express one feature, you probably over-split.

## Complexity cap

Enforce ESLint cyclomatic complexity:

- Default threshold: 20 (ESLint default)
- Tighten later only if it does not create noise.

When this rule triggers:

- Reduce branching by extracting helpers or using lookup tables.
- If the function is inherently complex but correct, document why and consider disabling the rule locally for that function with a comment.

## File/folder structure (anti-chaos rules)

- Follow SvelteKit conventions for routes and layout.
- Prefer feature-locality: keep feature code close to where it is used.
- Avoid premature “enterprise structure” (do not add layers just to feel scalable).

## Playwright locator policy (test stability)

Order of preference:

1. getByRole / getByLabel / getByPlaceholder (semantic, user-facing)
2. getByTestId for UI elements that are dynamic, localized, or otherwise unstable
3. Avoid getByText for anything that can change (localization, wording, formatting)

If a test currently depends on German strings, replace with data-testid in the UI.

## SDD quality gates (must be checked before merging)

- [ ] Prettier run / formatting stable
- [ ] ESLint passes
- [ ] Typecheck passes
- [ ] No new brittle E2E selectors (no new getByText for UI copy)
- [ ] No new complexity hotspots (or justified)

## References (official)

- SvelteKit project structure: https://svelte.dev/docs/kit/project-structure
- ESLint config files: https://eslint.org/docs/latest/use/configure/configuration-files
- eslint-plugin-svelte user guide: https://sveltejs.github.io/eslint-plugin-svelte/user-guide/
- typescript-eslint shared configs: https://typescript-eslint.io/users/configs
- Prettier options: https://prettier.io/docs/options
- ESLint complexity rule: https://eslint.org/docs/latest/rules/complexity
- Playwright locators: https://playwright.dev/docs/locators
- Playwright best practices: https://playwright.dev/docs/best-practices
  ----- END STANDARD (v1) -----

3. SDD integration docs (short and actionable):

- Docs/Specs/PXX-code-quality.md
- Docs/Plans/PXX-code-quality.md
- Docs/Tasks/PXX-code-quality.md
  Tasks must be checklist-style and reflect phased work:
  Audit → Standard → SDD wiring → Enforcement tooling PR → Refactor PR batches.

4. Update Docs/INDEX.md (or the repo’s doc index) to link:

- the audit report
- the standard
- the spec/plan/tasks

Finally:

- Commit these docs-only changes with a clear message (e.g. "Add code quality standard + audit package").
- Do not change code or CI configs in this commit.
