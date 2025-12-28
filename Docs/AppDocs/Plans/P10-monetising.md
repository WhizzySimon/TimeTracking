# P10 — Free/Pro Feature-Flags + Paywall + User Profile — Plan

**Phase:** 10  
**Created:** 2025-12-24  
**Last Updated:** 2025-12-24  
**Based on Spec:** `Docs/Specs/P10-monetising.md`

---

## Architecture / Modules

### Neue Dateien

| Datei                                    | Verantwortung                                          |
| ---------------------------------------- | ------------------------------------------------------ |
| `src/lib/stores/user.ts`                 | `userPlan` Store, `loadUserProfile()`, `getUserPlan()` |
| `src/lib/api/profile.ts`                 | Supabase Profile API (read/update)                     |
| `src/lib/components/Paywall.svelte`      | Paywall-Komponente für gesperrte Tabs                  |
| `src/lib/components/PlanSelector.svelte` | Plan-Auswahl Modal (Free vs Pro)                       |

### Geänderte Dateien

| Datei                              | Änderung                           |
| ---------------------------------- | ---------------------------------- |
| `src/routes/month/+page.svelte`    | Paywall-Check hinzufügen           |
| `src/routes/analysis/+page.svelte` | Paywall-Check hinzufügen           |
| `src/routes/settings/+page.svelte` | "Konto" Abschnitt hinzufügen       |
| `src/routes/+layout.svelte`        | `loadUserProfile()` bei Auth-Check |
| `src/lib/types.ts`                 | `UserProfile` Type hinzufügen      |

### Abhängigkeiten

```
+layout.svelte (Auth-Check)
    │
    ├── loadSession() [bestehend]
    │
    └── loadUserProfile() [NEU]
            │
            └── profile.ts → Supabase profiles.plan
                    │
                    └── userPlan Store
                            │
                            ├── month/+page.svelte → Paywall?
                            └── analysis/+page.svelte → Paywall?
```

---

## Data Model

### Supabase Schema (profiles Tabelle erweitern)

```sql
-- Neue Spalten
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'pro'));

-- Index für P11
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
```

### TypeScript Types

```typescript
// src/lib/types.ts
export type UserPlan = 'free' | 'pro';

export interface UserProfile {
	id: string;
	email: string;
	plan: UserPlan;
	stripeCustomerId?: string;
	subscriptionStatus?: string;
	subscriptionEndsAt?: string;
	createdAt: string;
	updatedAt: string;
}
```

---

## UI State Model

### Stores

| Store         | Typ                             | Initialisierung | Update                   |
| ------------- | ------------------------------- | --------------- | ------------------------ |
| `userPlan`    | `Writable<UserPlan>`            | `'free'`        | Nach `loadUserProfile()` |
| `userProfile` | `Writable<UserProfile \| null>` | `null`          | Nach `loadUserProfile()` |

### State Flow

```
App Start
    │
    ├── loadSession() → authSession Store
    │
    └── if authenticated:
            │
            └── loadUserProfile()
                    │
                    ├── Supabase: SELECT plan FROM profiles
                    │
                    └── userPlan.set(plan)

Route: /month oder /analysis
    │
    └── $userPlan === 'free'?
            │
            ├── JA → Render <Paywall />
            │
            └── NEIN → Render normaler Inhalt
```

---

## Error Handling

| Szenario                       | Handling                                 |
| ------------------------------ | ---------------------------------------- |
| Supabase offline bei App-Start | Cached `plan` aus localStorage verwenden |
| Kein Cache vorhanden           | Default `plan = 'free'` (konservativ)    |
| Profile existiert nicht        | Behandeln als `plan = 'free'`            |
| Netzwerkfehler beim Laden      | Console.error, weiter mit cached/default |

### Caching-Strategie

```typescript
// localStorage Key
const PLAN_CACHE_KEY = 'userPlan';

// Bei erfolgreichem Load
localStorage.setItem(PLAN_CACHE_KEY, plan);

// Bei Fehler
const cached = localStorage.getItem(PLAN_CACHE_KEY);
return cached ?? 'free';
```

---

## Testing Strategy

### Unit Tests

| Test                                          | Datei                         |
| --------------------------------------------- | ----------------------------- |
| `getUserPlan()` returns cached value on error | `src/lib/stores/user.test.ts` |
| `loadUserProfile()` updates store             | `src/lib/stores/user.test.ts` |

### E2E Tests

| Test                                  | Datei                 |
| ------------------------------------- | --------------------- |
| Free-User sieht Paywall auf /month    | `e2e/paywall.test.ts` |
| Free-User sieht Paywall auf /analysis | `e2e/paywall.test.ts` |
| Pro-User sieht normale Tabs           | `e2e/paywall.test.ts` |
| "Weiter mit Free" navigiert zu /day   | `e2e/paywall.test.ts` |
| Settings zeigt Konto-Abschnitt        | `e2e/paywall.test.ts` |

### Manuelles Testing

1. Neuen User registrieren → `plan = 'free'`
2. /month öffnen → Paywall
3. /analysis öffnen → Paywall
4. SQL: `UPDATE profiles SET plan='pro'`
5. App neu laden → /month zeigt Inhalt
6. SQL: `UPDATE profiles SET plan='free'`
7. App neu laden → Paywall wieder da

---

## Risks / Constraints

### Performance

- Profile-Load bei jedem App-Start: ~50-100ms (akzeptabel)
- Kein Realtime-Subscription für Plan-Änderungen (nicht nötig in P10)

### UX

- Paywall muss sofort sichtbar sein, kein Flackern
- Loading-State während Profile-Load (kurz, aber vorhanden)

### Platform

- Supabase RLS muss korrekt konfiguriert sein
- Profile muss bei Signup automatisch erstellt werden (Trigger prüfen)

---

## Implementation Order

1. **Supabase Schema** — SQL ausführen (manuell)
2. **Types** — `UserProfile`, `UserPlan` in types.ts
3. **API** — `profile.ts` mit `loadUserProfile()`
4. **Store** — `user.ts` mit `userPlan` Store
5. **Layout** — Profile bei Auth-Check laden
6. **Paywall** — Komponente erstellen
7. **Routes** — Paywall in /month und /analysis
8. **Settings** — Konto-Abschnitt
9. **PlanSelector** — Modal für Plan-Auswahl
10. **E2E Tests** — Paywall-Tests

---

## Supabase Setup Checklist

Vor Implementation muss User folgendes in Supabase ausführen:

- [ ] SQL: `ALTER TABLE profiles ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'`
- [ ] SQL: `ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT`
- [ ] SQL: `ALTER TABLE profiles ADD COLUMN subscription_status TEXT`
- [ ] SQL: `ALTER TABLE profiles ADD COLUMN subscription_ends_at TIMESTAMPTZ`
- [ ] SQL: `ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro'))`
- [ ] RLS Policy prüfen: User kann nur eigenes Profil lesen
- [ ] Trigger prüfen: Profile wird bei Signup erstellt
