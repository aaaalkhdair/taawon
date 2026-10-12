"use client";
import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import type { Child } from "@/db/schema";
import { useT } from "@/i18n/client";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { createSessionAction } from "@/app/specialist/actions";

export function BookSessionModal({ childrenList }: { childrenList: Child[] }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <CalendarPlus className="size-4" />
        <span>{t("specialist.sessions.bookBtn")}</span>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-bold text-ink">{t("specialist.sessions.modal.title")}</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await createSessionAction(formData);
                setOpen(false);
              }}
              className="mt-4 space-y-4"
            >
              <Field label={t("specialist.sessions.modal.child")}>
                <Select name="childId" required>
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t("specialist.sessions.modal.type")}>
                  <Select name="type" required>
                    <option value="in_person">{t("common.inPerson")}</option>
                    <option value="online">{t("common.online")}</option>
                  </Select>
                </Field>
                <Field label={t("specialist.sessions.modal.duration")}>
                  <Select name="durationMin" defaultValue="45">
                    <option value="30">30 {t("common.minutes")}</option>
                    <option value="45">45 {t("common.minutes")}</option>
                    <option value="60">60 {t("common.minutes")}</option>
                  </Select>
                </Field>
              </div>

              <Field label={t("specialist.sessions.modal.date")}>
                <Input
                  type="datetime-local"
                  name="startsAt"
                  required
                  defaultValue={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                />
              </Field>

              <Field label={t("specialist.sessions.modal.notes")}>
                <Textarea name="notes" rows={2} placeholder={t("common.notes")} />
              </Field>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {t("action.cancel")}
                </Button>
                <SubmitButton>{t("action.save")}</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
