---
description: Start a new feature - follows Spec-Driven Development (Spec → Plan → Tasks → Implement)
---

## Wann diesen Workflow nutzen?

Nutze `/new-feature` wenn du ein **komplett neues Feature** implementieren willst, das noch keine Spec/Plan/Tasks hat.

**Nicht nutzen wenn:**

- Tasks bereits existieren → nutze `/continue-work`
- Nur eine kleine Änderung/Bugfix → nutze `/new-task`

---

## Cascade Workflow

### Step 0: Watcher Instance (CRITICAL)

If the user specified an instance (e.g., `/new-feature A`), use that instance.
Otherwise, ask: **"Which watcher instance are you using? (A or B)"**

Remember the instance for this entire session:

- Instance A: `scripts/watcher/A/command.txt`, `scripts/watcher/A/status.txt`, `scripts/watcher/A/output.txt`
- Instance B: `scripts/watcher/B/command.txt`, `scripts/watcher/B/status.txt`, `scripts/watcher/B/output.txt`

### Step 1: Branch Decision (CRITICAL)

**New chat session = new branch.** Create a branch directly from current position:

```
git checkout -b feat/<feature-name>
```

**Do NOT go to main first.** See `Docs/Tooling/GIT_WORKFLOW.md` section "Anti-Pattern 1" for why.

### Phase 0: Setup

1. /rules-read-all
2. /read-governance
3. Read `Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md` (kompletter Workflow-Guide)

### Phase 1: SPEC erstellen

4. Frage den User: "Beschreibe das Feature, das du implementieren willst."

5. Nach User-Input:
   - Erstelle `Docs/Specs/<feature-slug>.md` basierend auf `Docs/Specs/_template.md`
   - Fülle aus: Goal, Scope, FR, IG, DD, Edge cases, Data & privacy, Acceptance checks
   - Zeige dem User die Spec zur Bestätigung

6. Checkpoint:
   - [ ] Keine mehrdeutigen Begriffe
   - [ ] Alle FR/IG/DD nummeriert und testbar
   - [ ] User hat Spec bestätigt

### Phase 2: PLAN erstellen

7. Erstelle `Docs/Plans/<feature-slug>.md` basierend auf `Docs/Plans/_template.md`
   - Architecture/modules
   - Data model
   - UI state model
   - Error handling
   - Testing strategy

8. Checkpoint:
   - [ ] Plan kann als Tasks ausgeführt werden ohne neue Entscheidungen
   - [ ] User hat Plan bestätigt

### Phase 3: TASKS erstellen

9. Erstelle `Docs/Tasks/<feature-slug>.md` basierend auf `Docs/Tasks/_template.md`
   - Kleine Tasks (0.5-2h)
   - Jeder Task hat: Files, Done when, Verify, Guardrails

10. Füge neue Phase in `Docs/IMPLEMENTATION_PROGRESS.md` hinzu
    - Phase-Header mit Status "Not started"
    - Alle Tasks als [ ] (unchecked)

11. Checkpoint:
    - [ ] Alle Tasks haben klare "Done when" Kriterien
    - [ ] Progress Tracker aktualisiert
    - [ ] User hat Tasks bestätigt

### Phase -1: Pre-Implementation Gates

12. **Verify Phase -1 / Pre-Implementation Gates are checked PASS** in spec/plan/tasks before Task 1 implementation:
    - [ ] Simplicity: ≤3 neue Dateien für initiale Implementierung?
    - [ ] Anti-Abstraction: Framework direkt nutzen, keine unnötigen Wrapper?
    - [ ] Integration-First: Contracts/Interfaces vor Implementierung definiert?
    - [ ] Scope-Lock: Keine neuen Requirements seit Spec-Approval hinzugefügt?
    - [ ] Test-Ready: Mindestens ein Acceptance Check ist automatisierbar?

### Phase 4: IMPLEMENT

13. Frage den User: "Spec, Plan und Tasks sind fertig. Phase -1 Gates bestanden. Soll ich mit Task 1 beginnen?"

14. Bei "Ja": Starte Implementation gemäß Task-Workflow:
    - Code implementieren
    - `npm run verify`
    - Unit Tests (wenn vorhanden)
    - MCP Playwright Browser Test
    - Progress Tracker updaten
    - Git Commit

---

## Report format

Nach Phase 0-3:

```
# Doc Inventory
- .windsurf/rules/* (all rules)
- Docs/INDEX.md, AGENTS.md
- Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md

# Feature: <name>
- Spec: Docs/Specs/<feature>.md ✅
- Plan: Docs/Plans/<feature>.md ✅
- Tasks: Docs/Tasks/<feature>.md ✅
- Progress Tracker: Updated ✅

Bereit für Implementation. Soll ich mit Task 1 beginnen?
```

---

## Wichtig

- **Nicht überspringen:** Jede Phase muss abgeschlossen sein bevor die nächste beginnt
- **User-Bestätigung:** Nach jeder Phase kurz bestätigen lassen
- **Dokumentation first:** Keine Zeile Code ohne Spec + Plan + Tasks
