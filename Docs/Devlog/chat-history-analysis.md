# Chat History Analysis → Devlog Extractor (Retro)

Ziel: Diesen kompletten Chat in ein standardisiertes Devlog-Artefakt extrahieren, das später auditierbar und analysierbar ist.

## NON-NEGOTIABLE

- KEINE Implementierung. KEINE Refactors. KEINE Tests ausführen. KEINE Commands (auch nicht via Watcher).
- KEINE Annahmen. Wenn etwas nicht eindeutig im Chat steht: `UNKNOWN`.
- Du darfst Repo-Dateien lesen, aber musst strikt unterscheiden:
  - **“aus Chat”** vs. **“repo-verified (static)”**
- “repo-verified” bedeutet nur statische Fakten ohne Ausführung (z.B. Eintrag existiert/fehlt). Keine Formulierungen wie “needs/should/must”.

---

## STEP 1 — Doc Inventory (kurz)

Lies diese Dateien:

- `Docs/INDEX.md`
- `AGENTS.md`
- `Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md`

Gib am Anfang deiner Antwort eine Sektion **Doc Inventory** aus (nur Pfade, je Zeile).

---

## STEP 2 — Devlog-Verzeichnis sicherstellen

Stelle sicher, dass existiert:

- `Docs/Devlog/`
- `Docs/Devlog/INDEX.md`

Wenn `Docs/Devlog/INDEX.md` nur die Header-Zeile hat:
`Date/Time | Title | Path | Status | Tags`
dann füge direkt darunter die Markdown-Separator-Zeile hinzu:
`--- | --- | --- | --- | ---`

---

## STEP 3 — Related Docs finden (nur lesen)

Versuche, diesen Chat bestehenden Artefakten zuzuordnen (nur lesen, nichts ändern):

- Suche in `Docs/Specs/`, `Docs/Plans/`, `Docs/Tasks/` nach passenden Dateien (z.B. Pxx-YYYYMMDD-... oder thematisch passend).
- Wenn nichts passt: `Related Docs = NONE`.

Wenn im Chat konkrete Doc-Dateien erwähnt werden (z.B. `SVELTEKIT_PWA_ADDENDUM.md`), müssen sie als Pfade unter **Other referenced docs** aufgeführt werden.

---

## STEP 4 — Devlog-Datei erzeugen

Erzeuge eine neue Datei in:

- `Docs/Devlog/`

**Dateiname (immer):**
`DL-<YYYYMMDD>-<HHMM>__<slug>.md`

Regeln:

- `<YYYYMMDD>-<HHMM>` = Zeitpunkt der Generierung (jetzt, lokale Zeit).
- `<slug>` = kurz, kebab-case, z.B. `pwa-update-button` oder `icon-cache-fix`.

### Inhalt der Devlog-Datei (GENAU dieses Format)

(Alles was nicht eindeutig ist: `UNKNOWN`)

# <Title>

**Chat Date/Time:** <ISO oder UNKNOWN>
**Generated At:** <ISO now>
**Chat topic:** <1 Satz>
**Workflow used:** </new-feature | /continue-work | /new-task | UNKNOWN>

**Related Docs:**

- Spec: <path oder NONE>
- Plan: <path oder NONE>
- Tasks: <path oder NONE>
- Progress: Docs/IMPLEMENTATION_PROGRESS.md (Phase/Abschnitt, falls zuordenbar, sonst NONE)
- Other referenced docs: <path(s) or NONE>

## Decisions (aus Chat)

- D1: <Decision> — Reason: <1 Satz> — Evidence: <kurzes Chat-Zitat oder sehr konkrete Chat-Stelle>
- D2: ...
- D3: ...

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)

- <Doc> — <was geändert/neu> — Evidence: <Chat>

### Code Delta (nur aus Chat)

- <file> — <kurz> — Evidence: <Chat>

### Repo-Verified Delta (optional, getrennt!)

Nur wenn du im aktuellen Repo ohne Ausführung eindeutig belegen kannst:

- <file/doc> — <statischer Fakt (existiert/fehlt/steht so drin)> — Evidence: <Repo-Datei/Abschnitt>

## Verification (strict)

Rule: "Verified now in repo" darf nur statische Fakten nennen (z.B. Eintrag existiert/fehlt). Keine Formulierungen wie "needs", "should", "must".

Rule: Alles, was aus Terminal-/Script-Output stammt, zählt als "Claimed in chat" (auch wenn es plausibel ist). "Verified now in repo" nur, wenn du die Datei im Repo direkt lesen kannst (existiert/enthält/fehlt).

- Claimed in chat:
  - <checks/tests> — Result: PASS/FAIL/UNKNOWN — Evidence: <Chat>
- Verified now in repo (static only):
  - <Fakt> — Evidence: <Repo>

## Bugs / Issues mentioned

- B1: <Bug> — Cause: <nur wenn belegt, sonst UNKNOWN> — Fix: <nur wenn belegt, sonst UNKNOWN> — Status: OPEN/DONE/UNKNOWN — Evidence: <Chat>

## Follow-ups

- F1: <konkret> — Owner: User/Cascade — Priority: High/Med/Low
- F2: ...
- F3: ...

## Tags

Regeln:

- **3–7 Tags pro Eintrag** — nicht weniger, nicht mehr
- **Tags MÜSSEN aus `Docs/Devlog/TAGS.md` stammen** — wenn keiner passt, verwende `misc`
- **Format:** Komma-getrennt, KEINE Klammern (z.B. `ui, ux, bugfix`)
- **Schreibweise:** immer lowercase

Beispiel:

```
tags: ui, ux, bugfix, settings, playwright
```

## Confidence

- High / Medium / Low (basierend darauf, wie viel im Chat wirklich eindeutig war)

---

## STEP 5 — INDEX aktualisieren

Füge in `Docs/Devlog/INDEX.md` eine neue Zeile hinzu:

`<Chat Date/Time oder UNKNOWN> | <Title> | Docs/Devlog/<filename> | <DONE/OPEN/PARTIAL> | <tag1>, <tag2>, <tag3>`

**WICHTIG:** Tags OHNE Klammern, komma-getrennt. Siehe `Docs/Devlog/TAGS.md` für erlaubte Tags.

Status-Regel:

- DONE = abgeschlossen & verifiziert (im Chat belegt)
- PARTIAL = teils umgesetzt / unklar
- OPEN = Follow-ups offen

---

## STEP 6 — Antworte am Ende NUR mit

- Created: <Devlog path>
- Updated: Docs/Devlog/INDEX.md
- Top Decisions: D1–D3
- Top Follow-ups: F1–F3
