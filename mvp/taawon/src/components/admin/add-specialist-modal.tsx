"use client";
import { useState } from "react";
import { Plus, X, Stethoscope } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button, Field, Input, Select } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { addSpecialistAction } from "@/app/admin/actions";

export function AddSpecialistModal() {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="size-4" />
        <span>{t("admin.specialists.addBtn")}</span>
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
              <h3 className="font-bold text-ink">{t("admin.specialists.modal.title")}</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await addSpecialistAction(formData);
                setOpen(false);
              }}
              className="mt-4 space-y-4"
            >
              <Field label={t("common.name")}>
                <Input name="name" required placeholder="مثال: أ. سارة الشمري" />
              </Field>

              <Field label={t("role.specialist")}>
                <Select name="specialty" required>
                  <option value="speech">{t("specialty.speech")}</option>
                  <option value="behavior">{t("specialty.behavior")}</option>
                  <option value="special_ed">{t("specialty.special_ed")}</option>
                </Select>
              </Field>

              <Field label={t("common.email")}>
                <Input name="email" type="email" required placeholder="spec@taawon.app" />
              </Field>

              <Field label={t("common.phone")}>
                <Input name="phone" placeholder="0500000000" />
              </Field>

              <Field label={t("common.password")}>
                <Input name="password" type="password" defaultValue="Taawon@2026" />
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
