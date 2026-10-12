import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  FileCheck2,
  Flame,
  HeartPulse,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/shell/app-shell";
import { Badge, Card, LinkButton, ProgressRing } from "@/components/ui";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const { t, locale, dir } = await getT();

  const arrow = dir === "rtl" ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />;

  const aiCapabilities = [
    t("landing.ai.cap1"),
    t("landing.ai.cap2"),
    t("landing.ai.cap3"),
    t("landing.ai.cap4"),
    t("landing.ai.cap5"),
    t("landing.ai.cap6"),
    t("landing.ai.cap7"),
    t("landing.ai.cap8"),
  ];

  return (
    <div className="min-h-screen bg-surface text-ink selection:bg-brand-500 selection:text-white">
      {/* ──────── 1. Sticky Glass Navbar ──────── */}
      <header className="glass sticky top-0 z-50 border-b border-line">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Logo name={t("app.name")} tagline={t("app.tagline")} />
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="hover:text-brand-600 transition-colors">
              {t("landing.nav.how")}
            </a>
            <a href="#roles" className="hover:text-brand-600 transition-colors">
              {t("landing.nav.roles")}
            </a>
            <a href="#ai" className="hover:text-brand-600 transition-colors">
              {t("landing.nav.ai")}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle locale={locale} label={t("common.lang")} />
            {user ? (
              <LinkButton href={homeFor(user.role)} size="sm">
                <span>{t("landing.nav.dashboard")}</span>
                {arrow}
              </LinkButton>
            ) : (
              <LinkButton href="/login" size="sm">
                <span>{t("landing.nav.signIn")}</span>
                {arrow}
              </LinkButton>
            )}
          </div>
        </div>
      </header>

      {/* ──────── 2. Hero Section ──────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="bg-medical-grid absolute inset-0 opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 start-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left/Start Column: Pitch & CTAs */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1 text-xs font-bold text-brand-700 shadow-xs">
                <Sparkles className="size-3.5 text-brand-600" />
                <span>{t("landing.hero.badge")}</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl sm:leading-[1.18]">
                {t("landing.hero.title")}
              </h1>

              <p className="text-base text-slate-600 sm:text-lg leading-relaxed max-w-2xl">
                {t("landing.hero.desc")}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <LinkButton href="/login" size="lg" className="shadow-pop">
                  <span>{t("landing.hero.tryDemo")}</span>
                  {arrow}
                </LinkButton>
                <a
                  href="#how"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-line bg-white px-6 text-base font-semibold text-ink shadow-sm hover:bg-surface transition-all"
                >
                  {t("landing.hero.howItWorks")}
                </a>
              </div>

              <div className="flex items-center gap-4 pt-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>{t("common.privacyNote")}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Brain className="size-4 text-brand-600" />
                  <span>Powered by Gemini</span>
                </span>
              </div>
            </div>

            {/* Right/End Column: Interactive App Mockup Frame */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-sm rounded-[2.5rem] border-8 border-slate-900 bg-white p-4 shadow-2xl">
                {/* Mockup screen header */}
                <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-care-500 text-white font-bold text-xs">
                      +
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">{t("landing.mock.todayTasks")}</p>
                      <p className="text-[10px] text-muted">{t("landing.mock.week")}</p>
                    </div>
                  </div>
                  <ProgressRing value={68} size={42} stroke={4} color="#1565d8" />
                </div>

                {/* Mockup tasks cards */}
                <div className="space-y-2.5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">طلب الأشياء بكلمة</span>
                      <span className="text-[10px] text-emerald-700 font-bold">✓ أنجزت</span>
                    </div>
                    <p className="text-[11px] text-slate-600">تخاطب وتواصل · تم رفع الفيديو</p>
                  </div>

                  <div className="rounded-xl border border-line bg-surface p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">مؤقّت الانتظار (دقيقتان)</span>
                      <span className="text-[10px] text-amber-600 font-bold">قيد التنفيذ</span>
                    </div>
                    <p className="text-[11px] text-slate-600">تعديل سلوك · تدريب منزلي</p>
                  </div>

                  <div className="rounded-xl border border-line bg-surface p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">غسل اليدين باستقلالية</span>
                      <span className="text-[10px] text-slate-400">اليوم</span>
                    </div>
                    <p className="text-[11px] text-slate-600">مهارة حياتية</p>
                  </div>
                </div>

                {/* Floating pill 1 */}
                <div className="absolute -top-4 -start-6 rounded-2xl border border-line bg-white/95 p-3 shadow-pop backdrop-blur-md animate-fade-up">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-700">
                    <Sparkles className="size-4 text-brand-600" />
                    <span>{t("landing.mock.floatingAi")}</span>
                  </div>
                </div>

                {/* Floating pill 2 */}
                <div className="absolute -bottom-5 -end-6 rounded-2xl border border-line bg-white/95 p-3 shadow-pop backdrop-blur-md animate-fade-up">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <TrendingUp className="size-4 text-emerald-600" />
                    <span>{t("landing.mock.floatingProgress")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── 3. Trust Metrics Strip ──────── */}
      <section className="border-y border-line bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-surface/60 p-5 space-y-1.5">
              <p className="text-lg font-bold text-brand-600">{t("landing.metrics.specialties")}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{t("landing.metrics.specialtiesDesc")}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface/60 p-5 space-y-1.5">
              <p className="text-lg font-bold text-care-600">{t("landing.metrics.planDuration")}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{t("landing.metrics.planDurationDesc")}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface/60 p-5 space-y-1.5">
              <p className="text-lg font-bold text-emerald-600">{t("landing.metrics.privacy")}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{t("landing.metrics.privacyDesc")}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface/60 p-5 space-y-1.5">
              <p className="text-lg font-bold text-violet-600">{t("landing.metrics.assistant")}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{t("landing.metrics.assistantDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── 4. Problem vs. Solution ──────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              {t("landing.comparison.title")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Traditional */}
            <Card className="p-6 sm:p-8 border-rose-200 bg-rose-50/20 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-rose-200/60">
                <XCircle className="size-5 text-rose-500" />
                <h3 className="font-bold text-lg text-rose-950">{t("landing.comparison.traditional")}</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  t("landing.comparison.traditional1"),
                  t("landing.comparison.traditional2"),
                  t("landing.comparison.traditional3"),
                  t("landing.comparison.traditional4"),
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Taawon */}
            <Card className="p-6 sm:p-8 border-brand-300 bg-brand-50/20 shadow-pop space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-brand-200">
                <CheckCircle2 className="size-5 text-brand-600" />
                <h3 className="font-bold text-lg text-brand-950">{t("landing.comparison.taawon")}</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  t("landing.comparison.taawon1"),
                  t("landing.comparison.taawon2"),
                  t("landing.comparison.taawon3"),
                  t("landing.comparison.taawon4"),
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-brand-600 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ──────── 5. How It Works (6-step Workflow) ──────── */}
      <section id="how" className="border-t border-line bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              {t("landing.how.title")}
            </h2>
            <p className="text-sm text-muted">{t("landing.how.subtitle")}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { num: "01", title: t("landing.how.step1.title"), desc: t("landing.how.step1.desc"), color: "bg-brand-50 text-brand-600" },
              { num: "02", title: t("landing.how.step2.title"), desc: t("landing.how.step2.desc"), color: "bg-care-50 text-care-600" },
              { num: "03", title: t("landing.how.step3.title"), desc: t("landing.how.step3.desc"), color: "bg-violet-50 text-violet-600" },
              { num: "04", title: t("landing.how.step4.title"), desc: t("landing.how.step4.desc"), color: "bg-brand-50 text-brand-600" },
              { num: "05", title: t("landing.how.step5.title"), desc: t("landing.how.step5.desc"), color: "bg-amber-50 text-amber-600" },
              { num: "06", title: t("landing.how.step6.title"), desc: t("landing.how.step6.desc"), color: "bg-emerald-50 text-emerald-600" },
            ].map((step, idx) => (
              <Card key={idx} className="p-6 space-y-3 hover:border-brand-300 transition-all">
                <span className={`inline-flex size-9 items-center justify-center rounded-xl font-mono text-sm font-bold ${step.color}`}>
                  {step.num}
                </span>
                <h3 className="font-bold text-base text-ink">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── 6. Roles Breakdown ──────── */}
      <section id="roles" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              {t("landing.roles.title")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 sm:p-8 space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <HeartPulse className="size-6" />
              </div>
              <h3 className="font-bold text-lg text-ink">{t("landing.roles.director")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t("landing.roles.directorDesc")}</p>
            </Card>

            <Card className="p-6 sm:p-8 space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-care-100 text-care-700">
                <Stethoscope className="size-6" />
              </div>
              <h3 className="font-bold text-lg text-ink">{t("landing.roles.specialist")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t("landing.roles.specialistDesc")}</p>
            </Card>

            <Card className="p-6 sm:p-8 space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Users className="size-6" />
              </div>
              <h3 className="font-bold text-lg text-ink">{t("landing.roles.parent")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t("landing.roles.parentDesc")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ──────── 7. AI Agent Capabilities ──────── */}
      <section id="ai" className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 py-20 text-white">
        <div className="bg-medical-grid absolute inset-0 opacity-20 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-care-300">
              <Brain className="size-3.5" />
              <span>Google Gemini AI</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t("landing.ai.title")}
            </h2>
            <p className="text-sm text-slate-300">{t("landing.ai.subtitle")}</p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {aiCapabilities.map((cap, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-md transition-all hover:bg-white/10"
              >
                <div className="flex items-center gap-2 text-care-400 font-bold text-xs mb-2">
                  <Sparkles className="size-3.5" />
                  <span>0{idx + 1}</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-200">{cap}</p>
              </div>
            ))}
          </div>

          {/* Privacy callout */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-5 backdrop-blur-md max-w-3xl mx-auto flex items-start gap-3.5">
            <ShieldCheck className="size-5 shrink-0 text-emerald-400 mt-0.5" />
            <p className="text-xs leading-relaxed text-emerald-200">
              {t("landing.ai.privacy")}
            </p>
          </div>
        </div>
      </section>

      {/* ──────── 8. Final CTA Band ──────── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Card className="rounded-3xl border-brand-200 bg-gradient-to-br from-brand-600 to-care-600 p-8 sm:p-12 text-center text-white shadow-pop">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              {t("landing.cta.title")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
              {t("landing.cta.desc")}
            </p>
            <div className="mt-8 flex justify-center">
              <LinkButton
                href="/login"
                size="lg"
                className="bg-white text-brand-700 hover:bg-slate-100 shadow-md font-bold text-base px-8 h-12"
              >
                <span>{t("landing.cta.btn")}</span>
                {arrow}
              </LinkButton>
            </div>
          </Card>
        </div>
      </section>

      {/* ──────── 9. Footer ──────── */}
      <footer className="border-t border-line bg-white py-8 text-xs text-muted">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo name={t("app.name")} />
          <p>{t("landing.footer.builtFor")}</p>
          <p>{t("landing.footer.rights")}</p>
        </div>
      </footer>
    </div>
  );
}
