import Link from "next/link";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { Video } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { EmptyState, PageHeader } from "@/components/ui";
import { ReviewCard } from "@/components/specialist/review-card";

export default async function SpecialistReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser("specialist");
  const { tab = "pending" } = await searchParams;
  const { t } = await getT();

  const assigns = await db.query.assignments.findMany({
    where: eq(schema.assignments.specialistId, user.id),
  });
  const childIds = assigns.map((a) => a.childId);

  const myChildren = childIds.length
    ? await db.query.children.findMany({
        where: inArray(schema.children.id, childIds),
      })
    : [];
  const childById = new Map(myChildren.map((c) => [c.id, c]));

  // Query submissions with videos
  const allSubmissions = childIds.length
    ? await db.query.submissions.findMany({
        where: and(
          inArray(schema.submissions.childId, childIds),
          isNotNull(schema.submissions.videoUrl)
        ),
        orderBy: desc(schema.submissions.createdAt),
      })
    : [];

  const pendingSubs = allSubmissions.filter((s) => s.rating == null);
  const reviewedSubs = allSubmissions.filter((s) => s.rating != null);

  const currentList = tab === "reviewed" ? reviewedSubs : pendingSubs;

  // Fetch tasks
  const taskIds = Array.from(new Set(currentList.map((s) => s.taskId)));
  const tasks = taskIds.length
    ? await db.query.planTasks.findMany({
        where: inArray(schema.planTasks.id, taskIds),
      })
    : [];
  const taskById = new Map(tasks.map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("specialist.reviews.title")}
        subtitle={t("specialist.reviews.subtitle")}
      />

      {/* Tabs */}
      <div className="flex border-b border-line gap-4">
        <Link
          href="/specialist/reviews?tab=pending"
          className={`border-b-2 pb-3 text-sm font-semibold transition-all ${
            tab !== "reviewed"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-ink"
          }`}
        >
          {t("specialist.reviews.pendingTab", { count: pendingSubs.length })}
        </Link>
        <Link
          href="/specialist/reviews?tab=reviewed"
          className={`border-b-2 pb-3 text-sm font-semibold transition-all ${
            tab === "reviewed"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-ink"
          }`}
        >
          {t("specialist.reviews.completedTab")} ({reviewedSubs.length})
        </Link>
      </div>

      {currentList.length === 0 ? (
        <EmptyState
          icon={<Video className="size-10" />}
          title={t("common.empty")}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {currentList.map((sub) => (
            <ReviewCard
              key={sub.id}
              submission={sub}
              child={childById.get(sub.childId) ?? null}
              task={taskById.get(sub.taskId) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
