# P10 — Free/Pro Feature-Flags + Paywall + User Profile

> **DEPRECATED:** This spec has been superseded by `Docs/Specs/subscription-plans.md`
>
> Key changes in new spec:
>
> - Free tier includes Monat/Auswertung (not gated)
> - Pro tier gates Cloud Backup, Import, Export
> - Premium tier added as placeholder

**Phase:** 10  
**Created:** 2025-12-24  
**Last Updated:** 2025-12-26  
**Status:** DEPRECATED

**Depends on:**

- Phase 6: Cloud Auth & Backup (Supabase Integration)

**Does not depend on:**

- Stripe Integration (→ P11)
- Payment Processing (→ P11)

---

## 1) Goal / Problem

Vorbereitung der Monetarisierung durch sauberes Free/Pro-Gating.
Tag und Woche bleiben dauerhaft vollständig nutzbar (Free).
Monat und Auswertung sind Pro-Features mit Paywall.
User Profile UI wird eingeführt für Plan-Anzeige und spätere Erweiterungen.

---

## 2) Scope

### In scope

- Supabase Schema: `profiles.plan` Feld
- Supabase Schema: Vorbereitung für Stripe (`stripe_customer_id`, `subscription_status`)
- Client: `userPlan` Store (lädt plan bei Login/Startup)
- Paywall-Komponente für gesperrte Tabs
- User Profile UI (neuer Bereich in Settings oder eigene Route)
- Plan-Auswahl UI (Free/Pro Vergleich, "Pro freischalten" Button)
- Deep-Link-Handling für gesperrte Tabs

### Out of scope

- Stripe Checkout Integration (→ P11)
- Webhook für Subscription-Status (→ P11)
- Automatische Plan-Änderung nach Zahlung (→ P11)
- Mehrsprachigkeit / i18n
- Onboarding-Flow für neue User (→ separate Spec)

### What we don't want

- Client als Quelle der Wahrheit für `plan` — Server (Supabase) ist autoritativ
- Teilweise gerenderte Pro-Features — entweder voll oder Paywall
- Versteckte Pro-Tabs — Tabs bleiben sichtbar, Inhalt ist Paywall
- Komplexe Subscription-Logik in P10 — nur `plan = 'free' | 'pro'`

---

## 3) Functional Requirements (FR)

### Feature-Gating

- **P10-FR-001**: User hat einen `plan` mit Werten `'free'` oder `'pro'`
- **P10-FR-002**: Default bei neuer Registrierung: `plan = 'free'`
- **P10-FR-003**: Free-User haben vollen Zugriff auf: Tag, Woche, Plus-Tab, Settings
- **P10-FR-004**: Free-User sehen Paywall statt Inhalt bei: Monat, Auswertung
- **P10-FR-005**: Pro-User haben vollen Zugriff auf alle Tabs
- **P10-FR-006**: Tabs Monat und Auswertung bleiben in Navigation sichtbar (nicht versteckt)

### Paywall

- **P10-FR-007**: Paywall zeigt Titel "Pro-Funktionen"
- **P10-FR-008**: Paywall zeigt Untertitel "Monatsübersicht und Auswertungen sind in Pro enthalten."
- **P10-FR-009**: Paywall zeigt Feature-Liste:
  - "Monat: Überblick über Wochen und Summen"
  - "Auswertung: Zeiträume vergleichen und Schwerpunkte erkennen"
  - "Tätigkeiten: Verteilung nach Kategorien über längere Zeit"
- **P10-FR-010**: Paywall zeigt Preis: "10 € / Monat — jederzeit kündbar"
- **P10-FR-011**: Paywall hat Primary Button "Pro freischalten" (Stub in P10)
- **P10-FR-012**: Paywall hat Secondary Button "Weiter mit Free" → navigiert zu /day
- **P10-FR-013**: Paywall zeigt Hinweis: "Tag- und Wochenansicht bleiben kostenlos verfügbar."
- **P10-FR-014**: Deep-Links auf /month oder /analysis zeigen Paywall für Free-User

### User Profile

- **P10-FR-015**: User Profile zeigt E-Mail-Adresse des eingeloggten Users
- **P10-FR-016**: User Profile zeigt aktuellen Plan (Free / Pro)
- **P10-FR-017**: User Profile zeigt "Plan ändern" Button (öffnet Plan-Auswahl)
- **P10-FR-018**: User Profile ist erreichbar über Settings-Tab (neuer Abschnitt "Konto")

### Plan-Auswahl

- **P10-FR-019**: Plan-Auswahl zeigt Free vs Pro Vergleich
- **P10-FR-020**: Free-Features: Tag, Woche, Unbegrenzte Historie, Cloud-Backup
- **P10-FR-021**: Pro-Features: Alles aus Free + Monat + Auswertung
- **P10-FR-022**: Pro-Preis: "10 € / Monat"
- **P10-FR-023**: "Pro freischalten" Button (Stub in P10 — zeigt Meldung "Kommt bald")
- **P10-FR-024**: Aktueller Plan ist visuell hervorgehoben

