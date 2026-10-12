"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Edit3, Loader2, Sparkles, X } from "lucide-react";
import type { Plan } from "@/db/schema";
import { useT } from "@/i18n/client";
import { Button, Card, Textarea } from "@/components/ui";
import {
  approvePlanAction,
  returnPlanToSpecialistsAction,
  revisePlanWithAiAction,
} from "@/app/admin/actions";

export function PlanReviewActions({ plan }: { plan: Plan }) {
  const { t } = useT();
  const router = useRouter();
  const [modalMode, setModalMode] = useState<"ai" | "specialist" | null>(null);
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const handleApprove = () => {
    if (confirm(t("admin.planReview.approveConfirm"))) {
      startTransition(async () => {
        await approvePlanAction(plan.id);
      });
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    startTransition(async () => {
      try {
        if (modalMode === "ai") {
          const newPlan = await revisePlanWithAiAction(plan.id, notes);
          setModalMode(null);
          router.push(`/admin/plans/${newPlan.id}`);
          router.refresh();
        } else if (modalMode === "specialist") {
          await returnPlanToSpecialistsAction(plan.id, notes);
          setModalMode(null);
          router.push("/admin/plans");
          router.refresh();
        }
      } catch {
        alert("Operation failed");
      }
    });
  };

  return (
    <>
      {/* Sticky Action Bar */}
      <Card className="sticky bottom-4 z-30 border-2 border-brand-500 bg-white/95 p-4 sm:p-5 shadow-pop backdrop-blur-md animate-fade-up">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-bold text-sm text-ink flex items-center gap-1.5">
              <span>{t("admin.planReview.stickyTitle")}</span>
              <span className="text-xs text-muted">
                ({t("admin.plans.version", { ver: plan.version })})
              </span>
            </h4>
            <p className="text-xs text-muted mt-0.5">
              اختر اعتماد الخطة فوراً أو طلب تعديلها عبر الذكاء الاصطناعي أو الأخصائيين
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="care"
              onClick={() => setModalMode("ai")}
              disabled={pending}
              className="gap-1.5"
            >
              <Sparkles className="size-4" />
              <span>{t("admin.planReview.returnAiBtn")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setModalMode("specialist")}
              disabled={pending}
              className="gap-1.5"
            >
              <Edit3 className="size-4" />
              <span>{t("admin.planReview.returnSpecialistBtn")}</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleApprove}
              disabled={pending}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="size-4" />
              <span>{t("admin.planReview.approveBtn")}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Revision Modal (AI or Specialist) */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !pending && setModalMode(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-pop animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-bold text-ink flex items-center gap-2">
                {modalMode === "ai" ? (
                  <>
                    <Sparkles className="size-4 text-brand-600" />
                    <span>{t("admin.planReview.returnAiModal")}</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="size-4 text-amber-600" />
                    <span>{t("admin.planReview.returnSpecialistModal")}</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => !pending && setModalMode(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            {pending && modalMode === "ai" ? (
              <div className="py-10 text-center space-y-3">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-care-500 text-white shadow-pop">
                  <Sparkles className="size-7 animate-spin" />
                </div>
                <h4 className="font-bold text-sm text-ink">{t("admin.planReview.aiRevising")}</h4>
                <p className="text-xs text-muted">{t("common.privacyNote")}</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-muted leading-relaxed">
                  {modalMode === "ai"
                    ? t("admin.planReview.returnAiHint")
                    : "اكتب ملاحظاتك وتوجيهاتك السريرية للأخصائيين لإجراء التعديلات المطلوبة."}
                </p>

                <Textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى التركيز أكثر على تنمية مهارات الطلب اللفظي في الأسابيع الأولى، وتقليل مدة أنشطة الانتظار..."
                  required
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-line">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setModalMode(null)}
                    disabled={pending}
                  >
                    {t("action.cancel")}
                  </Button>
                  <Button type="submit" disabled={!notes.trim() || pending}>
                    {pending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{t("common.loading")}</span>
                      </>
                    ) : modalMode === "ai" ? (
                      t("admin.planReview.returnAiSubmit")
                    ) : (
                      t("action.submit")
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
