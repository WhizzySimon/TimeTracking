# Box: UI/UX

**Risk Class:** low (styling) | medium (layout/interaction) | high (navigation/flow)

---

## When to Use

- Visual styling changes (colors, fonts, spacing)
- Layout adjustments
- Interaction patterns (hover, click, animations)
- Responsive design fixes
- Accessibility improvements
- Component visual polish

---

## Acceptance Criteria Format

All acceptance criteria for UI/UX MUST:

- Be visually verifiable (screenshot or description)
- Specify viewport sizes to test (desktop, mobile)
- Include interaction states (hover, focus, active, disabled)
- Note accessibility requirements (contrast, focus indicators)

**Example:**
```
AC-001: Button uses primary color (#3B82F6) with white text
AC-002: Hover state darkens by 10%
AC-003: Focus ring is 2px solid with offset
AC-004: Works on 375px mobile viewport
AC-005: Contrast ratio meets WCAG AA (4.5:1)
```

---

## Required Verification Commands

| Command | Required | Notes |
|---------|----------|-------|
| `npm run verify` | ✅ Yes | Format + TypeScript + Lint |
| `npm run test:unit` | ❌ No | UI rarely needs unit tests |
| `npm run test:e2e` | ⚠️ If flow | Only if user flow affected |
| Browser test (MCP) | ✅ Yes | Visual verification required |

---

## Evidence Bundle Requirements

- [ ] Box type: `ui-ux`
- [ ] Anomaly check passed (`npm run ai:detect-anomalies` shows 0 critical)
- [ ] Visual change description
- [ ] Screenshot (before/after if applicable)
- [ ] Viewport sizes tested (list each)
- [ ] `npm run verify` output
- [ ] Browser snapshot (MCP)
- [ ] Accessibility check (if applicable)

---

## High-Risk Escalation

If risk class is **high** (navigation/flow changes):

- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Verify PWA behavior (installed app)
- [ ] Check keyboard navigation
- [ ] Verify screen reader compatibility

---

## Common Failure Patterns

| Pattern | Prevention |
|---------|------------|
| Only testing desktop | Always test 375px viewport |
| Forgetting dark mode | Test both light and dark themes |
| Breaking touch targets | Minimum 44x44px for mobile |
| Ignoring focus states | Test keyboard navigation |
| Color contrast issues | Use contrast checker tool |

---

## UI/UX Discipline

1. **Mobile first:** Design and test for 375px first
2. **States matter:** Check all states (default, hover, focus, active, disabled)
3. **Accessibility:** Contrast, focus rings, semantic HTML
4. **Screenshot evidence:** Always capture visual proof
5. **Cross-browser:** Test Safari (WebKit) not just Chrome

---

## Viewport Checklist

| Viewport | Width | Test |
|----------|-------|------|
| Mobile | 375px | ✅ Required |
| Tablet | 768px | ⚠️ If layout changes |
| Desktop | 1280px | ✅ Required |
| Large | 1920px | ⚠️ Optional |
