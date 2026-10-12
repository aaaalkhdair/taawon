import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { EmptyState, PageHeader } from "@/components/ui";
import { SessionItem } from "@/components/specialist/session-item";
import { BookSessionModal } from "@/components/specialist/book-session-modal";

export default async function SpecialistSessionsPage() {
  const user = await requireUser("specialist");
  const { t } = await getT();

  const assigns = await db.query.assignments.findMany({
    where: eq(schema.assignments.specialistId, user.id),
  });
  const childIds = assigns.map((a) => a.childId);

  const myChildren = childIds.length
    ? await db.query.children.findMany({
        where: inArray(schema.children.id, childIds),
      })
    : [];
  const childById = new Map(myChildren.map((c) => [c.id, c]));

  const allSessions = await db.query.sessions.findMany({
    where: eq(schema.sessions.specialistId, user.id),
    orderBy: desc(schema.sessions.startsAt),
  });

  const upcoming = allSessions.filter((s) => s.status === "scheduled");
  const past = allSessions.filter((s) => s.status !== "scheduled");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("specialist.sessions.title")}
        subtitle={t("specialist.sessions.subtitle")}
        action={<BookSessionModal childrenList={myChildren} />}
      />

      <div className="space-y-6">
        <div>
          <h2 className="text-base font-bold text-ink mb-3">
            {t("specialist.sessions.upcoming")} ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <EmptyState title={t("parent.nextSession.none")} />
          ) : (
            <div className="space-y-3">
              {upcoming.map((sess) => (
                <SessionItem
                  key={sess.id}
                  session={sess}
                  child={childById.get(sess.childId) ?? null}
                />
              ))}
            </div>
          )}
        </div>

        {past.length > 0 && (
          <div className="border-t border-line pt-6">
            <h2 className="text-base font-bold text-muted mb-3">
              {t("specialist.sessions.past")} ({past.length})
            </h2>
            <div className="space-y-3 opacity-80">
              {past.map((sess) => (
                <SessionItem
                  key={sess.id}
                  session={sess}
                  child={childById.get(sess.childId) ?? null}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
