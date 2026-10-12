import { and, eq } from "drizzle-orm";
import { CalendarCheck, Flame, ListChecks, ShieldAlert } from "lucide-react";
import { db, schema } from "@/db";
import { getParentContext } from "@/lib/parent";
import { getT } from "@/i18n/server";
import { computeProgress } from "@/lib/progress";
import { addDays, dateKey, planWeek } from "@/lib/utils";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { TaskCard } from "@/components/parent/task-card";

export default async function ParentTasksPage() {
  const { activeChild } = await getParentContext();
  const { t } = await getT();

  if (!activeChild) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-10" />}
        title={t("parent.noChildren")}
      />
    );
  }

  const progress = await computeProgress(activeChild.id);
  const plan = progress.plan;

  if (!plan || plan.status !== "approved" || !plan.startDate) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("parent.tasks.title")}
          subtitle={t("parent.tasks.subtitle")}
        />
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ListChecks className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink">
            {t("status.assessment")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("parent.statusAssessment.desc")}
          </p>
        </Card>
      </div>
    );
  }

  const currentWeek = planWeek(plan.startDate);
  const currentPhase = plan.content.phases.find((p) => p.week === currentWeek) ?? plan.content.phases[0];

  const tasks = await db.query.planTasks.findMany({
    where: and(
      eq(schema.planTasks.planId, plan.id),
      eq(schema.planTasks.week, currentWeek)
    ),
  });

  const today = dateKey();
  const todaySubmissions = await db.query.submissions.findMany({
    where: and(
      eq(schema.submissions.childId, activeChild.id),
      eq(schema.submissions.date, today)
    ),
  });
  const subByTaskId = new Map(todaySubmissions.map((s) => [s.taskId, s]));

  // Calculate past 7 days streak
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(new Date(), -6 + i);
    return dateKey(d);
  });
  const recentSubs = await db.query.submissions.findMany({
    where: eq(schema.submissions.childId, activeChild.id),
  });
  const datesWithSubs = new Set(recentSubs.map((s) => s.date));
  let streakDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = dateKey(addDays(new Date(), -i));
    if (datesWithSubs.has(d)) streakDays++;
    else break;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("parent.tasks.title")}
        subtitle={t("parent.tasks.subtitle")}
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-sm">
            <Flame className="size-4 text-amber-500 fill-amber-500" />
            <span>{t("parent.tasks.streak", { days: streakDays })}</span>
          </div>
        }
      />

      {/* Week Header Banner */}
      <Card className="bg-gradient-to-r from-brand-50 to-care-50/50 p-5 border-brand-100">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-sm">
            {currentWeek}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                {t("parent.tasks.week", { week: currentWeek })}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-care-700">
                {currentPhase.title}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-700 font-medium">
              {currentPhase.focus}
            </p>
          </div>
        </div>

        {/* 7-Day Consistency Strip */}
        <div className="mt-4 border-t border-brand-100/60 pt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">{t("parent.progress.complianceRate")}:</span>
          <div className="flex items-center gap-1.5">
            {past7Days.map((d, idx) => {
              const done = datesWithSubs.has(d);
              return (
                <div
                  key={idx}
                  title={d}
                  className={`flex size-7 items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                    done
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-white text-slate-400 border border-line"
                  }`}
                >
                  {done ? <CalendarCheck className="size-3.5" /> : idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            submission={subByTaskId.get(task.id) ?? null}
            childId={activeChild.id}
          />
        ))}
      </div>
    </div>
  );
}
