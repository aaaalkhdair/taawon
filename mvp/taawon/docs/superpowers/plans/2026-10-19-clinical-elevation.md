# Clinical Elevation & UI/UX Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate and rebuild the Taawon (تعاون) platform into a bespoke, clinical-grade rehabilitation platform conforming strictly to the 5 designated skills: `frontend-design`, `ui-ux-pro-max`, `writing-plans`, `canvas-design`, and `test-driven-development`.

**Architecture:** Next.js 16 (App Router) + TypeScript with a decoupled clinical domain model (anonymization layer, scoring engine, 12-week plan synthesizer), Drizzle ORM over libSQL, and a custom design-token system eliminating generic AI tropes in favor of medical pediatric ergonomics.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Drizzle ORM, @libsql/client, @google/genai, Node.js native test runner via tsx.

**Spec:** Clinical Special Education and Home Rehabilitation Specification (Taawon Architecture Blueprint).

---

## Global Constraints

- **Accessibility (WCAG AA):** Every interactive element must provide a minimum 44×44px touch target, visible focus rings, and a text contrast ratio of at least 4.5:1.
- **Visual Design Identity:** Zero generic AI tropes: no random terracotta gradients, no decorative numbered badges that aren't sequences, no all-caps eyebrows, and no generic SaaS cards.
- **Privacy & Safety:** Absolute zero PII leakage to LLMs; all patient names and phone numbers are tokenized before API calls.
- **Test-Driven Rigor:** Core mathematical models (progress scoring, PII redaction, workflow states) must have passing automated unit tests before production deployment.
- **Authentic Localization:** Strict authentic Jordanian clinical naming and Arabic RTL first-class typography.

---

## Review Focus

1. **PII Leakage in AI prompts:** Patient names or identifiers slipping into external LLM calls if regex or tokenization fails.
2. **Accessibility touch target degradation:** Icon-only buttons or mobile menu items under 44px on smaller mobile screens.
3. **Scoring boundary overflow:** Specialist clinical rating (70%) + home compliance (30%) exceeding 100% or dropping below 0% under edge-case inputs.
4. **Contrast failure on light badges/surfaces:** Muted gray-on-gray or pastels falling below the 4.5:1 WCAG AA contrast threshold.
5. **Session and role leakage:** Unauthenticated parents accessing director approval actions or specialist review queues.

---

## Implementation Tasks

### Task 1: Test-Driven Core Logic (TDD Suite)

**Files:**
- Create: `tests/anonymize.test.ts`
- Create: `tests/progress.test.ts`
- Create: `tests/workflow.test.ts`
- Modify: `src/lib/ai/anonymize.ts`
- Modify: `src/lib/progress.ts`

- [ ] Write failing test for PII anonymizer and de-anonymizer (`tests/anonymize.test.ts`).
- [ ] Run test and verify RED state.
- [ ] Implement/refine `src/lib/ai/anonymize.ts` to pass all test cases (names, emails, phone numbers, Jordanian civil numbers).
- [ ] Write failing test for 70/30 clinical progress score algorithm (`tests/progress.test.ts`).
- [ ] Run test and verify RED state.
- [ ] Implement/refine `src/lib/progress.ts` to ensure mathematically bounded score calculation (0-100%).
- [ ] Run test suite with `npm test` and verify GREEN state across all unit tests.

### Task 2: Clinical Design System & UI/UX Elevation (`ui-ux-pro-max` & `frontend-design`)

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/ui.tsx`
- Modify: `src/components/logo.tsx`
- Modify: `src/components/shell/app-shell.tsx`

- [ ] Define medical semantic color tokens in `globals.css` (Clinical Indigo `#133E87`, Deep Slate `#0F172A`, Restful Mint `#0D9488`, Warning Amber `#D97706`).
- [ ] Refactor button, input, badge, and card primitives in `src/components/ui.tsx` to strictly enforce:
  - Minimum 44×44px interactive touch target.
  - 4.5:1 WCAG AA contrast ratio.
  - Active-state tactile feedback and accessible focus rings.
- [ ] Upgrade the Taawon Logo primitive (`src/components/logo.tsx`) with a clinical emblem.
- [ ] Verify accessibility across shell navigation with visible active indicators.

### Task 3: Redesign Landing Page (Bespoke Pediatric Clinical Identity)

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/i18n/messages/landing.ts`

- [ ] Remove all generic AI tropes (decorative fake pills, random gradient splashes).
- [ ] Re-anchor hero section around real clinical pediatric care: Director, Speech Pathologist, Behavior Analyst, and Parent.
- [ ] Implement real interactive clinical pathway breakdown (Intake -> Assessment -> AI Synthesis -> Human Director Approval -> Home Implementation).
- [ ] Ensure all CTAs use active-voice Arabic verbs ("ابدأ استبيان طفلك", "دخول المنظومة السريرية").
- [ ] Verify mobile layout responsiveness (320px to 1440px) without horizontal scrolling.

### Task 4: Polish Clinical Portals (Director, Specialist, Parent)

**Files:**
- Modify: `src/app/director/page.tsx`
- Modify: `src/app/specialist/page.tsx`
- Modify: `src/app/parent/page.tsx`
- Modify: `src/components/parent/task-card.tsx`
- Modify: `src/components/parent/chat-box.tsx`

- [ ] Elevate Director Dashboard: clear approval badges, macro center analytics, human-in-the-loop plan signing.
- [ ] Elevate Specialist Dashboard: high-contrast video review queue, 1-5 star clinical scoring, developmental milestone check-offs.
- [ ] Elevate Parent Dashboard: daily task cards with step-by-step illustrations, timer, and 24/7 AI pediatric assistant.

### Task 5: Verification, Typecheck, and Deployment Build

- [ ] Run `npm run typecheck` to confirm zero TypeScript compilation errors.
- [ ] Run `npm test` to verify all automated test suites pass.
- [ ] Run `npm run build` to confirm production build cleanliness.
- [ ] Commit with clean git history and push to GitHub.