---

## 4) Implementation Guarantees (IG)

- **P10-IG-001**: `plan` wird ausschließlich aus Supabase `profiles` Tabelle gelesen
- **P10-IG-002**: Client cached `plan` lokal, aber refresht bei App-Start und nach Auth-Events
- **P10-IG-003**: Paywall rendert vollständig — kein Flackern, kein Teil-Render des Pro-Inhalts
- **P10-IG-004**: Tag und Woche dürfen niemals gesperrt werden (auch nicht durch Bugs)
- **P10-IG-005**: Supabase RLS Policy: User kann nur eigenes Profil lesen/schreiben
- **P10-IG-006**: `stripe_customer_id` und `subscription_status` werden in P10 nicht verwendet, nur angelegt

---

## 5) Design Decisions (DD)

- **P10-DD-001**: Paywall als eigene Komponente `Paywall.svelte`, nicht inline in jeder Route
- **P10-DD-002**: Plan-Check in Route-Komponenten (`+page.svelte`), nicht im Layout
- **P10-DD-003**: `userPlan` als Svelte Store in `$lib/stores/user.ts`
- **P10-DD-004**: Plan-Auswahl als Modal, nicht als eigene Route
- **P10-DD-005**: "Pro freischalten" Button in P10 zeigt Toast/Dialog "Kommt bald" — kein Redirect
- **P10-DD-006**: User Profile als Abschnitt in Settings, nicht als eigene Route (konsistent mit bestehendem Design)

---

## 6) Edge cases

- **User ohne Profil-Eintrag**: Sollte nicht vorkommen (Supabase Trigger erstellt Profil bei Signup). Falls doch: behandeln als `plan = 'free'`
- **Supabase offline beim App-Start**: Cached `plan` aus letzter Session verwenden. Falls kein Cache: `plan = 'free'` (konservativ)
- **Plan ändert sich während Session**: Nicht in P10 relevant (keine automatische Änderung). Für P11: Polling oder Realtime-Subscription
- **User löscht Account**: Supabase CASCADE löscht Profil automatisch
- **Mehrere Geräte**: Plan ist server-seitig, synchronisiert automatisch bei App-Start

---

## 7) Data & privacy

### Supabase Schema: `profiles` Tabelle (erweitert)

```sql
-- Neue Spalten für profiles Tabelle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Check constraint für plan
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'pro'));

-- Index für Stripe Customer ID (für Webhook-Lookups in P11)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
```

### Was wird gespeichert?

| Feld                   | Typ         | Beschreibung                           | Wann gesetzt                                  |
| ---------------------- | ----------- | -------------------------------------- | --------------------------------------------- |
| `plan`                 | TEXT        | 'free' oder 'pro'                      | Default 'free', manuell oder via Stripe (P11) |
| `stripe_customer_id`   | TEXT        | Stripe Customer ID                     | P11: Nach erstem Checkout                     |
| `subscription_status`  | TEXT        | 'active', 'canceled', 'past_due', etc. | P11: Via Webhook                              |
| `subscription_ends_at` | TIMESTAMPTZ | Wann Subscription endet                | P11: Via Webhook                              |

### Retention

- Profil-Daten bleiben solange User existiert
- Bei Account-Löschung: CASCADE Delete

### Export/Delete

- DSGVO-Export muss `plan` und Subscription-Daten enthalten
- Account-Löschung löscht alle Profil-Daten

---

## 8) Acceptance checks (testable)

### Feature-Gating

- [ ] **AC-001**: Neuer User hat `plan = 'free'` nach Registrierung (→ P10-FR-002)
- [ ] **AC-002**: Free-User kann Tag-Tab vollständig nutzen (→ P10-FR-003)
- [ ] **AC-003**: Free-User kann Woche-Tab vollständig nutzen (→ P10-FR-003)
- [ ] **AC-004**: Free-User sieht Paywall auf Monat-Tab (→ P10-FR-004)
- [ ] **AC-005**: Free-User sieht Paywall auf Auswertung-Tab (→ P10-FR-004)
- [ ] **AC-006**: Pro-User sieht Monat-Tab normal (→ P10-FR-005)
- [ ] **AC-007**: Pro-User sieht Auswertung-Tab normal (→ P10-FR-005)

### Paywall

- [ ] **AC-008**: Paywall zeigt korrekten Titel und Untertitel (→ P10-FR-007, P10-FR-008)
- [ ] **AC-009**: Paywall zeigt alle 3 Feature-Bullets (→ P10-FR-009)
- [ ] **AC-010**: "Weiter mit Free" navigiert zu /day (→ P10-FR-012)
- [ ] **AC-011**: Deep-Link /month zeigt Paywall für Free-User (→ P10-FR-014)
- [ ] **AC-012**: Deep-Link /analysis zeigt Paywall für Free-User (→ P10-FR-014)

### User Profile

