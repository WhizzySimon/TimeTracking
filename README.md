# TimeTracker

Offline-first time tracking app (SvelteKit PWA).

## Entry points

- Human onboarding: `START_HERE.md`
- Single source of truth + priority order: `Docs/INDEX.md`
- Agent/process rules: `AGENTS.md`

## Start a new Cascade session

1) Run:
- /project-start

2) Paste the one-line outputs from the workflows.

3) Then give the first implementation instruction (e.g. "Complete Task 0, then start Task 1.1.").

## When commands are needed

Cascade must create a PowerShell script under `scripts/`.
You run it locally and paste the output back into Cascade.
