import { notFound } from "next/navigation";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { AlertCircle, ArrowRight, History, Sparkles } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { formatDate } from "@/lib/utils";
import { AiBadge, Badge, Card, PageHeader } from "@/components/ui";
import { PlanView } from "@/components/child/plan-view";
import { PlanReviewActions } from "@/components/admin/plan-review-actions";

export default async function AdminPlanReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("admin");
  const { id: planId } = await params;
  const { t, locale } = await getT();

  const plan = await db.query.plans.findFirst({
    where: eq(schema.plans.id, planId),
  });
  if (!plan) notFound();

  const child = await db.query.children.findFirst({
    where: eq(schema.children.id, plan.childId),
  });

  // All versions of plans for this child (Clinical version audit trail)
  const allVersions = await db.query.plans.findMany({
    where: eq(schema.plans.childId, plan.childId),
    orderBy: desc(schema.plans.version),
  });

  const isPending = plan.status === "pending";

  return (
    <div className="space-y-6 pb-20">
      <div>
        <Link
          href="/admin/plans"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-600 transition-colors"
        >
          <ArrowRight className="size-3.5 rtl-flip" />
          <span>{t("admin.plans.title")}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-ink">
                {t("admin.planReview.title", { ver: plan.version })}: {child?.name}
              </h1>
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
              {(plan.source === "ai" || plan.source === "demo") && (
                <AiBadge label={t("common.ai")} />
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              {formatDate(plan.createdAt, locale)} · {child?.diagnosis ?? "خطة تأهيلية متكاملة"}
            </p>
          </div>
        </div>
      </Card>

      {/* Previous Director Notes Callout */}
      {plan.adminNotes && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-sm animate-fade-up">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="size-4 text-amber-600" />
            <span>{t("admin.planReview.prevNotes")}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
            «{plan.adminNotes}»
          </p>
        </div>
      )}

      {/* Complete Plan View (Unified insight, goals, 12-week phases) */}
      <PlanView content={plan.content} t={t} />

      {/* Version History Audit Trail */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="size-5 text-brand-600" />
          <h3 className="font-bold text-base text-ink">{t("admin.planReview.historyTitle")}</h3>
        </div>
        <div className="divide-y divide-line">
          {allVersions.map((v) => (
            <div key={v.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink">
                    {t("admin.plans.version", { ver: v.version })}
                  </span>
                  <Badge
                    tone={
                      v.status === "approved"
                        ? "green"
                        : v.status === "pending"
                        ? "amber"
                        : "gray"
                    }
                  >
                    {t(`plan.status.${v.status}`)}
                  </Badge>
                  {(v.source === "ai" || v.source === "demo") && (
                    <span className="text-[10px] text-muted font-mono">{t("common.ai")}</span>
                  )}
                </div>
                <p className="text-muted">{formatDate(v.createdAt, locale)}</p>
                {v.adminNotes && <p className="text-slate-600 italic">«{v.adminNotes}»</p>}
              </div>

              {v.id !== plan.id && (
                <Link
                  href={`/admin/plans/${v.id}`}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  {t("action.view")}
                </Link>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Sticky Director Decision Panel (Only active when status is pending) */}
      {isPending && <PlanReviewActions plan={plan} />}
    </div>
  );
}
