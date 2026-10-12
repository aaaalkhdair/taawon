"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { onClinicalReportSaved, resubmitPlan } from "@/lib/workflow";
import { assistClinicalReport } from "@/lib/ai/agent";
import { notify, notifyAdmins } from "@/lib/notify";
import { getLocale } from "@/i18n/server";
import type { PlanContent } from "@/db/schema";

async function verifySpecialistAssignment(specialistId: string, childId: string) {
  const assignment = await db.query.assignments.findFirst({
    where: and(
      eq(schema.assignments.specialistId, specialistId),
      eq(schema.assignments.childId, childId)
    ),
  });
  if (!assignment) throw new Error("Specialist not assigned to this child");
}

export async function saveClinicalReportAction(childId: string, content: string) {
  const user = await requireUser("specialist");
  await verifySpecialistAssignment(user.id, childId);

  const now = new Date().toISOString();
  const existing = await db.query.clinicalReports.findFirst({
    where: and(
      eq(schema.clinicalReports.childId, childId),
      eq(schema.clinicalReports.specialistId, user.id)
    ),
  });

  if (existing) {
    await db
      .update(schema.clinicalReports)
      .set({ content, updatedAt: now })
      .where(eq(schema.clinicalReports.id, existing.id));
  } else {
    await db.insert(schema.clinicalReports).values({
      childId,
      specialistId: user.id,
      content,
      createdAt: now,
      updatedAt: now,
    });
  }

  const child = await db.query.children.findFirst({
    where: eq(schema.children.id, childId),
  });

  await notifyAdmins({
    titleAr: `تم تقديم تقرير سريري لـ ${child?.name}`,
    titleEn: `Clinical report submitted for ${child?.name}`,
    bodyAr: `أكمل ${user.name} التقرير السريري التخصصي.`,
    bodyEn: `${user.name} submitted their clinical assessment report.`,
    link: `/admin/children/${childId}`,
  });

  const result = await onClinicalReportSaved(childId);

  revalidatePath(`/specialist/children/${childId}`);
  revalidatePath(`/specialist`);
  return { success: true, generatedPlan: result.generated };
}

export async function improveClinicalReportAction(childId: string, draft: string) {
  const user = await requireUser("specialist");
  await verifySpecialistAssignment(user.id, childId);

  const locale = await getLocale();
  const specialtyLabel = user.specialty ?? "تخاطب وتربية خاصة";
  return assistClinicalReport(childId, draft, specialtyLabel, locale);
}

export async function createSessionAction(formData: FormData) {
  const user = await requireUser("specialist");
  const childId = String(formData.get("childId") ?? "");
  const startsAt = String(formData.get("startsAt") ?? "");
  const durationMin = Number(formData.get("durationMin") ?? 45);
  const type = (formData.get("type") as "in_person" | "online") ?? "in_person";
  const notes = formData.get("notes") ? String(formData.get("notes")) : null;

  await verifySpecialistAssignment(user.id, childId);

  await db.insert(schema.sessions).values({
    childId,
    specialistId: user.id,
    startsAt,
    durationMin,
    type,
    notes,
    status: "scheduled",
  });

  const child = await db.query.children.findFirst({
    where: eq(schema.children.id, childId),
  });
  if (child) {
    await notify(child.parentId, {
      titleAr: `تم تحديد موعد جلسة علاجية جديدة: ${child.name}`,
      titleEn: `New therapy session scheduled: ${child.name}`,
      bodyAr: `مع ${user.name} بتاريخ ${new Date(startsAt).toLocaleString("ar-SA")}`,
      bodyEn: `With ${user.name} on ${new Date(startsAt).toLocaleString("en-US")}`,
      link: "/parent",
    });
  }

  revalidatePath("/specialist/sessions");
  revalidatePath("/specialist");
}

export async function updateSessionStatusAction(sessionId: string, status: "done" | "cancelled") {
  const user = await requireUser("specialist");
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(schema.sessions.id, sessionId),
      eq(schema.sessions.specialistId, user.id)
    ),
  });
  if (!session) throw new Error("Unauthorized session");

  await db
    .update(schema.sessions)
    .set({ status })
    .where(eq(schema.sessions.id, sessionId));

  revalidatePath("/specialist/sessions");
  revalidatePath("/specialist");
}

export async function reviewSubmissionAction(
  submissionId: string,
  rating: number,
  feedback: string
) {
  const user = await requireUser("specialist");
  const sub = await db.query.submissions.findFirst({
    where: eq(schema.submissions.id, submissionId),
  });
  if (!sub) throw new Error("Submission not found");

  await verifySpecialistAssignment(user.id, sub.childId);

  const now = new Date().toISOString();
  await db
    .update(schema.submissions)
    .set({
      rating,
      feedback,
      evaluatedBy: user.id,
      evaluatedAt: now,
    })
    .where(eq(schema.submissions.id, submissionId));

  const child = await db.query.children.findFirst({
    where: eq(schema.children.id, sub.childId),
  });
  if (child) {
    await notify(child.parentId, {
      titleAr: `تم تقييم أداء ${child.name} في المهمة المنزلية ⭐`,
      titleEn: `Specialist evaluated ${child.name}'s task video ⭐`,
      bodyAr: `التقييم: ${rating}/5 — «${feedback}»`,
      bodyEn: `Rating: ${rating}/5 — "${feedback}"`,
      link: "/parent/progress",
    });
  }

  revalidatePath("/specialist/reviews");
  revalidatePath("/specialist");
}

export async function resubmitPlanAction(planId: string, content: PlanContent) {
  const user = await requireUser("specialist");
  const plan = await db.query.plans.findFirst({
    where: eq(schema.plans.id, planId),
  });
  if (!plan) throw new Error("Plan not found");

  await verifySpecialistAssignment(user.id, plan.childId);
  await resubmitPlan(planId, content);

  revalidatePath(`/specialist/plans/${planId}`);
  revalidatePath(`/admin/plans/${planId}`);
}
