import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type MetricTone = "high" | "medium" | "low" | "primary";
const tones: Record<MetricTone, string> = {
  high: "text-risk-high",
  medium: "text-risk-medium",
  low: "text-risk-low",
  primary: "text-primary",
};

export function DashboardMetricCard({ icon: Icon, tone, value, label }: {
  icon: LucideIcon; tone: MetricTone; value: number; label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
      <Icon className={cn("size-4 shrink-0", tones[tone])} aria-hidden />
      <span className={cn("text-subtitle font-bold tabular-nums", tones[tone])}>{value}</span>
      <span className="min-w-0 text-label leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}
