"use server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { submitQuestionnaire } from "@/lib/workflow";
import { notifyChildSpecialists } from "@/lib/notify";
import { chatWithParent } from "@/lib/ai/agent";
import { dateKey } from "@/lib/utils";
import { getLocale } from "@/i18n/server";

export async function submitQuestionnaireAction(childId: string, answers: Record<string, string>) {
  const user = await requireUser("parent");
  // ensure child belongs to parent
  const child = await db.query.children.findFirst({
    where: and(eq(schema.children.id, childId), eq(schema.children.parentId, user.id)),
  });
  if (!child) throw new Error("Unauthorized child access");

  await submitQuestionnaire(childId, answers);
  revalidatePath("/parent");
  revalidatePath("/parent/questionnaire");
}

export async function submitTaskAction(formData: FormData) {
  const user = await requireUser("parent");
  const taskId = String(formData.get("taskId") ?? "");
  const childId = String(formData.get("childId") ?? "");
  const videoUrl = formData.get("videoUrl") ? String(formData.get("videoUrl")) : null;
  const note = formData.get("note") ? String(formData.get("note")) : null;

  const child = await db.query.children.findFirst({
    where: and(eq(schema.children.id, childId), eq(schema.children.parentId, user.id)),
  });
  if (!child) throw new Error("Unauthorized child access");

  const today = dateKey();

  // Check if submission already exists for today & this task
  const existing = await db.query.submissions.findFirst({
    where: and(
      eq(schema.submissions.taskId, taskId),
      eq(schema.submissions.childId, childId),
      eq(schema.submissions.date, today)
    ),
  });

  if (existing) {
    await db
      .update(schema.submissions)
      .set({
        videoUrl: videoUrl ?? existing.videoUrl,
        note: note ?? existing.note,
      })
      .where(eq(schema.submissions.id, existing.id));
  } else {
    await db.insert(schema.submissions).values({
      taskId,
      childId,
      date: today,
      videoUrl,
      note,
    });
  }

  if (videoUrl) {
    await notifyChildSpecialists(childId, {
      titleAr: `فيديو جديد بحاجة للمراجعة: ${child.name}`,
      titleEn: `New video requires review: ${child.name}`,
      bodyAr: "قام ولي الأمر برفع فيديو توثيقي لأداء إحدى المهام اليومية.",
      bodyEn: "Parent uploaded a documentation video for a daily home task.",
      link: "/specialist/reviews",
    });
  }

  revalidatePath("/parent");
  revalidatePath("/parent/tasks");
  revalidatePath("/parent/progress");
}

export async function sendChatMessageAction(childId: string, message: string) {
  const user = await requireUser("parent");
  const child = await db.query.children.findFirst({
    where: and(eq(schema.children.id, childId), eq(schema.children.parentId, user.id)),
  });
  if (!child) throw new Error("Unauthorized child access");

  const locale = await getLocale();
  const reply = await chatWithParent(childId, user.id, message, locale);
  return reply;
}
