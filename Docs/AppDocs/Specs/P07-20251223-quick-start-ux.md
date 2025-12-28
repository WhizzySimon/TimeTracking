# Quick-Start UX — Spec

**Phase:** 7 (ursprünglich), Phase 8 (Plus-Tab Erweiterung)  
**Created:** 2025-12-23  
**Last Updated:** 2025-12-23  
**Status:** In Progress (Phase 7 implementiert, Phase 8 in Planung)

---

## 1) Goal / Problem

Der aktuelle Workflow zum Anlegen und Beenden von Aufgaben erfordert zu viele Klicks (3-4 pro Aktion). Für Nutzer mit 20-40 Tätigkeitswechseln pro Tag ist das ein spürbarer Nachteil gegenüber Konkurrenzprodukten wie Toggl und Clockify, die 1-Klick-Workflows bieten.

**Ziel:** Reduzierung der Interaktionen auf 1 Klick für die häufigsten Aktionen (Aufgabe starten, beenden, fortsetzen).

## 2) Scope

### In scope

#### Phase 7 (implementiert, teilweise obsolet durch Phase 8)

- ~~Quick-Start Buttons für die 5 häufigsten Tätigkeiten auf Tag-Tab~~ → ersetzt durch Plus-Tab
- ~~Kategorie-Dropdown nach Häufigkeit sortiert~~ → nicht mehr benötigt
- "Beenden"-Button für laufende Aufgaben (1-Klick-Ende) ✓
- Resume-Button für beendete Aufgaben (1-Klick-Fortsetzen) ✓
- Endzeit vorausfüllen beim Bearbeiten einer laufenden Aufgabe ✓
- ~~Toggle in Einstellungen: Sortierung alphabetisch / Häufigkeit~~ → entfernen

#### Phase 8 (neu: Plus-Tab) — AKTUELL

- **Dedizierter Plus-Tab** (`/add`) als **erster Tab** (links von "Tag"), nur "+" Symbol
- **Volle Tätigkeitsliste** ohne Modal — maximale Sichtbarkeit
- **Dynamische Default-Tab-Logik**: App öffnet mit Plus-Tab (keine laufende Aufgabe) oder Tag-Tab (laufende Aufgabe)
- **Optimierte Sortierung**: Top 5 (Häufigkeit) + Rest (A-Z, ohne Duplikate)
- **Entfernen vom Tag-Tab**: "+ Aufgabe hinzufügen" Button und Quick-Start Buttons
- **Entfernen aus Einstellungen**: Sorting Toggle (nicht mehr benötigt)

### Out of scope

- Individuelle Favoriten (manuell gepinnt) — später
- Spracheingabe / AI — V2
- Widgets (iOS/Android) — nicht geplant
- Integrationen mit anderen Tools — nicht geplant

## 3) Functional Requirements (FR)

### Quick-Start Buttons

- **TT-FR-001**: Im Tag-Screen werden oberhalb des "+ Aufgabe hinzufügen" Buttons bis zu 5 Quick-Start Buttons angezeigt.
- **TT-FR-002**: Die Quick-Start Buttons zeigen die 5 am häufigsten genutzten Kategorien (basierend auf Anzahl der Einträge der letzten 30 Tage).
- **TT-FR-003**: Ein Tap auf einen Quick-Start Button erstellt sofort eine neue Aufgabe mit dieser Kategorie, Startzeit = jetzt, keine Endzeit (laufend).
- **TT-FR-004**: Wenn weniger als 5 Kategorien in den letzten 30 Tagen genutzt wurden, werden entsprechend weniger Quick-Start Buttons angezeigt.
- **TT-FR-005**: Wenn bereits eine Aufgabe läuft, wird diese automatisch beendet (Endzeit = jetzt), bevor die neue Aufgabe startet.

### Kategorie-Dropdown

- **TT-FR-006**: Im AddTaskModal wird die Kategorie-Liste nach Häufigkeit sortiert (häufigste zuerst), wenn die Einstellung "Häufigkeit" aktiv ist.
- **TT-FR-007**: Beim Öffnen des Dropdowns scrollt die Liste automatisch zu Position 6 (erste Kategorie nach den Quick-Start Buttons), sodass die Top 5 durch Hochscrollen erreichbar bleiben.
- **TT-FR-008**: Die Sortierung kann in den Einstellungen zwischen "Alphabetisch" und "Häufigkeit" umgeschaltet werden.
- **TT-FR-009**: Standard-Sortierung ist "Häufigkeit".

