import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { Stethoscope, Users, Video } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { AddSpecialistModal } from "@/components/admin/add-specialist-modal";

export default async function AdminSpecialistsPage() {
  await requireUser("admin");
  const { t } = await getT();

  const specialists = await db.query.users.findMany({
    where: eq(schema.users.role, "specialist"),
    orderBy: desc(schema.users.createdAt),
  });

  const allAssignments = await db.query.assignments.findMany();
  const allSubmissions = await db.query.submissions.findMany({
    where: and(isNotNull(schema.submissions.videoUrl), isNull(schema.submissions.rating)),
  });

  // Calculate stats per specialist
  const specData = specialists.map((spec) => {
    const assignedChildIds = allAssignments
      .filter((a) => a.specialistId === spec.id)
      .map((a) => a.childId);
    const pendingReviewsCount = allSubmissions.filter((s) =>
      assignedChildIds.includes(s.childId)
    ).length;

    return {
      spec,
      childrenCount: assignedChildIds.length,
      pendingReviewsCount,
    };
  });

  // Registered parents list
  const parents = await db.query.users.findMany({
    where: eq(schema.users.role, "parent"),
    orderBy: desc(schema.users.createdAt),
  });
  const allChildren = await db.query.children.findMany();

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("admin.specialists.title")}
        subtitle={t("admin.specialists.subtitle")}
        action={<AddSpecialistModal />}
      />

      {/* Specialists Directory */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specData.map(({ spec, childrenCount, pendingReviewsCount }) => (
          <Card key={spec.id} className="p-5 space-y-4 hover:shadow-pop transition-all">
            <div className="flex items-center gap-3">
              <Avatar name={spec.name} size="lg" />
              <div>
                <h3 className="font-bold text-base text-ink">{spec.name}</h3>
                <p className="text-xs text-muted">{spec.email}</p>
                <div className="mt-1">
                  <Badge tone="blue">
                    {spec.specialty ? t(`specialty.${spec.specialty}`) : t("role.specialist")}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs">
              <div className="rounded-xl bg-surface p-2.5 text-center">
                <p className="text-muted">{t("specialist.stat.myChildren")}</p>
                <p className="text-base font-bold text-ink mt-0.5">{childrenCount}</p>
              </div>
              <div className="rounded-xl bg-surface p-2.5 text-center">
                <p className="text-muted">{t("specialist.stat.pendingReviews")}</p>
                <p className="text-base font-bold text-amber-600 mt-0.5">{pendingReviewsCount}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Parents Section */}
      <div className="space-y-4 border-t border-line pt-8">
        <div>
          <h2 className="text-lg font-bold text-ink">{t("admin.specialists.parentsSection")}</h2>
          <p className="text-xs text-muted">قائمة أولياء الأمور وحساباتهم والأطفال التابعين لهم</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parents.map((p) => {
            const pChildren = allChildren.filter((c) => c.parentId === p.id);
            return (
              <Card key={p.id} className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-ink">{p.name}</h4>
                    <p className="text-xs text-muted">{p.phone ?? p.email}</p>
                  </div>
                </div>

                <div className="border-t border-line pt-2">
                  <p className="text-[11px] font-semibold text-muted mb-1.5">الأبناء المسجلون:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pChildren.map((c) => (
                      <Badge key={c.id} tone="gray" className="text-xs">
                        {c.name} ({t(`status.${c.status}`)})
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
