# DevFramework Documentation

This folder contains all **development framework documentation** — the process, rules, and tooling for building TimeTracker.

## What's in DevFramework?

| Folder                  | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `Rules/`                | JIT rules for Cascade behavior (session-start, pre-commit, etc.) |
| `Guidelines/`           | Development guidelines, spec writing rules, workflow guides      |
| `Tooling/`              | Cascade watcher, git workflow, bootstrap docs                    |
| `TaskQualityAssurance/` | Quality assurance system (task boxes, audit, evidence bundles)   |
| `Devlog/`               | Changelog, decisions, learnings, evidence bundles                |
| `Specs/`                | Framework-related specifications                                 |
| `Plans/`                | Framework-related implementation plans                           |
| `Tasks/`                | Framework-related task breakdowns                                |
| `Standards/`            | Code quality standards                                           |
| `Testing/`              | Testing strategy documentation                                   |
| `SDD/`                  | Spec-Driven Development profiles                                 |
| `Reports/`              | Analysis and audit reports                                       |

## Quick Start

### For New Sessions

1. Read `Rules/_entrypoint-jit-rule-map.md` — the JIT rule dispatcher
2. Follow the appropriate trigger point for your action

### For Task Quality Assurance

See `TaskQualityAssurance/INDEX.md` for:

- Task boxes (checklists per task type)
- Anomaly detection
- Evidence bundles
- Audit gate workflow

### For Tooling Setup

See `Tooling/BOOTSTRAP.md` for:

- Dev server setup
- Cascade watcher
- Git workflow

## Naming Convention

**We spell out acronyms for clarity.** Example: `TaskQualityAssurance` instead of `TaskQA`.

This ensures documentation is understandable without prior context.

---

**Parent index:** `Docs/INDEX.md`
