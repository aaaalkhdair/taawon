"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useT } from "@/i18n/client";

export const DOMAIN_COLORS: Record<string, string> = {
  communication: "#1565d8",
  cognitive: "#8b5cf6",
  behavior: "#0ea5a4",
  daily_living: "#f59e0b",
  overall: "#0f1f38",
};

type Weekly = { week: number; overall: number; [k: string]: number };

/** Weekly trend per domain (area chart). */
export function ProgressTrendChart({ data, height = 280, domains = ["communication", "cognitive", "behavior", "daily_living"] }: { data: Weekly[]; height?: number; domains?: string[] }) {
  const { t, locale } = useT();
  const rows = data.map((d) => ({ ...d, label: `${t("common.week")} ${d.week}` }));
  return (
    <div dir="ltr" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {domains.map((d) => (
              <linearGradient key={d} id={`g-${d}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DOMAIN_COLORS[d]} stopOpacity={0.25} />
                <stop offset="100%" stopColor={DOMAIN_COLORS[d]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e9f2" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5b6b82" }} axisLine={false} tickLine={false} reversed={locale === "ar"} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#5b6b82" }} axisLine={false} tickLine={false} orientation={locale === "ar" ? "right" : "left"} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e3e9f2", fontFamily: "inherit", direction: locale === "ar" ? "rtl" : "ltr" }}
            formatter={(v, name) => [`${v}%`, t(`domain.${name}`)]}
          />
          <Legend formatter={(v) => <span style={{ color: "#5b6b82", fontSize: 12 }}>{t(`domain.${v}`)}</span>} />
          {domains.map((d) => (
            <Area key={d} type="monotone" dataKey={d} stroke={DOMAIN_COLORS[d]} strokeWidth={2.5} fill={`url(#g-${d})`} dot={false} activeDot={{ r: 5 }} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Current level per domain (radar chart). */
export function SkillsRadar({ data, height = 280 }: { data: { domain: string; value: number }[]; height?: number }) {
  const { t } = useT();
  const rows = data.map((d) => ({ ...d, label: t(`domain.${d.domain}`) }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={rows} outerRadius="72%">
          <PolarGrid stroke="#e3e9f2" />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: "#5b6b82" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#1565d8" fill="#1565d8" fillOpacity={0.2} strokeWidth={2} />
          <Tooltip formatter={(v) => [`${v}%`, ""]} contentStyle={{ borderRadius: 12, border: "1px solid #e3e9f2" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
