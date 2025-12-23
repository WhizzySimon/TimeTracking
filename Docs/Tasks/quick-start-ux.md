# Quick-Start UX - Tasks

**Status:** Ready for implementation  
**Based on:** `Docs/Specs/quick-start-ux.md`, `Docs/Plans/quick-start-ux.md`  
**Estimated total:** ~8 hours

---

## Verification Workflow (MANDATORY for each task)

After completing each task:

1. **Run `npm run verify`** via cascade-command.txt → must show ALL PASSED
2. **Run unit tests** (if applicable): `npm run test:unit`
3. **Test UI with MCP Playwright browser** (`mcp1_browser_navigate` to `http://localhost:5173`)
4. **Git commit** via cascade-command.txt: `git add -A; git commit -m "feat: description"`
5. **Update progress** in `Docs/IMPLEMENTATION_PROGRESS.md`

---

## Task 1 - Frequency Utils erstellen

- **Files:**
  - `src/lib/utils/frequency.ts` (neu)
  - `src/lib/utils/frequency.test.ts` (neu)
- **Done when:**
  - `getCategoryFrequency(entries, categories, days)` gibt Map<categoryId, count> zurück
  - `getTopCategories(n, entries, categories)` gibt Top N Kategorien zurück
  - Systemkategorien (Pause, Urlaub, Krank, Feiertag) werden ausgeschlossen
  - Nur Einträge der letzten 30 Tage werden gezählt
  - Bei Gleichstand: alphabetisch sortieren
  - Unit Tests bestehen
- **Verify:**
  - `npm run check`
  - `npm run test:unit`
- **Guardrails:**
  - Keine Änderungen an bestehenden Dateien
  - Keine neuen Dependencies

## Task 2 - Quick-Start Buttons Komponente

- **Files:**
  - `src/lib/components/QuickStartButtons.svelte` (neu)
  - `src/routes/day/+page.svelte` (ändern)
- **Done when:**
  - Komponente zeigt bis zu 5 Buttons für häufigste Kategorien
  - Tap auf Button ruft `onstart(categoryId)` Callback auf
  - Bei weniger als 5 genutzten Kategorien: weniger Buttons
  - Bei 0 genutzten Kategorien: Komponente nicht anzeigen
  - Buttons sind responsive (wrap bei kleinem Screen)
  - In day/+page.svelte eingebunden oberhalb von "+ Aufgabe hinzufügen"
- **Verify:**
  - `npm run check`
  - Manuell: Buttons erscheinen, Tap löst Callback aus
- **Guardrails:**
  - Layout der bestehenden Elemente nicht brechen
  - Bestehende Funktionalität erhalten

## Task 3 - Quick-Start Logik (Aufgabe sofort starten)

- **Files:**
  - `src/routes/day/+page.svelte` (ändern)
  - `src/lib/storage/operations.ts` (ggf. erweitern)
- **Done when:**
  - `handleQuickStart(categoryId)` erstellt Aufgabe mit startTime=now, endTime=null
  - Wenn bereits eine Aufgabe läuft: diese wird automatisch beendet (endTime=now)
  - Neue Aufgabe erscheint sofort in der Liste
  - Kein Modal wird geöffnet
- **Verify:**
  - `npm run check`
  - Manuell: Quick-Start Button → Aufgabe startet, laufende wird beendet
- **Guardrails:**
  - Bestehende `handleSaveEntry` Logik nicht brechen

## Task 4 - TaskItem Refactor (Running vs Completed)

- **Files:**
  - `src/lib/components/TaskItem.svelte` (ändern)
  - `src/lib/components/TaskList.svelte` (ändern)
- **Done when:**
  - Laufende Aufgabe (endTime=null) zeigt "Beenden"-Button
  - Beendete Aufgabe zeigt Resume-Button (▶)
  - Laufende Aufgabe hat visuell unterscheidbares Layout (z.B. Hintergrundfarbe, Icon)
  - Tap auf Aufgaben-Text öffnet weiterhin Bearbeiten-Modal
  - Tap auf "Beenden" ruft `onend(entry)` Callback auf
  - Tap auf Resume ruft `onresume(entry)` Callback auf
