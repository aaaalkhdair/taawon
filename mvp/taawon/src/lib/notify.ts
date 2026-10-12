import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

type Msg = { titleAr: string; titleEn: string; bodyAr?: string; bodyEn?: string; link?: string };

export async function notify(userIds: string | string[], msg: Msg) {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (!ids.length) return;
  await db.insert(schema.notifications).values(ids.map((userId) => ({ userId, ...msg })));
}

export async function notifyAdmins(msg: Msg) {
  const admins = await db.query.users.findMany({ where: eq(schema.users.role, "admin") });
  await notify(admins.map((a) => a.id), msg);
}

export async function notifyChildSpecialists(childId: string, msg: Msg) {
  const rows = await db.query.assignments.findMany({ where: eq(schema.assignments.childId, childId) });
  await notify(rows.map((r) => r.specialistId), msg);
}
