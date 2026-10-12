import { CheckCircle2, AlertTriangle, Eye, Lightbulb, FileText, Target, CalendarRange } from "lucide-react";
import type { InitialReportContent, PlanContent } from "@/db/schema";
import type { TFn } from "@/i18n/config";
import { AiBadge, Badge, Card, CardHeader, Prose } from "../ui";

const DOMAIN_TONE = { communication: "blue", cognitive: "violet", behavior: "teal", daily_living: "amber" } as const;

export function DomainBadge({ domain, t }: { domain: keyof typeof DOMAIN_TONE; t: TFn }) {
  return <Badge tone={DOMAIN_TONE[domain] ?? "gray"}>{t(`domain.${domain}`)}</Badge>;
}

/** AI initial report produced from the parent questionnaire. */
export function InitialReportCard({ content, t, title, aiLabel }: { content: InitialReportContent; t: TFn; title: string; aiLabel: string }) {
  const list = (icon: React.ReactNode, label: string, items: string[], color: string) => (
    <div className="rounded-xl border border-line bg-surface/60 p-4">
      <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${color}`}>
        {icon}
        {label}
      </div>
      <ul className="space-y-1.5 text-sm text-slate-700">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-40" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <Card>
      <CardHeader icon={<FileText className="size-5" />} title={title} action={<AiBadge label={aiLabel} />} />
      <div className="space-y-4 p-5">
        <Prose>{content.summary}</Prose>
        <div className="grid gap-3 md:grid-cols-2">
          {list(<CheckCircle2 className="size-4" />, t("report.strengths"), content.strengths, "text-emerald-700")}
          {list(<AlertTriangle className="size-4" />, t("report.challenges"), content.challenges, "text-amber-700")}
          {list(<Eye className="size-4" />, t("report.behaviors"), content.behaviors, "text-violet-700")}
          {list(<Lightbulb className="size-4" />, t("report.recommendations"), content.recommendations, "text-brand-700")}
        </div>
      </div>
    </Card>
  );
}

/** Full plan view: unified insight, goals, 12-week phases with tasks. `currentWeek` highlights the active week. */
export function PlanView({ content, t, currentWeek, compact }: { content: PlanContent; t: TFn; currentWeek?: number; compact?: boolean }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader icon={<Lightbulb className="size-5" />} title={t("plan.unifiedInsight")} />
        <div className="p-5">
          <Prose>{content.unifiedInsight}</Prose>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Target className="size-5" />} title={t("plan.goals")} />
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {content.goals.map((g, i) => (
            <div key={i} className="rounded-xl border border-line p-4">
              <DomainBadge domain={g.domain} t={t} />
              <p className="mt-2 text-sm leading-7 text-slate-700">{g.goal}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<CalendarRange className="size-5" />} title={t("plan.phases")} subtitle={t("plan.phasesHint")} />
        <div className="divide-y divide-line">
          {content.phases.map((ph) => {
            const active = currentWeek === ph.week;
            return (
              <details key={ph.week} open={active || (!compact && ph.week === 1)} className={`group ${active ? "bg-brand-50/50" : ""}`}>
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${active ? "bg-brand-600 text-white" : "bg-surface text-slate-600"}`}>
                    {ph.week}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">
                      {t("common.week")} {ph.week} — {ph.title}
                    </p>
                    <p className="truncate text-sm text-muted">{ph.focus}</p>
                  </div>
                  {active && <Badge tone="blue">{t("plan.currentWeek")}</Badge>}
                  <span className="text-slate-400 transition group-open:rotate-180">⌄</span>
                </summary>
                <div className="grid gap-3 px-5 pb-5 md:grid-cols-3">
                  {ph.tasks.map((task, i) => (
                    <div key={i} className="rounded-xl border border-line bg-white p-4">
                      <DomainBadge domain={task.domain} t={t} />
                      <p className="mt-2 font-medium text-ink">{task.title}</p>
                      <p className="mt-1 text-sm text-muted">{task.description}</p>
                      <p className="mt-2 rounded-lg bg-surface p-2.5 text-xs leading-6 text-slate-600">💡 {task.howTo}</p>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
