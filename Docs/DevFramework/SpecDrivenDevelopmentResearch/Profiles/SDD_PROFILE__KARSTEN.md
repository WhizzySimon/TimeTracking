# SDD Profile: SharePoint-GPT-Middleware (Karsten)

**Generated:** 2025-12-24
**Type:** repo-maturity
**Scope:** Full repository analysis of SharePoint-GPT-Middleware FastAPI project
**Analyst:** Cascade (AI agent)

## Evidence Inventory

Files inspected:

- `README.md` — Project overview, API endpoints, setup instructions
- `.windsurf/rules/implementation-specification-rules.md` — Spec writing rules (FR/IG/DD format)
- `.windsurf/rules/python-rules.md` — Python coding conventions, logging format
- `.windsurf/rules/workspace-rules.md` — Empty (trigger only)
- `.windsurf/workflows/*.md` — 5 workflow files (read-all-md-files, rules-read-all, etc.)
- `_V2_SPEC_ROUTERS.md` — V2 router technical specification (1680 lines)
- `_V2_SPEC_COMMON_UI_FUNCTIONS.md` — UI library specification (1240 lines)
- `PERSISTENT_STORAGE_STRUCTURE.md` — Storage folder/file documentation
- `src/pyproject.toml` — Dependencies, dev tools (pytest, ruff)
- `requirements.txt` — Compiled dependencies (FastAPI, OpenAI, Azure)
- `.vscode/tasks.json` — VS Code tasks (Run API, Open Browser)
- `src/test_*.py` — 3 integration test files (Azure OpenAI, SharePoint access)

## Scoring Policy

**Type:** repo-maturity  
**Scale:** 0 = absent, 5 = robust + enforced

## Axis Score Table

| Axis                     | Score (0-5) | Confidence | Evidence Pointers                                                                            | 1-line Rationale                                                                                            |
| ------------------------ | ----------: | ---------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1. Spec quality          |           4 | High       | `_V2_SPEC_ROUTERS.md:1-60`, `.windsurf/rules/implementation-specification-rules.md:52-62`    | FR/IG/DD numbering enforced, TOC required, "What we don't want" section; no spec template file              |
| 2. Scope control         |           3 | Med        | `_V2_SPEC_ROUTERS.md:56-61`, `.windsurf/rules/implementation-specification-rules.md:117-126` | "What we don't want" sections document anti-patterns; no explicit scope-lock gates                          |
| 3. Traceability          |           2 | Med        | `_V2_SPEC_ROUTERS.md:192-200`                                                                | DD-E001 to DD-E009 numbered decisions; no progress tracker, no task-to-spec mapping                         |
| 4. Code quality rules    |           4 | High       | `.windsurf/rules/python-rules.md`, `src/pyproject.toml:43-44`                                | Detailed Python rules (imports, logging, naming); ruff configured (line-length=200); no enforced pre-commit |
| 5. Testing strategy      |           2 | Med        | `src/pyproject.toml:26-29`, `src/test_*.py`                                                  | pytest in dev deps, 3 integration test files; no unit tests, no E2E, no coverage                            |
| 6. Tooling & automation  |           2 | Med        | `.vscode/tasks.json`, `InstallAndCompileDependencies.bat`                                    | VS Code tasks for dev server; batch scripts for Azure deploy; no CI/CD, no verification script              |
| 8. Iteration loop        |           1 | Low        | UNKNOWN                                                                                      | No task workflow documented, no progress tracker, no commit conventions                                     |
| 9. Operational safety    |           3 | Med        | `.windsurf/rules/python-rules.md:26-38`                                                      | "Do not rename existing symbols", "re-use existing code"; no explicit run_command ban                       |
| 10. Cost/time efficiency |           2 | Low        | `.windsurf/rules/implementation-specification-rules.md:29`                                   | Spec length guidelines (500-2500 lines); no task sizing, no token tracking                                  |

**Total Score:** 26/50

## Key Practices (max 10)

