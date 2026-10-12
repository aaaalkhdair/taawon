import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { Bell, Globe, LogOut } from "lucide-react";
import { db, schema } from "@/db";
import type { User } from "@/db/schema";
import { getT } from "@/i18n/server";
import { logoutAction, setLocaleAction } from "@/app/actions";
import { Logo } from "../logo";
import { Avatar } from "../ui";
import { SideNav, BottomNav } from "./nav";

export function LanguageToggle({ locale, label, className }: { locale: string; label: string; className?: string }) {
  return (
    <form action={setLocaleAction} className={className}>
      <input type="hidden" name="locale" value={locale === "ar" ? "en" : "ar"} />
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
      >
        <Globe className="size-4" />
        {label}
      </button>
    </form>
  );
}

/**
 * Authenticated application shell: desktop sidebar, top bar, mobile bottom nav.
 * `headerSlot` lets an area inject extra content in the top bar (e.g. the parent's child switcher).
 */
export async function AppShell({ user, children, headerSlot }: { user: User; children: React.ReactNode; headerSlot?: React.ReactNode }) {
  const { t, locale } = await getT();
  const [{ value: unread }] = await db
    .select({ value: count() })
    .from(schema.notifications)
    .where(and(eq(schema.notifications.userId, user.id), eq(schema.notifications.read, false)));

  const roleLabel =
    user.role === "specialist" && user.specialty ? `${t("role.specialist")} · ${t(`specialty.${user.specialty}`)}` : t(`role.${user.role}`);

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-line bg-white px-4 py-5 lg:flex">
        <Link href="/" className="mb-8 px-2">
          <Logo name={t("app.name")} tagline={t("app.tagline")} />
        </Link>
        <SideNav role={user.role} unread={unread} />
        <div className="mt-auto rounded-2xl border border-line bg-surface p-3">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{roleLabel}</p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-slate-600 transition hover:bg-white hover:text-rose-600">
              <LogOut className="size-4 rtl-flip" />
              {t("nav.logout")}
            </button>
          </form>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:ps-64">
        <header className="glass sticky top-0 z-20 border-b border-line">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="lg:hidden">
              <Logo name={t("app.name")} />
            </Link>
            <div className="flex-1 min-w-0">{headerSlot}</div>
            <LanguageToggle locale={locale} label={t("common.lang")} />
            <Link
              href="/notifications"
              className="relative hidden size-9 items-center justify-center rounded-xl border border-line bg-white text-slate-600 transition hover:bg-brand-50 sm:flex"
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -end-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <form action={logoutAction} className="lg:hidden">
              <button className="flex size-9 items-center justify-center rounded-xl border border-line bg-white text-slate-600" aria-label={t("nav.logout")}>
                <LogOut className="size-4 rtl-flip" />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-10">{children}</main>
      </div>

      <BottomNav role={user.role} unread={unread} />
    </div>
  );
}
