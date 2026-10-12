import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Child, InitialReportContent, PlanContent } from "@/db/schema";
import { createAnonymizer, type Identity } from "./anonymize";
import { generateJson, generateText, isAiEnabled, type ChatTurn } from "./gemini";
import { demoAssistReport, demoChatReply, demoInitialReport, demoPlan, demoProgressInsight, demoSummary } from "./demo";
import { ageYears, planWeek } from "../utils";
import { computeProgress } from "../progress";
import { dictionaries, type Locale } from "@/i18n/config";

/* ─────────── Context & privacy ─────────── */

const CHILD = "[الطفل]";

async function loadChildContext(childId: string) {
  const child = await db.query.children.findFirst({ where: eq(schema.children.id, childId) });
  if (!child) throw new Error("Child not found");
  const parent = await db.query.users.findFirst({ where: eq(schema.users.id, child.parentId) });
  const assigns = await db.query.assignments.findMany({ where: eq(schema.assignments.childId, childId) });
  const specialists = assigns.length
    ? await db.query.users.findMany({ where: (u, { inArray }) => inArray(u.id, assigns.map((a) => a.specialistId)) })
    : [];
  const identities: Identity[] = [
    { value: child.name, token: CHILD },
    ...(parent ? [{ value: parent.name, token: "[ولي_الأمر]" }] : []),
    ...specialists.map((s, i) => ({ value: s.name, token: `[أخصائي_${i + 1}]` })),
  ];
  return { child, parent, specialists, anon: createAnonymizer(identities), age: ageYears(child.birthDate) };
}

const langLine = (locale: Locale) =>
  locale === "en" ? "Respond in clear, simple English." : "أجب باللغة العربية الفصحى المبسّطة.";

const BASE_SYSTEM = `أنت "مساعد تعاون"، خبير سريري في التربية الخاصة والتخاطب وتعديل السلوك للأطفال، تعمل داخل منصّة مركز تأهيل.
- البيانات التي تصلك مُجهّلة: الرمز ${CHILD} يشير إلى الطفل، ولا تحاول استنتاج هويته.
- استخدم الرمز ${CHILD} عند الإشارة للطفل في مخرجاتك.
- لا تقدّم تشخيصاً طبياً نهائياً؛ قدّم ملاحظات وتوصيات مهنية فقط.
- كن دقيقاً، داعماً، وعملياً.`;

/* ─────────── 1. Initial report from parent questionnaire (auto-saved) ─────────── */

const initialReportSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    challenges: { type: "array", items: { type: "string" } },
    behaviors: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "strengths", "challenges", "behaviors", "recommendations"],
};

export async function generateInitialReport(childId: string) {
  const { child, anon, age } = await loadChildContext(childId);
  const response = await db.query.questionnaireResponses.findFirst({
    where: eq(schema.questionnaireResponses.childId, childId),
    orderBy: desc(schema.questionnaireResponses.createdAt),
  });
  const qs = await db.query.questions.findMany({ orderBy: asc(schema.questions.order) });
  const answers: Record<string, string> = response ? JSON.parse(response.answers) : {};
  const qa = qs
    .filter((q) => answers[q.id])
    .map((q) => `س: ${q.textAr}\nج: ${answers[q.id]}`)
    .join("\n\n");

  const ai = await generateJson<InitialReportContent>({
    system: BASE_SYSTEM,
    prompt: anon.mask(
      `هذه إجابات ولي الأمر على الاستبيان التمهيدي لطفل عمره ${age} سنوات (${child.gender === "male" ? "ذكر" : "أنثى"}).
اكتب تقريراً أولياً يتضمن: ملخصاً (summary) من 3–5 جمل، ونقاط القوة، والتحديات، والسلوكيات الملاحظة، والتوصيات للأخصائيين. كل قائمة من 3 إلى 5 عناصر قصيرة.

${qa || "لا توجد إجابات تفصيلية."}`
    ),
    schema: initialReportSchema,
  });

  const firstName = child.name.split(" ")[0];
  const content = ai ? anon.unmaskDeep(ai) : demoInitialReport(firstName, age);
  const [row] = await db
    .insert(schema.initialReports)
    .values({ childId, content, source: ai ? "ai" : "demo" })
    .returning();
  return row;
}

/* ─────────── 2+3. Merge specialist reports → 3-month plan (needs admin approval) ─────────── */

const planSchema = {
  type: "object",
  properties: {
    unifiedInsight: { type: "string" },
    goals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          domain: { type: "string", enum: ["communication", "cognitive", "behavior", "daily_living"] },
          goal: { type: "string" },
        },
        required: ["domain", "goal"],
      },
    },
    phases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          week: { type: "integer" },
          title: { type: "string" },
          focus: { type: "string" },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                howTo: { type: "string" },
                domain: { type: "string", enum: ["communication", "cognitive", "behavior", "daily_living"] },
              },
              required: ["title", "description", "howTo", "domain"],
            },
          },
        },
        required: ["week", "title", "focus", "tasks"],
      },
    },
  },
  required: ["unifiedInsight", "goals", "phases"],
};

