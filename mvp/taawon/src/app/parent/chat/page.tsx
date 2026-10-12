import { asc, eq } from "drizzle-orm";
import { ShieldAlert } from "lucide-react";
import { db, schema } from "@/db";
import { getParentContext } from "@/lib/parent";
import { getT } from "@/i18n/server";
import { EmptyState, PageHeader } from "@/components/ui";
import { ChatBox } from "@/components/parent/chat-box";

export default async function ParentChatPage() {
  const { activeChild } = await getParentContext();
  const { t } = await getT();

  if (!activeChild) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-10" />}
        title={t("parent.noChildren")}
      />
    );
  }

  const messages = await db.query.chatMessages.findMany({
    where: eq(schema.chatMessages.childId, activeChild.id),
    orderBy: asc(schema.chatMessages.createdAt),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("parent.chat.title")}
        subtitle={t("parent.chat.subtitle")}
      />
      <ChatBox
        childId={activeChild.id}
        childName={activeChild.name}
        initialMessages={messages}
      />
    </div>
  );
}
