import Link from "next/link";
import { and, desc, eq, inArray, isNull, isNotNull } from "drizzle-orm";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileEdit,
  FileText,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  ArrowLeft,
  ArrowRight,
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
  StatCard,
} from "@/components/ui";

export default async function SpecialistDashboardPage() {
  const user = await requireUser("specialist");
  const { t, locale, dir } = await getT();

  // Find assigned children
  const assigns = await db.query.assignments.findMany({
    where: eq(schema.assignments.specialistId, user.id),
  });
  const childIds = assigns.map((a) => a.childId);

  const myChildren = childIds.length
    ? await db.query.children.findMany({
        where: inArray(schema.children.id, childIds),
      })
    : [];

  // 1. Pending clinical reports: children in 'assessment' where I haven't submitted a report yet
  const myReports = await db.query.clinicalReports.findMany({
    where: eq(schema.clinicalReports.specialistId, user.id),
  });
  const reportedChildIds = new Set(myReports.map((r) => r.childId));
  const assessmentChildrenNeeded = myChildren.filter(
    (c) => c.status === "assessment" && !reportedChildIds.has(c.id)
  );

  // 2. Videos pending review for my children
  const pendingVideos = childIds.length
    ? await db.query.submissions.findMany({
        where: and(
          inArray(schema.submissions.childId, childIds),
          isNotNull(schema.submissions.videoUrl),
          isNull(schema.submissions.rating)
        ),
      })
    : [];

  // 3. Plans returned by director for editing
  const returnedPlans = childIds.length
    ? await db.query.plans.findMany({
        where: and(
          inArray(schema.plans.childId, childIds),
          eq(schema.plans.status, "returned_specialist")
        ),
      })
    : [];

  // 4. Sessions this week
  const upcomingSessions = await db.query.sessions.findMany({
    where: and(
      eq(schema.sessions.specialistId, user.id),
      eq(schema.sessions.status, "scheduled")
    ),
    orderBy: desc(schema.sessions.startsAt),
    limit: 5,
  });

  // Calculate progress for each child
  const childrenWithProgress = await Promise.all(
    myChildren.map(async (child) => {
      const prog = await computeProgress(child.id);
      return { child, prog, hasReport: reportedChildIds.has(child.id) };
    })
  );

  const specialtyName = user.specialty ? t(`specialty.${user.specialty}`) : t("role.specialist");

  return (
    <div className="space-y-6">
      {/* Header Greeting Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-care-600 p-6 text-white shadow-pop sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="lg" className="ring-4 ring-white/30 text-xl size-16" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("specialist.greeting", { name: user.name })}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {t("specialist.specialty", { name: specialtyName })}
              </p>
            </div>
          </div>
          <Badge tone="teal" className="bg-white/20 text-white ring-white/30 text-xs px-3.5 py-1.5 backdrop-blur-md">
            {myChildren.length} {t("specialist.stat.myChildren")}
          </Badge>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("specialist.stat.myChildren")}
          value={myChildren.length}
          icon={<Users className="size-5" />}
          tone="blue"
        />
        <StatCard
          label={t("specialist.stat.pendingReports")}
          value={assessmentChildrenNeeded.length}
          icon={<FileEdit className="size-5" />}
          tone="amber"
        />
        <StatCard
          label={t("specialist.stat.pendingReviews")}
          value={pendingVideos.length}
          icon={<Video className="size-5" />}
          tone="rose"
        />
        <StatCard
          label={t("specialist.stat.weekSessions")}
          value={upcomingSessions.length}
          icon={<CalendarDays className="size-5" />}
          tone="teal"
        />
      </div>

      {/* Action Needed Section */}
      <Card className="p-6">
        <CardHeader
          icon={<Clock className="size-5 text-amber-500" />}
          title={t("specialist.actionsNeeded.title")}
        />
        <div className="pt-4">
          {assessmentChildrenNeeded.length === 0 &&
          pendingVideos.length === 0 &&
          returnedPlans.length === 0 ? (
            <div className="flex items-center gap-3 py-4 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 border border-emerald-200">
              <CheckCircle2 className="size-5 shrink-0" />
              <span>{t("specialist.actionsNeeded.empty")}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Reports needed */}
              {assessmentChildrenNeeded.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} size="sm" />
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {t("specialist.actionsNeeded.writeReport", { name: c.name })}
                      </p>
                      <p className="text-xs text-muted">{c.diagnosis ?? t("status.assessment")}</p>
                    </div>
                  </div>
                  <LinkButton href={`/specialist/children/${c.id}?tab=my_report`} size="sm" variant="primary">
                    {t("action.edit")}
                    {dir === "rtl" ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                  </LinkButton>
                </div>
              ))}

              {/* Videos pending review */}
              {pendingVideos.map((v) => {
                const child = myChildren.find((c) => c.id === v.childId);
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                        <Video className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          {t("specialist.actionsNeeded.reviewVideo", {
                            name: child?.name ?? "",
                            task: v.note ?? t("nav.tasks"),
                          })}
                        </p>
                        <p className="text-xs text-muted">{v.date}</p>
                      </div>
                    </div>
                    <LinkButton href="/specialist/reviews" size="sm" variant="secondary">
                      {t("action.view")}
                    </LinkButton>
                  </div>
                );
              })}

              {/* Returned plans */}
              {returnedPlans.map((p) => {
                const child = myChildren.find((c) => c.id === p.childId);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          {t("specialist.actionsNeeded.editPlan", { name: child?.name ?? "" })}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-1">{p.adminNotes}</p>
                      </div>
                    </div>
                    <LinkButton href={`/specialist/plans/${p.id}`} size="sm" variant="primary">
                      {t("action.edit")}
                    </LinkButton>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Grid: My Children Quick Overview + Upcoming Sessions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Children List */}
        <Card className="p-6">
          <CardHeader
            icon={<Users className="size-5 text-brand-600" />}
            title={t("specialist.children.title")}
            action={
              <Link href="/specialist/children" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                {t("action.view")}
              </Link>
            }
          />
          <div className="pt-4 divide-y divide-line">
            {childrenWithProgress.length === 0 ? (
              <EmptyState title={t("common.empty")} />
            ) : (
              childrenWithProgress.slice(0, 5).map(({ child, prog, hasReport }) => (
                <div key={child.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar name={child.name} size="md" />
                    <div>
                      <Link
                        href={`/specialist/children/${child.id}`}
                        className="font-bold text-sm text-ink hover:text-brand-600 transition-colors"
                      >
                        {child.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge tone={child.status === "active" ? "green" : "blue"} className="text-[10px]">
                          {t(`status.${child.status}`)}
                        </Badge>
                        <span className="text-xs text-muted">
                          {t("common.progress")}: {prog.overall}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {hasReport ? (
                      <span className="text-xs text-emerald-600 font-semibold">✓ {t("specialist.children.reportDone")}</span>
                    ) : (
                      <LinkButton href={`/specialist/children/${child.id}?tab=my_report`} size="sm" variant="outline">
                        {t("specialist.children.reportPending")}
                      </LinkButton>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Sessions Schedule Timeline */}
        <Card className="p-6">
          <CardHeader
            icon={<CalendarDays className="size-5 text-care-600" />}
            title={t("specialist.sessions.upcoming")}
            action={
              <Link href="/specialist/sessions" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                {t("action.view")}
              </Link>
            }
          />
          <div className="pt-4 space-y-3">
            {upcomingSessions.length === 0 ? (
              <EmptyState title={t("parent.nextSession.none")} />
            ) : (
              upcomingSessions.map(async (sess) => {
                const child = myChildren.find((c) => c.id === sess.childId);
                return (
                  <div key={sess.id} className="flex items-center justify-between rounded-xl border border-line bg-surface p-3.5">
                    <div>
                      <p className="text-sm font-bold text-ink">{child?.name}</p>
                      <p className="text-xs text-muted mt-0.5">{formatDateTime(sess.startsAt, locale)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={sess.type === "in_person" ? "blue" : "teal"}>
                        {sess.type === "in_person" ? t("common.inPerson") : t("common.online")}
                      </Badge>
                      <span className="text-xs text-slate-500">{sess.durationMin} {t("common.minutes")}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
