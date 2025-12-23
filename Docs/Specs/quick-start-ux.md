# Quick-Start UX — Spec

## 1) Goal / Problem

Der aktuelle Workflow zum Anlegen und Beenden von Aufgaben erfordert zu viele Klicks (3-4 pro Aktion). Für Nutzer mit 20-40 Tätigkeitswechseln pro Tag ist das ein spürbarer Nachteil gegenüber Konkurrenzprodukten wie Toggl und Clockify, die 1-Klick-Workflows bieten.

**Ziel:** Reduzierung der Interaktionen auf 1 Klick für die häufigsten Aktionen (Aufgabe starten, beenden, fortsetzen).

## 2) Scope

### In scope

- Quick-Start Buttons für die 5 häufigsten Tätigkeiten (1-Klick-Start)
- Kategorie-Dropdown nach Häufigkeit sortiert (mit Scroll zu Position 6)
- "Beenden"-Button für laufende Aufgaben (1-Klick-Ende)
- Resume-Button für beendete Aufgaben (1-Klick-Fortsetzen)
- Endzeit vorausfüllen beim Bearbeiten einer laufenden Aufgabe
- Toggle in Einstellungen: Sortierung alphabetisch / Häufigkeit

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

### UI-Layout

- **TT-FR-018**: Die Reihenfolge im Tag-Screen ist: Quick-Start Buttons → "+ Aufgabe hinzufügen" → Aufgabenliste (neueste zuerst).
- **TT-FR-019**: Die Aufgabenliste scrollt nach unten, Quick-Start Buttons und "+ Aufgabe hinzufügen" bleiben immer sichtbar (sticky oder am Anfang).

## 4) Implementation Guarantees (IG)

- **TT-IG-001**: Häufigkeitsberechnung basiert auf Einträgen der letzten 30 Tage, nicht auf Gesamthistorie.
- **TT-IG-002**: Neue Kategorien (noch nie verwendet) erscheinen am Ende der Häufigkeitsliste.
- **TT-IG-003**: Systemkategorien (Pause, Urlaub, Krank, Feiertag) werden nicht als Quick-Start Buttons angezeigt.
- **TT-IG-004**: Die Häufigkeitsdaten werden lokal berechnet (keine Server-Anfrage).
- **TT-IG-005**: Alle Aktionen (Quick-Start, Beenden, Resume) funktionieren offline.

## 5) Design Decisions (DD)

- **TT-DD-001**: Häufigkeit statt manueller Favoriten — automatische Anpassung ohne Nutzerpflege.
- **TT-DD-002**: Automatisches Beenden bei Resume/Quick-Start — weniger Klicks, Fehler können durch Bearbeiten korrigiert werden.
- **TT-DD-003**: Hybrid-Scroll im Dropdown — Top 5 bleiben erreichbar, aber Fokus auf Position 6.
- **TT-DD-004**: Kein Bestätigungsdialog bei "Beenden" — Geschwindigkeit vor Sicherheit, Korrektur ist einfach.

## 6) Edge cases

- **Keine Einträge in den letzten 30 Tagen**: Keine Quick-Start Buttons anzeigen, nur "+ Aufgabe hinzufügen".
- **Weniger als 5 Kategorien genutzt**: Nur so viele Quick-Start Buttons wie Kategorien vorhanden.
- **Alle Kategorien sind Systemkategorien**: Keine Quick-Start Buttons (Systemkategorien ausgeschlossen).
- **Laufende Aufgabe beim App-Start**: "Beenden"-Button ist sofort sichtbar.
- **Resume auf Aufgabe mit gelöschter Kategorie**: Resume-Button nicht anzeigen oder deaktivieren.
- **Gleichstand bei Häufigkeit**: Alphabetisch sortieren als Tiebreaker.

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

### UI-Layout

- [ ] AC-016: Quick-Start Buttons sind oberhalb von "+ Aufgabe hinzufügen".
- [ ] AC-017: Aufgabenliste ist unterhalb, neueste zuerst.
- [ ] AC-018: Bei langer Liste bleiben Quick-Start Buttons sichtbar (kein Scrollen nötig).

## 9) Change log

- 2025-12-23: Created — Quick-Start UX Spec basierend auf Wettbewerbsanalyse
