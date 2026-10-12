import { HeartPulse } from "lucide-react";
import { cn } from "./ui";

export function Logo({ name, tagline, className, light }: { name: string; tagline?: string; className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-care-500 text-white shadow-pop">
        <HeartPulse className="size-5" strokeWidth={2.2} />
        <span className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-600 ring-2 ring-brand-50">
          +
        </span>
      </div>
      <div className="leading-tight">
        <div className={cn("text-lg font-bold tracking-tight", light ? "text-white" : "text-ink")}>{name}</div>
        {tagline && <div className={cn("text-[11px]", light ? "text-white/70" : "text-muted")}>{tagline}</div>}
      </div>
    </div>
  );
}
