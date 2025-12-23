# Quick-Start UX - Plan

**Phase:** 7 (Quick-Start UX) + Phase 8 (Plus-Tab)  
**Created:** 2025-12-23  
**Last Updated:** 2025-12-23  
**Based on Spec:** `Docs/Specs/P07-20251223-quick-start-ux.md`

---

## Architecture / modules

### Neue Komponenten

| Komponente                 | Verantwortung                            |
| -------------------------- | ---------------------------------------- |
| `QuickStartButtons.svelte` | Zeigt Top 5 Kategorien als 1-Tap-Buttons |
| `TaskItemRunning.svelte`   | Laufende Aufgabe mit "Beenden"-Button    |
| `TaskItemCompleted.svelte` | Beendete Aufgabe mit Resume-Button       |

### Bestehende Komponenten (zu ändern)

| Komponente                                 | Änderung                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| `src/routes/day/+page.svelte`              | QuickStartButtons einbinden, Layout anpassen                             |
| `src/lib/components/TaskList.svelte`       | Unterscheidung laufend/beendet, Resume-Button                            |
| `src/lib/components/TaskItem.svelte`       | Refactor zu TaskItemRunning/TaskItemCompleted oder Conditional Rendering |
| `src/lib/components/AddTaskModal.svelte`   | Endzeit vorausfüllen bei laufender Aufgabe                               |
| `src/lib/components/CategorySelect.svelte` | Häufigkeitssortierung, Auto-Scroll zu Position 6                         |
| `src/routes/settings/+page.svelte`         | Toggle für Sortierung hinzufügen                                         |

### Neue Utility-Funktionen

| Funktion                 | Datei                        | Zweck                                               |
| ------------------------ | ---------------------------- | --------------------------------------------------- |
| `getCategoryFrequency()` | `src/lib/utils/frequency.ts` | Berechnet Häufigkeit pro Kategorie (letzte 30 Tage) |
| `getTopCategories(n)`    | `src/lib/utils/frequency.ts` | Gibt Top N Kategorien nach Häufigkeit zurück        |

### Dependencies

- Keine neuen externen Dependencies
- Nutzt bestehende Stores: `timeEntries`, `categories`
- Nutzt bestehende Storage-Funktionen: `saveTimeEntry`, `getAll`

## Data model

### Keine neuen Tabellen

Häufigkeit wird **berechnet**, nicht gespeichert.

### Neue Einstellung (localStorage)

```typescript
// Key: 'category-sort-order'
// Values: 'frequency' | 'alphabetical'
// Default: 'frequency'
```

### Häufigkeitsberechnung (zur Laufzeit)

```typescript
interface CategoryFrequency {
	categoryId: string;
	count: number;
}

// Berechnung:
// 1. Filtere timeEntries der letzten 30 Tage
// 2. Gruppiere nach categoryId
// 3. Zähle Einträge pro Kategorie
// 4. Sortiere absteigend nach count
```

## UI state model

### Neuer State in `day/+page.svelte`

```typescript
// Abgeleitet (derived) aus bestehenden Stores
let topCategories = $derived(getTopCategories(5, $timeEntries, $categories));

// Einstellung aus localStorage
let sortOrder = $state<'frequency' | 'alphabetical'>('frequency');
```

### State-Flow für Quick-Start

```
User tappt Quick-Start Button
  → createQuickEntry(categoryId)
    → Wenn laufende Aufgabe existiert: beende sie (endTime = now)
    → Erstelle neue Aufgabe (startTime = now, endTime = null)
    → Speichere in IndexedDB
    → Update timeEntries Store
```

### State-Flow für Beenden

```
User tappt "Beenden" Button
  → endRunningEntry()
    → Setze endTime = now
    → Speichere in IndexedDB
    → Update timeEntries Store
```

### State-Flow für Resume

```
User tappt Resume Button (▶)
  → resumeEntry(entry)
    → Wenn laufende Aufgabe existiert: beende sie
    → Erstelle neue Aufgabe mit entry.categoryId
    → Speichere in IndexedDB
    → Update timeEntries Store
```

## Error handling

| Fehler                            | Handling                                                           |
| --------------------------------- | ------------------------------------------------------------------ |
| IndexedDB-Fehler beim Speichern   | Console.error, keine UI-Meldung (Retry beim nächsten Sync)         |
| Kategorie wurde gelöscht (Resume) | Resume-Button nicht anzeigen für Einträge mit ungültiger Kategorie |
| Keine Kategorien vorhanden        | Quick-Start Buttons nicht anzeigen                                 |

**Prinzip:** Fehler still behandeln, Korrektur ist einfach (Aufgabe bearbeiten).

## Testing strategy

### Unit Tests (`src/lib/utils/frequency.test.ts`)

- `getCategoryFrequency()` mit verschiedenen Datensätzen
- `getTopCategories()` mit weniger als 5 Kategorien
- Filterung nach 30 Tagen
- Ausschluss von Systemkategorien
- Tiebreaker (alphabetisch bei Gleichstand)

### E2E Tests (`e2e/quick-start.test.ts`)

- Quick-Start Button erstellt Aufgabe
- Beenden-Button setzt Endzeit
- Resume erstellt neue Aufgabe
- Automatisches Beenden bei Quick-Start/Resume
- Sortierung im Dropdown (Häufigkeit vs. alphabetisch)
- Toggle in Einstellungen funktioniert

### Manuelle Tests

