import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Bell, CheckCheck } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { markAllNotificationsReadAction } from "@/app/actions";
import { AppShell } from "@/components/shell/app-shell";
import { Card, EmptyState, PageHeader, cn } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { formatDateTime } from "@/lib/utils";

export default async function NotificationsPage() {
  const user = await requireUser();
  const { t, locale } = await getT();
  const items = await db.query.notifications.findMany({
    where: eq(schema.notifications.userId, user.id),
    orderBy: desc(schema.notifications.createdAt),
    limit: 50,
  });

  return (
    <AppShell user={user}>
      <PageHeader
        title={t("notifications.title")}
        subtitle={t("notifications.subtitle")}
        action={
          items.some((n) => !n.read) && (
            <form action={markAllNotificationsReadAction}>
              <SubmitButton variant="outline" size="sm">
                <CheckCheck className="size-4" />
                {t("common.markAllRead")}
              </SubmitButton>
            </form>
          )
        }
      />
      <Card className="divide-y divide-line overflow-hidden">
        {items.length === 0 && <EmptyState icon={<Bell />} title={t("common.noNotifications")} />}
        {items.map((n) => {
          const title = locale === "ar" ? n.titleAr : n.titleEn;
          const body = locale === "ar" ? n.bodyAr : n.bodyEn;
          const inner = (
            <div className={cn("flex gap-4 px-5 py-4 transition hover:bg-surface", !n.read && "bg-brand-50/50")}>
              <div className={cn("mt-1 size-2.5 shrink-0 rounded-full", n.read ? "bg-slate-200" : "bg-brand-600")} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{title}</p>
                {body && <p className="mt-0.5 text-sm text-muted line-clamp-2">{body}</p>}
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(n.createdAt, locale)}</p>
              </div>
            </div>
          );
          return n.link ? (
            <Link key={n.id} href={n.link} className="block">
              {inner}
            </Link>
          ) : (
            <div key={n.id}>{inner}</div>
          );
        })}
      </Card>
    </AppShell>
  );
}
