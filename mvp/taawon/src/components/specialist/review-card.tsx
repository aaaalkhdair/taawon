"use client";
import { useState, useTransition } from "react";
import { Star, Video, CheckCircle2 } from "lucide-react";
import type { Submission, Child, PlanTask } from "@/db/schema";
import { useT } from "@/i18n/client";
import { Badge, Button, Card, Textarea } from "@/components/ui";
import { reviewSubmissionAction } from "@/app/specialist/actions";
import { DomainBadge } from "@/components/child/plan-view";

export function ReviewCard({
  submission,
  child,
  task,
}: {
  submission: Submission;
  child: Child | null;
  task: PlanTask | null;
}) {
  const { t } = useT();
  const [rating, setRating] = useState<number>(submission.rating ?? 5);
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? "");
  const [pending, startTransition] = useTransition();
  const [reviewed, setReviewed] = useState(submission.rating != null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await reviewSubmissionAction(submission.id, rating, feedback);
        setReviewed(true);
      } catch {
        alert("Failed to submit review");
      }
    });
  };

  return (
    <Card className="overflow-hidden p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-ink">{child?.name}</h3>
            {task && <DomainBadge domain={task.domain} t={t} />}
          </div>
          <p className="text-xs text-muted mt-0.5">
            {task?.title} · {submission.date}
          </p>
        </div>
        {reviewed ? (
          <Badge tone="green" className="gap-1">
            <CheckCircle2 className="size-3" />
            <span>{t("specialist.reviews.completedTab")}</span>
          </Badge>
        ) : (
          <Badge tone="amber" className="gap-1">
            <Video className="size-3" />
            <span>{t("status.assessment")}</span>
          </Badge>
        )}
      </div>

      {submission.note && (
        <p className="rounded-xl border border-line bg-surface p-3 text-xs italic text-slate-700">
          📝 {t("parent.tasks.uploadModal.noteLabel")}: &ldquo;{submission.note}&rdquo;
        </p>
      )}

      {/* Video Player */}
      {submission.videoUrl && (
        <div className="rounded-2xl overflow-hidden bg-black max-h-72 flex justify-center">
          <video
            src={submission.videoUrl}
            controls
            playsInline
            className="w-full max-h-72 object-contain"
          />
        </div>
      )}

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} className="border-t border-line pt-4 space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {t("specialist.reviews.rateChild")}
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-amber-500 hover:scale-110 transition-transform"
              >
                <Star
                  className={`size-6 ${
                    star <= rating ? "fill-current" : "text-slate-200"
                  }`}
                />
              </button>
            ))}
            <span className="ms-2 text-xs font-bold text-slate-700">
              {rating} / 5
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {t("specialist.reviews.feedbackLabel")}
          </label>
          <Textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t("specialist.reviews.feedbackPlaceholder")}
            required
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={pending || !feedback.trim()}>
            {pending ? t("common.loading") : t("specialist.reviews.submitReview")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
