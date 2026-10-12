import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import {
  CalendarDays,
  ClipboardList,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { computeProgress } from "@/lib/progress";
import { formatDateTime } from "@/lib/utils";
import {
  Avatar,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  LinkButton,
  PageHeader,
  ProgressBar,
  StatCard,
} from "@/components/ui";
import { SkillsRadar } from "@/components/child/charts";

export default async function AdminDashboardPage() {
  await requireUser("admin");
  const { t, locale, dir } = await getT();

  const allChildren = await db.query.children.findMany();
  const specialists = await db.query.users.findMany({
    where: eq(schema.users.role, "specialist"),
  });

  // Plans pending director approval
  const pendingPlans = await db.query.plans.findMany({
    where: eq(schema.plans.status, "pending"),
    orderBy: desc(schema.plans.createdAt),
  });

  // Calculate aggregated metrics for active children
  const activeChildren = allChildren.filter((c) => c.status === "active");
  const activeProgresses = await Promise.all(
    activeChildren.map((c) => computeProgress(c.id))
  );

  const avgProgress = activeProgresses.length
    ? Math.round(activeProgresses.reduce((acc, p) => acc + p.overall, 0) / activeProgresses.length)
    : 0;

  const avgCompliance = activeProgresses.length
    ? Math.round(activeProgresses.reduce((acc, p) => acc + p.compliance, 0) / activeProgresses.length)
    : 0;

  // Domain averages for Center Radar chart
  const domains = ["communication", "cognitive", "behavior", "daily_living"] as const;
  const domainAverages = domains.map((domain) => {
    let sum = 0;
    let count = 0;
    for (const p of activeProgresses) {
      const d = p.byDomain.find((item) => item.domain === domain);
      if (d) {
        sum += d.value;
        count++;
      }
    }
    return { domain, value: count > 0 ? Math.round(sum / count) : 0 };
  });

  // Recent center sessions
  const recentSessions = await db.query.sessions.findMany({
    orderBy: desc(schema.sessions.startsAt),
    limit: 5,
  });

  const childById = new Map(allChildren.map((c) => [c.id, c]));
  const specById = new Map(specialists.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.dashboard.title")}
        subtitle={t("admin.dashboard.subtitle")}
        action={
          <LinkButton href="/admin/children/new" size="md">
            + {t("admin.children.newBtn")}
          </LinkButton>
        }
      />

      {/* Urgent Pending Plans Banner */}
      {pendingPlans.length > 0 && (
        <Card className="border-brand-200 bg-gradient-to-r from-brand-50 via-white to-care-50/50 p-6 shadow-sm animate-fade-up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-pop">
                <Sparkles className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-ink text-base">
                    {t("admin.pendingPlansBanner.title", { count: pendingPlans.length })}
                  </h3>
                  <Badge tone="blue">{t("plan.status.pending")}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-600 max-w-xl leading-relaxed">
                  {t("admin.pendingPlansBanner.desc")}
                </p>
              </div>
            </div>
            <LinkButton href={`/admin/plans/${pendingPlans[0].id}`} size="lg">
              {t("admin.pendingPlansBanner.reviewBtn")}
              {dir === "rtl" ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            </LinkButton>
          </div>
        </Card>
      )}

      {/* Executive Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label={t("admin.stat.totalChildren")}
          value={allChildren.length}
          icon={<Users className="size-5" />}
          tone="blue"
        />
        <StatCard
          label={t("admin.stat.specialists")}
          value={specialists.length}
          icon={<Stethoscope className="size-5" />}
          tone="teal"
        />
        <StatCard
          label={t("admin.stat.pendingPlans")}
          value={pendingPlans.length}
          icon={<ClipboardList className="size-5" />}
          tone="amber"
        />
        <StatCard
          label={t("admin.stat.avgProgress")}
          value={`${avgProgress}%`}
          icon={<TrendingUp className="size-5" />}
          tone="violet"
        />
        <StatCard
          label={t("admin.stat.compliance")}
          value={`${avgCompliance}%`}
          icon={<CheckCircle2 className="size-5" />}
          tone="teal"
        />
      </div>

      {/* Grid: Center Skill Radar + Children Status Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Center-wide skills radar */}
        <Card className="p-6">
          <CardHeader
            icon={<TrendingUp className="size-5 text-brand-600" />}
            title="متوسط تحسن المهارات عبر المركز"
            subtitle="معدل تقدم الأطفال في مجالات النطق، السلوك، والإدراك"
          />
          <div className="pt-4">
            <SkillsRadar data={domainAverages} height={280} />
          </div>
        </Card>

        {/* Children Status Overview */}
        <Card className="p-6">
          <CardHeader
            icon={<Users className="size-5 text-care-600" />}
            title={t("admin.children.title")}
            action={
              <Link href="/admin/children" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                {t("action.view")}
              </Link>
            }
          />
          <div className="pt-4 divide-y divide-line">
            {allChildren.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size="sm" />
                  <div>
                    <Link
                      href={`/admin/children/${c.id}`}
                      className="font-bold text-sm text-ink hover:text-brand-600 transition-colors"
                    >
                      {c.name}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">{c.diagnosis ?? t(`status.${c.status}`)}</p>
                  </div>
                </div>
                <Badge
                  tone={
                    c.status === "active"
                      ? "green"
                      : c.status === "plan_review"
                      ? "amber"
                      : c.status === "assessment"
                      ? "blue"
                      : "gray"
                  }
                  className="text-xs"
                >
                  {t(`status.${c.status}`)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Center Activity Timeline */}
      <Card className="p-6">
        <CardHeader
          icon={<CalendarDays className="size-5 text-violet-600" />}
          title="نشاط الجلسات العلاجية في المركز"
          subtitle="الجلسات الحضورية وعن بعد المسجلة من الأخصائيين"
        />
        <div className="pt-4 divide-y divide-line">
          {recentSessions.length === 0 ? (
            <EmptyState title={t("common.empty")} />
          ) : (
            recentSessions.map((sess) => {
              const child = childById.get(sess.childId);
              const spec = specById.get(sess.specialistId);
              return (
                <div key={sess.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-ink">
                      {child?.name} · مع {spec?.name} (
                      {spec?.specialty ? t(`specialty.${spec.specialty}`) : t("role.specialist")})
                    </p>
                    <p className="text-xs text-muted">{formatDateTime(sess.startsAt, locale)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={sess.type === "in_person" ? "blue" : "teal"}>
                      {sess.type === "in_person" ? t("common.inPerson") : t("common.online")}
                    </Badge>
                    <Badge tone={sess.status === "done" ? "green" : "gray"}>
                      {sess.status === "done" ? t("action.save") : t("specialist.sessions.upcoming")}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
