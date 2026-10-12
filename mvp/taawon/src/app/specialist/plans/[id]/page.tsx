import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { PageHeader } from "@/components/ui";
import { PlanView } from "@/components/child/plan-view";
import { SpecialistPlanEditor } from "@/components/specialist/plan-editor";

export default async function SpecialistPlanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("specialist");
  const { id: planId } = await params;
  const { t } = await getT();

  const plan = await db.query.plans.findFirst({
    where: eq(schema.plans.id, planId),
  });
  if (!plan) notFound();

  // Verify specialist assigned to this child
  const assignment = await db.query.assignments.findFirst({
    where: and(
      eq(schema.assignments.specialistId, user.id),
      eq(schema.assignments.childId, plan.childId)
    ),
  });
  if (!assignment) notFound();

  const child = await db.query.children.findFirst({
    where: eq(schema.children.id, plan.childId),
  });

  const isEditable = plan.status === "returned_specialist";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/specialist/children/${plan.childId}?tab=plan`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-600 transition-colors"
        >
          <ArrowRight className="size-3.5 rtl-flip" />
          <span>{child?.name}</span>
        </Link>
      </div>

      <PageHeader
        title={t("specialist.planEdit.title")}
        subtitle={`${child?.name} · ${t("common.week")} 1-12`}
      />

      {isEditable ? (
        <SpecialistPlanEditor plan={plan} childName={child?.name ?? ""} />
      ) : (
        <PlanView content={plan.content} t={t} />
      )}
    </div>
  );
}
