
---

# Arbeitszeit-App – UI & Logik Spezifikation (v1)

> **Status:** Final
> **Ziel:** 1:1 Umsetzung der Excel-Logik als Web-App
> **Sprache:** Deutsch
> **Plattform:** Mobile-first (Web, iPhone-optimiert)

---

## 1. Grundprinzipien

* **Ein Screen = eine klare Verantwortung**
* **Keine versteckten Automatiken**
* **Alles, was zählt, ist sichtbar**
* **Tippen UND Klicken immer möglich**
* **Excel-Logik wird nicht „verbessert“, nur sauber umgesetzt**

---

## 2. Tabs & Navigation

### Haupttabs (fix)

* **Tag**
* **Woche**
* **Auswertung**
* **Einstellungen**

### Navigation

* **Tag / Woche**

  * ← / → Buttons
* **Tag**

  * Wenn Datum = heute → Titel zeigt **„Heute“**
* **Woche**

  * Wenn Woche = aktuelle KW → Titel zeigt **„Aktuelle KW 12“**
  * Sonst **„KW 12“**

---

## 3. Tab: Tag

### Reihenfolge (verbindlich)

1. **Hinweisbanner** (nur wenn relevant)
2. **Tagesart**
3. **Inline-Summary**
4. **Aufgabenliste (neueste zuerst)**

---

### 3.1 Hinweisbanner (Edge Case)

**Bedingung:**
Es existiert eine Aufgabe mit Startzeit, aber **keine Endzeit**.

**Anzeige (persistent):**

> ⚠ Aufgabe läuft noch (keine Endzeit)

* Kein Modal
* Kein Toast
* Banner verschwindet sofort, wenn Endzeit gesetzt wird

---

### 3.2 Tagesart

Dropdown (genau eine Auswahl):

* Arbeitstag
* Urlaub
* Krank
* Feiertag

**Regel:**

* Tagesart beeinflusst **nur Soll**, niemals Ist

---

### 3.3 Inline-Summary (eine Zeile)

Anzeige **unterhalb** der Tagesart:

```
Ist: 4,0 Std    Soll: 8,0 Std    Saldo: −4,0 Std
```

---

### 3.4 Aufgabenliste

* Sortierung: **neueste zuerst**
* Laufende Aufgabe:

  * Endzeit = „laufend“
* Pro Aufgabe anzeigen:

  * Zeitspanne
  * Kategorie
  * Hinweis „zählt als Arbeitszeit“ / „zählt nicht“

---

## 4. Tab: Woche

### Reihenfolge

1. **Wochenart**
2. **Inline-Summary**
3. **Tagesliste**

---

### 4.1 Wochenart

Dropdown:

* Arbeitswoche
* Urlaub
* Krank
* Feiertag

**Aktion:**

* Setzt die **Tagesart aller Tage dieser Woche**
* Tage können danach einzeln angepasst werden

---

### 4.2 Inline-Summary

```
Ist: 34,0 Std    Soll: 51,0 Std    Saldo: −17,0 Std
```

---

### 4.3 Tagesliste

* Zeige **nur Tage**, die im aktiven Arbeitszeitmodell aktiv sind
* Pro Tag:

  * Datum
  * Tagesart
  * Ist / Soll

Beispiel:

```
Mo 18.03 – Arbeitstag   Ist 4,0 / Soll 8,0
Di 19.03 – Urlaub       Ist 0,0 / Soll 0,0
```

---

## 5. Tab: Auswertung

### 5.1 Standard-Zeitraum

* **01.01.aktuelles Jahr – Heute**

### 5.2 Zeitraum-Selector

Beim Klick auf „Zeitraum“:

#### Schnellwahl

* **Aktuelles Jahr**

#### Manuell

* Zwei Felder:

  * Von (TT.MM.JJJJ)
  * Bis (TT.MM.JJJJ)
