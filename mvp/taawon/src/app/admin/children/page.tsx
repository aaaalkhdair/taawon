import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { Users, Plus, Stethoscope } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { computeProgress } from "@/lib/progress";
import { ageYears } from "@/lib/utils";
import type { ChildStatus } from "@/db/schema";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  LinkButton,
  PageHeader,
  ProgressBar,
} from "@/components/ui";

export default async function AdminChildrenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser("admin");
  const { status: filterStatus } = await searchParams;
  const { t } = await getT();

  const allChildren = await db.query.children.findMany({
    where: filterStatus ? eq(schema.children.status, filterStatus as ChildStatus) : undefined,
    orderBy: desc(schema.children.createdAt),
  });

  const allParents = await db.query.users.findMany({
    where: eq(schema.users.role, "parent"),
  });
  const parentById = new Map(allParents.map((p) => [p.id, p]));

  // Get assignments
  const allAssignments = await db.query.assignments.findMany();
  const allSpecialists = await db.query.users.findMany({
    where: eq(schema.users.role, "specialist"),
  });
  const specById = new Map(allSpecialists.map((s) => [s.id, s]));

  const childrenData = await Promise.all(
    allChildren.map(async (child) => {
      const prog = await computeProgress(child.id);
      const childAssigns = allAssignments.filter((a) => a.childId === child.id);
      const assignedSpecs = childAssigns.map((a) => specById.get(a.specialistId)).filter(Boolean);
      return {
        child,
        prog,
        age: ageYears(child.birthDate),
        parent: parentById.get(child.parentId),
        assignedSpecs,
      };
    })
  );

  const filters = [
    { key: "", label: t("admin.children.filterAll") },
    { key: "new", label: t("status.new") },
    { key: "assessment", label: t("status.assessment") },
    { key: "plan_review", label: t("status.plan_review") },
    { key: "active", label: t("status.active") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.children.title")}
        subtitle={t("admin.children.subtitle")}
        action={
          <LinkButton href="/admin/children/new" size="md">
            <Plus className="size-4" />
            <span>{t("admin.children.newBtn")}</span>
          </LinkButton>
        }
      />

      {/* Filter Tabs */}
      <div className="flex border-b border-line gap-2 overflow-x-auto scrollbar-none pb-1">
        {filters.map((f) => {
          const isSelected = (filterStatus ?? "") === f.key;
          return (
            <Link
              key={f.key}
              href={f.key ? `/admin/children?status=${f.key}` : "/admin/children"}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-line"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {childrenData.length === 0 ? (
        <EmptyState
          icon={<Users className="size-10" />}
          title={t("common.empty")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {childrenData.map(({ child, prog, age, parent, assignedSpecs }) => (
            <Card key={child.id} className="flex flex-col justify-between p-5 hover:shadow-pop transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={child.name} size="lg" />
                    <div>
                      <h3 className="font-bold text-ink text-base">{child.name}</h3>
                      <p className="text-xs text-muted">
                        {age} {t("common.years")} · {child.gender === "male" ? t("common.male") : t("common.female")}
                      </p>
                      {parent && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {t("admin.children.parent", { name: parent.name })}
                        </p>
                      )}
                    </div>
                  </div>
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

                {child.diagnosis && (
                  <p className="text-xs text-slate-600 bg-surface rounded-lg p-2.5 line-clamp-2">
                    {child.diagnosis}
                  </p>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5 border-t border-line pt-3">
                  <div className="flex justify-between text-xs text-muted">
                    <span>{t("common.progress")}</span>
                    <span className="font-bold text-ink">{prog.overall}%</span>
                  </div>
                  <ProgressBar value={prog.overall} tone="brand" />
                </div>

                {/* Assigned specialists avatars */}
                <div className="flex items-center justify-between text-xs text-muted pt-1">
                  <span>{t("admin.children.teamAssigned", { count: assignedSpecs.length })}</span>
                  <div className="flex -space-x-1.5 rtl:space-x-reverse">
                    {assignedSpecs.slice(0, 3).map((spec) => (
                      <Avatar
                        key={spec!.id}
                        name={spec!.name}
                        size="sm"
                        className="size-6 text-[10px] ring-2 ring-white"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-3 flex justify-end">
                <LinkButton href={`/admin/children/${child.id}`} size="sm" variant="outline">
                  {t("action.view")}
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