### Beenden-Button

- **TT-FR-010**: Eine laufende Aufgabe zeigt einen "Beenden"-Button direkt in der Aufgabenliste (nicht nur im Modal).
- **TT-FR-011**: Ein Tap auf "Beenden" setzt die Endzeit auf jetzt und speichert sofort (kein Modal, keine Bestätigung).
- **TT-FR-012**: Die laufende Aufgabe hat ein visuell unterscheidbares Layout (z.B. Hintergrundfarbe, Icon) gegenüber beendeten Aufgaben.

### Resume-Button

- **TT-FR-013**: Jede beendete Aufgabe in der Tagesliste zeigt einen Resume-Button (z.B. "▶").
- **TT-FR-014**: Ein Tap auf Resume erstellt eine neue Aufgabe mit derselben Kategorie, Startzeit = jetzt, keine Endzeit.
- **TT-FR-015**: Wenn bereits eine Aufgabe läuft, wird diese automatisch beendet (Endzeit = jetzt), bevor die neue Aufgabe startet.
- **TT-FR-016**: Der Tap auf den Aufgaben-Text (nicht Resume-Button) öffnet weiterhin das Bearbeiten-Modal.

### Endzeit vorausfüllen

- **TT-FR-017**: Beim Bearbeiten einer laufenden Aufgabe ist das Endzeit-Feld mit der aktuellen Zeit vorausgefüllt (nicht leer).

### UI-Layout (Phase 7)

- **TT-FR-018**: Die Reihenfolge im Tag-Screen ist: Quick-Start Buttons → "+ Aufgabe hinzufügen" → Aufgabenliste (neueste zuerst).
- **TT-FR-019**: Die Aufgabenliste scrollt nach unten, Quick-Start Buttons und "+ Aufgabe hinzufügen" bleiben immer sichtbar (sticky oder am Anfang).

### Plus-Tab (Phase 8)

- **TT-FR-020**: Der Plus-Tab ist unter `/add` erreichbar und zeigt ausschließlich die Tätigkeitsliste (kein Modal, keine anderen UI-Elemente außer Navigation).
- **TT-FR-021**: Die Tätigkeitsliste nutzt die volle Bildschirmhöhe für maximale Sichtbarkeit. Ziel: So viele Tätigkeiten wie möglich ohne Scrollen.
- **TT-FR-028**: Der Plus-Tab ist der **erste Tab** in der Navigation (links von "Tag") und zeigt nur ein "+" Symbol (kein Text).
- **TT-FR-022**: Die Tätigkeitsliste ist in zwei Bereiche unterteilt:
  - **Top 5**: Die 5 wahrscheinlichsten Tätigkeiten basierend auf **kontextbewusster Häufigkeit** (Wochentag + Uhrzeit, letzte 30 Tage), visuell abgetrennt
  - **Rest (A-Z)**: Alle anderen Tätigkeiten alphabetisch sortiert, **ohne die Top 5 zu wiederholen** (keine Duplikate)

### Smart Suggestions (Phase 8 Erweiterung)

- **TT-FR-033**: Die Top 5 werden durch einen **kontextbewussten Algorithmus** berechnet, der Wochentag und Uhrzeit berücksichtigt.
- **TT-FR-034**: Der Algorithmus verwendet **2-Stunden-Zeitslots** (12 Slots pro Tag: 00:00-02:00, 02:00-04:00, ..., 22:00-24:00).
- **TT-FR-035**: Jeder Wochentag wird **separat** behandelt (Mo, Di, Mi, Do, Fr, Sa, So — keine Gruppierung von Wochenenden).
- **TT-FR-036**: Der Score einer Kategorie wird nach dem **Kontext-First-Prinzip** berechnet:
  - Primär: Anzahl der Einträge im aktuellen Kontext (gleicher Wochentag + gleicher Zeitslot) × 1000
  - Sekundär: Gesamthäufigkeit der letzten 30 Tage (als Tiebreaker)
