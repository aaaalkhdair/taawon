"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import type { Question } from "@/db/schema";
import { useT } from "@/i18n/client";
import { Button, Card, ProgressBar, Textarea } from "@/components/ui";
import { submitQuestionnaireAction } from "@/app/parent/actions";

export function QuestionnaireWizard({
  childId,
  childName,
  questions,
}: {
  childId: string;
  childName: string;
  questions: Question[];
}) {
  const { t, locale } = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Group questions by section
  const sections = Array.from(new Set(questions.map((q) => q.section)));
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);

  const currentSection = sections[currentSectionIdx];
  const currentQuestions = questions.filter((q) => q.section === currentSection);
  const isLast = currentSectionIdx === sections.length - 1;

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentSectionIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      startTransition(async () => {
        await submitQuestionnaireAction(childId, answers);
        setSubmitted(true);
      });
    }
  };

  const handlePrev = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-10" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-ink">
          {t("parent.q.successTitle")}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {t("parent.q.successDesc")}
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            router.push("/parent");
            router.refresh();
          }}
        >
          {t("action.back")}
        </Button>
      </Card>
    );
  }

  if (pending) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="relative mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-brand-600 to-care-500 text-white shadow-pop">
          <Sparkles className="size-10 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-ink">
          {t("parent.q.analyzing")}
        </h2>
        <p className="text-sm text-muted">
          {t("common.privacyNote")}
        </p>
        <div className="pt-4 flex justify-center">
          <Loader2 className="size-6 text-brand-600 animate-spin" />
        </div>
      </Card>
    );
  }

  const progressPct = ((currentSectionIdx + 1) / sections.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Step Tracker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          <span>
            {t("parent.q.step", { current: currentSectionIdx + 1, total: sections.length })}
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <ProgressBar value={progressPct} tone="brand" />
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            {childName}
          </span>
          <h2 className="mt-1 text-xl font-bold text-ink capitalize">
            {t(`admin.section.${currentSection}`) !== `admin.section.${currentSection}`
              ? t(`admin.section.${currentSection}`)
              : currentSection}
          </h2>
        </div>

        {/* Questions in this section */}
        <div className="space-y-6 divide-y divide-line">
          {currentQuestions.map((q, idx) => {
            const qText = locale === "ar" ? q.textAr : q.textEn;
            const currentVal = answers[q.id] ?? "";

            return (
              <div key={q.id} className={idx > 0 ? "pt-6" : ""}>
                <label className="block text-sm font-semibold text-ink mb-3 leading-relaxed">
                  {idx + 1}. {qText}
                </label>

                {/* Question Type: Scale (1 to 5) */}
                {q.type === "scale" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const isSelected = currentVal === String(num);
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleAnswerChange(q.id, String(num))}
                            className={`h-11 rounded-xl text-sm font-bold transition-all ${
                              isSelected
                                ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/30"
                                : "bg-surface text-slate-700 hover:bg-brand-50 border border-line"
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[11px] text-muted px-1">
                      <span>{t("parent.q.scaleNever")}</span>
                      <span>{t("parent.q.scaleAlways")}</span>
                    </div>
                  </div>
                )}

                {/* Question Type: Choice */}
                {q.type === "choice" && (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {(() => {
                      try {
                        const opts = JSON.parse(q.options || "[]") as { ar: string; en: string }[];
                        return opts.map((opt, oIdx) => {
                          const label = locale === "ar" ? opt.ar : opt.en;
                          const isSelected = currentVal === label;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, label)}
                              className={`p-3.5 rounded-xl text-sm font-medium text-start transition-all border ${
                                isSelected
                                  ? "bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20"
                                  : "bg-surface border-line text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        });
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                )}

                {/* Question Type: Text */}
                {q.type === "text" && (
                  <Textarea
                    rows={3}
                    value={currentVal}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder={t("common.notes")}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-line pt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrev}
            disabled={currentSectionIdx === 0 || pending}
          >
            <ArrowRight className="size-4 rtl-flip" />
            {t("action.previous")}
          </Button>

          <Button type="button" onClick={handleNext} disabled={pending}>
            {isLast ? t("action.submit") : t("action.next")}
            <ArrowLeft className="size-4 rtl-flip" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
