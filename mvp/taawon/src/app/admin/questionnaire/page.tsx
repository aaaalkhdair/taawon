import { asc } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { Badge, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { AddQuestionModal } from "@/components/admin/add-question-modal";
import { deleteQuestionAction } from "@/app/admin/actions";

export default async function AdminQuestionnairePage() {
  await requireUser("admin");
  const { t, locale } = await getT();

  const questions = await db.query.questions.findMany({
    orderBy: asc(schema.questions.order),
  });

  const sections = ["general", "communication", "behavior", "daily_living", "academic"] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.qEditor.title")}
        subtitle={t("admin.qEditor.subtitle")}
        action={<AddQuestionModal />}
      />

      <div className="space-y-6">
        {sections.map((sec) => {
          const secQuestions = questions.filter((q) => q.section === sec);
          return (
            <Card key={sec} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="font-bold text-base text-ink capitalize">
                  {t(`admin.section.${sec}`) !== `admin.section.${sec}`
                    ? t(`admin.section.${sec}`)
                    : sec}
                </h3>
                <Badge tone="blue">{secQuestions.length} أسئلة</Badge>
              </div>

              {secQuestions.length === 0 ? (
                <p className="text-xs text-muted py-2">{t("common.empty")}</p>
              ) : (
                <div className="divide-y divide-line">
                  {secQuestions.map((q, idx) => (
                    <div key={q.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-ink">
                          {idx + 1}. {locale === "ar" ? q.textAr : q.textEn}
                        </p>
                        <p className="text-xs text-muted font-normal">
                          {locale === "ar" ? q.textEn : q.textAr}
                        </p>
                        <div className="pt-1">
                          <Badge tone="gray" className="text-[10px]">
                            {q.type === "text"
                              ? t("admin.qEditor.typeText")
                              : q.type === "choice"
                              ? t("admin.qEditor.typeChoice")
                              : t("admin.qEditor.typeScale")}
                          </Badge>
                        </div>
                      </div>

                      <form action={deleteQuestionAction.bind(null, q.id)}>
                        <SubmitButton variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 p-2">
                          <Trash2 className="size-4" />
                        </SubmitButton>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
