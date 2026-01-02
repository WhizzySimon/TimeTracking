# Spec-Driven Development — Complete Workflow

Dieses Dokument beschreibt den vollständigen Workflow für die Entwicklung neuer Features in TimeTracker.

---

## Welchen Workflow starten?

**Immer zuerst `/project-start` ausführen.** Danach je nach Kontext `/continue-work` oder `/new-feature` oder `/new-task`.

Beim Start eines neuen Chats (nach `/project-start`) den richtigen Workflow wählen:

```
Neuer Chat starten
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Hast du offene Tasks im Progress Tracker?               │
│  (Check: Docs/IMPLEMENTATION_PROGRESS.md)                │
└──────────────────────────────────────────────────────────┘
       │                              │
      JA                            NEIN
       │                              │
       ▼                              ▼
┌─────────────┐          ┌──────────────────────────────────┐
│ /continue-  │          │  Willst du ein neues Feature     │
│    work     │          │  implementieren (Spec nötig)?    │
└─────────────┘          └──────────────────────────────────┘
                                │                │
                               JA              NEIN
                                │                │
                                ▼                ▼
                         ┌─────────────┐  ┌─────────────┐
                         │ /new-       │  │ /new-task   │
                         │   feature   │  │             │
                         └─────────────┘  └─────────────┘
```

| Workflow         | Wann nutzen?                                                |
| ---------------- | ----------------------------------------------------------- |
| `/continue-work` | Tasks sind offen → findet nächsten Task automatisch         |
| `/new-feature`   | Neues Feature → führt durch Spec → Plan → Tasks → Implement |
| `/new-task`      | Kleine Änderung, Bugfix, Ad-hoc Aufgabe                     |

---

## Übersicht: 4 Phasen + Implementation

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: SPEC          →  Was/Warum?                               │
│  PHASE 2: PLAN          →  Wie? (Architektur)                       │
│  PHASE 3: TASKS         →  Kleine, verifizierbare Schritte          │
│  PHASE 4: IMPLEMENT     →  Code schreiben + testen + committen      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase -1: Pre-Implementation Gates

**Ziel:** Sicherstellen, dass wir nicht over-engineeren, bevor wir anfangen.

Vor dem Start von Phase 4 (Implementation) müssen alle Gates bestanden sein:

- [ ] **Simplicity:** ≤3 neue Dateien für initiale Implementierung?
- [ ] **Anti-Abstraction:** Framework direkt nutzen, keine unnötigen Wrapper?
- [ ] **Integration-First:** Contracts/Interfaces vor Implementierung definiert?
- [ ] **Scope-Lock:** Keine neuen Requirements seit Spec-Approval hinzugefügt?
- [ ] **Test-Ready:** Mindestens ein Acceptance Check ist automatisierbar?

---

## Phase 1: SPEC erstellen

**Ziel:** Festhalten, WAS gebaut werden soll und WARUM.

**Datei:** `TempAppDevDocs/Features/Specs/<feature-slug>.md`

**Template:** `TempAppDevDocs/Features/Specs/_template.md`

### Pflichtinhalte

| Abschnitt                          | Beschreibung                                          |
| ---------------------------------- | ----------------------------------------------------- |
| **Goal / Problem**                 | 1-3 Sätze: Was ist das Problem?                       |
| **Scope**                          | In scope / Out of scope                               |
| **Functional Requirements (FR)**   | User-sichtbares Verhalten (TT-FR-001, TT-FR-002, ...) |
| **Implementation Guarantees (IG)** | Constraints die immer gelten müssen (TT-IG-001, ...)  |
| **Design Decisions (DD)**          | Bewusste Entscheidungen (TT-DD-001, ...) — optional   |
| **Edge cases**                     | Randfälle und Fehlerszenarien                         |
| **Data & privacy**                 | Was wird gespeichert, wo, wie lange?                  |
| **Acceptance checks**              | Testbare Kriterien (AC-001, AC-002, ...)              |
| **Change log**                     | Änderungshistorie                                     |

### Checkpoint vor Phase 2

- [ ] Keine mehrdeutigen Begriffe (z.B. "schnell", "einfach") ohne messbare Definition
- [ ] Alle FR/IG/DD sind nummeriert und testbar
- [ ] Edge cases sind dokumentiert

---

## Phase 2: PLAN erstellen

