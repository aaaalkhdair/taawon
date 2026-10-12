"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Plan, PlanContent } from "@/db/schema";
import { useT } from "@/i18n/client";
import { Button, Card, Field, Textarea } from "@/components/ui";
import { resubmitPlanAction } from "@/app/specialist/actions";

export function SpecialistPlanEditor({
  plan,
  childName,
}: {
  plan: Plan;
  childName: string;
}) {
  const { t } = useT();
  const router = useRouter();
  const [content, setContent] = useState<PlanContent>(plan.content);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await resubmitPlanAction(plan.id, content);
        setSuccess(true);
        setTimeout(() => {
          router.push(`/specialist/children/${plan.childId}?tab=plan`);
          router.refresh();
        }, 1500);
      } catch {
        alert("Failed to resubmit plan");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Director notes banner */}
      {plan.adminNotes && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-sm animate-fade-up">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="size-4 text-amber-600" />
            <span>{t("specialist.planEdit.directorNotes")}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
            {plan.adminNotes}
          </p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="size-5 text-emerald-600" />
          <span className="font-bold text-sm">{t("specialist.planEdit.success")}</span>
        </div>
      )}

      {/* Unified Insight Editor */}
      <Card className="p-6 space-y-3">
        <h3 className="font-bold text-base text-ink">{t("plan.unifiedInsight")}</h3>
        <Textarea
          rows={5}
          value={content.unifiedInsight}
          onChange={(e) => setContent({ ...content, unifiedInsight: e.target.value })}
          required
        />
      </Card>

      {/* Goals Editor */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-base text-ink">{t("plan.goals")}</h3>
        <div className="space-y-3">
          {content.goals.map((g, idx) => (
            <Field key={idx} label={t(`domain.${g.domain}`)}>
              <Textarea
                rows={2}
                value={g.goal}
                onChange={(e) => {
                  const nextGoals = [...content.goals];
                  nextGoals[idx] = { ...g, goal: e.target.value };
                  setContent({ ...content, goals: nextGoals });
                }}
                required
              />
            </Field>
          ))}
        </div>
      </Card>

      {/* 12-Week Phases (collapsible) */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-base text-ink">{t("plan.phases")}</h3>
        <div className="space-y-3">
          {content.phases.map((ph, pIdx) => (
            <details
              key={ph.week}
              open={pIdx === 0}
              className="rounded-xl border border-line bg-surface p-4 group"
            >
              <summary className="font-bold text-sm text-ink cursor-pointer flex items-center justify-between">
                <span>
                  {t("common.week")} {ph.week}: {ph.title}
                </span>
                <span className="text-xs text-muted group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <div className="mt-4 space-y-3 pt-3 border-t border-line">
                <Field label={t("common.notes")}>
                  <Textarea
                    rows={2}
                    value={ph.focus}
                    onChange={(e) => {
                      const nextPhases = [...content.phases];
                      nextPhases[pIdx] = { ...ph, focus: e.target.value };
                      setContent({ ...content, phases: nextPhases });
                    }}
                  />
                </Field>
              </div>
            </details>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" size="lg" disabled={pending || success}>
          {pending ? t("common.loading") : t("specialist.planEdit.resubmit")}
        </Button>
      </div>
    </form>
  );
}
