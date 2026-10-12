import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import {
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Sparkles,
  Star,
  TrendingUp,
  Video,
  FileQuestion,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { db, schema } from "@/db";
import { getParentContext } from "@/lib/parent";
import { getT } from "@/i18n/server";
import { computeProgress } from "@/lib/progress";
import { ageYears, dateKey, formatDateTime, planWeek } from "@/lib/utils";
import {
  Avatar,
  Badge,
  Card,
  CardHeader,
  EmptyState,
  LinkButton,
  ProgressRing,
} from "@/components/ui";

export default async function ParentDashboardPage() {
  const { user, activeChild } = await getParentContext();
  const { t, locale, dir } = await getT();

  if (!activeChild) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-10" />}
        title={t("parent.noChildren")}
      />
    );
  }

  const age = ageYears(activeChild.birthDate);
  const status = activeChild.status;
  const today = dateKey();

  // Progress & Active plan
  const progress = await computeProgress(activeChild.id);
  const currentWeek = progress.plan ? planWeek(progress.plan.startDate) : 1;

  // Today's tasks count
  let todayTasksCount = 0;
  let doneTodayCount = 0;
  if (progress.plan) {
    const tasks = await db.query.planTasks.findMany({
      where: and(
        eq(schema.planTasks.planId, progress.plan.id),
        eq(schema.planTasks.week, currentWeek)
      ),
    });
    todayTasksCount = tasks.length;
    if (tasks.length > 0) {
      const subs = await db.query.submissions.findMany({
        where: and(
          eq(schema.submissions.childId, activeChild.id),
          eq(schema.submissions.date, today)
        ),
      });
      const doneTaskIds = new Set(subs.map((s) => s.taskId));
      doneTodayCount = tasks.filter((t) => doneTaskIds.has(t.id)).length;
    }
  }

  // Next session
  const nextSession = await db.query.sessions.findFirst({
    where: and(
      eq(schema.sessions.childId, activeChild.id),
      eq(schema.sessions.status, "scheduled")
    ),
    orderBy: desc(schema.sessions.startsAt),
  });
  let nextSpecialist = null;
  if (nextSession) {
    nextSpecialist = await db.query.users.findFirst({
      where: eq(schema.users.id, nextSession.specialistId),
    });
  }

  // Latest feedback
  const latestEvaluation = await db.query.submissions.findFirst({
    where: and(
      eq(schema.submissions.childId, activeChild.id),
      eq(schema.submissions.rating, 5) // or any evaluated
    ),
    orderBy: desc(schema.submissions.evaluatedAt),
  });

  // Recent notifications
  const recentNotifications = await db.query.notifications.findMany({
    where: eq(schema.notifications.userId, user.id),
    orderBy: desc(schema.notifications.createdAt),
    limit: 2,
  });

  return (
    <div className="space-y-6">
      {/* Welcome & Child Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-care-600 p-6 text-white shadow-pop sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={activeChild.name} size="lg" className="ring-4 ring-white/30 text-xl size-16" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("parent.greeting", { name: user.name.split(" ")[0] })}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {activeChild.name} · {t("parent.childAge", { age })}
              </p>
            </div>
          </div>
          <div>
            <Badge
              tone="teal"
              className="bg-white/20 text-white ring-white/30 text-sm px-3.5 py-1.5 backdrop-blur-md"
            >
              {t(`status.${status}`)}
            </Badge>
          </div>
        </div>

        {/* Stepper of rehabilitation roadmap */}
        <div className="mt-8 border-t border-white/20 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {t("parent.stepper.title")}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { key: "new", label: t("parent.step.questionnaire"), href: "/parent/questionnaire" },
              { key: "assessment", label: t("parent.step.assessment"), href: "/parent/progress" },
              { key: "plan_review", label: t("parent.step.planReview"), href: "/parent/progress" },
              { key: "active", label: t("parent.step.active"), href: "/parent/tasks" },
            ].map((step, idx) => {
              const order = ["new", "assessment", "plan_review", "active"];
              const currIdx = order.indexOf(status);
              const isPast = currIdx > idx;
              const isCurrent = currIdx === idx;

              return (
                <Link
                  key={step.key}
                  href={step.href}
                  className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <div
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isPast
                        ? "bg-emerald-400 text-slate-900"
                        : isCurrent
                        ? "bg-white text-brand-700 ring-4 ring-white/30 shadow-md"
                        : "bg-white/20 text-white/70 group-hover:bg-white/30"
                    }`}
                  >
                    {isPast ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`font-medium line-clamp-1 ${
                      isCurrent ? "text-white font-bold" : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {step.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Questionnaire Shortcut Card */}
      <Card className="border-brand-200 bg-white p-4 sm:p-5 shadow-card transition-all hover:shadow-pop">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FileQuestion className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-ink">{t("parent.q.title")}</h4>
                {status === "new" ? (
                  <Badge tone="amber" className="text-[10px]">مطلوب التعبئة</Badge>
                ) : (
                  <Badge tone="green" className="text-[10px]">مكتمل ✓</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {status === "new"
                  ? "يرجى تعبئة الاستبيان ليقوم الذكاء الاصطناعي بتحليله وتجهيز التقرير الأولي."
                  : "تم تسجيل إجابات الاستبيان النمائي للطفل، يمكنك عرضها أو إعادة تحديثها بأي وقت."}
              </p>
            </div>
          </div>
          <LinkButton
            href="/parent/questionnaire"
            size="sm"
            variant={status === "new" ? "primary" : "outline"}
            className="shrink-0"
          >
            {status === "new" ? t("parent.statusNew.cta") : "عرض / تعبئة الاستبيان"}
          </LinkButton>
        </div>
      </Card>

      {/* Dynamic CTA Card based on current stage */}
      {status === "new" && (
        <Card className="border-brand-200 bg-brand-50/60 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
                <FileQuestion className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">
                  {t("parent.statusNew.title", { name: activeChild.name.split(" ")[0] })}
                </h3>
                <p className="mt-1 text-sm text-slate-600 max-w-xl">
                  {t("parent.statusNew.desc")}
                </p>
              </div>
            </div>
            <LinkButton href="/parent/questionnaire" size="lg">
              {t("parent.statusNew.cta")}
              {dir === "rtl" ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            </LinkButton>
          </div>
        </Card>
      )}

      {status === "assessment" && (
        <Card className="border-care-200 bg-care-50/60 p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-care-600 text-white shadow-sm">
              <Clock className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                {t("parent.statusAssessment.title")}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {t("parent.statusAssessment.desc")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {status === "plan_review" && (
        <Card className="border-amber-200 bg-amber-50/60 p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
              <Clock className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                {t("parent.statusReview.title")}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {t("parent.statusReview.desc")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Grid: Main Widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Tasks Summary */}
        <Card className="flex flex-col">
          <CardHeader
            icon={<ListChecks className="size-5 text-brand-600" />}
            title={t("parent.todayTasks.title")}
            action={
              <Link
                href="/parent/tasks"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                {t("parent.todayTasks.viewAll")}
              </Link>
            }
          />
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            {todayTasksCount === 0 ? (
              <p className="text-sm text-muted">{t("common.empty")}</p>
            ) : doneTodayCount === todayTasksCount ? (
              <div className="space-y-2">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="size-8" />
                </div>
                <p className="font-semibold text-ink">{t("parent.todayTasks.allDone")}</p>
                <p className="text-xs text-muted">
                  {doneTodayCount} / {todayTasksCount} {t("common.today")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ProgressRing
                  value={(doneTodayCount / todayTasksCount) * 100}
                  size={100}
                  stroke={10}
                  color="#1565d8"
                />
                <p className="text-sm font-semibold text-ink">
                  {t("parent.todayTasks.pendingCount", {
                    count: todayTasksCount - doneTodayCount,
                  })}
                </p>
                <LinkButton href="/parent/tasks" size="sm" variant="secondary">
                  {t("parent.todayTasks.viewAll")}
                </LinkButton>
              </div>
            )}
          </div>
        </Card>

        {/* Progress Overview Card */}
        <Card className="flex flex-col">
          <CardHeader
            icon={<TrendingUp className="size-5 text-care-600" />}
            title={t("common.overall")}
            action={
              <Link
                href="/parent/progress"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                {t("action.view")}
              </Link>
            }
          />
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <ProgressRing
              value={progress.overall}
              size={100}
              stroke={10}
              color="#0ea5a4"
              label={t("parent.tasks.week", { week: currentWeek })}
            />
            <div className="mt-4 grid grid-cols-2 gap-4 w-full border-t border-line pt-3 text-xs">
              <div>
                <p className="text-muted">{t("parent.progress.complianceRate")}</p>
                <p className="text-base font-bold text-ink">{progress.compliance}%</p>
              </div>
              <div>
                <p className="text-muted">{t("parent.progress.overallScore")}</p>
                <p className="text-base font-bold text-ink">{progress.overall}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Session */}
        <Card className="flex flex-col">
          <CardHeader
            icon={<CalendarDays className="size-5 text-violet-600" />}
            title={t("parent.nextSession.title")}
          />
          <div className="flex flex-1 flex-col justify-center p-6">
            {nextSession ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-line bg-surface p-3.5">
                  <p className="text-sm font-semibold text-ink">
                    {formatDateTime(nextSession.startsAt, locale)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {nextSpecialist?.name} (
                    {nextSpecialist?.specialty
                      ? t(`specialty.${nextSpecialist.specialty}`)
                      : t("role.specialist")}
                    )
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{t("common.time")}: {nextSession.durationMin} {t("common.minutes")}</span>
                  <Badge tone={nextSession.type === "in_person" ? "blue" : "teal"}>
                    {nextSession.type === "in_person" ? t("common.inPerson") : t("common.online")}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-muted">
                {t("parent.nextSession.none")}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Row 2: AI Chat CTA + Latest Feedback */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Assistant Promo Banner */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-brand-950 p-6 text-white shadow-card">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-care-500 text-white">
                  <Sparkles className="size-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-care-300">
                  {t("common.ai")}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold">
                {t("parent.aiChatCard.title")}
              </h3>
              <p className="mt-2 text-sm text-slate-300 max-w-md leading-relaxed">
                {t("parent.aiChatCard.desc")}
              </p>
            </div>
            <div className="mt-6">
              <LinkButton href="/parent/chat" variant="care" size="md">
                {t("parent.aiChatCard.cta")}
                {dir === "rtl" ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
              </LinkButton>
            </div>
          </div>
        </Card>

        {/* Latest Specialist Feedback */}
        <Card>
          <CardHeader
            icon={<Star className="size-5 text-amber-500" />}
            title={t("parent.latestFeedback.title")}
          />
          <div className="p-6">
            {latestEvaluation ? (
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < (latestEvaluation.rating ?? 0)
                          ? "fill-current"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                  <span className="ms-2 text-xs font-bold text-slate-700">
                    {latestEvaluation.rating} / 5
                  </span>
                </div>
                {latestEvaluation.feedback && (
                  <p className="rounded-xl border border-line bg-surface p-3 text-sm italic text-slate-700">
                    &ldquo;{latestEvaluation.feedback}&rdquo;
                  </p>
                )}
                {latestEvaluation.videoUrl && (
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <Video className="size-3.5" />
                    <span>{t("parent.tasks.videoUploaded")}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted py-4">
                {t("parent.latestFeedback.none")}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