**Ziel:** Festhalten, WIE es gebaut werden soll (Architektur).

**Datei:** `TempAppDevDocs/Features/Plans/<feature-slug>.md`

**Template:** `TempAppDevDocs/Features/Plans/_template.md`

### Pflichtinhalte

| Abschnitt                  | Beschreibung                                    |
| -------------------------- | ----------------------------------------------- |
| **Architecture / modules** | Komponenten, Verantwortlichkeiten, Dependencies |
| **Data model**             | Neue/geänderte Datenstrukturen                  |
| **UI state model**         | Welcher State existiert, wo lebt er?            |
| **Error handling**         | Was kann schiefgehen, wie reagieren wir?        |
| **Testing strategy**       | Unit/Integration/E2E — was ist automatisierbar? |
| **Risks / constraints**    | Performance, UX, Platform-Einschränkungen       |

### Checkpoint vor Phase 3

- [ ] Plan kann als Tasks ausgeführt werden ohne neue Entscheidungen
- [ ] Keine offenen Architektur-Fragen

---

## Phase 3: TASKS erstellen

**Ziel:** Plan in kleine, verifizierbare Schritte aufteilen.

**Datei:** `TempAppDevDocs/Features/Tasks/<feature-slug>.md`

**Template:** `TempAppDevDocs/Features/Tasks/_template.md`

### Task-Format

```markdown
## Task X - [Kurze Beschreibung]

- **Files:**
  - `path/to/file.ts`
- **Done when:**
  - Spezifische Abschlusskriterien
- **Verify:**
  - `npm run verify`
  - `npm run test:unit`
- **Guardrails:**
  - Darf X nicht ändern
  - Muss Y erhalten
```

### Regeln für Tasks

- Tasks sollten **0.5-2h** dauern (human-sized)
- Jeder Task muss **unabhängig verifizierbar** sein
- Kein Task darf von "während dem Coden herausfinden" abhängen

### Checkpoint vor Phase 4

- [ ] Alle Tasks haben klare "Done when" Kriterien
- [ ] Alle Tasks haben Verify-Schritte
- [ ] Tasks sind in logischer Reihenfolge

---

## Phase 4: IMPLEMENT (Task-Workflow)

**Ziel:** Tasks nacheinander implementieren, testen, committen.

### Workflow pro Task

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. CODE IMPLEMENTIEREN                                             │
│     └─ Task umsetzen gemäß Spec/Plan                                │
│                                                                     │
│  2. VERIFICATION (npm run verify)                                   │
│     └─ Format + TypeScript + Lint                                   │
│     └─ Bei Fehlern: Fixen und wiederholen                           │
│                                                                     │
│  3. UNIT TESTS (npm run test:unit)                                  │
│     └─ Wenn Task Unit Tests hat                                     │
│     └─ Bei Fehlern: Fixen und wiederholen                           │
│                                                                     │
│  4. UI TEST (MCP Playwright Browser)                                │
│     └─ mcp1_browser_navigate → http://localhost:5173                │
│     └─ mcp1_browser_snapshot → UI prüfen                            │
│     └─ mcp1_browser_console_messages → Errors prüfen                │
│     └─ Bei Fehlern: Fixen und zurück zu Schritt 2                   │
│                                                                     │
│  5. PROGRESS TRACKER UPDATEN                                        │
│     └─ Task als ✅ markieren in Docs/IMPLEMENTATION_PROGRESS.md     │
│     └─ Verification-Ergebnisse eintragen                            │
│     └─ Deviations notieren (falls vorhanden)                        │
│                                                                     │
│  6. CHANGELOG UPDATEN                                               │
│     └─ Eine Zeile in DevFramework/FrameworkSelfImprovementLogs
/CHANGELOG.md          │
│     └─ Format: | Date | Type | Summary | Ref |                      │
│                                                                     │
│  7. JIT RULE: BEFORE COMMIT                                         │
│     └─ Follow JIT rule map trigger "Before git commit"              │
│     └─ (See: DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md)   │
│                                                                     │
│  8. GIT COMMIT                                                      │
│     └─ git commit -m "feat: description"                            │
│     └─ Commit-Message im Conventional Commits Format                │
│                                                                     │
│  9. NÄCHSTER TASK                                                   │
│     └─ Weiter mit nächstem Task                                     │
│     └─ Bei Phase-Ende: User informieren                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Wichtig: Reihenfolge einhalten!