* **Kalender + Texteingabe möglich**
* Letzter Zeitraum wird **persistiert**

---

### 5.3 Inline-Summary

```
Gesamt Ist: 142 Std    Gesamt Soll: 168 Std    Saldo: −26 Std
```

---

### 5.4 Gruppierung (automatisch)

* Zeitraum ≈ 1 Monat → **Kalenderwochen**
* Zeitraum > 2 Monate → **Monate**
* Aktuelle (unvollständige) Periode immer anzeigen

Pro Gruppe:

```
KW 12 – Arbeitswoche   Ist 38 / Soll 51
```

---

## 6. Aufgabe hinzufügen

### Felder

* **Kategorie** (filterbar, Tipp-Suche)
* **Startzeit** (vorbelegt)
* **Endzeit** (optional)
* **Beschreibung** (optional)

### Verhalten

* Wenn Aufgabe läuft:

  * Banner bleibt im Tag-Screen sichtbar
  * Keine automatische Beendigung

---

## 7. Kategorien

### Systemkategorien (fix, nicht löschbar)

* Pause
* Urlaub
* Krank
* Feiertag

### Eigene Kategorien

* Frei benennbar
* Flag:

  * **„Zählt als Arbeitszeit“** (Checkbox)

### UI

* ➕ Button immer sichtbar
* 🗑️ Button pro Kategorie (nicht bei Systemkategorien)
* Kein „Edit-Mode“

---

## 8. Arbeitszeitmodelle

### Konzept

* Beliebig viele Modelle
* Jedes Modell gilt **ab einem Datum**
* Kein Enddatum (nächstes Modell beendet das vorige)

---

## 9. Arbeitszeitmodell hinzufügen

### 9.1 Gültig ab

* **Textfeld**
* Format: `TT.MM.JJJJ`
* Validierung:

  * echtes Datum
  * kein Duplikat
  * zeitlich konsistent

---

### 9.2 Sollstunden pro Wochentag (Mo–So)

**JEDE Zeile einzeilig, immer mit Stundenfeld**

Format:

```
☑ Montag     [ 8,0 ] Std
☑ Dienstag   [ 8,0 ] Std
☑ Mittwoch   [ 8,0 ] Std
☑ Donnerstag [ 8,0 ] Std
☑ Freitag    [ 8,0 ] Std
☐ Samstag    [ 0,0 ] Std   (disabled)
☐ Sonntag    [ 0,0 ] Std   (disabled)
```

#### Regeln

* Stundenfeld **immer sichtbar**
* Disabled, wenn Checkbox aus
* Wert bleibt erhalten beim Deaktivieren
* Komma **und** Punkt erlauben (DE/EN)

---

### 9.3 Wöchentliche Sollzeit

* Read-only
* Unter allen Tagen
* Berechnung:

  * Summe aller **aktivierten** Tage

Beispiel:

```
Wöchentliche Sollzeit: 40,0 Std
```

---

## 10. Berechnungslogik (klar & final)

### Ist-Zeit

Summe aller Aufgaben mit:

```
Kategorie.zähltAlsArbeitszeit === true
```

### Soll-Zeit (pro Tag)

```
wenn Tagesart === Arbeitstag:
    Soll = Arbeitszeitmodell[Wochentag]
sonst:
    Soll = 0
```

### Saldo

```
Saldo = Ist − Soll
```

---

## 11. Dinge, die es bewusst NICHT gibt

* ❌ Manuelle Tages- oder Wochen-Overrides
* ❌ Edit-Modus für Kategorien
* ❌ Zwangs-Picker ohne Texteingabe
* ❌ Automatische Task-Beendigung

---

## 12. Implementierungs-Hinweise (für Cascade)

* Mobile-first
* Keine nativen `<input type="date">` ohne Text-Fallback
* Persistenz lokal (JSON / IndexedDB / localStorage)
* Validierungen klar, aber nicht aggressiv

---

**Ende der Spezifikation.**