- **Verify:**
  - `npm run check`
  - Manuell: Buttons erscheinen korrekt, Callbacks werden aufgerufen
- **Guardrails:**
  - Bestehende Edit-Funktionalität erhalten
  - Delete-Funktionalität erhalten

## Task 5 - Beenden-Button Logik

- **Files:**
  - `src/routes/day/+page.svelte` (ändern)
- **Done when:**
  - `handleEndEntry(entry)` setzt endTime=now und speichert sofort
  - Kein Modal, keine Bestätigung
  - Aufgabe wechselt von "laufend" zu "beendet" in der Liste
- **Verify:**
  - `npm run check`
  - Manuell: Beenden-Button → Aufgabe wird beendet
- **Guardrails:**
  - Bestehende Logik nicht brechen

## Task 6 - Resume-Button Logik

- **Files:**
  - `src/routes/day/+page.svelte` (ändern)
- **Done when:**
  - `handleResumeEntry(entry)` erstellt neue Aufgabe mit gleicher Kategorie
  - Wenn bereits eine Aufgabe läuft: diese wird automatisch beendet
  - Neue Aufgabe erscheint sofort in der Liste als "laufend"
- **Verify:**
  - `npm run check`
  - Manuell: Resume-Button → neue Aufgabe startet
- **Guardrails:**
  - Bestehende Logik nicht brechen

## Task 7 - Kategorie-Dropdown Häufigkeitssortierung

- **Files:**
  - `src/lib/components/CategorySelect.svelte` (ändern)
  - `src/lib/stores/index.ts` (ggf. für sortOrder Store)
- **Done when:**
  - Kategorien werden nach Häufigkeit sortiert (wenn Einstellung aktiv)
  - Dropdown scrollt automatisch zu Position 6 beim Öffnen
  - Neue Kategorien (count=0) erscheinen am Ende
  - Sortierung nutzt `getCategoryFrequency` aus frequency.ts
- **Verify:**
  - `npm run check`
  - Manuell: Dropdown zeigt häufigste Kategorien oben, scrollt zu Position 6
- **Guardrails:**
  - Alphabetische Sortierung bleibt als Option erhalten
  - Bestehende Filter-Funktionalität erhalten

## Task 8 - Einstellungen Toggle für Sortierung

- **Files:**
  - `src/routes/settings/+page.svelte` (ändern)
- **Done when:**
  - Toggle "Tätigkeiten sortieren: Alphabetisch / Häufigkeit"
  - Standard: Häufigkeit
  - Einstellung wird in localStorage gespeichert
  - Einstellung wird beim App-Start geladen
- **Verify:**
  - `npm run check`
  - Manuell: Toggle wechselt Sortierung, bleibt nach Reload erhalten
- **Guardrails:**
  - Bestehende Einstellungen nicht brechen

## Task 9 - Endzeit vorausfüllen beim Bearbeiten

- **Files:**
  - `src/lib/components/AddTaskModal.svelte` (ändern)
- **Done when:**
  - Beim Bearbeiten einer laufenden Aufgabe (entry.endTime=null) ist Endzeit-Feld mit aktueller Zeit vorausgefüllt
  - Bei neuer Aufgabe: Endzeit bleibt leer (wie bisher)
  - Bei Bearbeiten einer beendeten Aufgabe: Endzeit zeigt bestehenden Wert
- **Verify:**
  - `npm run check`
  - Manuell: Laufende Aufgabe bearbeiten → Endzeit ist vorausgefüllt
- **Guardrails:**
  - Bestehende Logik für neue Aufgaben nicht ändern

## Task 10 - E2E Tests

- **Files:**
  - `e2e/quick-start.test.ts` (neu)
- **Done when:**
  - Test: Quick-Start Button erstellt Aufgabe
  - Test: Beenden-Button setzt Endzeit
  - Test: Resume erstellt neue Aufgabe
  - Test: Automatisches Beenden bei Quick-Start/Resume
  - Test: Toggle in Einstellungen funktioniert
  - Alle Tests bestehen
- **Verify:**
  - `npm run test:e2e`
- **Guardrails:**
  - Bestehende E2E Tests nicht brechen
