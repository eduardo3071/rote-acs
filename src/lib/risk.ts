/**
 * Central risk-priority rules for screens. RiskScore = visit priority, never a diagnosis.
 * Thresholds come from RiskBadge's riskLevel so there is one source of truth.
 */
import { riskLevel, type RiskLevel } from "@/components/RiskBadge";
import { daysSinceVisit, waterSourceLabels, type Family } from "@/data/families";

export { riskLevel, type RiskLevel };

export const priorityLabels: Record<RiskLevel, string> = {
  high: "Alta prioridade",
  medium: "Atenção",
  low: "OK",
};

export const priorityShort: Record<RiskLevel, string> = {
  high: "Alta",
  medium: "Atenção",
  low: "OK",
};

export type RiskFilterValue = "all" | RiskLevel;

export const matchesFilter = (f: Family, filter: RiskFilterValue) =>
  filter === "all" || riskLevel(f.riskScore) === filter;

export function countByLevel(families: Family[]) {
  const out = { high: 0, medium: 0, low: 0 } as Record<RiskLevel, number>;
  for (const f of families) out[riskLevel(f.riskScore)]++;
  return out;
}

export function daysAgoLabel(family: Family): string {
  const d = daysSinceVisit(family);
  return d === 0 ? "hoje" : d === 1 ? "1 dia atrás" : `${d} dias atrás`;
}

/** Short card line built only from the family's own fields. */
export function shortRiskReason(f: Family): string {
  const parts: string[] = [];
  if (f.clusterRisk && f.giSymptoms) parts.push("Vizinho com diarreia", "mesma fonte de água");
  else if (f.clusterRisk) parts.push("Vizinho em risco", "mesma fonte de água");
  else {
    if (f.giSymptoms) parts.push("Sintoma gastrointestinal");
    if (f.feverSymptoms) parts.push("Febre registrada");
  }
  if (parts.length === 0) {
    const d = daysSinceVisit(f);
    if (d >= 15) parts.push(`Sem visita há ${d} dias`);
    if (f.childrenUnder5 > 0)
      parts.push(f.childrenUnder5 === 1 ? "1 criança menor de 5 anos" : `${f.childrenUnder5} crianças menores de 5 anos`);
    if (!f.vaccinationsUpToDate) parts.push("Vacinação atrasada");
  }
  return parts.slice(0, 2).join(" · ") || "Sem alertas no momento";
}

export const waterLabel = (f: Family) => waterSourceLabels[f.waterSource];
