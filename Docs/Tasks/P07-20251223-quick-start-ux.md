# Quick-Start UX - Tasks

**Phase:** 7 (Quick-Start UX) + Phase 8 (Plus-Tab + Smart Suggestions)  
**Created:** 2025-12-23  
**Last Updated:** 2025-12-23  
**Based on Spec:** `Docs/Specs/P07-20251223-quick-start-ux.md`  
**Based on Plan:** `Docs/Plans/P07-20251223-quick-start-ux.md`  
**Status:** Phase 7 Complete, Phase 8 Pending (9 Tasks)  
**Estimated total:** ~8 hours (Phase 7) + ~5 hours (Phase 8, inkl. Smart Suggestions)

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

## Task 10 - E2E Tests ✓

- **Files:**
  - `e2e/quick-start.test.ts` (neu)
- **Done when:**
  - Test: Quick-Start Button erstellt Aufgabe ✓
  - Test: Beenden-Button setzt Endzeit ✓
  - Test: Resume erstellt neue Aufgabe ✓
  - Test: Automatisches Beenden bei Quick-Start/Resume ✓
  - Test: Toggle in Einstellungen funktioniert ✓
  - Alle Tests bestehen ✓
- **Verify:**
  - `npm run test:e2e` ✓ (6 tests passing)
- **Guardrails:**
  - Bestehende E2E Tests nicht brechen ✓

---

# Phase 8: Plus-Tab Tasks

## Task 8.1 - Plus-Tab Route erstellen

- **Files:**
  - `src/routes/add/+page.svelte` (neu)
- **Done when:**
  - Route `/add` existiert und ist erreichbar
  - Zeigt Platzhalter-Inhalt
- **Verify:**
  - `npm run verify`
  - Browser: Navigation zu `/add` funktioniert
- **Guardrails:**
  - Keine Änderungen an bestehenden Routes

## Task 8.2 - Smart Suggestions Algorithmus implementieren

- **Files:**
  - `src/lib/utils/frequency.ts` (erweitern)
  - `src/lib/utils/frequency.test.ts` (erweitern)
- **Done when:**
  - `getSmartTopCategories(n, entries, categories, now?)` implementiert
  - Verwendet 2-Stunden-Zeitslots (SLOT_HOURS = 2)
  - Verwendet Kontext-First-Scoring (CONTEXT_MULTIPLIER = 1000)
  - Wochentage werden separat behandelt (0=So, 1=Mo, ..., 6=Sa)
  - Fallback auf Gesamthäufigkeit wenn keine Kontext-Matches
  - Alphabetischer Tiebreaker bei Gleichstand
  - Unit Tests für alle Szenarien bestehen
- **Verify:**
  - `npm run verify`
  - `npm run test:unit` — Smart Suggestions Tests bestehen
- **Guardrails:**
  - Bestehende `getTopCategories()` Funktion nicht ändern (Fallback)
  - Keine neuen Dependencies

## Task 8.3 - CategoryList Komponente

- **Files:**
  - `src/lib/components/CategoryList.svelte` (neu)
  - `src/routes/add/+page.svelte`
- **Done when:**
  - Komponente zeigt Top 5 Kategorien (visuell abgetrennt) — **kontextbewusst**
  - Komponente zeigt Rest alphabetisch (ohne Duplikate)
  - Systemkategorien sind ausgeschlossen
  - Volle Bildschirmhöhe genutzt
- **Verify:**
  - `npm run verify`
  - Browser: Liste korrekt sortiert, keine Duplikate
- **Guardrails:**
  - Nutzt neue `getSmartTopCategories()` Funktion

## Task 8.4 - Ein-Klick-Start Logik

- **Files:**
  - `src/routes/add/+page.svelte`
- **Done when:**
  - Klick auf Kategorie erstellt Aufgabe (startTime=jetzt, endTime=null)
  - Laufende Aufgabe wird automatisch beendet
  - Redirect zu `/day` nach Erstellung
- **Verify:**
  - `npm run verify`
  - Browser: Klick → Aufgabe erstellt → Redirect zu /day
