"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button, Card, Textarea } from "@/components/ui";
import { improveClinicalReportAction, saveClinicalReportAction } from "@/app/specialist/actions";

export function ReportEditor({
  childId,
  initialContent,
}: {
  childId: string;
  initialContent: string;
}) {
  const { t } = useT();
  const [content, setContent] = useState(initialContent);
  const [aiPending, startAi] = useTransition();
  const [savePending, startSave] = useTransition();
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [planGenerated, setPlanGenerated] = useState(false);

  const handleImproveWithAi = () => {
    startAi(async () => {
      try {
        const enhanced = await improveClinicalReportAction(childId, content);
        if (enhanced) setContent(enhanced);
      } catch {
        alert("Failed to connect to AI");
      }
    });
  };

  const handleSave = () => {
    startSave(async () => {
      try {
        const res = await saveClinicalReportAction(childId, content);
        setSaveNotice(t("specialist.report.savedSuccess"));
        if (res.generatedPlan) {
          setPlanGenerated(true);
        }
      } catch {
        alert("Failed to save report");
      }
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-base font-bold text-ink">
          {t("specialist.report.editorTitle")}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {t("specialist.report.editorHint")}
        </p>
      </div>

      {saveNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-fade-up">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {planGenerated && (
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-care-600 p-5 text-white shadow-pop animate-fade-up">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Sparkles className="size-4 text-care-300" />
            <span>{t("common.ai")}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/90">
            {t("specialist.report.planGeneratedNotice")}
          </p>
        </div>
      )}

      <Textarea
        rows={12}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("specialist.report.placeholder")}
        className="font-mono text-xs leading-6"
        disabled={aiPending || savePending}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleImproveWithAi}
          disabled={aiPending || savePending || !content.trim()}
          className="gap-2 text-brand-700 bg-brand-50 hover:bg-brand-100"
        >
          {aiPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("specialist.report.aiDrafting")}</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4 text-brand-600" />
              <span>{t("specialist.report.aiDraftBtn")}</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={aiPending || savePending || !content.trim()}
        >
          {savePending ? t("common.loading") : t("action.save")}
        </Button>
      </div>
    </Card>
  );
}
