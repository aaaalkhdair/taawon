"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, ChevronDown, Star, Upload, Video, X } from "lucide-react";
import type { PlanTask, Submission } from "@/db/schema";
import { useT } from "@/i18n/client";
import { Badge, Button, Card, Textarea } from "@/components/ui";
import { uploadVideo } from "@/lib/upload-client";
import { submitTaskAction } from "@/app/parent/actions";
import { DomainBadge } from "@/components/child/plan-view";

export function TaskCard({
  task,
  submission,
  childId,
}: {
  task: PlanTask;
  submission: Submission | null;
  childId: string;
}) {
  const { t } = useT();
  const [openModal, setOpenModal] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState(submission?.note ?? "");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const isDoneToday = !!submission;
  const hasVideo = !!submission?.videoUrl;
  const isRated = submission?.rating != null;

  const handleMarkDoneNoVideo = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("taskId", task.id);
      fd.append("childId", childId);
      await submitTaskAction(fd);
    });
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadVideo(file, setProgress);
      startTransition(async () => {
        const fd = new FormData();
        fd.append("taskId", task.id);
        fd.append("childId", childId);
        fd.append("videoUrl", url);
        if (note) fd.append("note", note);
        await submitTaskAction(fd);
        setIsUploading(false);
        setOpenModal(false);
      });
    } catch {
      setIsUploading(false);
      alert("Failed to upload video");
    }
  };

  return (
    <>
      <Card className={`p-5 transition-all ${isDoneToday ? "border-emerald-200 bg-emerald-50/20" : ""}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <DomainBadge domain={task.domain} t={t} />
              {isDoneToday && (
                <Badge tone="green" className="flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  {t("parent.tasks.doneToday")}
                </Badge>
              )}
            </div>
            <h3 className="text-base font-bold text-ink">{task.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>

            {/* Expandable How-To */}
            <button
              type="button"
              onClick={() => setShowHowTo(!showHowTo)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 mt-1"
            >
              <span>{t("parent.tasks.howTo")}</span>
              <ChevronDown className={`size-3.5 transition-transform ${showHowTo ? "rotate-180" : ""}`} />
            </button>
            {showHowTo && (
              <div className="mt-2 rounded-xl bg-surface p-3.5 text-xs leading-relaxed text-slate-700 border border-line animate-fade-up">
                💡 {task.howTo}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            {!isDoneToday ? (
              <>
                <Button
                  size="sm"
                  onClick={() => setOpenModal(true)}
                  disabled={pending}
                  className="gap-1.5"
                >
                  <Video className="size-3.5" />
                  {t("parent.tasks.uploadVideo")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkDoneNoVideo}
                  disabled={pending}
                >
                  {t("parent.tasks.markDone")}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setOpenModal(true)}
                  disabled={pending}
                  className="gap-1.5 text-xs"
                >
                  <Upload className="size-3.5" />
                  {hasVideo ? t("action.edit") : t("parent.tasks.uploadVideo")}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Existing Video Status & Feedback */}
        {hasVideo && (
          <div className="mt-4 border-t border-line pt-3 text-xs">
            {isRated ? (
              <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < (submission?.rating ?? 0) ? "fill-current" : "text-slate-200"
                      }`}
                    />
                  ))}
                  <span className="ms-1 text-slate-800">
                    {submission?.rating} / 5
                  </span>
                </div>
                {submission?.feedback && (
                  <p className="italic text-slate-700">&ldquo;{submission.feedback}&rdquo;</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted">
                <Video className="size-4 text-brand-600" />
                <span>{t("parent.tasks.videoUploaded")}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Upload Video Modal */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !isUploading && setOpenModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-bold text-ink">{t("parent.tasks.uploadModal.title")}</h3>
              <button
                onClick={() => !isUploading && setOpenModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleVideoSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("parent.tasks.uploadModal.videoHint")}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  capture="environment"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("parent.tasks.uploadModal.noteLabel")}
                </label>
                <Textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("parent.tasks.uploadModal.notePlaceholder")}
                />
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted">
                    <span>{t("parent.tasks.uploadModal.uploading")}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-brand-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpenModal(false)}
                  disabled={isUploading}
                >
                  {t("action.cancel")}
                </Button>
                <Button type="submit" disabled={!file || isUploading || pending}>
                  {t("parent.tasks.uploadModal.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
