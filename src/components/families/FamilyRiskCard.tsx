import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import type { Family } from "@/data/families";
import { daysAgoLabel, priorityShort, riskLevel, shortRiskReason, type RiskLevel } from "@/lib/risk";
import { cn } from "@/lib/utils";

const bar: Record<RiskLevel, string> = { high: "bg-risk-high", medium: "bg-risk-medium", low: "bg-risk-low" };
const text: Record<RiskLevel, string> = { high: "text-risk-high", medium: "text-risk-medium", low: "text-risk-low" };

export function FamilyRiskCard({ family, style }: { family: Family; style?: React.CSSProperties }) {
  const level = riskLevel(family.riskScore);
  return (
    <Link to="/familias/$id" params={{ id: family.id }} style={style}
      className={cn("relative block overflow-hidden rounded-lg border bg-card transition-transform active:scale-[0.99] animate-rise-in",
        level === "high" ? "border-risk-high/40 shadow-risk-high" : "border-border")}>
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", bar[level])} />
      <div className="flex items-center gap-4 py-4 pl-6 pr-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-subtitle font-bold text-foreground">{family.name}</h3>
          <p className="mt-1 text-small text-muted-foreground">{shortRiskReason(family)}</p>
          <p className="mt-1 text-label text-ink-faint">Última visita: {daysAgoLabel(family)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <RiskBadge score={family.riskScore} />
          <span className={cn("text-label font-semibold", text[level])}>{priorityShort[level]}</span>
        </div>
      </div>
      {level === "high" && (
        <div className="flex items-center gap-2 bg-risk-high/18 py-2 pl-6 pr-4 text-label font-bold tracking-[0.5px] text-risk-high">
          <AlertTriangle className="size-3" aria-hidden /> VISITAR HOJE
        </div>
      )}
    </Link>
  );
}
