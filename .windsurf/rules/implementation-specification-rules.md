---
trigger: always_on
---

# Implementation Specification Rules (TimeTracker)

**Bootstrap rule set.** Source of truth: [Docs/INDEX.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/INDEX.md:0:0-0:0) and [RULE_MAP.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/RULE_MAP.md:0:0-0:0).

## Just-in-Time Rules

This project uses trigger-based rules. Read the right rules at the right time:

| When | Read |
|------|------|
| Session start | [Docs/Rules/session-start.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/Rules/session-start.md:0:0-0:0) |
| Creating spec | [Docs/Rules/spec-writing.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/Rules/spec-writing.md:0:0-0:0) |
| Creating plan | [Docs/Rules/planning.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/Rules/planning.md:0:0-0:0) |
| Before implementing | [Docs/Rules/implementation.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/Rules/implementation.md:0:0-0:0) |
| Before git commit | [Docs/Rules/pre-commit.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/Rules/pre-commit.md:0:0-0:0) |
| Session end | [Docs/Rules/session-end.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/Rules/session-end.md:0:0-0:0) |

Full trigger map: [RULE_MAP.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/RULE_MAP.md:0:0-0:0)

## Core Principles (always)

- **Source of truth:** [Docs/INDEX.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/INDEX.md:0:0-0:0) (priority order when docs conflict)
- **Never use git stash** — causes data loss
- **Use `&&` for watcher commands** — watcher uses cmd.exe

## How to Write Requirements (FR/IG/DD)

Authoritative format:
- [Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md](cci:7://file:///e:/Private/Dev/Timekeeping/TimeTracker/Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md:0:0-0:0)
- `Docs/Specs/_template.md`

Minimum bar for any feature change:
- FR/IG/DD are numbered, testable, and unambiguous
- Acceptance checks exist and map to the numbered requirements