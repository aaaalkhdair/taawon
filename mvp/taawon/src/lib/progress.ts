import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Domain, Plan, PlanTask, Submission } from "@/db/schema";
import { addDays, dateKey, planWeek } from "./utils";

export const DOMAINS: Domain[] = ["communication", "cognitive", "behavior", "daily_living"];

export type DomainProgress = { domain: Domain; value: number; rating: number | null; completion: number };
export type WeeklyPoint = { week: number; overall: number } & Partial<Record<Domain, number>>;
export type ChildProgress = {
  plan: Plan | null;
  currentWeek: number;
  overall: number;
  compliance: number;
  byDomain: DomainProgress[];
  weekly: WeeklyPoint[];
  pendingReviews: number;
};

/** 70% specialist ratings + 30% task completion, per domain. Deterministic (computed in-app, not by AI). */
function score(subs: Submission[], expected: number) {
  const completion = expected > 0 ? Math.min(1, subs.length / expected) : 0;
  const rated = subs.filter((s) => s.rating != null);
  const rating = rated.length ? rated.reduce((a, s) => a + (s.rating ?? 0), 0) / rated.length / 5 : null;
  const value = rating == null ? completion * 100 : (0.7 * rating + 0.3 * completion) * 100;
  return { value: Math.round(value), rating: rating == null ? null : Math.round(rating * 100), completion: Math.round(completion * 100) };
}

export async function getActivePlan(childId: string) {
  return (
    (await db.query.plans.findFirst({
      where: and(eq(schema.plans.childId, childId), eq(schema.plans.status, "approved")),
      orderBy: desc(schema.plans.createdAt),
    })) ?? null
  );
}

export async function computeProgress(childId: string, now = new Date()): Promise<ChildProgress> {
  const plan = await getActivePlan(childId);
  if (!plan || !plan.startDate) {
    return { plan, currentWeek: 0, overall: 0, compliance: 0, byDomain: DOMAINS.map((d) => ({ domain: d, value: 0, rating: null, completion: 0 })), weekly: [], pendingReviews: 0 };
  }
  const tasks = await db.query.planTasks.findMany({ where: eq(schema.planTasks.planId, plan.id) });
  const taskIds = new Set(tasks.map((t) => t.id));
  const allSubs = (await db.query.submissions.findMany({ where: eq(schema.submissions.childId, childId) })).filter((s) => taskIds.has(s.taskId));
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const currentWeek = planWeek(plan.startDate, 12, now);
  const start = new Date(plan.startDate);
  const today = dateKey(now);

  // expected task-days per domain, per week, up to today
  const expected: Record<number, Record<string, number>> = {};
  for (let d = new Date(start); dateKey(d) <= today; d = addDays(d, 1)) {
    const w = planWeek(plan.startDate, 12, d);
    const weekTasks = tasks.filter((t) => t.week === w);
    expected[w] ??= {};
    for (const t of weekTasks) expected[w][t.domain] = (expected[w][t.domain] ?? 0) + 1;
  }

  const subsFor = (pred: (s: Submission, t: PlanTask) => boolean) =>
    allSubs.filter((s) => {
      const t = taskById.get(s.taskId);
      return t ? pred(s, t) : false;
    });

  const byDomain: DomainProgress[] = DOMAINS.map((domain) => {
    const exp = Object.values(expected).reduce((a, e) => a + (e[domain] ?? 0), 0);
    return { domain, ...score(subsFor((_, t) => t.domain === domain), exp) };
  });
  const active = byDomain.filter((d) => Object.values(expected).some((e) => e[d.domain]));
  const overall = active.length ? Math.round(active.reduce((a, d) => a + d.value, 0) / active.length) : 0;
  const totalExpected = Object.values(expected).reduce((a, e) => a + Object.values(e).reduce((x, y) => x + y, 0), 0);
  const compliance = totalExpected ? Math.round(Math.min(1, allSubs.length / totalExpected) * 100) : 0;

  // weekly cumulative series (progress up to the end of each week) for nicer trend lines
  const weekly: WeeklyPoint[] = [];
  for (let w = 1; w <= currentWeek; w++) {
    const point: WeeklyPoint = { week: w, overall: 0 };
    const vals: number[] = [];
    for (const domain of DOMAINS) {
      const exp = Object.entries(expected)
        .filter(([wk]) => Number(wk) <= w)
        .reduce((a, [, e]) => a + (e[domain] ?? 0), 0);
      if (!exp) continue;
      const v = score(subsFor((_, t) => t.domain === domain && t.week <= w), exp).value;
      point[domain] = v;
      vals.push(v);
    }
    point.overall = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    weekly.push(point);
  }

  const pendingReviews = allSubs.filter((s) => s.videoUrl && s.rating == null).length;
  return { plan, currentWeek, overall, compliance, byDomain, weekly, pendingReviews };
}
