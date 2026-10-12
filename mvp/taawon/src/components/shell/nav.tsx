"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ClipboardList,
  FileQuestion,
  CalendarDays,
  Video,
  ListChecks,
  TrendingUp,
  Bot,
  BookOpen,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/db/schema";
import { useT } from "@/i18n/client";
import { cn } from "../ui";

type Item = { href: string; key: string; icon: LucideIcon; mobile?: boolean };

export const NAV: Record<Role, Item[]> = {
  admin: [
    { href: "/admin", key: "nav.dashboard", icon: LayoutDashboard, mobile: true },
    { href: "/admin/children", key: "nav.children", icon: Users, mobile: true },
    { href: "/admin/plans", key: "nav.plans", icon: ClipboardList, mobile: true },
    { href: "/admin/specialists", key: "nav.specialists", icon: Stethoscope, mobile: true },
    { href: "/admin/questionnaire", key: "nav.questionnaire", icon: FileQuestion },
    { href: "/notifications", key: "nav.notifications", icon: Bell, mobile: true },
  ],
  specialist: [
    { href: "/specialist", key: "nav.dashboard", icon: LayoutDashboard, mobile: true },
    { href: "/specialist/children", key: "nav.children", icon: Users, mobile: true },
    { href: "/specialist/sessions", key: "nav.sessions", icon: CalendarDays, mobile: true },
    { href: "/specialist/reviews", key: "nav.reviews", icon: Video, mobile: true },
    { href: "/notifications", key: "nav.notifications", icon: Bell, mobile: true },
  ],
  parent: [
    { href: "/parent", key: "nav.dashboard", icon: LayoutDashboard, mobile: true },
    { href: "/parent/questionnaire", key: "nav.questionnaire", icon: FileQuestion, mobile: true },
    { href: "/parent/tasks", key: "nav.tasks", icon: ListChecks, mobile: true },
    { href: "/parent/progress", key: "nav.progress", icon: TrendingUp, mobile: true },
    { href: "/parent/chat", key: "nav.chat", icon: Bot, mobile: true },
    { href: "/parent/learning", key: "nav.learning", icon: BookOpen },
    { href: "/notifications", key: "nav.notifications", icon: Bell },
  ],
};

function isActive(pathname: string, href: string) {
  if (href.split("/").length === 2) return pathname === href; // role root
  return pathname === href || pathname.startsWith(href + "/");
}

export function SideNav({ role, unread }: { role: Role; unread: number }) {
  const pathname = usePathname();
  const { t } = useT();
  return (
    <nav className="flex flex-col gap-1">
      {NAV[role].map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-brand-600 text-white shadow-pop" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            )}
          >
            <Icon className="size-[18px]" />
            <span className="flex-1">{t(item.key)}</span>
            {item.href === "/notifications" && unread > 0 && (
              <span className={cn("rounded-full px-1.5 text-[11px] font-bold", active ? "bg-white text-brand-700" : "bg-rose-500 text-white")}>
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav({ role, unread }: { role: Role; unread: number }) {
  const pathname = usePathname();
  const { t } = useT();
  const items = NAV[role].filter((i) => i.mobile).slice(0, 5);
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-0.5 py-2.5">
              <Icon className={cn("size-[22px] transition", active ? "text-brand-600" : "text-slate-400")} strokeWidth={active ? 2.4 : 2} />
              <span className={cn("text-[10px] font-medium", active ? "text-brand-700" : "text-slate-500")}>{t(item.key)}</span>
              {item.href === "/notifications" && unread > 0 && (
                <span className="absolute top-1.5 start-1/2 ms-2 size-2 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
