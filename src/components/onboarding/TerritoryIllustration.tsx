import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

const nodes = [
  { x: 50, y: 14, tone: "high" },
  { x: 86, y: 40, tone: "medium" },
  { x: 84, y: 74, tone: "low" },
  { x: 16, y: 74, tone: "high" },
  { x: 12, y: 38, tone: "low" },
  { x: 50, y: 92, tone: "medium" },
] as const;

const toneClass = {
  high: "border-risk-high bg-risk-high/15 text-risk-high shadow-risk-high",
  medium: "border-risk-medium bg-risk-medium/15 text-risk-medium shadow-risk-medium",
  low: "border-risk-low bg-risk-low/15 text-risk-low shadow-risk-low",
};

/** Families (houses) linked to a central territory hub, tinted by priority. */
export function TerritoryIllustration({ play }: { play: boolean }) {
  return (
    <div className="relative aspect-square w-full max-w-[280px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-primary" fill="none" aria-hidden>
        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.4" strokeDasharray="1 2" />
        {play &&
          nodes.map((n, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={n.x}
              y2={n.y}
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="0.5"
              className="animate-draw-line"
              style={{ animationDelay: `${150 + i * 60}ms` }}
            />
          ))}
      </svg>

      <div className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill border border-primary/40 bg-elevated shadow-primary">
        <span className="label-caps text-primary">Área</span>
      </div>

      {nodes.map((n, i) => (
        <div
          key={i}
          className={cn(
            "absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill border-2",
            toneClass[n.tone],
            play ? "animate-pop-in" : "opacity-0",
          )}
          style={{ left: `${n.x}%`, top: `${n.y}%`, animationDelay: `${300 + i * 80}ms` }}
        >
          <Home className="size-5" strokeWidth={2} aria-hidden />
        </div>
      ))}
    </div>
  );
}
