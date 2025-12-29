---
description: Read the authoritative docs + relevant code before doing anything
auto_execution_mode: 3
---

Make sure you have no duplicates in your read list.

Step A (docs):
Read:

- Docs/AppDocs/DevFramework/ToolSetup
  Framework/DeveloperGuidesAndStandards
  /UI_LOGIC_SPEC_V1.md
- Docs/AppDocs/DevFramework/ToolSetup
  Framework/DeveloperGuidesAndStandards
  /TECHNICAL_GUIDELINE_V1.md
- Docs/AppDocs/DevFramework/ToolSetup
  Framework/DeveloperGuidesAndStandards
  /SVELTEKIT_PWA_ADDENDUM.md
- Docs/DevFramework/ToolSetup
  Framework/DeveloperGuidesAndStandards/DEVELOPMENT_GUIDELINES.md
- Docs/DevFramework/ToolSetup
  Framework/DeveloperGuidesAndStandards/IMPLEMENTATION_SPECIFICATION_RULES.md

Step B (code):
Read all:

- src/\*_/_.ts
- src/\*_/_.js
- src/\*_/_.svelte
- src/\*_/_.css
- src/\*_/_.html

Read:

- package.json
- svelte.config.\*
- vite.config.\*
- playwright.config.\*
- .npmrc (if exists)
- pnpm-lock.yaml (if exists)
- package-lock.json (if exists)

Read all:

- e2e/\*_/_.ts
- e2e/\*_/_.js
- e2e/\*_/_.spec.ts
- e2e/\*_/_.spec.js

Read:

- static/sw.js
- static/manifest.webmanifest
- static/robots.txt

Do NOT read node_modules or build outputs.

Return only a single line:
"Read core docs + [x] code files, [z]k context tokens"
