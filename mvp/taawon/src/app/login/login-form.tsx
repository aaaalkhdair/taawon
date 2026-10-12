"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { useT } from "@/i18n/client";
import { Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const { t } = useT();
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <Field label={t("common.email")}>
        <Input name="email" type="email" required dir="ltr" placeholder="name@taawon.app" autoComplete="email" />
      </Field>
      <Field label={t("common.password")}>
        <Input name="password" type="password" required dir="ltr" placeholder="••••••••" autoComplete="current-password" />
      </Field>
      {state?.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{t(state.error)}</p>}
      <SubmitButton size="lg" className="w-full">
        {t("login.button")}
      </SubmitButton>
    </form>
  );
}
