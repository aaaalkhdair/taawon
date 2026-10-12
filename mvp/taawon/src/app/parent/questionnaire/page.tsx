import { asc, desc, eq } from "drizzle-orm";
import { CheckCircle2, FileEdit, ShieldAlert, Sparkles } from "lucide-react";
import { db, schema } from "@/db";
import { getParentContext } from "@/lib/parent";
import { getT } from "@/i18n/server";
import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { QuestionnaireWizard } from "@/components/parent/questionnaire-wizard";

export default async function ParentQuestionnairePage({
  searchParams,
}: {
  searchParams?: Promise<{ retake?: string }>;
}) {
  const { activeChild } = await getParentContext();
  const { t } = await getT();
  const params = await searchParams;
  const isRetake = params?.retake === "true";

  if (!activeChild) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-10" />}
        title={t("parent.noChildren")}
      />
    );
  }

  // Check if response already exists
  const existingResponse = await db.query.questionnaireResponses.findFirst({
    where: eq(schema.questionnaireResponses.childId, activeChild.id),
    orderBy: desc(schema.questionnaireResponses.createdAt),
  });

  const questions = await db.query.questions.findMany({
    orderBy: asc(schema.questions.order),
  });

  // If already submitted and user didn't explicitly request to retake
  if (existingResponse && !isRetake) {
    let answersCount = 0;
    try {
      const parsed = JSON.parse(existingResponse.answers);
      answersCount = Object.keys(parsed).length;
    } catch {
      answersCount = questions.length;
    }

    return (
      <div className="space-y-6">
        <PageHeader
          title={t("parent.q.title")}
          subtitle={t("parent.q.subtitle")}
        />
        <Card className="p-8 text-center max-w-xl mx-auto shadow-pop">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-10" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-ink">
            {t("parent.q.alreadySubmitted")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            تم تسجيل إجابات الاستبيان للطفل <span className="font-bold text-ink">{activeChild.name}</span> ({answersCount} سؤالاً)، وتم توليد التقرير السريري الأولي بالذكاء الاصطناعي بنجاح.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/parent/questionnaire?retake=true" className="gap-2">
              <FileEdit className="size-4" />
              <span>إعادة تعبئة أو تحديث الاستبيان</span>
            </LinkButton>
            <LinkButton href="/parent" variant="secondary">
              {t("action.back")}
            </LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("parent.q.title")}
        subtitle={t("parent.q.subtitle")}
      />
      <QuestionnaireWizard
        childId={activeChild.id}
        childName={activeChild.name}
        questions={questions}
      />
    </div>
  );
}