- **TT-FR-037**: Bei **keinen Kontext-Matches** für alle Kategorien fällt der Algorithmus auf die **Gesamthäufigkeit** zurück (Fallback).
- **TT-FR-038**: Bei **Gleichstand** im Score wird **alphabetisch** sortiert (deutsche Lokalisierung).
- **TT-FR-023**: Ein Klick auf eine Tätigkeit erstellt sofort eine neue Aufgabe (Startzeit = aktuelle Uhrzeit gerundet auf 5 Min, Endzeit = null). Kein Modal, keine weitere Eingabe.
- **TT-FR-024**: Nach dem Starten einer Aufgabe erfolgt automatische Weiterleitung zum Tag-Tab (`/day`), wo die laufende Aufgabe mit Beenden-Button sichtbar ist.
- **TT-FR-025**: Systemkategorien (Pause, Urlaub, Krank, Feiertag) erscheinen NICHT in der Plus-Tab-Liste.

### Dynamische Default-Tab-Logik (Phase 8)

- **TT-FR-026**: Beim App-Start (Navigation zu `/` oder App-Öffnung):
  - **Keine laufende Aufgabe** → Redirect zu `/add` (Plus-Tab)
  - **Laufende Aufgabe vorhanden** → Redirect zu `/day` (Tag-Tab)
- **TT-FR-027**: Die Logik prüft beim Laden, ob eine Aufgabe mit `endTime = null` für das aktuelle Datum existiert.

### Entfernen (Phase 8 Cleanup)

- **TT-FR-029**: Der "+ Aufgabe hinzufügen" Button wird vom Tag-Tab entfernt (Plus-Tab übernimmt).
- **TT-FR-030**: Die Quick-Start Buttons werden vom Tag-Tab entfernt (Plus-Tab übernimmt).
- **TT-FR-031**: Der Sorting Toggle (Häufigkeit/Alphabetisch) wird aus den Einstellungen entfernt.
- **TT-FR-032**: Der Tag-Tab zeigt nur noch: Tagesnavigation, Tagesart-Selector, Zusammenfassung, Aufgabenliste mit Beenden/Resume.

## 4) Implementation Guarantees (IG)

- **TT-IG-001**: Häufigkeitsberechnung basiert auf Einträgen der letzten 30 Tage, nicht auf Gesamthistorie.
- **TT-IG-002**: Neue Kategorien (noch nie verwendet) erscheinen am Ende der Häufigkeitsliste.
- **TT-IG-003**: Systemkategorien (Pause, Urlaub, Krank, Feiertag) werden nicht als Quick-Start Buttons angezeigt.
- **TT-IG-004**: Die Häufigkeitsdaten werden lokal berechnet (keine Server-Anfrage).
- **TT-IG-005**: Alle Aktionen (Quick-Start, Beenden, Resume) funktionieren offline.
- **TT-IG-006** (Phase 8): Die Plus-Tab Tätigkeitsliste lädt in unter 100ms nach App-Start.
- **TT-IG-007** (Phase 8): Der Plus-Tab funktioniert vollständig offline (alle Daten aus IndexedDB).
- **TT-IG-008** (Phase 8): Die Default-Tab-Logik wird bei jedem App-Start/Navigation zu `/` ausgeführt.
- **TT-IG-009** (Phase 8 Smart): Der kontextbewusste Algorithmus berechnet Scores in O(n) Zeit (n = Anzahl Einträge der letzten 30 Tage).
- **TT-IG-010** (Phase 8 Smart): Der Zeitslot wird aus der `startTime` des Eintrags berechnet, nicht aus der Erstellungszeit.
- **TT-IG-011** (Phase 8 Smart): Der Wochentag wird aus dem `date`-Feld des Eintrags berechnet (JavaScript `getDay()`: 0=So, 1=Mo, ..., 6=Sa).

## 5) Design Decisions (DD)

