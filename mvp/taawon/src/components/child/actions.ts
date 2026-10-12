"use server";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/i18n/server";
import { generateChildSummary } from "@/lib/ai/agent";

/** Executive AI summary of a child — available to admin and specialists. */
export async function childSummaryAction(childId: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role === "parent") throw new Error("unauthorized");
  return generateChildSummary(childId, await getLocale());
}