- UI-Layout auf verschiedenen Bildschirmgrößen
- Scroll-Verhalten bei langer Aufgabenliste
- Auto-Scroll im Dropdown zu Position 6

## Risks / constraints

### Performance

- **Häufigkeitsberechnung:** Bei vielen Einträgen (>1000) könnte die Berechnung spürbar sein.
- **Mitigation:** Berechnung nur bei Bedarf (nicht bei jedem Render), ggf. Caching.

### UX

- **Quick-Start Buttons nehmen Platz:** Bei kleinen Bildschirmen könnten 5 Buttons zu viel sein.
- **Mitigation:** Responsive Layout, ggf. 3 Buttons auf sehr kleinen Screens.

### Platform

- **localStorage für Einstellung:** Wird nicht zwischen Geräten synchronisiert.
- **Akzeptiert:** Einstellung ist gerätespezifisch, kein Problem.

## Implementierungsreihenfolge Phase 7 (abgeschlossen)

1. ~~**Frequency Utils** — Grundlage für alles~~ ✓
2. ~~**Quick-Start Buttons** — Größter Impact~~ ✓
3. ~~**Beenden-Button** — Einfach, hoher Nutzen~~ ✓
4. ~~**Resume-Button** — Aufbauend auf Quick-Start Logik~~ ✓
5. ~~**Dropdown Sortierung** — Nutzt Frequency Utils~~ ✓
6. ~~**Einstellungen Toggle** — Letzter Schritt~~ ✓ (wird in Phase 8 entfernt)
7. ~~**Endzeit vorausfüllen** — Kleine Änderung in AddTaskModal~~ ✓

---

# Phase 8: Plus-Tab (Ein-Klick-Workflow)

## Architektur-Änderungen

### Neue Route

| Route | Komponente | Zweck |
|-------|------------|-------|
| `/add` | `src/routes/add/+page.svelte` | Plus-Tab mit Tätigkeitsliste |

### Neue Komponenten

| Komponente | Verantwortung |
|------------|---------------|
| `CategoryList.svelte` | Volle Tätigkeitsliste (Top 5 + A-Z) |

### Zu ändernde Komponenten

| Komponente | Änderung |
|------------|----------|
| `src/lib/components/Navigation.svelte` | Plus-Tab als erster Tab (nur "+") |
| `src/routes/+page.svelte` oder `+layout.svelte` | Default-Tab-Logik (Redirect basierend auf laufender Aufgabe) |
| `src/routes/day/+page.svelte` | Quick-Start Buttons + "+ Aufgabe hinzufügen" entfernen |
| `src/routes/settings/+page.svelte` | Sorting Toggle entfernen |

### Zu entfernende Komponenten/Code

| Was | Wo |
|-----|-----|
| `QuickStartButtons.svelte` | Nicht mehr benötigt (Plus-Tab übernimmt) |
| Sorting Toggle UI | `settings/+page.svelte` |
| `categorySort` Store | `src/lib/stores/theme.ts` |
| "+ Aufgabe hinzufügen" Button | `day/+page.svelte` |

## Data Model (Phase 8)

### Keine neuen Daten

- Nutzt bestehende `categories` und `timeEntries` Stores
- Nutzt bestehende `getTopCategories()` Funktion

### Entfernen

- `categorySort` aus localStorage (nicht mehr benötigt)

## UI State Model (Phase 8)

### Plus-Tab (`/add`)

```typescript
// Kategorien für die Liste
let topCategories = $derived(getTopCategories(5, $timeEntries, $categories));
let allCategories = $derived($categories.filter(c => !c.isSystem));
let remainingCategories = $derived(
  allCategories
    .filter(c => !topCategories.some(t => t.id === c.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
);
```

### Default-Tab-Logik (`+layout.svelte` oder `+page.svelte`)

```typescript
// Bei Navigation zu "/" prüfen
const hasRunningTask = $derived(
  $timeEntries.some(e => e.endTime === null && isToday(e.date))
);

// Redirect
if (hasRunningTask) {
  goto('/day');
} else {
  goto('/add');
}
```

## Error Handling (Phase 8)

| Fehler | Handling |
|--------|----------|
| Keine Kategorien | Hinweis "Keine Kategorien" + Link zu Einstellungen |
| IndexedDB-Fehler | Console.error, stille Behandlung |

## Testing Strategy (Phase 8)

### E2E Tests (erweitern `e2e/quick-start.test.ts`)

- Plus-Tab unter `/add` erreichbar
- Top 5 + A-Z Liste korrekt sortiert
- Keine Duplikate in der Liste
- Klick startet Aufgabe sofort
- Redirect zu `/day` nach Start
- Default-Tab-Logik funktioniert

### Manuelle Tests

- Plus-Tab ist erster Tab (links von "Tag")
- Nur "+" Symbol sichtbar
- Volle Bildschirmhöhe genutzt

## Implementierungsreihenfolge Phase 8

1. **Plus-Tab Route erstellen** — `/add` mit CategoryList
2. **CategoryList Komponente** — Top 5 + A-Z ohne Duplikate
3. **Ein-Klick-Start Logik** — Aufgabe erstellen + Redirect
4. **Navigation anpassen** — Plus-Tab als erster Tab
5. **Default-Tab-Logik** — Redirect basierend auf laufender Aufgabe
6. **Cleanup: Tag-Tab** — Quick-Start Buttons + Button entfernen
7. **Cleanup: Settings** — Sorting Toggle entfernen
8. **E2E Tests erweitern** — Phase 8 Acceptance Checks
