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

### Phase 0: Setup

1. /rules-read-all
2. /read-governance
3. Ensure on dev branch:
   ```
   git checkout dev
   git pull origin dev
   ```
4. Read `Docs/DevFramework/DeveloperGuidesAndStandards/SPEC_DRIVEN_DEVELOPMENT.md` (kompletter Workflow-Guide)

### Phase 1: SPEC erstellen

4. Frage den User: "Beschreibe das Feature, das du implementieren willst."

5. Nach User-Input:
   - Erstelle `Docs/AppDocs/Specs/<feature-slug>.md` basierend auf `Docs/AppDocs/Specs/_template.md`
   - Fülle aus: Goal, Scope, FR, IG, DD, Edge cases, Data & privacy, Acceptance checks
   - Zeige dem User die Spec zur Bestätigung

6. Checkpoint:
   - [ ] Keine mehrdeutigen Begriffe
   - [ ] Alle FR/IG/DD nummeriert und testbar
   - [ ] User hat Spec bestätigt

### Phase 2: PLAN erstellen

7. Erstelle `Docs/AppDocs/Plans/<feature-slug>.md` basierend auf `Docs/AppDocs/Plans/_template.md`
   - Architecture/modules
   - Data model
   - UI state model
   - Error handling
   - Testing strategy

8. Checkpoint:
   - [ ] Plan kann als Tasks ausgeführt werden ohne neue Entscheidungen
   - [ ] User hat Plan bestätigt

### Phase 3: TASKS erstellen

9. Erstelle `Docs/AppDocs/Tasks/<feature-slug>.md` basierend auf `Docs/AppDocs/Tasks/_template.md`
   - Kleine Tasks (0.5-2h)
   - Jeder Task hat: Files, Done when, Verify, Guardrails

10. Füge neue Phase in `Docs/DevFramework/IMPLEMENTATION_PROGRESS.md` hinzu
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

14. Bei "Ja": Starte Implementation gemäß Task-Workflow (see `Docs/DevFramework/DeveloperGuidesAndStandards/SPEC_DRIVEN_DEVELOPMENT.md`):
    - Code implementieren
    - `npm run verify`
    - Unit Tests (wenn vorhanden)
    - MCP Playwright Browser Test
    - Progress Tracker updaten
    - Changelog updaten
    - Git Commit (follow `Docs/DevFramework/JustInTimeAgentRules/pre-commit.md`)

---

## Report format

Nach Phase 0-3:

```
# Doc Inventory
- .windsurf/rules/* (all rules)
- Docs/INDEX.md, RULE_MAP.md
- Docs/DevFramework/DeveloperGuidesAndStandards/SPEC_DRIVEN_DEVELOPMENT.md

# Feature: <name>
- Spec: Docs/AppDocs/Specs/<feature>.md ✅
- Plan: Docs/AppDocs/Plans/<feature>.md ✅
- Tasks: Docs/AppDocs/Tasks/<feature>.md ✅
- Progress Tracker: Updated ✅

Bereit für Implementation. Soll ich mit Task 1 beginnen?
```

---

## Wichtig

- **Nicht überspringen:** Jede Phase muss abgeschlossen sein bevor die nächste beginnt
- **User-Bestätigung:** Nach jeder Phase kurz bestätigen lassen
- **Dokumentation first:** Keine Zeile Code ohne Spec + Plan + Tasks
