import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, UserPlus } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { addChildAction } from "@/app/admin/actions";

export default async function AdminNewChildPage() {
  await requireUser("admin");
  const { t } = await getT();

  const parents = await db.query.users.findMany({
    where: eq(schema.users.role, "parent"),
  });

  const specialists = await db.query.users.findMany({
    where: eq(schema.users.role, "specialist"),
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link
          href="/admin/children"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-600 transition-colors"
        >
          <ArrowRight className="size-3.5 rtl-flip" />
          <span>{t("admin.children.title")}</span>
        </Link>
      </div>

      <PageHeader
        title={t("admin.newChild.title")}
        subtitle={t("admin.newChild.subtitle")}
      />

      <form action={addChildAction} className="space-y-6">
        {/* Child Information Section */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-ink pb-2 border-b border-line">
            1. {t("admin.newChild.childSection")}
          </h3>

          <Field label={t("common.name")}>
            <Input name="name" required placeholder="مثال: يوسف أحمد السالم" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t("admin.newChild.birthDate")}>
              <Input type="date" name="birthDate" required defaultValue="2020-01-01" />
            </Field>
            <Field label={t("admin.newChild.gender")}>
              <Select name="gender" required>
                <option value="male">{t("common.male")}</option>
                <option value="female">{t("common.female")}</option>
              </Select>
            </Field>
          </div>

          <Field label={t("admin.newChild.diagnosis")}>
            <Textarea
              name="diagnosis"
              rows={2}
              placeholder="مثال: تأخر لغوي نمائي، صعوبات انتباه..."
            />
          </Field>
        </Card>

        {/* Parent Account Section */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-ink pb-2 border-b border-line">
            2. {t("admin.newChild.parentSection")}
          </h3>

          <Field label={t("admin.newChild.existingParent")}>
            <Select name="parentId" defaultValue="">
              <option value="">-- {t("admin.newChild.orCreateParent")} --</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone ?? p.email})
                </option>
              ))}
            </Select>
          </Field>

          <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
            <p className="text-xs font-bold text-slate-700">
              {t("admin.newChild.orCreateParent")}:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="اسم ولي الأمر">
                <Input name="parentName" placeholder="مثال: أحمد السالم" />
              </Field>
              <Field label={t("common.phone")}>
                <Input name="parentPhone" placeholder="0500000000" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("common.email")}>
                <Input name="parentEmail" type="email" placeholder="parent@example.com" />
              </Field>
              <Field label={t("common.password")}>
                <Input
                  name="parentPassword"
                  type="password"
                  defaultValue="Taawon@2026"
                />
              </Field>
            </div>
          </div>
        </Card>

        {/* Specialists Team Section (1 to N) */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-ink pb-2 border-b border-line">
            3. {t("admin.newChild.teamSection")}
          </h3>
          <p className="text-xs text-muted">
            اختر الأخصائيين المسندين لمتابعة الطفل (نطق، سلوك، تربية خاصة):
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {specialists.map((spec) => (
              <label
                key={spec.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 hover:bg-brand-50 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="specialistIds"
                  value={spec.id}
                  defaultChecked
                  className="size-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="font-bold text-xs text-ink">{spec.name}</p>
                  <p className="text-[11px] text-muted">
                    {spec.specialty ? t(`specialty.${spec.specialty}`) : t("role.specialist")}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <SubmitButton size="lg">
            <UserPlus className="size-4" />
            <span>{t("admin.newChild.submit")}</span>
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