1. **FR/IG/DD numbering with domain prefixes** — Requirements use `XXXX-FR-01`, `XXXX-IG-01`, `XXXX-DD-01` format (`.windsurf/rules/implementation-specification-rules.md:92-100`)
2. **"What we don't want" sections** — Anti-patterns documented in specs (`_V2_SPEC_ROUTERS.md:56-61`)
3. **Detailed Python coding rules** — Imports, logging format, naming conventions, docstring rules (`.windsurf/rules/python-rules.md`)
4. **Spec dependency declarations** — "Depends on" / "Does not depend on" headers (`_V2_SPEC_ROUTERS.md:5-11`)
5. **ASCII UI diagrams** — Component layouts with box diagrams (`_V2_SPEC_COMMON_UI_FUNCTIONS.md:182-200`)
6. **Spec change log format** — Timestamped changelog with Added/Changed/Fixed prefixes (`.windsurf/rules/implementation-specification-rules.md:328-362`)
7. **Layer architecture diagrams** — ASCII box diagrams for call hierarchy (`.windsurf/rules/implementation-specification-rules.md:128-144`)
8. **Structured logging format** — `[ x / n ]` iterations, `OK/ERROR/FAIL/WARNING` status (`.windsurf/rules/python-rules.md:50-112`)
9. **Ruff linter configured** — Line length 200, in pyproject.toml (`src/pyproject.toml:43-44`)
10. **Azure deployment scripts** — PowerShell scripts for App Service create/deploy/delete (`CreateAzureAppService.ps1`, `DeployAzureAppService.ps1`)

## Failure Modes / Typical Defects (max 10)

1. **No AGENTS.md** — No central process guide for AI agents
2. **No progress tracker** — No file tracking task completion or verification results
3. **No task template** — Specs exist but no structured task breakdown
4. **No spec template file** — Rules describe format but no `_template.md` to copy
5. **No verification script** — No `npm run verify` equivalent for Python (format + lint + typecheck)
6. **No E2E tests** — Only integration tests for external services (Azure, SharePoint)
7. **No CI/CD pipeline** — All verification is manual
8. **No mandatory doc inventory** — Workflows read files but no structured inventory in responses
10. **No commit conventions** — No conventional commits format documented

## "Best-of" Adoptable Practices for TimeTracker (max 10)

1. **Add "Depends on" / "Does not depend on" headers** — Target: `Docs/Features/Specs/_template.md` add dependency declaration section
2. **Add "What we don't want" section** — Target: `Docs/Features/Specs/_template.md` add anti-patterns section after Scope
3. **Add spec change log format** — Target: `Docs/Features/Specs/_template.md` use timestamped `**[YYYY-MM-DD HH:MM]**` format with Added/Changed/Fixed prefixes
4. **Add layer architecture diagrams** — Target: `Docs/Features/Plans/_template.md` add ASCII box diagram section for multi-layer systems
5. **Add structured logging rules** — Target: `.windsurf/rules/` add logging format rules (`[ x / n ]`, `OK/ERROR/FAIL`)
6. **Add domain prefix convention** — Target: `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md` document domain prefix convention (e.g., V2UI, V2EP)
7. **Add spec length guidelines** — Target: `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md` add "small: ~500 lines, medium: ~1000 lines, complex: ~2500 lines"
8. **Add ASCII UI diagram convention** — Target: `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md` document component boundary diagrams
9. **Add "Scenario" section with Problem/Solution** — Target: `Docs/Features/Specs/_template.md` add structured scenario section
10. **Add event flow documentation** — Target: `Docs/Features/Plans/_template.md` add call flow diagrams with `+->` notation

## Open Questions / Gaps

- **Gap 1:** No unit test coverage for core business logic (only external service integration tests)
- **Gap 2:** No type checking (mypy not configured)
- **Gap 3:** No pre-commit hooks for code quality enforcement

## Notes

- This repo has strong spec-writing conventions but weak process enforcement
- Specs are detailed (1000+ lines) but no task breakdown or progress tracking
- Python rules are comprehensive but not enforced via automation
- Comparison: TimeTracker scores 46/50, Karsten scores 26/50 — main gaps are iteration loop, testing, and tooling automation
