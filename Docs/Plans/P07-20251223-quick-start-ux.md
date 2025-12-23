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
| `getSmartTopCategories(n)` | `src/lib/utils/frequency.ts` | **NEU (Phase 8 Smart):** Kontextbewusste Top N basierend auf Wochentag + Zeitslot |
| `calculateContextScore()` | `src/lib/utils/frequency.ts` | **NEU (Phase 8 Smart):** Berechnet Score für eine Kategorie im aktuellen Kontext |

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

### Kontextbewusste Score-Berechnung (Phase 8 Smart)

```typescript
// Konstanten
const SLOT_HOURS = 2;        // 2-Stunden-Zeitslots
const CONTEXT_MULTIPLIER = 1000;  // Kontext-Matches dominieren

interface ContextScore {
  categoryId: string;
  score: number;           // contextMatches * 1000 + totalFrequency
  contextMatches: number;  // Einträge im aktuellen Kontext
  totalFrequency: number;  // Gesamteinträge (letzte 30 Tage)
}

// Berechnung:
// 1. Aktuellen Kontext ermitteln:
//    - weekday = new Date().getDay()  // 0=So, 1=Mo, ..., 6=Sa
//    - slot = Math.floor(new Date().getHours() / SLOT_HOURS)  // 0-11
// 2. Für jede Kategorie:
//    a. totalFrequency = Anzahl Einträge der letzten 30 Tage
//    b. contextMatches = Einträge mit gleichem Wochentag UND gleichem Zeitslot
//    c. score = contextMatches * CONTEXT_MULTIPLIER + totalFrequency
// 3. Sortiere absteigend nach score
// 4. Bei Gleichstand: alphabetisch (deutsche Lokalisierung)
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

### Unit Tests für Smart Suggestions (`src/lib/utils/frequency.test.ts`)

- `getSmartTopCategories()` mit Kontext-Matches
- `getSmartTopCategories()` ohne Kontext-Matches (Fallback)
- Zeitslot-Berechnung (0-11 für 2h-Slots)
- Wochentag-Berechnung (0=So, 6=Sa)
- Kontext-First-Scoring (Kontext-Match schlägt hohe Gesamthäufigkeit)
- Alphabetischer Tiebreaker bei Gleichstand

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
// Kategorien für die Liste (Phase 8 Smart: kontextbewusst)
let topCategories = $derived(getSmartTopCategories(5, $timeEntries, $categories));
let allCategories = $derived($categories.filter(c => c.type !== 'system'));
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
- **Smart Suggestions:** Top 5 ändert sich basierend auf Wochentag/Uhrzeit (schwer zu testen, ggf. Mock)

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

---

## Phase 8 Smart Suggestions — Algorithmus-Details

### Konstanten

```typescript
const SLOT_HOURS = 2;              // 2-Stunden-Zeitslots (12 pro Tag)
const CONTEXT_MULTIPLIER = 1000;   // Kontext-Matches dominieren
const LOOKBACK_DAYS = 30;          // Nur letzte 30 Tage berücksichtigen
```

### Zeitslot-Mapping

| Slot | Zeitraum | Typische Aktivitäten (Beispiel) |
|------|----------|--------------------------------|
| 0 | 00:00-02:00 | — |
| 1 | 02:00-04:00 | — |
| 2 | 04:00-06:00 | — |
| 3 | 06:00-08:00 | Frühe Vorbereitung |
| 4 | 08:00-10:00 | Meetings, Orga, Mails |
| 5 | 10:00-12:00 | Hausbesuche, Unterricht |
| 6 | 12:00-14:00 | (Mittagspause) |
| 7 | 14:00-16:00 | Unterricht, Verwaltung |
| 8 | 16:00-18:00 | Gruppen, Kreise |
| 9 | 18:00-20:00 | Ausschüsse, Abendtermine |
| 10 | 20:00-22:00 | Kirchenvorstand, Vorbereitung |
| 11 | 22:00-24:00 | Späte Vorbereitung |

### Algorithmus-Implementierung

```typescript
function getSmartTopCategories(
  n: number,
  entries: TimeEntry[],
  categories: Category[],
  now: Date = new Date()
): Category[] {
  // 1. Letzte 30 Tage filtern
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - LOOKBACK_DAYS);
  const recentEntries = entries.filter(e => new Date(e.date) >= cutoffDate);
  
  // 2. Aktuellen Kontext ermitteln
  const currentWeekday = now.getDay();  // 0=So, 1=Mo, ..., 6=Sa
  const currentSlot = Math.floor(now.getHours() / SLOT_HOURS);  // 0-11
  
  // 3. Scores berechnen
  const scores = new Map<string, { score: number; name: string }>();
  
  for (const category of categories) {
    if (category.type === 'system') continue;
    
    const categoryEntries = recentEntries.filter(e => e.categoryId === category.id);
    const totalFrequency = categoryEntries.length;
    
    // Kontext-Matches: gleicher Wochentag + gleicher Zeitslot
    const contextMatches = categoryEntries.filter(e => {
      const entryDate = new Date(e.date);
      const entryWeekday = entryDate.getDay();
      const [hours] = e.startTime.split(':').map(Number);
      const entrySlot = Math.floor(hours / SLOT_HOURS);
      return entryWeekday === currentWeekday && entrySlot === currentSlot;
    }).length;
    
    // Kontext-First Scoring
    const score = contextMatches * CONTEXT_MULTIPLIER + totalFrequency;
    
    if (score > 0) {
      scores.set(category.id, { score, name: category.name });
    }
  }
  
  // 4. Sortieren: Score absteigend, bei Gleichstand alphabetisch
  const sortedIds = [...scores.entries()]
    .sort((a, b) => {
      const scoreDiff = b[1].score - a[1].score;
      if (scoreDiff !== 0) return scoreDiff;
      return a[1].name.localeCompare(b[1].name, 'de');
    })
    .slice(0, n)
    .map(([id]) => id);
  
  // 5. Kategorien zurückgeben
  return sortedIds
    .map(id => categories.find(c => c.id === id))
    .filter((c): c is Category => c !== undefined);
}
```

### Beispiel-Szenarien

**Szenario 1: Dienstag 09:15**
- Kontext: Wochentag=2 (Di), Slot=4 (08:00-10:00)
- "DB Gruna-Seidnitz": 3 Kontext-Matches, 4 gesamt → Score: 3004
- "Allg. Orga": 2 Kontext-Matches, 25 gesamt → Score: 2025
- **Ergebnis:** DB Gruna-Seidnitz erscheint vor Allg. Orga ✓

**Szenario 2: Montag 14:00 (keine Daten)**
- Kontext: Wochentag=1 (Mo), Slot=7 (14:00-16:00)
- Keine Kontext-Matches für irgendeine Kategorie
- **Fallback:** Sortierung nach Gesamthäufigkeit

**Szenario 3: Sonntag 10:30**
- Kontext: Wochentag=0 (So), Slot=5 (10:00-12:00)
- "Gottesdienst/Predigt": 4 Kontext-Matches → Score: 4005
- **Ergebnis:** Gottesdienst erscheint ganz oben ✓

### Design-Entscheidungen (Begründung)

| Entscheidung | Begründung |
|--------------|------------|
| 2h-Slots statt 1h | Analyse realer Daten: genug Granularität, aber ausreichend Datenpunkte pro Slot |
| Wochentage separat | Sa ≠ So: unterschiedliche Aktivitätsmuster (Vorbereitung vs. Gottesdienst) |
| ×1000 Multiplikator | Kontext-Matches sollen dominieren, nicht von hoher Gesamthäufigkeit überschrieben werden |
| Fallback auf Gesamthäufigkeit | Neue Nutzer oder unbekannte Kontexte funktionieren trotzdem sinnvoll |
