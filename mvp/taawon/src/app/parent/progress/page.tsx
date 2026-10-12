import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { Sparkles, Star, Target, TrendingUp, Video, ShieldAlert } from "lucide-react";
import { db, schema } from "@/db";
import { getParentContext } from "@/lib/parent";
import { getT } from "@/i18n/server";
import { computeProgress } from "@/lib/progress";
import { generateProgressInsight } from "@/lib/ai/agent";
import { formatDate, planWeek } from "@/lib/utils";
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  ProgressBar,
  ProgressRing,
  Prose,
} from "@/components/ui";
import { ProgressTrendChart, SkillsRadar } from "@/components/child/charts";
import { DomainBadge } from "@/components/child/plan-view";

async function AiInsightCard({ child, locale }: { child: typeof schema.children.$inferSelect; locale: "ar" | "en" }) {
  const insight = await generateProgressInsight(child, locale);
  return <Prose className="text-slate-800">{insight}</Prose>;
}

export default async function ParentProgressPage() {
  const { activeChild } = await getParentContext();
  const { t, locale } = await getT();

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
  const currentWeek = plan ? planWeek(plan.startDate) : 1;

  // Recent evaluated submissions
  const evaluatedSubmissions = await db.query.submissions.findMany({
    where: eq(schema.submissions.childId, activeChild.id),
    orderBy: desc(schema.submissions.evaluatedAt),
    limit: 6,
  });

  const evaluatedWithTasks = await Promise.all(
    evaluatedSubmissions
      .filter((s) => s.rating != null)
      .map(async (sub) => {
        const task = await db.query.planTasks.findFirst({
          where: eq(schema.planTasks.id, sub.taskId),
        });
        return { sub, task };
      })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("parent.progress.title")}
        subtitle={t("parent.progress.subtitle")}
      />

      {/* Top Stat Overview Rings */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-5 p-6">
          <ProgressRing
            value={progress.overall}
            size={90}
            stroke={9}
            color="#1565d8"
          />
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              {t("parent.progress.overallScore")}
            </p>
            <p className="mt-1 text-2xl font-bold text-ink">{progress.overall}%</p>
            <p className="mt-1 text-xs text-muted">
              {t("parent.tasks.week", { week: currentWeek })}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-6">
          <ProgressRing
            value={progress.compliance}
            size={90}
            stroke={9}
            color="#0ea5a4"
          />
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              {t("parent.progress.complianceRate")}
            </p>
            <p className="mt-1 text-2xl font-bold text-ink">{progress.compliance}%</p>
            <p className="mt-1 text-xs text-muted">
              {t("common.compliance")}
            </p>
          </div>
        </Card>
      </div>

      {/* AI Developmental Insight */}
      <Card className="border-care-200 bg-gradient-to-br from-white to-care-50/40 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-care-500 text-white shadow-xs">
            <Sparkles className="size-4" />
          </span>
          <h3 className="font-bold text-ink">{t("parent.progress.aiInsightTitle")}</h3>
        </div>
        <Suspense fallback={<p className="text-sm text-muted">{t("ai.thinking")}</p>}>
          <AiInsightCard child={activeChild} locale={locale} />
        </Suspense>
      </Card>

      {/* Domain Breakdown Bars */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-ink">{t("parent.progress.radarTitle")}</h3>
        <div className="space-y-3.5">
          {progress.byDomain.map((d) => (
            <div key={d.domain} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-ink">{t(`domain.${d.domain}`)}</span>
                <span className="font-bold text-slate-800">{d.value}%</span>
              </div>
              <ProgressBar
                value={d.value}
                tone={d.domain === "behavior" ? "care" : d.domain === "daily_living" ? "amber" : "brand"}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Charts: Trend + Radar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader
            icon={<TrendingUp className="size-5 text-brand-600" />}
            title={t("parent.progress.trendTitle")}
          />
          <div className="pt-4">
            <ProgressTrendChart data={progress.weekly} height={260} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader
            icon={<Target className="size-5 text-care-600" />}
            title={t("parent.progress.radarTitle")}
          />
          <div className="pt-4">
            <SkillsRadar data={progress.byDomain} height={260} />
          </div>
        </Card>
      </div>

      {/* Goals of current plan */}
      {plan && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-ink">{t("parent.progress.goalsTitle")}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {plan.content.goals.map((g, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface p-4">
                <DomainBadge domain={g.domain} t={t} />
                <p className="mt-2 text-sm text-slate-700 leading-relaxed font-medium">
                  {g.goal}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Specialist Reviews History */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-ink">{t("parent.progress.historyTitle")}</h3>
        {evaluatedWithTasks.length === 0 ? (
          <p className="text-sm text-muted">{t("parent.latestFeedback.none")}</p>
        ) : (
          <div className="divide-y divide-line">
            {evaluatedWithTasks.map(({ sub, task }, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {task && <DomainBadge domain={task.domain} t={t} />}
                    <span className="text-sm font-bold text-ink">{task?.title}</span>
                  </div>
                  <span className="text-xs text-muted">{formatDate(sub.date, locale)}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < (sub.rating ?? 0) ? "fill-current" : "text-slate-200"
                      }`}
                    />
                  ))}
                  <span className="ms-1.5 text-xs font-semibold text-slate-700">
                    {sub.rating} / 5
                  </span>
                </div>
                {sub.feedback && (
                  <p className="text-xs italic text-slate-600 bg-surface rounded-lg p-2.5">
                    &ldquo;{sub.feedback}&rdquo;
                  </p>
                )}
                {sub.videoUrl && (
                  <div className="flex items-center gap-1 text-[11px] text-brand-600">
                    <Video className="size-3" />
                    <span>{t("parent.tasks.videoUploaded")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