function normalizePlan(p: PlanContent): PlanContent {
  const phases = [...(p.phases ?? [])].sort((a, b) => a.week - b.week).slice(0, 12);
  // ensure 12 weeks exist (repeat last phase if the model returned fewer)
  while (phases.length && phases.length < 12) {
    const last = phases[phases.length - 1];
    phases.push({ ...last, week: phases.length + 1 });
  }
  phases.forEach((ph, i) => (ph.week = i + 1));
  return { ...p, phases };
}

export async function generatePlanContent(childId: string, opts?: { adminNotes?: string; previous?: PlanContent }) {
  const { child, anon, age, specialists } = await loadChildContext(childId);
  const initial = await db.query.initialReports.findFirst({
    where: eq(schema.initialReports.childId, childId),
    orderBy: desc(schema.initialReports.createdAt),
  });
  const reports = await db.query.clinicalReports.findMany({ where: eq(schema.clinicalReports.childId, childId) });
  const specById = new Map(specialists.map((s) => [s.id, s]));
  const reportsText = reports
    .map((r) => {
      const s = specById.get(r.specialistId);
      const spec = s?.specialty ? dictionaries.ar[`specialty.${s.specialty}`] : "أخصائي";
      return `— تقرير أخصائي ${spec}:\n${r.content}`;
    })
    .join("\n\n");

  let prompt = `الطفل عمره ${age} سنوات.
التقرير الأولي (من استبيان ولي الأمر):
${initial ? JSON.stringify(initial.content) : "غير متوفر"}

تقارير الفحص السريري من الأخصائيين:
${reportsText || "غير متوفرة"}

المطلوب:
1) unifiedInsight: رؤية تشخيصية موحّدة تدمج التقارير (فقرة من 5–7 جمل).
2) goals: هدف ذكي (SMART) واحد لكل مجال من المجالات: communication, cognitive, behavior, daily_living.
3) phases: خطة علاجية لمدة 12 أسبوعاً (12 عنصراً، week من 1 إلى 12). لكل أسبوع عنوان وتركيز، و3 مهام منزلية يومية قصيرة (10–15 دقيقة) مبسطة لولي الأمر، لكل مهمة: title قصير، description جملة، howTo خطوات تطبيق عملية، domain.
تدرّج في الصعوبة عبر الأسابيع.`;

  if (opts?.previous && opts.adminNotes) {
    prompt += `\n\nهذه نسخة سابقة من الخطة رفضها المدير:\n${JSON.stringify(opts.previous)}\n\nملاحظات المدير التي يجب تطبيقها بدقة:\n«${opts.adminNotes}»\nعدّل الخطة وفق الملاحظات مع الحفاظ على البنية.`;
  }

  const ai = await generateJson<PlanContent>({ system: BASE_SYSTEM, prompt: anon.mask(prompt), schema: planSchema, temperature: 0.5 });
  const firstName = child.name.split(" ")[0];
  if (ai && ai.phases?.length) return { content: normalizePlan(anon.unmaskDeep(ai)), source: "ai" as const };
  return { content: demoPlan(firstName, { adminNotes: opts?.adminNotes }), source: "demo" as const };
}

/* ─────────── Executive summary (admin / specialist, on demand) ─────────── */

export async function generateChildSummary(childId: string, locale: Locale) {
  const { child, anon, age } = await loadChildContext(childId);
  const progress = await computeProgress(childId);
  const initial = await db.query.initialReports.findFirst({
    where: eq(schema.initialReports.childId, childId),
    orderBy: desc(schema.initialReports.createdAt),
  });
  const reports = await db.query.clinicalReports.findMany({ where: eq(schema.clinicalReports.childId, childId) });
  const firstName = child.name.split(" ")[0];

  const text = await generateText({
    system: `${BASE_SYSTEM}\n${langLine(locale)}`,
    prompt: anon.mask(`اكتب ملخصاً تنفيذياً (Executive Summary) سريعاً لا يتجاوز 6 نقاط قصيرة عن حالة طفل عمره ${age} سنوات، لاستخدامه قبل الجلسة العلاجية. ركّز على: المرحلة الحالية، نسب التقدّم، أبرز التحسّن، ما يحتاج متابعة، مدى التزام الأسرة، وتوصية واحدة للجلسة القادمة.

البيانات:
- حالة الطفل في المنصّة: ${child.status}
- الأسبوع الحالي في الخطة: ${progress.currentWeek} من 12
- التقدّم العام: ${progress.overall}% — الالتزام بالمهام: ${progress.compliance}%
- التقدّم حسب المجال: ${progress.byDomain.map((d) => `${d.domain}: ${d.value}%`).join("، ")}
- فيديوهات بانتظار التقييم: ${progress.pendingReviews}
- التقرير الأولي: ${initial ? initial.content.summary : "غير متوفر"}
- عدد تقارير الأخصائيين: ${reports.length}`),
  });
  return text
    ? anon.unmask(text)
    : demoSummary(firstName, { overall: progress.overall, compliance: progress.compliance, week: progress.currentWeek || 1, status: child.status });
}

