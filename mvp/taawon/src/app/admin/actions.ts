"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import {
  approvePlan,
  createPlanVersion,
  returnPlanToSpecialists,
  revisePlanWithAI,
} from "@/lib/workflow";
import { notify, notifyChildSpecialists } from "@/lib/notify";
import type { Specialty } from "@/db/schema";

export async function approvePlanAction(planId: string) {
  await requireUser("admin");
  await approvePlan(planId);
  revalidatePath("/admin");
  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
  redirect(`/admin/plans`);
}

export async function revisePlanWithAiAction(planId: string, notes: string) {
  await requireUser("admin");
  const newPlan = await revisePlanWithAI(planId, notes);
  revalidatePath("/admin/plans");
  return newPlan;
}

export async function returnPlanToSpecialistsAction(planId: string, notes: string) {
  await requireUser("admin");
  await returnPlanToSpecialists(planId, notes);
  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
}

export async function addChildAction(formData: FormData) {
  await requireUser("admin");
  const name = String(formData.get("name") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "");
  const gender = (formData.get("gender") as "male" | "female") ?? "male";
  const diagnosis = formData.get("diagnosis") ? String(formData.get("diagnosis")) : null;

  let parentId = formData.get("parentId") ? String(formData.get("parentId")) : "";

  // If creating new parent
  if (!parentId || parentId === "new") {
    const parentName = String(formData.get("parentName") ?? "").trim();
    const parentEmail = String(formData.get("parentEmail") ?? "").trim().toLowerCase();
    const parentPhone = formData.get("parentPhone") ? String(formData.get("parentPhone")) : null;
    const password = String(formData.get("parentPassword") || "Taawon@2026");
    const passwordHash = await bcrypt.hash(password, 10);

    const [newParent] = await db
      .insert(schema.users)
      .values({
        name: parentName,
        email: parentEmail,
        passwordHash,
        role: "parent",
        phone: parentPhone,
      })
      .returning();
    parentId = newParent.id;
  }

  // Insert child
  const [child] = await db
    .insert(schema.children)
    .values({
      name,
      birthDate,
      gender,
      parentId,
      diagnosis,
      status: "new",
    })
    .returning();

  // Specialist assignments
  const specialistIds = formData.getAll("specialistIds").map(String);
  if (specialistIds.length > 0) {
    await db.insert(schema.assignments).values(
      specialistIds.map((sId) => ({
        childId: child.id,
        specialistId: sId,
      }))
    );
  }

  // Notify parent
  await notify(parentId, {
    titleAr: `مرحباً بك في منصة تعاون! تم تسجيل ${child.name}`,
    titleEn: `Welcome to Taawon! ${child.name} has been registered`,
    bodyAr: "يرجى تعبئة الاستبيان الأولي للبدء في خطة التأهيل.",
    bodyEn: "Please fill out the preliminary questionnaire to begin rehabilitation.",
    link: "/parent/questionnaire",
  });

  // Notify specialists
  if (specialistIds.length > 0) {
    await notifyChildSpecialists(child.id, {
      titleAr: `تم إسناد طفل جديد إليك: ${child.name}`,
      titleEn: `New child assigned to you: ${child.name}`,
      link: `/specialist/children/${child.id}`,
    });
  }

  revalidatePath("/admin/children");
  revalidatePath("/admin");
  redirect("/admin/children");
}

export async function addSpecialistAction(formData: FormData) {
  await requireUser("admin");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = formData.get("phone") ? String(formData.get("phone")) : null;
  const specialty = formData.get("specialty") as Specialty;
  const password = String(formData.get("password") || "Taawon@2026");
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(schema.users).values({
    name,
    email,
    passwordHash,
    role: "specialist",
    specialty,
    phone,
  });

  revalidatePath("/admin/specialists");
  revalidatePath("/admin");
  redirect("/admin/specialists");
}

export async function updateChildAssignmentsAction(childId: string, specialistIds: string[]) {
  await requireUser("admin");
  await db.delete(schema.assignments).where(eq(schema.assignments.childId, childId));
  if (specialistIds.length > 0) {
    await db.insert(schema.assignments).values(
      specialistIds.map((sId) => ({
        childId,
        specialistId: sId,
      }))
    );
  }
  revalidatePath(`/admin/children/${childId}`);
}

export async function generatePlanAction(childId: string) {
  await requireUser("admin");
  const plan = await createPlanVersion(childId);
  revalidatePath(`/admin/children/${childId}`);
  revalidatePath(`/admin/plans`);
  redirect(`/admin/plans/${plan.id}`);
}

export async function createQuestionAction(formData: FormData) {
  await requireUser("admin");
  const section = String(formData.get("section") ?? "general");
  const textAr = String(formData.get("textAr") ?? "");
  const textEn = String(formData.get("textEn") ?? "");
  const type = (formData.get("type") as "text" | "choice" | "scale") ?? "text";
  const rawOptions = formData.get("options") ? String(formData.get("options")) : null;

  let options = null;
  if (type === "choice" && rawOptions) {
    const lines = rawOptions.split("\n").filter((l) => l.trim().length > 0);
    const parsed = lines.map((l) => {
      const parts = l.split("|");
      return {
        ar: parts[0]?.trim() ?? "",
        en: parts[1]?.trim() ?? parts[0]?.trim() ?? "",
      };
    });
    options = JSON.stringify(parsed);
  }

  const existingCount = (await db.query.questions.findMany()).length;

  await db.insert(schema.questions).values({
    section,
    textAr,
    textEn,
    type,
    options,
    order: existingCount + 1,
  });

  revalidatePath("/admin/questionnaire");
}

export async function deleteQuestionAction(questionId: string) {
  await requireUser("admin");
  await db.delete(schema.questions).where(eq(schema.questions.id, questionId));
  revalidatePath("/admin/questionnaire");
}
