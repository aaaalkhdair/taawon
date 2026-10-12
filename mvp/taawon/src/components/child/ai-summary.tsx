"use client";
import { useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button, Prose } from "../ui";
import { childSummaryAction } from "./actions";

/** One-click AI executive summary (admin & specialist). */
export function AiSummaryButton({ childId }: { childId: string }) {
  const { t } = useT();
  const [text, setText] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <Button
        variant="care"
        onClick={() => start(async () => setText(await childSummaryAction(childId)))}
        disabled={pending}
      >
        <Sparkles className={pending ? "size-4 animate-spin" : "size-4"} />
        {pending ? t("ai.thinking") : t("ai.summary")}
      </Button>
      {text && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 backdrop-blur-sm sm:items-center" onClick={() => setText(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-pop animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-care-500 text-white">
                  <Sparkles className="size-4" />
                </span>
                {t("ai.summary")}
              </h3>
              <button onClick={() => setText(null)} className="rounded-lg p-1 text-slate-400 hover:bg-surface">
                <X className="size-5" />
              </button>
            </div>
            <Prose>{text}</Prose>
            <p className="mt-4 text-xs text-muted">🔒 {t("common.privacyNote")}</p>
          </div>
        </div>
      )}
    </>
  );
}
