import { redirect } from "next/navigation";
import { ShieldCheck, Stethoscope, Users, Building2 } from "lucide-react";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { demoLoginAction } from "@/app/actions";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui";
import { LanguageToggle } from "@/components/shell/app-shell";
import { LoginForm } from "./login-form";

const DEMO = [
  { email: "admin@taawon.app", role: "admin", icon: Building2, color: "from-brand-600 to-brand-500" },
  { email: "speech@taawon.app", role: "specialist", icon: Stethoscope, color: "from-care-600 to-care-500" },
  { email: "parent@taawon.app", role: "parent", icon: Users, color: "from-violet-600 to-violet-500" },
] as const;

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  const { t, locale } = await getT();

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-care-600 p-12 text-white lg:flex lg:flex-col">
        <div className="bg-medical-grid absolute inset-0 opacity-30" />
        <div className="absolute -bottom-32 -start-32 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <Logo name={t("app.name")} tagline={t("app.tagline")} light />
        </div>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-4xl font-bold leading-tight">{t("login.heroTitle")}</h2>
          <p className="mt-4 text-lg text-white/80">{t("login.heroText")}</p>
          <div className="mt-8 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <ShieldCheck className="size-5 shrink-0" />
            {t("common.privacyNote")}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="bg-medical-grid flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo name={t("app.name")} />
          </div>
          <LanguageToggle locale={locale} label={t("common.lang")} className="ms-auto" />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Card className="p-6 sm:p-8 animate-fade-up">
            <h1 className="text-2xl font-bold">{t("login.title")}</h1>
            <p className="mt-1 text-muted">{t("login.subtitle")}</p>
            <LoginForm />
          </Card>

          <div className="mt-6 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <p className="text-sm font-semibold text-ink">{t("login.demo")}</p>
            <p className="mb-3 text-xs text-muted">{t("login.demoHint")}</p>
            <div className="grid grid-cols-3 gap-3">
              {DEMO.map((d) => {
                const Icon = d.icon;
                return (
                  <form key={d.email} action={demoLoginAction}>
                    <input type="hidden" name="email" value={d.email} />
                    <button className="group flex w-full flex-col items-center gap-2 rounded-2xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-pop">
                      <span className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${d.color} text-white`}>
                        <Icon className="size-5" />
                      </span>
                      <span className="text-center text-xs font-semibold text-ink">{t(`role.${d.role}`)}</span>
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
