import { daysSinceVisit, type Family, type WaterSource } from "@/data/families";
import type { AppTranslations } from "@/lib/app-translations";
import { fill } from "@/lib/app-translations";
import type { RiskLevel } from "@/lib/risk";

export function localizedPriority(level: RiskLevel, m: AppTranslations) {
  return level === "high" ? m.risk.high : level === "medium" ? m.risk.medium : m.risk.low;
}
export function localizedPriorityShort(level: RiskLevel, m: AppTranslations) {
  return level === "high" ? m.risk.highShort : level === "medium" ? m.risk.mediumShort : m.risk.lowShort;
}
export function localizedRiskClass(level: RiskLevel, m: AppTranslations) {
  return level === "high" ? m.risk.highClass : level === "medium" ? m.risk.mediumClass : m.risk.lowClass;
}
export function localizedWater(source: WaterSource, m: AppTranslations) { return m.water[source]; }
export function localizedDaysAgo(f: Pick<Family, "lastVisit">, m: AppTranslations) {
  const days = daysSinceVisit(f);
  return days === 0 ? m.common.today : days === 1 ? m.common.dayAgo : fill(m.common.daysAgo, { count: days });
}
export function localizedReason(f: Family, m: AppTranslations) {
  const parts: string[] = [];
  if (f.clusterRisk && f.giSymptoms) parts.push(m.reason.neighborDiarrhea, m.reason.sameWater);
  else if (f.clusterRisk) parts.push(m.reason.neighborRisk, m.reason.sameWater);
  else { if (f.giSymptoms) parts.push(m.reason.gi); if (f.feverSymptoms) parts.push(m.reason.fever); }
  if (!parts.length) {
    const d = daysSinceVisit(f);
    if (d >= 15) parts.push(fill(m.reason.noVisit, { count: d }));
    if (f.childrenUnder5 > 0) parts.push(f.childrenUnder5 === 1 ? m.reason.oneChild : fill(m.reason.children, { count: f.childrenUnder5 }));
    if (!f.vaccinationsUpToDate) parts.push(m.reason.vaccinesLate);
  }
  return parts.slice(0, 2).join(" · ") || m.reason.none;
}