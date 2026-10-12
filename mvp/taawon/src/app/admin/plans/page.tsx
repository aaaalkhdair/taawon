import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { ClipboardList, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { formatDate } from "@/lib/utils";
import { AiBadge, Badge, Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";

export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireUser("admin");
  const { tab = "pending" } = await searchParams;
  const { t, locale, dir } = await getT();

  const allPlans = await db.query.plans.findMany({
    orderBy: desc(schema.plans.createdAt),
  });

  const allChildren = await db.query.children.findMany();
  const childById = new Map(allChildren.map((c) => [c.id, c]));

  const pendingPlans = allPlans.filter((p) => p.status === "pending");
  const returnedPlans = allPlans.filter((p) => p.status === "returned_specialist");
  const approvedPlans = allPlans.filter((p) => p.status === "approved");

  const currentList =
    tab === "returned" ? returnedPlans : tab === "approved" ? approvedPlans : pendingPlans;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.plans.title")}
        subtitle={t("admin.plans.subtitle")}
      />

      {/* Tabs */}
      <div className="flex border-b border-line gap-4">
        <Link
          href="/admin/plans?tab=pending"
          className={`border-b-2 pb-3 text-sm font-semibold transition-all ${
            tab === "pending"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-ink"
          }`}
        >
          {t("admin.plans.tabPending", { count: pendingPlans.length })}
        </Link>
        <Link
          href="/admin/plans?tab=returned"
          className={`border-b-2 pb-3 text-sm font-semibold transition-all ${
            tab === "returned"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-ink"
          }`}
        >
          {t("admin.plans.tabReturned", { count: returnedPlans.length })}
        </Link>
        <Link
          href="/admin/plans?tab=approved"
          className={`border-b-2 pb-3 text-sm font-semibold transition-all ${
            tab === "approved"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-ink"
          }`}
        >
          {t("admin.plans.tabApproved", { count: approvedPlans.length })}
        </Link>
      </div>

      {currentList.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-10" />}
          title={t("common.empty")}
        />
      ) : (
        <div className="space-y-3">
          {currentList.map((plan) => {
            const child = childById.get(plan.childId);
            return (
              <Card
                key={plan.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:shadow-pop transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-ink">{child?.name}</h3>
                    <Badge tone="blue">
                      {t("admin.plans.version", { ver: plan.version })}
                    </Badge>
                    {(plan.source === "ai" || plan.source === "demo") && (
                      <AiBadge label={t("common.ai")} />
                    )}
                    <Badge
                      tone={
                        plan.status === "approved"
                          ? "green"
                          : plan.status === "pending"
                          ? "amber"
                          : "rose"
                      }
                    >
                      {t(`plan.status.${plan.status}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {formatDate(plan.createdAt, locale)}
                    {plan.adminNotes && ` · «${plan.adminNotes}»`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <LinkButton href={`/admin/plans/${plan.id}`} size="sm" variant="primary">
                    <span>{plan.status === "pending" ? t("admin.pendingPlansBanner.reviewBtn") : t("action.view")}</span>
                    {dir === "rtl" ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
