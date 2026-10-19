import Link from "next/link";
import clsx, { type ClassValue } from "clsx";
import { Sparkles } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export function cn(...v: ClassValue[]) {
  return clsx(v);
}

/* ───────── Button ───────── */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "care" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20",
  care: "bg-care-500 text-white hover:bg-care-600 shadow-sm shadow-care-500/20",
  secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  outline: "border border-line bg-white text-ink hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-ink",
  danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 min-h-[44px] sm:min-h-0",
    variants[variant],
    sizes[size],
    className
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/* ───────── Card ───────── */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-white shadow-card", className)} {...props} />;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 border-b border-line px-5 py-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-ink truncate">{title}</h3>
          {subtitle && <p className="text-sm text-muted truncate">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ───────── Badge ───────── */
type Tone = "blue" | "teal" | "amber" | "rose" | "gray" | "violet" | "green";
const tones: Record<Tone, string> = {
  blue: "bg-brand-50 text-brand-700 ring-brand-200",
  teal: "bg-care-50 text-care-700 ring-care-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  gray: "bg-slate-50 text-slate-600 ring-slate-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
export function Badge({ tone = "blue", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function AiBadge({ label = "AI", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-brand-600 to-care-500 px-2.5 py-0.5 text-xs font-medium text-white",
        className
      )}
    >
      <Sparkles className="size-3" />
      {label}
    </span>
  );
}

/* ───────── Form controls ───────── */
const field =
  "w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-slate-400 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(field, "h-11", className)} {...props} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(field, "py-3 leading-7", className)} {...props} />;
}
export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(field, "h-11", className)} {...props} />;
}
export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-ink", className)} {...props} />;
}
export function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/* ───────── Avatar ───────── */
const avatarColors = [
  "bg-brand-100 text-brand-700",
  "bg-care-100 text-care-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];
export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const s = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-14 text-lg" : "size-10 text-sm";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        avatarColors[hash % avatarColors.length],
        s,
        className
      )}
    >
      {initials}
    </div>
  );
}

/* ───────── Progress ───────── */
export function ProgressBar({ value, tone = "brand", className }: { value: number; tone?: "brand" | "care" | "amber"; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const color = tone === "care" ? "bg-care-500" : tone === "amber" ? "bg-amber-500" : "bg-brand-600";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 96,
  stroke = 9,
  label,
  color = "#1565d8",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e8eef7" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-ink" dir="ltr">
          {Math.round(v)}%
        </span>
        {label && <span className="text-[11px] text-muted">{label}</span>}
      </div>
    </div>
  );
}

/* ───────── Layout helpers ───────── */
export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
      <div>
        {back}
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = "blue",
  hint,
}: {
  label: ReactNode;
  value: ReactNode;
  icon: ReactNode;
  tone?: "blue" | "teal" | "amber" | "violet" | "rose";
  hint?: ReactNode;
}) {
  const t = {
    blue: "bg-brand-50 text-brand-600",
    teal: "bg-care-50 text-care-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    rose: "bg-rose-50 text-rose-600",
  }[tone];
  return (
    <Card className="p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <div className={cn("flex size-11 items-center justify-center rounded-xl", t)}>{icon}</div>
      </div>
    </Card>
  );
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: ReactNode; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Renders AI/long text with preserved line breaks. */
export function Prose({ children, className }: { children: string; className?: string }) {
  return <div className={cn("whitespace-pre-line leading-8 text-[15px] text-slate-700", className)}>{children}</div>;
}
