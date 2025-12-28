# P10 — Free/Pro Feature-Flags + Paywall + User Profile — Tasks

**Phase:** 10  
**Created:** 2025-12-24  
**Last Updated:** 2025-12-24  
**Based on Spec:** `Docs/Specs/P10-monetising.md`  
**Based on Plan:** `Docs/Plans/P10-monetising.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task 10.1 - Supabase Schema erweitern

- **Files:**
  - Supabase SQL Editor (manuell)
- **Done when:**
  - `profiles.plan` Spalte existiert mit Default 'free'
  - `profiles.stripe_customer_id` Spalte existiert
  - `profiles.subscription_status` Spalte existiert
  - `profiles.subscription_ends_at` Spalte existiert
  - CHECK Constraint für plan ('free', 'pro') aktiv
- **Verify:**
  - SQL: `SELECT plan FROM profiles LIMIT 1` funktioniert
  - Neuer User hat automatisch `plan = 'free'`
- **Guardrails:**
  - Bestehende Daten nicht löschen
  - RLS Policies nicht ändern
- **Estimated:** 0.5h
- **Note:** User muss SQL manuell in Supabase ausführen

---

## Task 10.2 - TypeScript Types hinzufügen

- **Files:**
  - `src/lib/types.ts`
- **Done when:**
  - `UserPlan` Type existiert ('free' | 'pro')
  - `UserProfile` Interface existiert mit allen Feldern
- **Verify:**
  - `npm run check`
- **Guardrails:**
  - Bestehende Types nicht ändern
- **Estimated:** 0.5h

---

## Task 10.3 - Profile API erstellen

- **Files:**
  - `src/lib/api/profile.ts` (neu)
- **Done when:**
  - `loadUserProfile()` lädt Profil von Supabase
  - `getUserPlan()` gibt cached Plan zurück
  - Fehlerbehandlung mit Fallback auf 'free'
  - localStorage Caching implementiert
- **Verify:**
  - `npm run check`
  - `npm run lint`
- **Guardrails:**
  - Keine Änderungen an auth.ts
- **Estimated:** 1h

---

## Task 10.4 - User Store erstellen

- **Files:**
  - `src/lib/stores/user.ts` (neu)
- **Done when:**
  - `userPlan` Writable Store existiert
  - `userProfile` Writable Store existiert
  - Export für beide Stores
- **Verify:**
  - `npm run check`
- **Guardrails:**
  - Keine Änderungen an bestehenden Stores
- **Estimated:** 0.5h

---

## Task 10.5 - Profile bei Auth-Check laden

- **Files:**
  - `src/routes/+layout.svelte`
- **Done when:**
  - `loadUserProfile()` wird nach erfolgreicher Auth aufgerufen
  - `userPlan` Store ist nach Auth-Check gefüllt
  - Loading-State während Profile-Load
- **Verify:**
  - `npm run verify`
  - Browser: Nach Login ist `userPlan` im Store
- **Guardrails:**
  - Auth-Flow nicht brechen
  - Bestehende Funktionalität erhalten
- **Estimated:** 1h

---

## Task 10.6 - Paywall Komponente erstellen

- **Files:**
  - `src/lib/components/Paywall.svelte` (neu)
- **Done when:**
  - Komponente zeigt Titel "Pro-Funktionen"
  - Komponente zeigt Untertitel
  - Komponente zeigt 3 Feature-Bullets
  - Komponente zeigt Preis "10 € / Monat"
  - Primary Button "Pro freischalten" (onclick prop)
  - Secondary Button "Weiter mit Free" (onclick prop)
  - Hinweis "Tag- und Wochenansicht bleiben kostenlos"
  - Responsive Design (mobile-first)
- **Verify:**
  - `npm run verify`
  - Browser: Komponente rendert korrekt
- **Guardrails:**
  - Keine externen Dependencies
  - Konsistent mit bestehendem Design
- **Estimated:** 1.5h

---

## Task 10.7 - Paywall in Monat-Tab

- **Files:**
  - `src/routes/month/+page.svelte`
- **Done when:**
  - Import von `userPlan` Store
  - Import von `Paywall` Komponente
  - Wenn `$userPlan === 'free'`: Paywall statt Inhalt
  - "Pro freischalten" zeigt Toast "Kommt bald"
  - "Weiter mit Free" navigiert zu /day
- **Verify:**
  - `npm run verify`
  - Browser: Free-User sieht Paywall
  - Browser: Pro-User sieht normalen Inhalt
- **Guardrails:**
  - Bestehende Monat-Logik nicht ändern
  - Kein Flackern (Paywall sofort oder Loading)
- **Estimated:** 1h

---

## Task 10.8 - Paywall in Auswertung-Tab

- **Files:**
  - `src/routes/analysis/+page.svelte`
- **Done when:**
  - Import von `userPlan` Store
  - Import von `Paywall` Komponente
  - Wenn `$userPlan === 'free'`: Paywall statt Inhalt
  - "Pro freischalten" zeigt Toast "Kommt bald"
  - "Weiter mit Free" navigiert zu /day
- **Verify:**
  - `npm run verify`
  - Browser: Free-User sieht Paywall
  - Browser: Pro-User sieht normalen Inhalt
- **Guardrails:**
  - Bestehende Auswertung-Logik nicht ändern
  - Kein Flackern
- **Estimated:** 0.5h

---

## Task 10.9 - Settings: Konto-Abschnitt

- **Files:**
  - `src/routes/settings/+page.svelte`
- **Done when:**
  - Neuer Abschnitt "Konto" am Anfang der Settings
  - Zeigt E-Mail des eingeloggten Users
  - Zeigt aktuellen Plan (Free / Pro)
  - "Plan ändern" Button (öffnet Modal in Task 10.10)
  - "Abmelden" Button bleibt (verschoben in Konto-Abschnitt)
- **Verify:**
  - `npm run verify`
  - Browser: Konto-Abschnitt sichtbar
- **Guardrails:**
  - Bestehende Settings-Funktionalität erhalten
  - Logout-Funktion nicht brechen
- **Estimated:** 1h

---

## Task 10.10 - PlanSelector Modal

- **Files:**
  - `src/lib/components/PlanSelector.svelte` (neu)
  - `src/routes/settings/+page.svelte` (Integration)
- **Done when:**
  - Modal zeigt Free vs Pro Vergleich
  - Free-Features: Tag, Woche, Historie, Cloud-Backup
  - Pro-Features: Alles + Monat + Auswertung
  - Pro-Preis: "10 € / Monat"
  - Aktueller Plan visuell hervorgehoben
  - "Pro freischalten" Button (zeigt "Kommt bald" Toast)
  - Close-Button / Backdrop-Click schließt Modal
- **Verify:**
  - `npm run verify`
  - Browser: Modal öffnet und schließt korrekt
- **Guardrails:**
  - Konsistent mit bestehendem Modal-Design
- **Estimated:** 1.5h

---

## Task 10.11 - E2E Tests

- **Files:**
  - `e2e/paywall.test.ts` (neu)
- **Done when:**
  - Test: Free-User sieht Paywall auf /month
  - Test: Free-User sieht Paywall auf /analysis
  - Test: "Weiter mit Free" navigiert zu /day
  - Test: Settings zeigt Konto-Abschnitt
  - Test: Plan-Auswahl Modal öffnet
- **Verify:**
  - `npm run test:e2e`
- **Guardrails:**
  - Bestehende Tests nicht brechen
  - Test-IDs für neue Elemente hinzufügen
- **Estimated:** 1.5h

---

## Task Summary

| Task      | Beschreibung             | Estimated |
| --------- | ------------------------ | --------- |
| 10.1      | Supabase Schema          | 0.5h      |
| 10.2      | TypeScript Types         | 0.5h      |
| 10.3      | Profile API              | 1h        |
| 10.4      | User Store               | 0.5h      |
| 10.5      | Profile bei Auth laden   | 1h        |
| 10.6      | Paywall Komponente       | 1.5h      |
| 10.7      | Paywall in Monat         | 1h        |
| 10.8      | Paywall in Auswertung    | 0.5h      |
| 10.9      | Settings Konto-Abschnitt | 1h        |
| 10.10     | PlanSelector Modal       | 1.5h      |
| 10.11     | E2E Tests                | 1.5h      |
| **Total** |                          | **~10h**  |

---

## Pre-Implementation Gates

- [x] **Simplicity:** ≤3 neue Dateien für initiale Implementierung? → 4 neue Dateien (akzeptabel)
- [x] **Anti-Abstraction:** Framework direkt nutzen, keine unnötigen Wrapper? → Ja
- [x] **Integration-First:** Contracts/Interfaces vor Implementierung definiert? → Ja (Types in Task 10.2)
- [x] **Scope-Lock:** Keine neuen Requirements seit Spec-Approval? → Ja
- [x] **Test-Ready:** Mindestens ein Acceptance Check ist automatisierbar? → Ja (E2E Tests)

---

## Dependencies

```
Task 10.1 (Schema) ─────────────────────────────────────────┐
                                                            │
Task 10.2 (Types) ──────────────────────────────────────────┤
        │                                                   │
        └── Task 10.3 (API) ────────────────────────────────┤
                │                                           │
                └── Task 10.4 (Store) ──────────────────────┤
                        │                                   │
                        └── Task 10.5 (Layout) ─────────────┤
                                │                           │
                                ├── Task 10.6 (Paywall) ────┤
                                │       │                   │
                                │       ├── Task 10.7 (Monat)
                                │       │                   │
                                │       └── Task 10.8 (Auswertung)
                                │                           │
                                └── Task 10.9 (Settings) ───┤
                                        │                   │
                                        └── Task 10.10 (PlanSelector)
                                                            │
Task 10.11 (E2E) ───────────────────────────────────────────┘
```

**Parallelisierbar:**

- Task 10.6 und Task 10.9 können parallel nach Task 10.5
- Task 10.7 und Task 10.8 können parallel nach Task 10.6
