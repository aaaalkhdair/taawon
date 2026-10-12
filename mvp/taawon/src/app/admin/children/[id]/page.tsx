import { notFound } from "next/navigation";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import {
  FileText,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
} from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { computeProgress } from "@/lib/progress";
import { ageYears, planWeek } from "@/lib/utils";
import { Avatar, Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { AiSummaryButton } from "@/components/child/ai-summary";
import { InitialReportCard, PlanView } from "@/components/child/plan-view";
import { ProgressTrendChart, SkillsRadar } from "@/components/child/charts";
import { SubmitButton } from "@/components/submit-button";
import {
  generatePlanAction,
  updateChildAssignmentsAction,
} from "@/app/admin/actions";

export default async function AdminChildProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireUser("admin");
  const { id: childId } = await params;
  const { tab = "overview" } = await searchParams;
  const { t } = await getT();

  const child = await db.query.children.findFirst({
    where: eq(schema.children.id, childId),
  });
  if (!child) notFound();

  const parent = await db.query.users.findFirst({
    where: eq(schema.users.id, child.parentId),
  });

  const age = ageYears(child.birthDate);
  const prog = await computeProgress(child.id);
  const currentWeek = prog.plan ? planWeek(prog.plan.startDate) : 1;

  // Initial report
  const initialReport = await db.query.initialReports.findFirst({
    where: eq(schema.initialReports.childId, childId),
    orderBy: desc(schema.initialReports.createdAt),
  });

  // Clinical reports
  const clinicalReports = await db.query.clinicalReports.findMany({
    where: eq(schema.clinicalReports.childId, childId),
  });

  // Specialists & Assignments
  const allSpecialists = await db.query.users.findMany({
    where: eq(schema.users.role, "specialist"),
  });
  const assignments = await db.query.assignments.findMany({
    where: eq(schema.assignments.childId, childId),
  });
  const assignedSpecialistIds = new Set(assignments.map((a) => a.specialistId));

  // Latest plan
  const latestPlan = await db.query.plans.findFirst({
    where: eq(schema.plans.childId, childId),
    orderBy: desc(schema.plans.createdAt),
  });

  const tabs = [
    { key: "overview", label: t("specialist.child.tabOverview"), icon: TrendingUp },
    { key: "initial", label: t("specialist.child.tabInitial"), icon: FileText },
    { key: "clinical", label: "التقارير السريرية", icon: Stethoscope },
    { key: "plan", label: t("specialist.child.tabPlan"), icon: Target },
    { key: "team", label: t("admin.child.tabTeam"), icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/children"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-600 transition-colors"
        >
          <ArrowRight className="size-3.5 rtl-flip" />
          <span>{t("admin.children.title")}</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={child.name} size="lg" className="size-16 text-xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-ink">{child.name}</h1>
                <Badge
                  tone={
                    child.status === "active"
                      ? "green"
                      : child.status === "plan_review"
                      ? "amber"
                      : child.status === "assessment"
                      ? "blue"
                      : "gray"
                  }
                >
                  {t(`status.${child.status}`)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted">
                {age} {t("common.years")} · {child.gender === "male" ? t("common.male") : t("common.female")}
                {child.diagnosis && ` · ${child.diagnosis}`}
              </p>
              {parent && (
                <p className="mt-1 text-xs text-slate-600">
                  {t("role.parent")}: {parent.name} ({parent.phone ?? parent.email})
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AiSummaryButton childId={child.id} />

            {/* If in assessment or has clinical reports, show trigger plan button */}
            {child.status !== "active" && (
              <form action={generatePlanAction.bind(null, child.id)}>
                <SubmitButton variant="primary" size="md" className="gap-2">
                  <Sparkles className="size-4" />
                  <span>{t("admin.child.generatePlanBtn")}</span>
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-line overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tb) => {
          const isActive = tab === tb.key;
          const Icon = tb.icon;
          return (
            <Link
              key={tb.key}
              href={`/admin/children/${child.id}?tab=${tb.key}`}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-ink hover:border-slate-300"
              }`}
            >
              <Icon className="size-4" />
              <span>{tb.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-bold text-ink mb-4">{t("parent.progress.trendTitle")}</h3>
              <ProgressTrendChart data={prog.weekly} height={260} />
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-ink mb-4">{t("parent.progress.radarTitle")}</h3>
              <SkillsRadar data={prog.byDomain} height={260} />
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold text-ink mb-4">{t("common.progress")}</h3>
            <div className="grid gap-4 sm:grid-cols-4">
              {prog.byDomain.map((d) => (
                <div key={d.domain} className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-xs text-muted font-medium">{t(`domain.${d.domain}`)}</p>
                  <p className="mt-2 text-2xl font-bold text-ink">{d.value}%</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {d.rating != null ? `${t("common.rating")}: ${d.rating}%` : t("common.compliance")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "initial" && (
        <div>
          {initialReport ? (
            <InitialReportCard
              content={initialReport.content}
              t={t}
              title={t("report.initialTitle")}
              aiLabel={t("common.ai")}
            />
          ) : (
            <EmptyState
              icon={<FileText className="size-10" />}
              title={t("common.empty")}
              text={t("parent.statusNew.desc")}
            />
          )}
        </div>
      )}

      {tab === "clinical" && (
        <div className="space-y-4">
          {clinicalReports.length === 0 ? (
            <EmptyState
              icon={<Stethoscope className="size-10" />}
              title="لا توجد تقارير سريرية بعد"
              text="يقوم الأخصائيون المعينون بإجراء الفحوصات وكتابة تقاريرهم التخصصية."
            />
          ) : (
            clinicalReports.map((rep) => {
              const spec = allSpecialists.find((s) => s.id === rep.specialistId);
              return (
                <Card key={rep.id} className="p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={spec?.name ?? ""} size="sm" />
                      <div>
                        <p className="font-bold text-sm text-ink">{spec?.name}</p>
                        <p className="text-xs text-muted">
                          {spec?.specialty ? t(`specialty.${spec.specialty}`) : t("role.specialist")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="whitespace-pre-line text-sm text-slate-700 leading-relaxed pt-2">
                    {rep.content}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "plan" && (
        <div>
          {latestPlan ? (
            <div className="space-y-4">
              {latestPlan.status === "pending" && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-center justify-between">
                  <div className="text-xs text-amber-900 font-bold">
                    ⚠️ {t("plan.status.pending")} ({t("admin.plans.version", { ver: latestPlan.version })})
                  </div>
                  <Link
                    href={`/admin/plans/${latestPlan.id}`}
                    className="text-xs font-bold text-brand-700 underline"
                  >
                    الانتقال لشاشة الاعتماد والملاحظات ←
                  </Link>
                </div>
              )}
              <PlanView
                content={latestPlan.content}
                t={t}
                currentWeek={currentWeek}
              />
            </div>
          ) : (
            <EmptyState
              icon={<Target className="size-10" />}
              title={t("common.empty")}
              text={t("admin.child.generatePlanHint")}
            />
          )}
        </div>
      )}

      {tab === "team" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-ink">{t("admin.child.tabTeam")}</h3>
          <p className="text-xs text-muted">
            قم بتحديد أو تحديث الأخصائيين المسندين لمتابعة الطفل:
          </p>

          <form
            action={async (formData) => {
              "use server";
              const sIds = formData.getAll("specialistIds").map(String);
              await updateChildAssignmentsAction(child.id, sIds);
            }}
            className="space-y-4"
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              {allSpecialists.map((spec) => (
                <label
                  key={spec.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 hover:bg-brand-50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="specialistIds"
                    value={spec.id}
                    defaultChecked={assignedSpecialistIds.has(spec.id)}
                    className="size-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <p className="font-bold text-xs text-ink">{spec.name}</p>
                    <p className="text-[11px] text-muted">
                      {spec.specialty ? t(`specialty.${spec.specialty}`) : t("role.specialist")}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <SubmitButton>{t("admin.child.updateTeamBtn")}</SubmitButton>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