/* ─────────── Specialist writing assistant ─────────── */

export async function assistClinicalReport(childId: string, draft: string, specialty: string, locale: Locale) {
  const { anon, age } = await loadChildContext(childId);
  const text = await generateText({
    system: `${BASE_SYSTEM}\n${langLine(locale)}`,
    prompt: anon.mask(`أنت تساعد أخصائي (${specialty}) في صياغة تقرير فحص سريري احترافي لطفل عمره ${age} سنوات.
أعد صياغة وتنظيم الملاحظات التالية في تقرير منظم بالعناوين: الملاحظات السريرية، نقاط القوة، الاحتياجات الأساسية، التوصيات. لا تخترع نتائج اختبارات غير مذكورة. اكتب نصاً عادياً بدون رموز Markdown.

ملاحظات الأخصائي:
${draft}`),
  });
  return text ? anon.unmask(text) : demoAssistReport(draft);
}

/* ─────────── Parent chat ─────────── */

export async function chatWithParent(childId: string, userId: string, message: string, locale: Locale) {
  const { child, anon, age } = await loadChildContext(childId);
  const progress = await computeProgress(childId);
  const week = progress.plan ? planWeek(progress.plan.startDate) : 0;
  const tasks = progress.plan
    ? await db.query.planTasks.findMany({ where: (t, { and, eq }) => and(eq(t.planId, progress.plan!.id), eq(t.week, week)) })
    : [];
  const history = await db.query.chatMessages.findMany({
    where: eq(schema.chatMessages.childId, childId),
    orderBy: desc(schema.chatMessages.createdAt),
    limit: 12,
  });

  await db.insert(schema.chatMessages).values({ childId, userId, role: "user", content: message });

  const firstName = child.name.split(" ")[0];
  const context = `معلومات عن الطفل (مُجهّلة):
- العمر: ${age} سنوات
- ${progress.plan ? `الأسبوع ${week} من الخطة العلاجية (12 أسبوعاً): ${progress.plan.content.phases[week - 1]?.title ?? ""} — ${progress.plan.content.phases[week - 1]?.focus ?? ""}` : "لا توجد خطة معتمدة بعد"}
- مهام هذا الأسبوع اليومية:
${tasks.map((t) => `  • ${t.title}: ${t.description} | طريقة التطبيق: ${t.howTo}`).join("\n") || "  لا توجد"}
- التقدّم العام: ${progress.overall}%، الالتزام: ${progress.compliance}%
- حسب المجال: ${progress.byDomain.map((d) => `${dictionaries.ar[`domain.${d.domain}`]} ${d.value}%`).join("، ")}
- أهداف الخطة: ${progress.plan?.content.goals.map((g) => g.goal).join("؛ ") ?? "—"}`;

  const turns: ChatTurn[] = history
    .reverse()
    .map((h) => ({ role: h.role === "user" ? ("user" as const) : ("model" as const), text: anon.mask(h.content) }));

  const reply = await generateText({
    system: `${BASE_SYSTEM}
أنت تتحدث الآن مع ولي أمر ${CHILD}. اشرح المهام اليومية وأهدافها وطريقة تطبيقها، ووضّح مستوى التقدّم بلغة بسيطة ودافئة ومشجعة. إجاباتك قصيرة (لا تتجاوز 120 كلمة) وعملية. إذا كان السؤال طبياً حرجاً أو خارج نطاقك، انصح بالتواصل مع الأخصائي. لا تستخدم رموز Markdown مثل ** أو #.
${langLine(locale)}

${context}`,
    history: turns,
    prompt: anon.mask(message),
  });

  const content = reply ? anon.unmask(reply) : demoChatReply(message, firstName, tasks.map((t) => t.title));
  const [row] = await db.insert(schema.chatMessages).values({ childId, userId, role: "assistant", content }).returning();
  return row;
}

/* ─────────── Progress interpretation ─────────── */

export async function generateProgressInsight(child: Child, locale: Locale) {
  const progress = await computeProgress(child.id);
  const firstName = child.name.split(" ")[0];
  const sorted = [...progress.byDomain].sort((a, b) => b.value - a.value);
  const best = dictionaries[locale][`domain.${sorted[0].domain}`];
  const weakest = dictionaries[locale][`domain.${sorted[sorted.length - 1].domain}`];
  const anon = createAnonymizer([{ value: child.name, token: CHILD }]);
  const text = await generateText({
    system: `${BASE_SYSTEM}\n${langLine(locale)}`,
    prompt: `فسّر لولي الأمر بجملتين أو ثلاث، بلغة دافئة ومشجعة، نتائج تقدّم ${CHILD}:
التقدّم العام ${progress.overall}%، الالتزام ${progress.compliance}%، حسب المجال: ${progress.byDomain.map((d) => `${dictionaries[locale][`domain.${d.domain}`]} ${d.value}%`).join("، ")}. لا تستخدم Markdown.`,
  });
  return text ? anon.unmask(text) : demoProgressInsight(firstName, best, weakest);
}

export { isAiEnabled };
