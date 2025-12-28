# Docs Index

This is the **authoritative index for the Docs/ folder**. It lists all documentation and their priority order.

**Note:** This is one level up from code — it indexes docs, not the repo. For repo-level quickstart, see `README.md`.

## Rule

Cascade reads this via `/read-governance` helper. Only docs listed here are authoritative.

## Priority order (when conflicts exist)

0. Docs/INDEX.md (this file)
1. Docs/Guidelines/ui-logic-spec-v1.md (product truth)
2. Docs/Guidelines/technical-guideline-v1.md (architecture truth)
3. Docs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md (platform constraints)
4. Docs/Guidelines/DEVELOPMENT_GUIDELINES.md (coding/repo rules)
5. Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md (how to write specs)
6. Docs/Rules/\_entrypoint-jit-rule-map.md (JIT rule dispatcher)

## Authoritative documents

### Development process (how we work)

- Docs/Rules/\_entrypoint-jit-rule-map.md  
  Purpose: **JIT Rule dispatcher** — trigger points for just-in-time rule loading.
- Docs/Rules/\*.md  
  Purpose: **Trigger-based rules** — read at specific points (session-start, pre-commit, etc.)
- Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md  
  Purpose: **Complete workflow guide** — 4 Phasen, Task-Workflow, Progress Tracking, Commit-Regeln.

### Product spec (what we build)

- Docs/Guidelines/ui-logic-spec-v1.md  
  Purpose: screens, flows, rules, acceptance criteria for the app.

### Architecture & implementation rules

- Docs/Guidelines/technical-guideline-v1.md  
  Purpose: project structure, module boundaries, data model, decisions.
- Docs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md  
  Purpose: SvelteKit + PWA constraints (offline-first, Safari behavior, etc.)
- Docs/Guidelines/DEVELOPMENT_GUIDELINES.md  
  Purpose: coding standards, practices, guardrails.
- Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md
  Purpose: spec writing rules (FR/IG/DD), verification loop, self-documenting requirement.

### Cascade tooling

- Docs/Tooling/BOOTSTRAP.md  
  Purpose: **Single entry point** for all tooling docs. Quick start commands and links.
- Docs/Tooling/CASCADE_WATCHER.md  
  Purpose: Multi-instance watcher system for command execution.
- Docs/Tooling/GIT_WORKFLOW.md  
  Purpose: Git workflow, simple dev/main model, no PRs.

### AI / Autonomy Stack (D5)

- Docs/AI/INDEX.md  
  Purpose: **Entry point for AI tooling** — task boxes, telemetry, anomaly detection, evidence bundles.
- Docs/AI/ZOOM_OUT.md  
  Purpose: **Anomaly recovery protocol** — 5-step procedure when stuck.
- Docs/AI/boxes/\*.md  
  Purpose: **Task box checklists** — per-type verification requirements (feature, bugfix, refactor, etc.)
- scripts/ai/telemetry.cjs  
  Purpose: **Telemetry CLI** — log events, commands, errors (JSONL format).
- scripts/ai/anomaly-detector.cjs  
  Purpose: **Anomaly detection** — repetition, churn, time, scope drift.
- scripts/ai/evidence-generator.cjs  
  Purpose: **Evidence bundles** — per-task completion artifacts.
- scripts/ai/learning-extractor.cjs  
  Purpose: **Learning extraction** — propose principles from evidence.

### Development history

- Docs/Devlog/CHANGELOG.md  
  Purpose: **Everything log** — one line per commit/session, quick scan of all changes.
- Docs/Devlog/DECISIONS.md  
  Purpose: **Decision log** — significant design/architecture/policy decisions (ADR-light).
- Docs/Devlog/LEARNINGS.md  
  Purpose: **Learnings (Distillate)** — proven preferences, max 30 bullets, read at session start.
- Docs/Devlog/LEARNINGS-INBOX.md  
  Purpose: **Learnings Inbox** — raw feedback capture, unbounded, not read at session start.
- Docs/Devlog/INDEX.md  
  Purpose: Index of detailed session devlogs.

### Setup checklist

- Docs/Guidelines/PROJECT_SCAFFOLD_CHECKLIST.md  
  Purpose: ensure project skeleton and tooling are complete.

### Code quality

- Docs/Standards/code-quality-standard.md  
  Purpose: Code quality rules (formatting, linting, complexity, test stability).
- Docs/Reports/code-quality-style-audit.md  
  Purpose: Audit of current tooling and code hotspots (read-only snapshot).

### Feature specs (P08 — Code Quality Enforcement)

- Docs/Specs/P08-code-quality.md  
  Purpose: Spec for future code quality enforcement work.
- Docs/Plans/P08-code-quality.md  
  Purpose: Plan for code quality enforcement.
- Docs/Tasks/P08-code-quality.md  
  Purpose: Task breakdown for code quality enforcement.

### Feature specs (A1 — Subscription Plans)

- Docs/Specs/subscription-plans.md  
  Purpose: Subscription tiers (Free/Pro/Premium), Import/Export, Cloud Backup gating.
- Docs/Plans/subscription-plans.md  
  Purpose: Architecture for subscription feature.
- Docs/Tasks/subscription-plans.md  
  Purpose: Task breakdown for subscription implementation.

Note: Supersedes `Docs/Specs/P10-monetising.md` (DEPRECATED).

### Feature specs (P11 — AI Import)

- Docs/Specs/ai-import.md  
  Purpose: Spec for AI-powered import from CSV/Excel/Text/Images (Premium feature).
- Docs/Plans/ai-import.md  
  Purpose: Architecture and implementation plan for AI Import.
- Docs/Tasks/ai-import.md  
  Purpose: Task breakdown for AI Import (25 tasks in 7 sub-phases).

## Required "Doc Inventory" in every Cascade answer

At the top of every response, Cascade must list:

- Docs read (exact paths)
- Any conflicts found + which doc won by priority
- Assumptions (only if unavoidable) + where they should be specified in docs
