# Docs Index

This is the **authoritative index for the Docs/ folder**. It lists all documentation and their priority order.

**Note:** This is one level up from code — it indexes docs, not the repo. For repo-level quickstart, see `README.md`.

## Documentation Structure

Documentation is organized into two main buckets:

- **`Docs/DevFramework/`** — Development framework (process, rules, QA system, devlog, tooling)
- **`Docs/AppDocs/`** — Application documentation (features, UI, product specs)

## Rule

Cascade reads this via `/read-governance` helper. Only docs listed here are authoritative.

## Priority order (when conflicts exist)

0. Docs/INDEX.md (this file)
1. Docs/AppDocs/Guidelines/UI_LOGIC_SPEC_V1.md (product truth)
2. Docs/AppDocs/Guidelines/TECHNICAL_GUIDELINE_V1.md (architecture truth)
3. Docs/AppDocs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md (platform constraints)
4. Docs/DevFramework/Guidelines/DEVELOPMENT_GUIDELINES.md (coding/repo rules)
5. Docs/DevFramework/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md (how to write specs)
6. Docs/DevFramework/Rules/\_entrypoint-jit-rule-map.md (JIT rule dispatcher)

---

## DevFramework — Development Process Documentation

**Entry point:** `Docs/DevFramework/INDEX.md`

### JIT Rules System

- Docs/DevFramework/Rules/\_entrypoint-jit-rule-map.md  
  Purpose: **JIT Rule dispatcher** — trigger points for just-in-time rule loading.
- Docs/DevFramework/Rules/\*.md  
  Purpose: **Trigger-based rules** — read at specific points (session-start, pre-commit, etc.)

### Development Guidelines

- Docs/DevFramework/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md  
  Purpose: **Complete workflow guide** — 4 Phasen, Task-Workflow, Progress Tracking, Commit-Regeln.
- Docs/DevFramework/Guidelines/DEVELOPMENT_GUIDELINES.md  
  Purpose: coding standards, practices, guardrails.
- Docs/DevFramework/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md  
  Purpose: spec writing rules (FR/IG/DD), verification loop, self-documenting requirement.
- Docs/DevFramework/Guidelines/PROJECT_SCAFFOLD_CHECKLIST.md  
  Purpose: ensure project skeleton and tooling are complete.

### Cascade Tooling

- Docs/DevFramework/Tooling/BOOTSTRAP.md  
  Purpose: **Single entry point** for all tooling docs. Quick start commands and links.
- Docs/DevFramework/Tooling/CASCADE_WATCHER.md  
  Purpose: Multi-instance watcher system for command execution.
- Docs/DevFramework/Tooling/GIT_WORKFLOW.md  
  Purpose: Git workflow, simple dev/main model, no PRs.

### TaskQualityAssurance (formerly "Autonomy Stack")

- Docs/DevFramework/TaskQualityAssurance/INDEX.md  
  Purpose: **Entry point for TaskQualityAssurance** — task boxes, telemetry, anomaly detection, evidence bundles.
- Docs/DevFramework/TaskQualityAssurance/ZOOM_OUT.md  
  Purpose: **Anomaly recovery protocol** — 5-step procedure when stuck.
- Docs/DevFramework/TaskQualityAssurance/boxes/\*.md  
  Purpose: **Task box checklists** — per-type verification requirements (feature, bugfix, refactor, etc.)
- scripts/ai/telemetry.cjs  
  Purpose: **Telemetry CLI** — log events, commands, errors (JSONL format).
- scripts/ai/anomaly-detector.cjs  
  Purpose: **Anomaly detection** — repetition, churn, time, scope drift.
- scripts/ai/evidence-generator.cjs  
  Purpose: **Evidence bundles** — per-task completion artifacts.
- scripts/ai/learning-extractor.cjs  
  Purpose: **Learning extraction** — propose principles from evidence.

### Development History

- Docs/DevFramework/Devlog/CHANGELOG.md  
  Purpose: **Everything log** — one line per commit/session, quick scan of all changes.
- Docs/DevFramework/Devlog/DECISIONS.md  
  Purpose: **Decision log** — significant design/architecture/policy decisions (ADR-light).
- Docs/DevFramework/Devlog/LEARNINGS.md  
  Purpose: **Learnings (Distillate)** — proven preferences, max 30 bullets, read at session start.
- Docs/DevFramework/Devlog/LEARNINGS-INBOX.md  
  Purpose: **Learnings Inbox** — raw feedback capture, unbounded, not read at session start.

### Code Quality

- Docs/DevFramework/Standards/code-quality-standard.md  
  Purpose: Code quality rules (formatting, linting, complexity, test stability).

### Framework Specs/Plans/Tasks

- Docs/DevFramework/Specs/task-quality-assurance.md — TaskQualityAssurance system spec
- Docs/DevFramework/Plans/task-quality-assurance.md — TaskQualityAssurance implementation plan
- Docs/DevFramework/Tasks/task-quality-assurance.md — TaskQualityAssurance task breakdown

---

## AppDocs — Application Documentation

**Entry point:** `Docs/AppDocs/INDEX.md` (to be created)

### Product Spec (what we build)

- Docs/AppDocs/Guidelines/UI_LOGIC_SPEC_V1.md  
  Purpose: screens, flows, rules, acceptance criteria for the app.

### Architecture

- Docs/AppDocs/Guidelines/TECHNICAL_GUIDELINE_V1.md  
  Purpose: project structure, module boundaries, data model, decisions.
- Docs/AppDocs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md  
  Purpose: SvelteKit + PWA constraints (offline-first, Safari behavior, etc.)
- Docs/AppDocs/Guidelines/THEMING.md  
  Purpose: App theming and styling guidelines.

### Feature Specs (A1 — Subscription Plans)

- Docs/AppDocs/Specs/subscription-plans.md  
  Purpose: Subscription tiers (Free/Pro/Premium), Import/Export, Cloud Backup gating.
- Docs/AppDocs/Plans/subscription-plans.md  
  Purpose: Architecture for subscription feature.
- Docs/AppDocs/Tasks/subscription-plans.md  
  Purpose: Task breakdown for subscription implementation.

### Feature Specs (P11 — AI Import)

- Docs/AppDocs/Specs/ai-import.md  
  Purpose: Spec for AI-powered import from CSV/Excel/Text/Images (Premium feature).
- Docs/AppDocs/Plans/ai-import.md  
  Purpose: Architecture and implementation plan for AI Import.
- Docs/AppDocs/Tasks/ai-import.md  
  Purpose: Task breakdown for AI Import (25 tasks in 7 sub-phases).

---

## Naming Convention

**We spell out acronyms for clarity.** Example: `TaskQualityAssurance` instead of `TaskQA`.

This ensures documentation is understandable without prior context.

---

## Required "Doc Inventory" in every Cascade answer

At the top of every response, Cascade must list:

- Docs read (exact paths)
- Any conflicts found + which doc won by priority
- Assumptions (only if unavoidable) + where they should be specified in docs