1. **Erst** alle Tests bestehen lassen
2. **Dann** Progress Tracker updaten
3. **Dann** Changelog updaten (eine Zeile in `DevFramework/FrameworkSelfImprovementLogs
/CHANGELOG.md`)
4. **Dann** JIT rule map: "Before git commit" trigger
5. **Zuletzt** Git Commit (damit alles im Commit ist)

### Commit-Message Format

```
feat: kurze Beschreibung

- Detail 1
- Task X.Y: was wurde gemacht
```

**Typen:**

- `feat:` — Neues Feature
- `fix:` — Bugfix
- `refactor:` — Code-Refactoring
- `docs:` — Dokumentation
- `test:` — Tests hinzufügen/ändern
- `chore:` — Wartung

---

## Progress Tracker

**Datei:** `DevFramework/IMPLEMENTATION_PROGRESS.md`

### Format pro Task

```markdown
- [x] **Task X.Y** — Kurze Beschreibung
  - Files: `path/to/file.ts`
  - Verified: npm run verify ✅, npm run test:unit ✅, Browser test ✅
  - Deviations: None (oder beschreiben)
  - Notes: (optional)
```

### Header aktualisieren

Nach jedem Task:

- "Last Updated" Datum aktualisieren
- "Tasks Completed" Zähler erhöhen
- "Estimated Progress" Prozent anpassen

---

## E2E Tests (am Ende einer Phase)

**Datei:** `e2e/<feature-slug>.test.ts`

### Wann E2E Tests schreiben?

- Als **letzter Task** einer Phase
- Testet das gesamte Feature end-to-end
- Nutzt Playwright

### E2E Test ausführen

```bash
npm run test:e2e
```

---

## Checkliste: Neues Feature starten

Bevor du mit der Implementierung beginnst:

- [ ] **Spec existiert:** `TempAppDevDocs/Features/Specs/<feature>.md`
- [ ] **Plan existiert:** `TempAppDevDocs/Features/Plans/<feature>.md`
- [ ] **Tasks existieren:** `TempAppDevDocs/Features/Tasks/<feature>.md`
- [ ] **Progress Tracker:** Phase in `DevFramework/IMPLEMENTATION_PROGRESS.md` angelegt
- [ ] **Alle Checkpoints** der Phasen 1-3 erfüllt

---

## Namenskonvention für Dokumente (optional)

**Standard:** `TempAppDevDocs/Features/Specs/<feature-slug>.md` (empfohlen)

**Optional:** `TempAppDevDocs/Features/Specs/P<phase>-<YYYYMMDD>-<feature-slug>.md` (nur wenn chronologische Sortierung gewünscht)

### Beispiele

- **Standard:** `TempAppDevDocs/Features/Specs/quick-start-ux.md`
- **Optional:** `TempAppDevDocs/Features/Specs/P08-20251223-quick-start-ux.md`

### Hinweise

- Bestehende Dokumente müssen NICHT umbenannt werden
- Beide Formate sind gleichwertig akzeptiert
- Feature-Slug immer in kebab-case

---

## Quick Reference

| Was                                                                          | Wo                                 |
| ---------------------------------------------------------------------------- | ---------------------------------- |
| Spec Template                                                                | `TempAppDevDocs/Features/Specs/_template.md` |
| Plan Template                                                                | `TempAppDevDocs/Features/Plans/_template.md` |
| Tasks Template                                                               | `TempAppDevDocs/Features/Tasks/_template.md` |
| Progress Tracker                                                             | `DevFramework/ToolSetup            |
| Framework/IMPLEMENTATION_PROGRESS.md`                                        |
| FR/IG/DD Regeln                                                              | `DevFramework/ToolSetup            |
| Framework/DeveloperGuidesAndStandards/IMPLEMENTATION_SPECIFICATION_RULES.md` |
| Command Execution                                                            | `DevFramework/ToolSetup            |

Framework/ToolSetup/command-execution-rules.md`              |
| Pre-Commit Rules  |`DevFramework/JustInTimeAgentRules/pre-commit.md` |

---

## Änderungshistorie

- 2025-12-28: Added JIT rule map reference to task workflow; paths updated to DevFramework structure
- 2025-12-24: Phase -1 / Pre-Implementation Gates hinzugefügt
- 2025-12-23: Erstellt — Konsolidierter Workflow für Spec-Driven Development