- **TT-DD-001**: Häufigkeit statt manueller Favoriten — automatische Anpassung ohne Nutzerpflege.
- **TT-DD-002**: Automatisches Beenden bei Resume/Quick-Start — weniger Klicks, Fehler können durch Bearbeiten korrigiert werden.
- **TT-DD-003**: Hybrid-Scroll im Dropdown — Top 5 bleiben erreichbar, aber Fokus auf Position 6.
- **TT-DD-004**: Kein Bestätigungsdialog bei "Beenden" — Geschwindigkeit vor Sicherheit, Korrektur ist einfach.
- **TT-DD-005** (Phase 8): Plus-Tab als separate Route (`/add`) statt Modal — maximaler Bildschirmplatz für Tätigkeitsliste.
- **TT-DD-006** (Phase 8): Top 5 visuell abgetrennt vom A-Z Bereich (z.B. Trennlinie, anderer Hintergrund).
- **TT-DD-007** (Phase 8): Kein Suchfeld auf Plus-Tab — bei 20-30 Kategorien ist Scrollen akzeptabel, Top 5 decken 80% der Fälle.
- **TT-DD-008** (Phase 8): Dynamische Default-Tab-Logik — User landet immer dort, wo die nächste Aktion stattfindet.
- **TT-DD-009** (Phase 8 Smart): **2-Stunden-Zeitslots** statt 1h oder 3h — basierend auf Analyse realer Nutzerdaten: genug Granularität für Arbeitsmuster (Morgen vs. Vormittag), aber nicht zu fein (genug Datenpunkte pro Slot).
- **TT-DD-010** (Phase 8 Smart): **Wochentage separat** (Sa ≠ So) — Analyse zeigt unterschiedliche Aktivitätsmuster (Sa: Vorbereitung, So: Gottesdienst).
- **TT-DD-011** (Phase 8 Smart): **Kontext-First-Scoring** (×1000) statt linearer Gewichtung — Kontext-Matches sollen dominieren, Gesamthäufigkeit nur als Tiebreaker. Verhindert, dass sehr häufige Kategorien kontextspezifische verdrängen.
- **TT-DD-012** (Phase 8 Smart): **Fallback auf Gesamthäufigkeit** — bei neuen Nutzern oder unbekannten Kontexten (z.B. erster Montag 09:00) funktioniert das System trotzdem sinnvoll.

## 6) Edge cases

### Phase 7

- **Keine Einträge in den letzten 30 Tagen**: Keine Quick-Start Buttons anzeigen, nur "+ Aufgabe hinzufügen".
- **Weniger als 5 Kategorien genutzt**: Nur so viele Quick-Start Buttons wie Kategorien vorhanden.
- **Alle Kategorien sind Systemkategorien**: Keine Quick-Start Buttons (Systemkategorien ausgeschlossen).
- **Laufende Aufgabe beim App-Start**: "Beenden"-Button ist sofort sichtbar.
- **Resume auf Aufgabe mit gelöschter Kategorie**: Resume-Button nicht anzeigen oder deaktivieren.
- **Gleichstand bei Häufigkeit**: Alphabetisch sortieren als Tiebreaker.

### Phase 8 (Plus-Tab)

- **Weniger als 5 genutzte Kategorien**: Top-Bereich zeigt nur die vorhandenen.
- **Keine Kategorien vorhanden**: Hinweis "Keine Kategorien" + Link zu Einstellungen.
- **Laufende Aufgabe beim Klick auf Plus-Tab Tätigkeit**: Wird automatisch beendet, neue startet.
- **Offline**: Plus-Tab funktioniert normal (IndexedDB).

### Phase 8 Smart Suggestions

- **Keine Kontext-Matches für aktuellen Zeitslot/Wochentag**: Fallback auf Gesamthäufigkeit der letzten 30 Tage.
- **Neuer Nutzer (keine Einträge)**: Alle Kategorien alphabetisch, kein Top-5-Bereich.
- **Kategorie nur in anderem Kontext genutzt**: Erscheint nicht in Top 5, aber im A-Z-Bereich.
- **Mitternacht-Grenzfall**: Zeitslot 0 (00:00-02:00) wird korrekt erkannt.
- **Zeitzonen**: Berechnung basiert auf lokaler Zeit des Nutzers (aus `date` und `startTime` Feldern).

## 7) Data & privacy

- **Was wird gespeichert?** Keine neuen Daten. Häufigkeit wird aus bestehenden TimeEntries berechnet.
- **Wo?** Berechnung erfolgt client-seitig aus IndexedDB.
- **Retention?** Keine zusätzliche Speicherung. Häufigkeit wird bei Bedarf neu berechnet.
- **Einstellung "Sortierung"**: Wird in localStorage gespeichert (wie andere UI-Präferenzen).

## 8) Acceptance checks (testable)

### Quick-Start Buttons

- [ ] AC-001: Bei 5+ genutzten Kategorien werden 5 Quick-Start Buttons angezeigt.
- [ ] AC-002: Tap auf Quick-Start Button erstellt Aufgabe mit Startzeit = jetzt, keine Endzeit.
- [ ] AC-003: Bei laufender Aufgabe wird diese automatisch beendet, wenn Quick-Start getappt wird.
- [ ] AC-004: Systemkategorien erscheinen nicht als Quick-Start Buttons.

### Kategorie-Dropdown

