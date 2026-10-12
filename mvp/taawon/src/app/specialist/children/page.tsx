import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { Users, FileEdit, CheckCircle2 } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { computeProgress } from "@/lib/progress";
import { ageYears } from "@/lib/utils";
import { Avatar, Badge, Card, EmptyState, LinkButton, PageHeader, ProgressBar } from "@/components/ui";

export default async function SpecialistChildrenPage() {
  const user = await requireUser("specialist");
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

  const myReports = await db.query.clinicalReports.findMany({
    where: eq(schema.clinicalReports.specialistId, user.id),
  });
  const reportedChildIds = new Set(myReports.map((r) => r.childId));

  const childrenData = await Promise.all(
    myChildren.map(async (child) => {
      const prog = await computeProgress(child.id);
      return {
        child,
        prog,
        age: ageYears(child.birthDate),
        hasReport: reportedChildIds.has(child.id),
      };
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("specialist.children.title")}
        subtitle={t("specialist.children.subtitle")}
      />

      {childrenData.length === 0 ? (
        <EmptyState
          icon={<Users className="size-10" />}
          title={t("common.empty")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {childrenData.map(({ child, prog, age, hasReport }) => (
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
                    </div>
                  </div>
                  <Badge tone={child.status === "active" ? "green" : "blue"}>
                    {t(`status.${child.status}`)}
                  </Badge>
                </div>

                {child.diagnosis && (
                  <p className="text-xs text-slate-600 bg-surface rounded-lg p-2.5 line-clamp-2">
                    {child.diagnosis}
                  </p>
                )}

                <div className="space-y-1.5 border-t border-line pt-3">
                  <div className="flex justify-between text-xs text-muted">
                    <span>{t("common.progress")}</span>
                    <span className="font-bold text-ink">{prog.overall}%</span>
                  </div>
                  <ProgressBar value={prog.overall} tone="brand" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
                {hasReport ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="size-3.5" />
                    {t("specialist.children.reportDone")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                    <FileEdit className="size-3.5" />
                    {t("specialist.children.reportPending")}
                  </span>
                )}
                <LinkButton href={`/specialist/children/${child.id}`} size="sm" variant="outline">
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