- **Guardrails:**
  - Nutzt bestehende `saveTimeEntry()` Funktion

## Task 8.5 - Navigation anpassen

- **Files:**
  - `src/lib/components/Navigation.svelte`
- **Done when:**
  - Plus-Tab ist erster Tab (links von "Tag")
  - Zeigt nur "+" Symbol (kein Text)
  - Link zu `/add`
- **Verify:**
  - `npm run verify`
  - Browser: Plus-Tab sichtbar und funktional
- **Guardrails:**
  - Bestehende Tab-Reihenfolge anpassen, nicht brechen

## Task 8.6 - Default-Tab-Logik

- **Files:**
  - `src/routes/+page.svelte` oder `src/routes/+layout.svelte`
- **Done when:**
  - Navigation zu `/` prüft auf laufende Aufgabe
  - Keine laufende Aufgabe → Redirect zu `/add`
  - Laufende Aufgabe → Redirect zu `/day`
- **Verify:**
  - `npm run verify`
  - Browser: App-Start ohne Aufgabe → /add, mit Aufgabe → /day
- **Guardrails:**
  - Nur Root-Route betroffen, andere Routes unverändert

## Task 8.7 - Cleanup: Tag-Tab

- **Files:**
  - `src/routes/day/+page.svelte`
  - `src/lib/components/QuickStartButtons.svelte` (löschen)
- **Done when:**
  - Quick-Start Buttons entfernt
  - "+ Aufgabe hinzufügen" Button entfernt
  - Tag-Tab zeigt nur: Navigation, Tagesart, Zusammenfassung, Aufgabenliste
- **Verify:**
  - `npm run verify`
  - Browser: Tag-Tab ohne Quick-Start und Add-Button
- **Guardrails:**
  - Beenden/Resume Buttons bleiben erhalten

## Task 8.8 - Cleanup: Settings

- **Files:**
  - `src/routes/settings/+page.svelte`
  - `src/lib/stores/theme.ts`
- **Done when:**
  - Sorting Toggle aus Einstellungen entfernt
  - `categorySort` Store entfernt
  - localStorage-Key `timetracker-category-sort` nicht mehr verwendet
- **Verify:**
  - `npm run verify`
  - Browser: Einstellungen ohne Sorting Toggle
- **Guardrails:**
  - Andere Einstellungen unverändert

## Task 8.9 - E2E Tests erweitern

- **Files:**
  - `e2e/quick-start.test.ts`
- **Done when:**
  - Test: Plus-Tab unter `/add` erreichbar
  - Test: Top 5 + A-Z Liste korrekt (kontextbewusst)
  - Test: Klick startet Aufgabe sofort
  - Test: Redirect zu `/day` nach Start
  - Test: Default-Tab-Logik funktioniert
  - Test: Quick-Start Buttons nicht mehr auf Tag-Tab
  - Alle Tests bestehen
- **Verify:**
  - `npm run test:e2e`
- **Guardrails:**
  - Alte Tests anpassen (Quick-Start Buttons gibt es nicht mehr)

---

## Task-Übersicht Phase 8 (aktualisiert)

| Task | Beschreibung                      | Status  |
| ---- | --------------------------------- | ------- |
| 8.1  | Plus-Tab Route erstellen          | ✅ Done |
| 8.2  | **Smart Suggestions Algorithmus** | ✅ Done |
| 8.3  | CategoryList Komponente           | ✅ Done |
| 8.4  | Ein-Klick-Start Logik             | ✅ Done |
| 8.5  | Navigation anpassen               | ✅ Done |
| 8.6  | Default-Tab-Logik                 | ✅ Done |
| 8.7  | Cleanup: Tag-Tab                  | ✅ Done |
| 8.8  | Cleanup: Settings                 | ✅ Done |
| 8.9  | E2E Tests erweitern               | ✅ Done |

**Neu hinzugefügt:** Task 8.2 (Smart Suggestions) — kontextbewusster Algorithmus basierend auf Analyse realer Nutzerdaten.
