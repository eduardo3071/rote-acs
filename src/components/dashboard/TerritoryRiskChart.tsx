import type { RiskLevel } from "@/lib/risk";

const order: RiskLevel[] = ["high", "medium", "low"];
const stroke: Record<RiskLevel, string> = {
  high: "stroke-risk-high",
  medium: "stroke-risk-medium",
  low: "stroke-risk-low",
};

/** Semicircular distribution gauge drawn in SVG. */
export function TerritoryRiskChart({ counts, total }: { counts: Record<RiskLevel, number>; total: number }) {
  const GAP = total > 0 ? 1.2 : 0;
  let start = 0;
  const segments = order
    .filter((l) => counts[l] > 0)
    .map((l) => {
      const len = (counts[l] / Math.max(total, 1)) * 100;
      const seg = { l, start, len: Math.max(len - GAP, 0.6) };
      start += len;
      return seg;
    });
  const arc = "M 12 64 A 52 52 0 0 1 116 64";

  return (
    <div className="relative mx-auto w-full max-w-[15rem]">
      <svg viewBox="0 0 128 72" className="w-full overflow-visible" role="img"
        aria-label={`${counts.high} alta prioridade, ${counts.medium} atenção, ${counts.low} OK`}>
        <path d={arc} pathLength={100} fill="none" strokeWidth={10} strokeLinecap="round" className="stroke-elevated" />
        {segments.map((s) => (
          <path key={s.l} d={arc} pathLength={100} fill="none" strokeWidth={10} strokeLinecap="butt"
            strokeDasharray={`${s.len} 100`} strokeDashoffset={-s.start}
            className={stroke[s.l]} />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="text-display font-bold leading-none text-foreground">{total}</span>
        <span className="label-caps mt-1 text-muted-foreground">famílias</span>
      </div>
    </div>
  );
}
