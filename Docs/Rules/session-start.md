# Session Start Rules

**Trigger:** Beginning of any new session

---

## Workflow

1. Run `/project-start` workflow
2. Follow its instructions and paste the requested one-line outputs
3. If anything is missing/fails, STOP and fix that first

## Mandatory Doc Loading

Before planning or coding, ALWAYS:

1. Read: `Docs/INDEX.md`
2. Read ONLY the docs referenced in `Docs/INDEX.md` that are relevant to the task
3. Start every response with a "Doc Inventory" section listing exactly what was read (exact file paths + headings/sections used)

If required info is missing, STOP and propose an update to the relevant doc (spec/plan/tasks) before coding.

## Learnings Check

Read `Docs/Devlog/LEARNINGS.md` (max 30 bullets of proven preferences).

## Memory Policy

- **Do NOT use `create_memory` tool** — this project uses file-based documentation
- All learnings go to `Docs/Devlog/LEARNINGS-INBOX.md`
- All rules go to `Docs/Rules/` or `.windsurf/rules/`
- IDE-independent system — no reliance on Cascade memories

---

**Next:** After session start, proceed to appropriate trigger:
- Creating spec? → Read `Docs/Rules/spec-writing.md`
- Creating plan? → Read `Docs/Rules/planning.md`
- Implementing? → Read `Docs/Rules/implementation.md`
