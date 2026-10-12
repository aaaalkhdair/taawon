"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { createQuestionAction } from "@/app/admin/actions";

export function AddQuestionModal() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("text");

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="size-4" />
        <span>{t("admin.qEditor.addQuestion")}</span>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-pop animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-bold text-ink">{t("admin.qEditor.modalTitle")}</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await createQuestionAction(formData);
                setOpen(false);
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("admin.qEditor.section")}>
                  <Select name="section" required>
                    <option value="general">{t("admin.section.general")}</option>
                    <option value="communication">{t("admin.section.communication")}</option>
                    <option value="behavior">{t("admin.section.behavior")}</option>
                    <option value="daily_living">{t("admin.section.daily_living")}</option>
                    <option value="academic">{t("admin.section.academic")}</option>
                  </Select>
                </Field>

                <Field label={t("admin.qEditor.type")}>
                  <Select
                    name="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="text">{t("admin.qEditor.typeText")}</option>
                    <option value="choice">{t("admin.qEditor.typeChoice")}</option>
                    <option value="scale">{t("admin.qEditor.typeScale")}</option>
                  </Select>
                </Field>
              </div>

              <Field label={t("admin.qEditor.textAr")}>
                <Input name="textAr" required placeholder="مثال: كيف يعبر الطفل عن مشاعره؟" />
              </Field>

              <Field label={t("admin.qEditor.textEn")}>
                <Input name="textEn" required placeholder="E.g. How does the child express feelings?" />
              </Field>

              {type === "choice" && (
                <Field label={t("admin.qEditor.optionsHint")}>
                  <Textarea
                    name="options"
                    rows={3}
                    placeholder={"نعم | Yes\nأحياناً | Sometimes\nلا | No"}
                    required
                  />
                </Field>
              )}

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