- [ ] AC-005: Dropdown ist nach Häufigkeit sortiert (Standard).
- [ ] AC-006: Dropdown scrollt zu Position 6 beim Öffnen.
- [ ] AC-007: Toggle in Einstellungen wechselt zwischen alphabetisch und Häufigkeit.

### Beenden-Button

- [ ] AC-008: Laufende Aufgabe zeigt "Beenden"-Button in der Liste.
- [ ] AC-009: Tap auf "Beenden" setzt Endzeit = jetzt und speichert sofort.
- [ ] AC-010: Laufende Aufgabe hat visuell unterscheidbares Layout.

### Resume-Button

- [ ] AC-011: Beendete Aufgaben zeigen Resume-Button (▶).
- [ ] AC-012: Tap auf Resume erstellt neue Aufgabe mit gleicher Kategorie.
- [ ] AC-013: Bei laufender Aufgabe wird diese automatisch beendet bei Resume.
- [ ] AC-014: Tap auf Aufgaben-Text öffnet Bearbeiten-Modal (nicht Resume).

### Endzeit vorausfüllen

- [ ] AC-015: Beim Bearbeiten einer laufenden Aufgabe ist Endzeit mit aktueller Zeit vorausgefüllt.

### UI-Layout (Phase 7)

- [ ] AC-016: Quick-Start Buttons sind oberhalb von "+ Aufgabe hinzufügen".
- [ ] AC-017: Aufgabenliste ist unterhalb, neueste zuerst.
- [ ] AC-018: Bei langer Liste bleiben Quick-Start Buttons sichtbar (kein Scrollen nötig).

### Plus-Tab (Phase 8)

- [ ] AC-019: Plus-Tab unter `/add` erreichbar, zeigt Tätigkeitsliste.
- [ ] AC-020: Top 5 wahrscheinlichste Kategorien (kontextbewusst) erscheinen oben, visuell abgetrennt.
- [ ] AC-021: Rest der Kategorien alphabetisch sortiert, ohne die Top 5 zu wiederholen.
- [ ] AC-022: Klick auf Tätigkeit startet Aufgabe sofort (kein Modal).
- [ ] AC-023: Nach Klick → Weiterleitung zu `/day`.
- [ ] AC-024: Systemkategorien erscheinen nicht in der Liste.

### Smart Suggestions (Phase 8)

- [ ] AC-032: Top 5 berücksichtigt aktuellen Wochentag (Mo-So separat).
- [ ] AC-033: Top 5 berücksichtigt aktuellen 2-Stunden-Zeitslot.
- [ ] AC-034: Kategorie mit Kontext-Match erscheint vor Kategorie mit nur Gesamthäufigkeit.
- [ ] AC-035: Bei keinen Kontext-Matches → Fallback auf Gesamthäufigkeit.
- [ ] AC-036: Bei Gleichstand → alphabetische Sortierung.

### Default-Tab-Logik (Phase 8)

- [ ] AC-025: App-Start ohne laufende Aufgabe → Redirect zu `/add`.
- [ ] AC-026: App-Start mit laufender Aufgabe → Redirect zu `/day`.

### Entfernen (Phase 8 Cleanup)

- [ ] AC-027: Plus-Tab ist erster Tab in Navigation (links von "Tag"), zeigt nur "+".
- [ ] AC-028: "+ Aufgabe hinzufügen" Button ist nicht mehr auf Tag-Tab.
- [ ] AC-029: Quick-Start Buttons sind nicht mehr auf Tag-Tab.
- [ ] AC-030: Sorting Toggle ist nicht mehr in Einstellungen.
- [ ] AC-031: Tag-Tab zeigt nur: Navigation, Tagesart, Zusammenfassung, Aufgabenliste.

## 9) Change log

- 2025-12-23: Created — Quick-Start UX Spec basierend auf Wettbewerbsanalyse
- 2025-12-23: Updated — Phase 8 hinzugefügt: Plus-Tab mit Ein-Klick-Workflow und dynamischer Default-Tab-Logik
- 2025-12-23: Updated — Plus-Tab als erster Tab (nur "+"), Entfernen von Quick-Start Buttons, "+ Aufgabe hinzufügen" Button und Sorting Toggle
- 2025-12-23: Updated — **Smart Suggestions**: Kontextbewusster Algorithmus für Top 5 (FR-033 bis FR-038, IG-009 bis IG-011, DD-009 bis DD-012, AC-032 bis AC-036). Parameter basierend auf Analyse realer Nutzerdaten: 2h-Zeitslots, Wochentage separat, Kontext-First-Scoring.
