# P10 — Monetising Tasks (Draft)

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

Feature: Free/Pro Feature-Flags + Paywall für Monat/Auswertung (ohne Stripe)
Workflow: New Feature (spec-driven)

Ziel

Vorbereitung der Monetarisierung durch sauberes Free/Pro-Gating.
Tag und Woche bleiben dauerhaft vollständig nutzbar.

Bestehende Produktstruktur (gegeben)

Tabs:

Tag – Tagesansicht (Aufgaben, Ist/Soll/Saldo)

Woche – Wochenübersicht (Tagesliste, Navigation)

Monat – Monatsübersicht (Aggregation über Wochen)

Auswertung – Zeitraum-Analyse + Tätigkeiten/Kategorien-Breakdown

Produktregeln (fix, nicht interpretieren)

User-Plan: plan = 'free' | 'pro'

Default bei neuer Registrierung: free

Free: Tabs Tag + Woche, vollständige Historie, freie Navigation über alle Wochen

Pro: Tabs Monat + Auswertung

Wichtig:
Analyse = Pro
Arbeit & Datenerfassung = immer Free

UX- & Gating-Regeln (fix)

Tabs Monat und Auswertung bleiben sichtbar.

Wenn plan !== 'pro', wird statt Inhalt ein Paywall-Screen angezeigt.

Kein kaputter Zwischenzustand, kein Teil-Render.

Deep-Links auf gesperrte Tabs müssen ebenfalls Paywall zeigen.

Tag und Woche dürfen niemals gesperrt werden.

Paywall-Texte (fix)

Titel: „Pro-Funktionen“
Untertitel: „Monatsübersicht und Auswertungen sind in Pro enthalten.“

Bullets:

„Monat: Überblick über Wochen und Summen“

„Auswertung: Zeiträume vergleichen und Schwerpunkte erkennen“

„Tätigkeiten: Verteilung nach Kategorien über längere Zeit“

Preis: „10 € / Monat — jederzeit kündbar“

Buttons:

Primary: „Pro freischalten“ (Stub / Platzhalter, kein Stripe)

Secondary: „Weiter mit Free“ (führt zurück zu Tag oder Woche)

Optional:

„Tag- und Wochenansicht bleiben kostenlos verfügbar.“

Datenmodell / Quelle der Wahrheit

Implementiere serverseitig in Supabase:

bevorzugt: profiles.plan text not null default 'free'

Client darf nicht die Quelle der Wahrheit sein.

⚠️ Explizite Prüfaufträge (keine Annahmen)

Bevor du implementierst, prüfe bitte:

Wo im bestehenden Code wird das User-Profil geladen?
– Existiert bereits ein zentraler Store/Loader für profiles?
– Falls ja: dort integrieren. Falls nein: sauber nach Projektstandard einführen.

Wie ist die Tab-Navigation technisch umgesetzt?
– Routing-basiert oder Component-State?
– Entsprechend korrektes Gating + Deep-Link-Verhalten implementieren.

Wie werden UI-Texte aktuell gehandhabt?
– Zentrale String-/i18n-Struktur nutzen, falls vorhanden.
– Keine neuen Patterns einführen.

Diese Punkte bitte im Plan/Spec dokumentieren, bevor Code entsteht.

Akzeptanzkriterien (Tests)

Free-User:

Tag & Woche voll nutzbar, inkl. Historie & Navigation

Monat/Auswertung zeigen Paywall

Pro-User:

Sieht alle Tabs normal

Deep-Link auf Monat/Auswertung:

Paywall für Free

Entsprechende Tests ergänzen (gemäß bestehender Teststruktur)

Spec-Driven Output (Workflow-konform)

Aktualisierte Specs / Plans / Tasks / Implementation Progress

Klare Task-Aufteilung (DB, Store, UI, Routing, Tests)

Danach Implementierung + Tests

Dev-Hinweis

Bitte liefere eine kurze Anleitung, wie ein User manuell auf Pro gesetzt wird (Supabase SQL), z. B.:

update profiles set plan='pro' where id='<uuid>';

Lieferung: PR-artige Zusammenfassung + Hinweise zum lokalen Testen (Free vs. Pro).
