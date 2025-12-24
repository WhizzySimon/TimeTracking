# Karsten Meeting Insights (Transcript-derived)
**Source:** `Spec driven dev karsten meeting 18-12-2025_16k.wav.txt`  
**Purpose:** Extract *process* practices that may not be visible in repo structure, mapped to our 10-axis rubric.

## Axes (use exactly these names)
Spec quality · Scope control · Traceability · Code quality rules · Testing strategy · Tooling & automation · Context bootstrapping · Iteration loop · Operational safety · Cost/time efficiency

---

## 1) Practices (max 15)

1) **Self-documenting endpoints as a first-class requirement**  
   - Evidence (short quote): “... komplett selbst dokumentieren ...”  
   - Why it matters: reduces reliance on “memory” across chats; both humans and agents can re-derive behavior from the system itself.  
   - Axis: Context bootstrapping

2) **Design endpoints to serve both developers *and* the agent**  
   - Evidence (short quote): “... nicht nur ... programmierer ... sondern ... für die ki ...”  
   - Why it matters: makes the API/spec a durable knowledge store; lowers prompt length and prevents hallucinations.  
   - Axis: Cost/time efficiency

3) **Browser-first exploration: avoid requiring extra tools for basic interactions**  
   - Evidence (paraphrase): he prefers GET-accessible exploration because a browser can’t easily do PUT/DELETE, and he doesn’t want to rely on extra tools like Postman for routine work.  
   - Why it matters: speeds up feedback loops and reduces friction.  
   - Axis: Cost/time efficiency

4) **Versioned routers / API structure (v1 vs v2)**  
   - Evidence (paraphrase): he organizes routers by version to keep breaking changes controlled.  
   - Why it matters: cleaner migrations; less accidental scope creep.  
   - Axis: Scope control

5) **Mini-DSL / compact notation to specify repetitive endpoint families**  
   - Evidence (short quote): “... kleine mini sprache erfunden ...”  
   - Why it matters: reduces spec-writing time and avoids copy/paste drift.  
   - Axis: Spec quality

6) **Model benchmarking with a “gold standard” question set**  
   - Evidence (short quote): “... zehn fragen ... ein goldstand ... jedes modell ... testen ...”  
   - Why it matters: removes vibes; picks models based on ability to answer your domain questions consistently.  
   - Axis: Tooling & automation

7) **Rule-compliance checks as a normal step (agent reviews its own output against rules)**  
   - Evidence (paraphrase): he runs “check against the rules/spec” loops to find conformance issues.  
   - Why it matters: catches issues early without manual diff-reading.  
   - Axis: Iteration loop

8) **Concrete code-quality rule enforcement: no local imports inside functions**  
   - Evidence (short quote): “no local imports in functions ... Fehler gefunden ...”  
   - Why it matters: improves readability and avoids hidden dependencies.  
   - Axis: Code quality rules

9) **Formatting for scan-speed: reduce vertical scrolling**  
   - Evidence (paraphrase): he prefers compact formatting (e.g., imports grouped/condensed) to reduce scroll cost during review.  
   - Why it matters: review speed matters more than theoretical “purity” when iterating with agents.  
   - Axis: Code quality rules

10) **Make the system explain itself because agents “start from zero” each chat**  
   - Evidence (paraphrase): he explicitly compensates for session amnesia by making docs and endpoints self-explanatory.  
   - Why it matters: stabilizes long projects with many chats.  
   - Axis: Context bootstrapping

---

## 2) Anti-patterns / failure modes (max 10)

1) **Relying on chat memory instead of self-documenting artifacts**  
   - Axis: Context bootstrapping

2) **Depending on extra tools for basic verification/exploration (adds friction + cost)**  
   - Axis: Cost/time efficiency

3) **Assuming “rules will be followed” without an enforcement step**  
   - Axis: Tooling & automation

---

## 3) Adoptable rules for TimeTracker (max 10, smallest-change-first)

1) **Add “Gold Standard” model-eval questions to the repo**  
   - Target: `Docs/SDD/model-benchmarks.md` (new)  
   - Change: store 10–20 canonical questions + expected answer outlines for your domain (TimeTracker).  
   - Axis: Tooling & automation

2) **Add a “Self-documenting” principle to SDD guidelines (system must explain itself)**  
   - Target: `Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md`  
   - Change: 1 short bullet: “Prefer artifacts that re-teach context without chat history (docs, templates, checklists, examples).”  
   - Axis: Context bootstrapping

3) **Add a mandatory “Check against rules” step before implementation** (you already enforce gates; add “rules conformance” explicitly)  
   - Target: `.windsurf/workflows/new-feature.md`  
   - Change: 1 line: “Before Task 1: run an explicit rules conformance review.”  
   - Axis: Tooling & automation

4) **Move from “code-quality-rules.md is short” to “examples-based rules”**  
   - Target: `.windsurf/rules/code-quality-rules.md`  
   - Change: add BAD/GOOD blocks for the top 10 issues you see most.  
   - Axis: Code quality rules

5) **Add optional “compact formatting for review speed” guidance**  
   - Target: `.windsurf/rules/code-quality-rules.md`  
   - Change: 2 bullets: minimize scroll; keep related config/typing blocks tight when readable.  
   - Axis: Code quality rules

---

## Notes
- This file captures **process insights** from the meeting that may not be explicit in Karsten’s repo docs.
- Use it as an appendix input to `SDD-COMPARISON__TimeTracker-vs-Karsten.md`.
