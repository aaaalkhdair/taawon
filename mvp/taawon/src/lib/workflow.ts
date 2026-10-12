import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { generateInitialReport, generatePlanContent } from "./ai/agent";
import { notify, notifyAdmins, notifyChildSpecialists } from "./notify";
import { dateKey } from "./utils";

/**
 * Core business workflow:
 * questionnaire → AI initial report (auto) → specialists' reports → AI plan → admin review → approved → daily tasks.
 */

export async function submitQuestionnaire(childId: string, answers: Record<string, string>) {
  await db.insert(schema.questionnaireResponses).values({ childId, answers: JSON.stringify(answers) });
  await db.update(schema.children).set({ status: "assessment" }).where(eq(schema.children.id, childId));
  const report = await generateInitialReport(childId);
  const child = await db.query.children.findFirst({ where: eq(schema.children.id, childId) });
  const msg = {
    titleAr: `تقرير أولي جديد: ${child?.name}`,
    titleEn: `New initial report: ${child?.name}`,
    bodyAr: "أكمل ولي الأمر الاستبيان وتم إنشاء التقرير الأولي بالذكاء الاصطناعي.",
    bodyEn: "The parent completed the questionnaire and an AI initial report was generated.",
  };
  await notifyAdmins({ ...msg, link: `/admin/children/${childId}` });
  await notifyChildSpecialists(childId, { ...msg, link: `/specialist/children/${childId}` });
  return report;
}

/** Called after a specialist saves a report. Generates the plan once every assigned specialist has reported. */
export async function onClinicalReportSaved(childId: string) {
  const child = await db.query.children.findFirst({ where: eq(schema.children.id, childId) });
  if (!child || child.status === "active" || child.status === "plan_review") return { generated: false };
  const assigns = await db.query.assignments.findMany({ where: eq(schema.assignments.childId, childId) });
  const reports = await db.query.clinicalReports.findMany({ where: eq(schema.clinicalReports.childId, childId) });
  const reported = new Set(reports.map((r) => r.specialistId));
  const allDone = assigns.length > 0 && assigns.every((a) => reported.has(a.specialistId));
  if (!allDone) return { generated: false };
  await createPlanVersion(childId);
  return { generated: true };
}

/** Generates (or regenerates) a plan with AI and puts it in the admin's review queue. */
export async function createPlanVersion(childId: string, opts?: { adminNotes?: string; previousPlanId?: string }) {
  const previous = opts?.previousPlanId
    ? await db.query.plans.findFirst({ where: eq(schema.plans.id, opts.previousPlanId) })
    : undefined;
  const { content, source } = await generatePlanContent(childId, { adminNotes: opts?.adminNotes, previous: previous?.content });
  const last = await db.query.plans.findFirst({ where: eq(schema.plans.childId, childId), orderBy: desc(schema.plans.version) });
  // supersede any open versions
  await db
    .update(schema.plans)
    .set({ status: "superseded" })
    .where(and(eq(schema.plans.childId, childId), inArray(schema.plans.status, ["pending", "returned_specialist"])));
  const [plan] = await db
    .insert(schema.plans)
    .values({ childId, content, source, version: (last?.version ?? 0) + 1, status: "pending", adminNotes: opts?.adminNotes ?? null })
    .returning();
  await db.update(schema.children).set({ status: "plan_review" }).where(eq(schema.children.id, childId));
  const child = await db.query.children.findFirst({ where: eq(schema.children.id, childId) });
  await notifyAdmins({
    titleAr: `خطة علاجية بانتظار الاعتماد: ${child?.name}`,
    titleEn: `Treatment plan awaiting approval: ${child?.name}`,
    bodyAr: `النسخة ${plan.version} جاهزة للمراجعة.`,
    bodyEn: `Version ${plan.version} is ready for review.`,
    link: `/admin/plans/${plan.id}`,
  });
  return plan;
}

export async function approvePlan(planId: string) {
  const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, planId) });
  if (!plan) throw new Error("Plan not found");
  const now = new Date();
  // only one approved plan per child
  await db
    .update(schema.plans)
    .set({ status: "superseded" })
    .where(and(eq(schema.plans.childId, plan.childId), eq(schema.plans.status, "approved")));
  await db
    .update(schema.plans)
    .set({ status: "approved", approvedAt: now.toISOString(), startDate: dateKey(now) })
    .where(eq(schema.plans.id, planId));
  const rows = plan.content.phases.flatMap((ph) =>
    ph.tasks.map((t) => ({ planId, childId: plan.childId, week: ph.week, title: t.title, description: t.description, howTo: t.howTo, domain: t.domain }))
  );
  if (rows.length) await db.insert(schema.planTasks).values(rows);
  await db.update(schema.children).set({ status: "active" }).where(eq(schema.children.id, plan.childId));

  const child = await db.query.children.findFirst({ where: eq(schema.children.id, plan.childId) });
  if (child) {
    await notify(child.parentId, {
      titleAr: "تم اعتماد الخطة العلاجية 🎉",
      titleEn: "Treatment plan approved 🎉",
      bodyAr: `خطة ${child.name} جاهزة، ومهام اليوم بانتظارك.`,
      bodyEn: `${child.name}'s plan is ready — today's tasks are waiting.`,
      link: "/parent/tasks",
    });
    await notifyChildSpecialists(child.id, {
      titleAr: `اعتُمدت خطة ${child.name}`,
      titleEn: `${child.name}'s plan was approved`,
      link: `/specialist/children/${child.id}`,
    });
  }
}

/** Admin rejects the plan and asks the AI to revise it according to notes. */
export async function revisePlanWithAI(planId: string, notes: string) {
  const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, planId) });
  if (!plan) throw new Error("Plan not found");
  return createPlanVersion(plan.childId, { adminNotes: notes, previousPlanId: planId });
}

/** Admin returns the plan to the specialists for manual edits. */
export async function returnPlanToSpecialists(planId: string, notes: string) {
  const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, planId) });
  if (!plan) throw new Error("Plan not found");
  await db.update(schema.plans).set({ status: "returned_specialist", adminNotes: notes }).where(eq(schema.plans.id, planId));
  const child = await db.query.children.findFirst({ where: eq(schema.children.id, plan.childId) });
  await notifyChildSpecialists(plan.childId, {
    titleAr: `أُعيدت خطة ${child?.name} للتعديل`,
    titleEn: `${child?.name}'s plan was returned for edits`,
    bodyAr: notes,
    bodyEn: notes,
    link: `/specialist/plans/${planId}`,
  });
}

/** Specialist resubmits an edited plan (content replaced), back to admin queue. */
export async function resubmitPlan(planId: string, content: typeof schema.plans.$inferSelect.content) {
  const plan = await db.query.plans.findFirst({ where: eq(schema.plans.id, planId) });
  if (!plan) throw new Error("Plan not found");
  await db.update(schema.plans).set({ content, status: "pending", source: "manual" }).where(eq(schema.plans.id, planId));
  const child = await db.query.children.findFirst({ where: eq(schema.children.id, plan.childId) });
  await notifyAdmins({
    titleAr: `تم تعديل خطة ${child?.name} من الأخصائي`,
    titleEn: `${child?.name}'s plan was edited by the specialist`,
    link: `/admin/plans/${planId}`,
  });
}
