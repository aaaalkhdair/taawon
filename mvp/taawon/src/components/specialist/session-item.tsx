"use client";
import { useTransition } from "react";
import { Check, X } from "lucide-react";
import type { Session, Child } from "@/db/schema";
import { useT } from "@/i18n/client";
import { Badge, Button } from "@/components/ui";
import { updateSessionStatusAction } from "@/app/specialist/actions";
import { formatDateTime } from "@/lib/utils";

export function SessionItem({
  session,
  child,
}: {
  session: Session;
  child: Child | null;
}) {
  const { t, locale } = useT();
  const [pending, startTransition] = useTransition();

  const handleUpdate = (status: "done" | "cancelled") => {
    startTransition(async () => {
      await updateSessionStatusAction(session.id, status);
    });
  };

  const isScheduled = session.status === "scheduled";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4.5 sm:flex-row sm:items-center sm:justify-between shadow-card">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-ink">{child?.name ?? "—"}</p>
          <Badge tone={session.type === "in_person" ? "blue" : "teal"} className="text-[10px]">
            {session.type === "in_person" ? t("common.inPerson") : t("common.online")}
          </Badge>
          <Badge tone={session.status === "done" ? "green" : session.status === "cancelled" ? "rose" : "gray"} className="text-[10px]">
            {session.status === "done" ? t("action.save") : session.status === "cancelled" ? t("action.cancel") : t("specialist.sessions.upcoming")}
          </Badge>
        </div>
        <p className="text-xs text-muted">
          {formatDateTime(session.startsAt, locale)} · {session.durationMin} {t("common.minutes")}
        </p>
        {session.notes && (
          <p className="text-xs text-slate-600 bg-surface rounded-lg p-2 mt-1">
            {session.notes}
          </p>
        )}
      </div>

      {isScheduled && (
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-line sm:border-0">
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-700 hover:bg-emerald-50 text-xs gap-1"
            disabled={pending}
            onClick={() => handleUpdate("done")}
          >
            <Check className="size-3.5" />
            <span>{t("specialist.sessions.markDone")}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50 text-xs gap-1"
            disabled={pending}
            onClick={() => handleUpdate("cancelled")}
          >
            <X className="size-3.5" />
            <span>{t("specialist.sessions.cancel")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
