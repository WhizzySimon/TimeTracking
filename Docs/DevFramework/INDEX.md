# DevFramework Documentation

This folder contains all **development framework documentation** — the process, rules, and tooling for building TimeTracker.

## What's in DevFramework?

| Folder                           | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| `JustInTimeAgentRules/`          | JIT rules for Cascade behavior (session-start, pre-commit, etc.) |
| `DeveloperGuidesAndStandards/`   | Development guidelines, spec writing rules, workflow guides      |
| `ToolSetup/`                     | Cascade watcher, git workflow, bootstrap docs                    |
| `TaskQualityAssurance/`          | Quality assurance system (task boxes, audit, evidence bundles)   |
| `FrameworkSelfImprovementLogs/`  | Changelog, decisions, learnings — self-learning system           |
| `FrameworkFeatureSpecs/`         | Framework-related specifications                                 |
| `FrameworkFeaturePlans/`         | Framework-related implementation plans                           |
| `FrameworkFeatureTasks/`         | Framework-related task breakdowns                                |
| `NewFeatureTesting/`             | Testing strategy documentation                                   |
| `SpecDrivenDevelopmentResearch/` | Spec-Driven Development methodology profiles                     |
| `Archive/`                       | Obsolete docs, completed audits, historical reference            |

## Quick Start

### For New Sessions

1. Read `JustInTimeAgentRules/_entrypoint-jit-rule-map.md` — the JIT rule dispatcher
2. Follow the appropriate trigger point for your action

### For Task Quality Assurance

See `TaskQualityAssurance/INDEX.md` for:

- Task boxes (checklists per task type)
- Anomaly detection
- Evidence bundles
- Audit gate workflow

### For Tooling Setup

See `ToolSetup/BOOTSTRAP.md` for:

- Dev server setup
- Cascade watcher
- Git workflow

## Naming Convention

**We spell out acronyms for clarity.** Example: `TaskQualityAssurance` instead of `TaskQA`.

This ensures documentation is understandable without prior context.

---

**Parent index:** `Docs/INDEX.md`
