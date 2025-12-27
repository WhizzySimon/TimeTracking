# ui-improvements — Spec

**Phase:** A5  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- None (standalone improvements)

**Does not depend on:**

- Multi-Arbeitgeber (A2)
- UX improvements (A4)

---

## 1) Goal / Problem

Ensure all UI text is in German and add more color scheme options. Currently some error messages (login) are in English, and users want more color choices beyond blue/orange.

---

## 2) Scope

### In scope

- Audit all UI text for German translation
- Translate login error messages to German
- Add 3 new color schemes: Green, Purple, Neutral/Gray
- Research color theory for harmonious schemes
- Color scheme picker in Settings

### Out of scope

- Custom color picker (user picks individual colors)
- Dark mode (separate feature)
- Font size/accessibility settings
- Per-employer color themes

### What we don't want

- Machine-translated text — use natural German
- Clashing color combinations — use design principles
- Too many schemes — keep to 5 total (Cool, Warm, Green, Purple, Neutral)

---

## 3) Functional Requirements (FR)

### German Translation

- **UI-FR-001**: All static UI text is in German
- **UI-FR-002**: Login error messages translated (invalid credentials, network error, etc.)
- **UI-FR-003**: Form validation messages in German
- **UI-FR-004**: Button labels, headings, placeholders all German
- **UI-FR-005**: No English fallback text visible to users

### Color Schemes

- **UI-FR-010**: Settings shows 5 color scheme options
- **UI-FR-011**: Schemes: Cool (blue), Warm (orange), Green, Purple, Neutral (gray)
- **UI-FR-012**: Each scheme defines: primary, secondary, accent, background, text colors
- **UI-FR-013**: Scheme applies to: buttons, headers, active states, links
- **UI-FR-014**: Selected scheme persists in localStorage
- **UI-FR-015**: Scheme syncs to cloud for Pro users

### Color Scheme Design

- **UI-FR-020**: Each scheme uses analogous or complementary color theory
- **UI-FR-021**: All schemes maintain WCAG AA contrast ratios
- **UI-FR-022**: Light variants derived algorithmically from base color
- **UI-FR-023**: Dark variants derived algorithmically from base color

---

## 4) Implementation Guarantees (IG)

- **UI-IG-001**: Translation audit covers all .svelte files
- **UI-IG-002**: Color schemes use CSS custom properties for easy theming
- **UI-IG-003**: Scheme change applies without page reload
- **UI-IG-004**: Contrast ratio >= 4.5:1 for all text

---

## 5) Design Decisions (DD)

- **UI-DD-001**: Color scheme defined as single base hue, variants calculated
- **UI-DD-002**: Use HSL color space for predictable lightness adjustments
- **UI-DD-003**: Neutral scheme uses desaturated blue-gray (not pure gray)
- **UI-DD-004**: Green scheme: #22c55e base (Tailwind green-500)
- **UI-DD-005**: Purple scheme: #a855f7 base (Tailwind purple-500)
- **UI-DD-006**: Neutral scheme: #64748b base (Tailwind slate-500)

---

## 6) Edge cases

- User switches scheme mid-session: Apply immediately
- Pro user on new device: Fetch scheme from cloud on login
- Scheme not in sync: Local preference wins until sync completes
- Future schemes: System supports adding more via config

---

## 7) Data & privacy

- **Stored:** Selected scheme name in localStorage and userProfile
- **Where:** Local + Supabase (Pro)
- **Retention:** Indefinite
- **Export:** Included in JSON export as preference

---

## 8) Acceptance checks (testable)

- [ ] AC-001: Login error "Invalid credentials" shows German text
- [ ] AC-002: All Settings page text is German
- [ ] AC-003: All form validation messages are German
- [ ] AC-004: Settings shows 5 color scheme options
- [ ] AC-005: Selecting Green scheme changes UI colors
- [ ] AC-006: Selecting Purple scheme changes UI colors
- [ ] AC-007: Selecting Neutral scheme changes UI colors
- [ ] AC-008: Scheme persists after page reload
- [ ] AC-009: All color combinations pass contrast check
- [ ] AC-010: No English text visible in normal user flows

---

## 9) Change log

**[2025-12-27 14:00]**

- Added: Initial spec created

---

## 10) Spec Completeness Checklist

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (UI-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (UI-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx)
- [x] No ambiguous terms without measurable definitions
