import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import type { Child, User } from "@/db/schema";

export type ParentContext = {
  user: User;
  children: Child[];
  activeChild: Child | null;
};

export async function getParentContext(): Promise<ParentContext> {
  const user = await requireUser("parent");
  const children = await db.query.children.findMany({
    where: eq(schema.children.parentId, user.id),
  });

  const jar = await cookies();
  const activeChildId = jar.get("active_child")?.value;

  let activeChild = children.find((c) => c.id === activeChildId) || null;
  if (!activeChild && children.length > 0) {
    activeChild = children[0];
  }

  return { user, children, activeChild };
}