- [ ] **AC-013**: Settings zeigt "Konto" Abschnitt mit E-Mail (→ P10-FR-015, P10-FR-018)
- [ ] **AC-014**: Settings zeigt aktuellen Plan (→ P10-FR-016)
- [ ] **AC-015**: "Plan ändern" öffnet Plan-Auswahl Modal (→ P10-FR-017)

### Plan-Auswahl

- [ ] **AC-016**: Plan-Auswahl zeigt Free vs Pro Vergleich (→ P10-FR-019)
- [ ] **AC-017**: Aktueller Plan ist visuell hervorgehoben (→ P10-FR-024)
- [ ] **AC-018**: "Pro freischalten" zeigt "Kommt bald" Meldung (→ P10-FR-023)

### Supabase

- [ ] **AC-019**: `profiles.plan` Spalte existiert mit Default 'free'
- [ ] **AC-020**: RLS Policy erlaubt nur Zugriff auf eigenes Profil
- [ ] **AC-021**: Manuelles `UPDATE profiles SET plan='pro'` schaltet Pro frei

---

## 9) Change log

**[2025-12-24 21:30]**

- Added: Initial spec created from user input document
- Added: Prüfaufträge-Ergebnisse integriert (kein profiles Store, Routing-basierte Navigation, hardcoded DE)
- Added: User Profile UI Anforderungen
- Added: Plan-Auswahl UI Anforderungen
- Added: Supabase Schema mit Stripe-Vorbereitung

---

## 10) Spec Completeness Checklist

Before proceeding to Phase 2 (Plan), verify all required sections are complete:

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (P10-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (P10-IG-xxx)
- [x] Design Decisions (DD) — all numbered (P10-DD-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions

---

## 11) UI Mockups (ASCII)

### Paywall (Monat/Auswertung Tab)

```
+---------------------------------------------------------------+
|  [←]  Monat: Dezember 2025  [→]                               |
+---------------------------------------------------------------+
|                                                               |
|                     🔒 Pro-Funktionen                         |
|                                                               |
|     Monatsübersicht und Auswertungen sind in Pro enthalten.   |
|                                                               |
|     ✓ Monat: Überblick über Wochen und Summen                 |
|     ✓ Auswertung: Zeiträume vergleichen und Schwerpunkte      |
|     ✓ Tätigkeiten: Verteilung nach Kategorien                 |
|                                                               |
|                    10 € / Monat                               |
|                  jederzeit kündbar                            |
|                                                               |
|              [ Pro freischalten ]  (Primary)                  |
|              [ Weiter mit Free ]   (Secondary)                |
|                                                               |
|     Tag- und Wochenansicht bleiben kostenlos verfügbar.       |
|                                                               |
+---------------------------------------------------------------+
```

### Settings — Konto Abschnitt

```
+---------------------------------------------------------------+
|  Einstellungen                                                |
+---------------------------------------------------------------+
|                                                               |
|  KONTO                                                        |
|  +-----------------------------------------------------------+|
|  | E-Mail: user@example.com                                  ||
|  +-----------------------------------------------------------+|
|  | Plan: Free                        [ Plan ändern ]         ||
|  +-----------------------------------------------------------+|
|  | [ Abmelden ]                                              ||
|  +-----------------------------------------------------------+|
|                                                               |
|  KATEGORIEN                                                   |
|  ...                                                          |
|                                                               |
+---------------------------------------------------------------+
```

### Plan-Auswahl Modal

```
+---------------------------------------------------------------+
|                      Plan auswählen                       [x] |
+---------------------------------------------------------------+
|                                                               |
|  +---------------------------+  +---------------------------+ |
|  |         FREE              |  |          PRO              | |
|  |        Kostenlos          |  |      10 € / Monat         | |
|  +---------------------------+  +---------------------------+ |
|  |                           |  |                           | |
|  | ✓ Tag-Ansicht             |  | ✓ Alles aus Free          | |
|  | ✓ Wochen-Ansicht          |  | ✓ Monats-Übersicht        | |
|  | ✓ Unbegrenzte Historie    |  | ✓ Auswertungen            | |
|  | ✓ Cloud-Backup            |  | ✓ Tätigkeiten-Analyse     | |
|  |                           |  |                           | |
|  |   [Aktueller Plan]        |  |   [ Pro freischalten ]    | |
|  |      (disabled)           |  |      (Primary)            | |
|  +---------------------------+  +---------------------------+ |
|                                                               |
+---------------------------------------------------------------+
```

---

## 12) Dev-Hinweise

### Manuell User auf Pro setzen (für Testing)

```sql
-- In Supabase SQL Editor:
UPDATE profiles SET plan = 'pro' WHERE id = '<user-uuid>';

-- User-ID finden:
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
```

### Lokales Testing

1. Registriere neuen User → automatisch `plan = 'free'`
2. Teste Paywall auf /month und /analysis
3. Setze manuell auf Pro (SQL oben)
4. Verifiziere Pro-Zugriff auf alle Tabs
5. Setze zurück auf Free, verifiziere Paywall wieder da
