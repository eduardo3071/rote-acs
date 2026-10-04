import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { fill, useAppTranslations } from "@/lib/app-translations";

export type RiskLevel = "high" | "medium" | "low";

const riskBadgeVariants = cva("risk-badge", {
  variants: {
    level: {
      high: "border-risk-high bg-risk-high/13 text-risk-high shadow-risk-high",
      medium: "border-risk-medium bg-risk-medium/13 text-risk-medium shadow-risk-medium",
      low: "border-risk-low bg-risk-low/13 text-risk-low shadow-risk-low",
    },
  },
  defaultVariants: { level: "low" },
});

/** 70–100 → alto (vermelho) · 40–69 → médio (amarelo) · 0–39 → baixo (verde) */
export function riskLevel(score: number): RiskLevel {
  const s = clampScore(score);
  if (s >= 70) return "high";
  if (s >= 40) return "medium";
  return "low";
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export const riskLabels: Record<RiskLevel, string> = {
  high: "Risco alto",
  medium: "Risco médio",
  low: "Risco baixo",
};

type RiskBadgeProps = Omit<React.ComponentPropsWithoutRef<"div">, "className"> &
  VariantProps<typeof riskBadgeVariants> & {
    /** Score from 0 to 100. Values outside the range are clamped. */
    score?: number;
    /** Alias of `score` (spec name). */
    riskScore?: number;
    className?: string;
    /** Overrides the visible text; defaults to the clamped score. */
    display?: string;
    /** Accessible description, e.g. "Risco alto, 87 de 100". */
    label?: string;
  };

export function RiskBadge({
  score,
  riskScore,
  level,
  className,
  display,
  label,
  ...props
}: RiskBadgeProps) {
  const { m } = useAppTranslations();
  const value = clampScore(riskScore ?? score ?? 0);
  const resolved = level ?? riskLevel(value);
  const riskLabel = resolved === "high" ? m.risk.highAria : resolved === "medium" ? m.risk.mediumAria : m.risk.lowAria;

  return (
    <div
      role="img"
      aria-label={label ?? fill(m.risk.scoreAria, { level: riskLabel, score: value })}
      className={cn(riskBadgeVariants({ level: resolved }), className)}
      {...props}
    >
      {display ?? value}
    </div>
  );
}
