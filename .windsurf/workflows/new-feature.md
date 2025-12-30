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

1. Read `.windsurf/rules/always-on.md` (loads JIT rule map)
2. Read `DevFramework/JustInTimeAgentRules/mindset.md`
3. Ensure on dev branch:
   ```
   git checkout dev
   git pull origin dev
   ```

### Phase 1: SPEC erstellen

> **⚠️ MODEL CHECK:** Phases 1-3 require design decisions.
> **Select Opus 4 Thinking** before proceeding.

3. Frage den User: "Beschreibe das Feature, das du implementieren willst."

4. Nach User-Input:
   - Erstelle `Docs/AppDocs/Features/Specs/<feature-slug>.md` basierend auf `Docs/AppDocs/Features/Specs/_template.md`
   - Fülle aus: Goal, Scope, FR, IG, DD, Edge cases, Data & privacy, Acceptance checks
   - Zeige dem User die Spec zur Bestätigung

5. Checkpoint:
   - [ ] Keine mehrdeutigen Begriffe
   - [ ] Alle FR/IG/DD nummeriert und testbar
   - [ ] User hat Spec bestätigt

### Phase 2: PLAN erstellen

6. Erstelle `Docs/AppDocs/Features/Plans/<feature-slug>.md` basierend auf `Docs/AppDocs/Features/Plans/_template.md`
   - Architecture/modules
   - Data model
   - UI state model
   - Error handling
   - Testing strategy

7. Checkpoint:
   - [ ] Plan kann als Tasks ausgeführt werden ohne neue Entscheidungen
   - [ ] User hat Plan bestätigt

### Phase 3: TASKS erstellen

8. Erstelle `Docs/Features/Tasks/<feature-slug>.md` basierend auf `Docs/AppDocs/Features/Tasks/_template.md`
   - Kleine Tasks (0.5-2h)
   - Jeder Task hat: Files, Done when, Verify, Guardrails

9. Füge neue Phase in `Docs/Features/IMPLEMENTATION_PROGRESS.md` hinzu - Phase-Header mit Status "Not started" - Alle Tasks als [ ] (unchecked)

10. Checkpoint:
    - [ ] Alle Tasks haben klare "Done when" Kriterien
    - [ ] Progress Tracker aktualisiert
    - [ ] User hat Tasks bestätigt

### Phase -1: Pre-Implementation Gates

11. **Verify Phase -1 / Pre-Implementation Gates are checked PASS** in spec/plan/tasks before Task 1 implementation:
    - [ ] Simplicity: ≤3 neue Dateien für initiale Implementierung?
    - [ ] Anti-Abstraction: Framework direkt nutzen, keine unnötigen Wrapper?
    - [ ] Integration-First: Contracts/Interfaces vor Implementierung definiert?
    - [ ] Scope-Lock: Keine neuen Requirements seit Spec-Approval hinzugefügt?
    - [ ] Test-Ready: Mindestens ein Acceptance Check ist automatisierbar?

### Phase 4: IMPLEMENT

> **⚠️ MODEL CHECK:** Implementation is execution, not design.
> **Switch to Sonnet 4.5** (2x) or **Opus 4** (4x) to save credits.

12. Frage den User: "Spec, Plan und Tasks sind fertig. Phase -1 Gates bestanden. **Bitte wechsle zu Sonnet 4.5** (für einfache Tasks) oder **Opus 4** (für komplexere Tasks). Soll ich mit Task 1 beginnen?"

13. Bei "Ja": Code implementieren - `npm run verify` - Unit Tests (wenn vorhanden) - MCP Playwright Browser Test - Progress Tracker updaten - Changelog updaten - Git Commit (follow `DevFramework/JustInTimeAgentRules/pre-commit.md`)

---

## Report format

Nach Phase 0-3:

```
# Doc Inventory
- .windsurf/rules/* (all rules)

# Feature: <name>
- Spec: Docs/AppDocs/Features/Specs/<feature>.md ✅
- Plan: Docs/AppDocs/Features/Plans/<feature>.md ✅
- Tasks: Docs/AppDocs/Features/Tasks/<feature>.md ✅
- Progress Tracker: Updated ✅

Bereit für Implementation. Soll ich mit Task 1 beginnen?
```

---

## Wichtig

- **Nicht überspringen:** Jede Phase muss abgeschlossen sein bevor die nächste beginnt
- **User-Bestätigung:** Nach jeder Phase kurz bestätigen lassen
- **Dokumentation first:** Keine Zeile Code ohne Spec + Plan + Tasks
