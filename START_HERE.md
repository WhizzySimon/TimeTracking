# Entry point (human quickstart, non-authoritative)

This file is for humans only. The source of truth is Docs/INDEX.md. Follow AGENTS.md and the start-of-session workflow (/project-start). If anything here conflicts with Docs/INDEX.md, ignore this file.

---

## Start a new implementation chat

1. **Run the project start workflow:**

   ```
   /project-start
   ```

2. **Paste the one-line outputs** from each workflow when prompted.

3. **Give the first instruction:**
   ```
   Complete Task 0 (setup testing), then start Task 1.1.
   ```

Expected: Cascade should load docs and start with a "Doc Inventory" section listing what was read.

---

## When commands are needed

Cascade must create PowerShell scripts in `scripts/*.ps1` when verification commands are needed. You run the script and paste the output back. Cascade cannot execute terminal commands directly.

Example verification commands you may need to run:

- `npm run check` (TypeScript)
- `npm run lint` (ESLint + Prettier)
- `npm run test:unit` (Vitest)
- `npm run build` (production build)

---

## Where to find things

- **Docs/INDEX.md** - Source of truth, doc index, priority order
- **AGENTS.md** - Spec-driven process rules (4 phases)
- **Docs/Guidelines/ui-logic-spec-v1.md** - Product spec (what to build)
- **Docs/Guidelines/technical-guideline-v1.md** - Architecture (how to build)
- **Docs/Plans/timetracker-v1-implementation.md** - Implementation plan
- **Docs/Tasks/timetracker-v1-implementation.md** - 60 tasks breakdown
- **Docs/IMPLEMENTATION_PROGRESS.md** - Progress tracker (updated per task)
- **Docs/TESTING_STRATEGY.md** - Unit testing guide
