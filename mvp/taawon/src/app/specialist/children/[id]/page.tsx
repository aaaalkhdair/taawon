import { notFound } from "next/navigation";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import {
  FileText,
  HelpCircle,
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
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { AiSummaryButton } from "@/components/child/ai-summary";
import { InitialReportCard, PlanView } from "@/components/child/plan-view";
import { ProgressTrendChart, SkillsRadar } from "@/components/child/charts";
import { ReportEditor } from "@/components/specialist/report-editor";

export default async function SpecialistChildProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser("specialist");
  const { id: childId } = await params;
  const { tab = "overview" } = await searchParams;
  const { t, locale } = await getT();

  // Verify assignment
  const assignment = await db.query.assignments.findFirst({
    where: and(
      eq(schema.assignments.specialistId, user.id),
      eq(schema.assignments.childId, childId)
    ),
  });
  if (!assignment) notFound();

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

  // Questionnaire responses
  const qResponse = await db.query.questionnaireResponses.findFirst({
    where: eq(schema.questionnaireResponses.childId, childId),
    orderBy: desc(schema.questionnaireResponses.createdAt),
  });
  const allQuestions = await db.query.questions.findMany({
    orderBy: (q, { asc }) => [asc(q.order)],
  });
  const answersMap: Record<string, string> = qResponse
    ? JSON.parse(qResponse.answers)
    : {};

  // Clinical reports
  const allClinicalReports = await db.query.clinicalReports.findMany({
    where: eq(schema.clinicalReports.childId, childId),
  });
  const myClinicalReport = allClinicalReports.find((r) => r.specialistId === user.id);
  const teamClinicalReports = allClinicalReports.filter((r) => r.specialistId !== user.id);

  // Specialist assignments for team
  const allAssignments = await db.query.assignments.findMany({
    where: eq(schema.assignments.childId, childId),
  });
  const teamSpecialists = allAssignments.length
    ? await db.query.users.findMany({
        where: (u, { inArray }) =>
          inArray(
            u.id,
            allAssignments.map((a) => a.specialistId)
          ),
      })
    : [];

  const tabs = [
    { key: "overview", label: t("specialist.child.tabOverview"), icon: TrendingUp },
    { key: "initial", label: t("specialist.child.tabInitial"), icon: FileText },
    { key: "questionnaire", label: t("specialist.child.tabQuestionnaire"), icon: HelpCircle },
    { key: "my_report", label: t("specialist.child.tabMyReport"), icon: Stethoscope },
    { key: "team_reports", label: t("specialist.child.tabTeamReports"), icon: Users },
    { key: "plan", label: t("specialist.child.tabPlan"), icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back link */}
      <div>
        <Link
          href="/specialist/children"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-600 transition-colors"
        >
          <ArrowRight className="size-3.5 rtl-flip" />
          <span>{t("specialist.children.title")}</span>
        </Link>
      </div>

      {/* Child Header Card */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={child.name} size="lg" className="size-16 text-xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-ink">{child.name}</h1>
                <Badge tone={child.status === "active" ? "green" : "blue"}>
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

          <div className="flex items-center gap-2">
            <AiSummaryButton childId={child.id} />
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-line overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tb) => {
          const isActive = tab === tb.key;
          const Icon = tb.icon;
          return (
            <Link
              key={tb.key}
              href={`/specialist/children/${child.id}?tab=${tb.key}`}
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

      {tab === "questionnaire" && (
        <Card className="p-6">
          {qResponse ? (
            <div className="space-y-4 divide-y divide-line">
              {allQuestions
                .filter((q) => answersMap[q.id])
                .map((q, idx) => (
                  <div key={q.id} className={idx > 0 ? "pt-4" : ""}>
                    <p className="text-xs font-semibold text-muted">
                      {idx + 1}. {locale === "ar" ? q.textAr : q.textEn}
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink">
                      {answersMap[q.id]}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={<HelpCircle className="size-10" />}
              title={t("common.empty")}
            />
          )}
        </Card>
      )}

      {tab === "my_report" && (
        <ReportEditor
          childId={child.id}
          initialContent={myClinicalReport?.content ?? ""}
        />
      )}

      {tab === "team_reports" && (
        <div className="space-y-4">
          {teamSpecialists
            .filter((s) => s.id !== user.id)
            .map((spec) => {
              const rep = teamClinicalReports.find((r) => r.specialistId === spec.id);
              return (
                <Card key={spec.id} className="p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={spec.name} size="sm" />
                      <div>
                        <p className="font-bold text-sm text-ink">{spec.name}</p>
                        <p className="text-xs text-muted">
                          {spec.specialty ? t(`specialty.${spec.specialty}`) : t("role.specialist")}
                        </p>
                      </div>
                    </div>
                    <Badge tone={rep ? "green" : "amber"}>
                      {rep ? t("specialist.children.reportDone") : t("specialist.children.reportPending")}
                    </Badge>
                  </div>

                  {rep ? (
                    <div className="whitespace-pre-line text-sm text-slate-700 leading-relaxed pt-2">
                      {rep.content}
                    </div>
                  ) : (
                    <p className="text-xs text-muted py-2">{t("common.empty")}</p>
                  )}
                </Card>
              );
            })}
        </div>
      )}

      {tab === "plan" && (
        <div>
          {prog.plan ? (
            <PlanView
              content={prog.plan.content}
              t={t}
              currentWeek={currentWeek}
            />
          ) : (
            <EmptyState
              icon={<Target className="size-10" />}
              title={t("common.empty")}
              text={t("status.plan_review")}
            />
          )}
        </div>
      )}
    </div>
  );
}
