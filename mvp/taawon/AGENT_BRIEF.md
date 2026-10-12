# Taawon — Brief for the agents building the interfaces

Project: `c:\Users\ahmad\OneDrive\Desktop\mvp\taawon` — Next.js **16.4** (App Router, Turbopack, React 19.3), TypeScript, Tailwind v4, Drizzle ORM (libSQL/SQLite file `local.db`), Gemini. The UI is **Arabic first (RTL)** and must also support English. The investor demo is on Saturday, so polish and reliability matter more than anything else.

## Next.js 16 rules (IMPORTANT)
- `cookies()`, `headers()`, `params` and `searchParams` are **async** (`const { id } = await params`). Type page props as `PageProps<'/admin/children/[id]'>`.
- No `middleware.ts`. Do auth inside layouts and pages with `requireUser(...)`.
- `cacheComponents` is OFF, so every page renders dynamically.
- Server Actions: put `"use server"` at the top of an `actions.ts` file. After a mutation, call `revalidatePath(...)`.
- If you are unsure about an API, read the docs in `node_modules/next/dist/docs/`.

## What already exists (reuse it, DON'T rewrite it)
- `src/db/schema.ts`: every table and type (users, children, assignments, questions, questionnaireResponses, initialReports, clinicalReports, plans (content = PlanContent JSON), planTasks, submissions, sessions, notifications, chatMessages). `src/db/index.ts` exports `db` and `schema` (use the `db.query.*` relational API or the query builder).
- `src/lib/auth.ts`: `requireUser(...roles)` returns the User (or redirects), plus `getCurrentUser()`.
- `src/i18n/server.ts`: `const { t, locale, dir } = await getT()`. In client components: `import { useT } from "@/i18n/client"`. Strings live in `src/i18n/messages/*.ts` (`common.ts` holds the shared ones: nav.*, action.*, common.*, role.*, specialty.*, domain.*, status.*, plan.status.*, report.*, plan.*, ai.*).
- `src/components/ui.tsx`: Button, LinkButton, buttonClass, Card, CardHeader, Badge, AiBadge, Input, Textarea, Select, Label, Field, Avatar, ProgressBar, ProgressRing, PageHeader, StatCard, EmptyState, Prose, cn.
- `src/components/submit-button.tsx`: `SubmitButton` (shows pending state; use it inside `<form action={serverAction}>`).
- `src/components/child/plan-view.tsx`: `PlanView({content,t,currentWeek})`, `InitialReportCard({content,t,title,aiLabel})`, `DomainBadge`.
- `src/components/child/charts.tsx` (client): `ProgressTrendChart({data})`, `SkillsRadar({data})`, `DOMAIN_COLORS`.
- `src/components/child/ai-summary.tsx`: `<AiSummaryButton childId=... />` (admin/specialist).
- `src/components/shell/app-shell.tsx`: `AppShell` (the role layouts already use it), `LanguageToggle`. The nav links live in `src/components/shell/nav.tsx` (the routes are listed there).
- `src/lib/progress.ts`: `computeProgress(childId)` returns `{plan, currentWeek, overall, compliance, byDomain[{domain,value,rating,completion}], weekly[], pendingReviews}`, plus `getActivePlan`, `DOMAINS`.
- `src/lib/workflow.ts`: `submitQuestionnaire(childId, answers)`, `onClinicalReportSaved(childId)`, `createPlanVersion(childId, opts)`, `approvePlan(planId)`, `revisePlanWithAI(planId, notes)`, `returnPlanToSpecialists(planId, notes)`, `resubmitPlan(planId, content)`.
- `src/lib/ai/agent.ts`: `generateChildSummary`, `assistClinicalReport(childId, draft, specialtyLabel, locale)`, `chatWithParent(childId, userId, message, locale)`, `generateProgressInsight(child, locale)`, `isAiEnabled()`. Every call already anonymizes personal data and falls back to demo output.
- `src/lib/notify.ts`: `notify`, `notifyAdmins`, `notifyChildSpecialists`.
- `src/lib/utils.ts`: `ageYears`, `dateKey`, `planWeek`, `formatDate`, `formatDateTime`, `addDays`.
- `src/lib/upload-client.ts`: `uploadVideo(file, onProgress)` (client) returns the video URL. The API route is `src/app/api/upload/route.ts`.
- Seeded demo data (password `Taawon@2026`): admin@taawon.app; speech@, behavior@, specialed@ (specialists); parent@taawon.app (Khaled: Sara active week 6, Yousef in assessment); mona@ (Omar: plan pending admin approval); abdullah@ (Leen: new, Rayan: active week 9).

## Design language
Medical and clean, in the style of Apple: white cards (`Card`), primary color `brand-600` (#1565d8), accent `care-500` (teal), surfaces `bg-surface`, borders `border-line`, text `text-ink` / `text-muted`, `rounded-2xl`, soft shadows (`shadow-card`, `shadow-pop`), `animate-fade-up`, and lucide-react icons. **Mobile first**: everything must look great at 375px wide. In RTL, use logical properties (`ms-`, `me-`, `ps-`, `start-`, `end-`) and never `ml-` or `mr-`. Add the class `rtl-flip` to directional arrows.

## Rules
- Write ONLY inside the files and folders you own (listed in your task). Do not edit shared files. If you really need a change to a shared file, describe it in your final report.
- Add your strings to YOUR messages file only (keys prefixed with your area), and provide BOTH `ar` and `en`. Arabic must be natural and professional.
- Do NOT run `npm run db:seed` / `db:push`, do NOT start `next dev` or `next build`, and do NOT install packages. To verify, run `npx tsc --noEmit` in the project folder; it must pass with zero errors in your files (other agents are working at the same time, so ignore errors that are in their files).
- When you finish, reply with: the files you created, any change you need in a shared file, and any known limitations.
