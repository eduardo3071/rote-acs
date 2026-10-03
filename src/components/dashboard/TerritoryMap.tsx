import { TERRITORY_CENTER, TERRITORY_RADIUS_M, type Family } from "@/data/families";
import { riskLevel, type RiskLevel } from "@/lib/risk";

const fill: Record<RiskLevel, string> = {
  high: "fill-risk-high",
  medium: "fill-risk-medium",
  low: "fill-risk-low",
};

const M_PER_DEG = 111_320;
const cosLat = Math.cos((TERRITORY_CENTER.latitude * Math.PI) / 180);

/** Project fictional coordinates into a 0–100 box centred on the territory. */
function project(f: Family) {
  const north = (f.latitude - TERRITORY_CENTER.latitude) * M_PER_DEG;
  const east = (f.longitude - TERRITORY_CENTER.longitude) * M_PER_DEG * cosLat;
  const r = TERRITORY_RADIUS_M * 1.05;
  return { x: 50 + (east / r) * 48, y: 50 - (north / r) * 48 };
}

/** Compact dot map of the demo territory (fictional coordinates). */
export function TerritoryMap({ families, focusId }: { families: Family[]; focusId?: string }) {
  const pts = families.map((f) => ({ f, ...project(f), level: riskLevel(f.riskScore) }));
  const cluster = pts.filter((p) => p.f.clusterRisk);
  const cx = cluster.reduce((s, p) => s + p.x, 0) / (cluster.length || 1);
  const cy = cluster.reduce((s, p) => s + p.y, 0) / (cluster.length || 1);
  const focus = pts.find((p) => p.f.id === focusId);
  const ordered = [...pts].sort((a, b) => a.f.riskScore - b.f.riskScore);

  return (
    <svg viewBox="0 0 100 100" className="aspect-square w-full" role="img"
      aria-label="Mapa ilustrativo do território com as famílias coloridas por prioridade">
      {[16, 32, 48].map((r) => (
        <circle key={r} cx={50} cy={50} r={r} className="fill-none stroke-border" strokeWidth={0.4} strokeDasharray="1 1.5" />
      ))}
      <line x1={50} y1={2} x2={50} y2={98} className="stroke-border" strokeWidth={0.3} />
      <line x1={2} y1={50} x2={98} y2={50} className="stroke-border" strokeWidth={0.3} />
      {cluster.length > 1 && (
        <circle cx={cx} cy={cy} r={7} className="fill-risk-high/10 stroke-risk-high" strokeWidth={0.5} strokeDasharray="1.2 1">
          <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      {ordered.map((p) => (
        <circle key={p.f.id} cx={p.x} cy={p.y} r={p.level === "high" ? 1.8 : 1.4} className={fill[p.level]}
          opacity={p.level === "low" ? 0.7 : 1}>
          <title>{p.f.name}</title>
        </circle>
      ))}
      {focus && (
        <g>
          <circle cx={focus.x} cy={focus.y} r={3.4} className="fill-none stroke-risk-high" strokeWidth={0.6} />
          <circle cx={focus.x} cy={focus.y} r={2.2} className="fill-risk-high" />
        </g>
      )}
    </svg>
  );
}
