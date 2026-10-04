import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { RiskBadge, riskLevel, type RiskLevel } from "@/components/RiskBadge";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const rows = [
  { nameKey: "onboarding.priority.familyB", score: 87, move: "up", noteKey: "onboarding.priority.up" },
  { nameKey: "onboarding.priority.familyC", score: 61, move: "same", noteKey: "onboarding.priority.same" },
  { nameKey: "onboarding.priority.familyA", score: 32, move: "down", noteKey: "onboarding.priority.down" },
] as const;

const moveIcon = { up: ArrowUp, same: Minus, down: ArrowDown };
const riskLabelKeys: Record<RiskLevel, "onboarding.priority.high" | "onboarding.priority.medium" | "onboarding.priority.low"> = {
  high: "onboarding.priority.high",
  medium: "onboarding.priority.medium",
  low: "onboarding.priority.low",
};

/** A reordered visit list: the family whose risk rose jumps to the top. */
export function PriorityIllustration({ play }: { play: boolean }) {
  const t = useT();

  return (
    <div className="relative w-full max-w-[320px]">
      <div aria-hidden className="absolute bottom-8 left-[42px] top-8 w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent" />
      <ol className="relative flex flex-col gap-3">
        {rows.map((r, i) => {
          const Icon = moveIcon[r.move];
          const level = riskLevel(r.score);
          return (
            <li
              key={r.nameKey}
              className={cn(
                "flex items-center gap-4 rounded-lg border bg-card p-3 shadow-card",
                r.move === "up" ? "border-risk-high/50 bg-elevated" : "border-border",
                play ? "animate-rise-in" : "opacity-0",
              )}
              style={{ animationDelay: `${200 + i * 130}ms` }}
            >
              <RiskBadge score={r.score} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-body font-semibold text-ink">{t(r.nameKey)}</span>
                <span className="text-small text-ink-soft">{t(riskLabelKeys[level])}</span>
              </div>
              <span
                className={cn(
                  "flex items-center gap-1 text-small font-semibold",
                  r.move === "up" && "text-risk-high",
                  r.move === "same" && "text-ink-soft",
                  r.move === "down" && "text-risk-low",
                )}
                aria-label={t(r.noteKey)}
              >
                <Icon className="size-4" aria-hidden />
                {t("onboarding.position", { position: String(i + 1) })}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
