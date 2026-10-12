"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { createSession, destroySession, getCurrentUser, homeFor } from "@/lib/auth";
import { LOCALE_COOKIE } from "@/i18n/config";

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "login.error" };
  }
  await createSession(user);
  redirect(homeFor(user.role));
}

/** One-click demo login used on the login page during the investor demo. */
export async function demoLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (!user) redirect("/login");
  await createSession(user);
  redirect(homeFor(user.role));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function setLocaleAction(formData: FormData) {
  const locale = formData.get("locale") === "en" ? "en" : "ar";
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

export async function setActiveChildAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const childId = String(formData.get("childId") ?? "");
  const child = await db.query.children.findFirst({
    where: and(eq(schema.children.id, childId), eq(schema.children.parentId, user.id)),
  });
  if (child) {
    const jar = await cookies();
    jar.set("active_child", child.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  revalidatePath("/parent", "layout");
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await db.update(schema.notifications).set({ read: true }).where(eq(schema.notifications.userId, user.id));
  revalidatePath("/", "layout");
}
