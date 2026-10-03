/**
 * Mock territory dataset — 50 fictional families around a demo centre point.
 * Coordinates are demonstration data only; they do not represent real homes.
 * A future backend can replace this module without touching screens.
 */

export type WaterSource = "well" | "river" | "tap";

export interface Family {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  waterSource: WaterSource;
  childrenUnder5: number;
  lastVisit: string; // ISO date
  giSymptoms: boolean;
  feverSymptoms: boolean;
  vaccinationsUpToDate: boolean;
  riskScore: number; // 0–100
  riskReason: string;
  clusterRisk: boolean;
}

export type FamilyInput = Omit<Family, "riskScore" | "riskReason">;

export const TERRITORY_CENTER = { latitude: -1.2921, longitude: 36.8219 } as const;
export const TERRITORY_RADIUS_M = 2000;

export const waterSourceLabels: Record<WaterSource, string> = {
  well: "Poço",
  river: "Rio",
  tap: "Torneira",
};

const DAY_MS = 86_400_000;

export function daysSinceVisit(family: Pick<Family, "lastVisit">, now = Date.now()): number {
  return Math.max(0, Math.round((now - new Date(family.lastVisit).getTime()) / DAY_MS));
}

/** Deterministic, explainable score (no ML yet). Always 0–100. */
export function calculateMockRiskScore(family: FamilyInput, now = Date.now()): number {
  const days = Math.min(daysSinceVisit(family, now), 45);
  let score = 5;
  score += (days / 45) * 20;
  if (family.giSymptoms) score += 30;
  if (family.feverSymptoms) score += 20;
  score += Math.min(family.childrenUnder5, 3) * 5;
  if (!family.vaccinationsUpToDate) score += 10;
  if (family.clusterRisk) score += 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Short, plain-language reason for the score. */
export function generateRiskReason(family: FamilyInput, now = Date.now()): string {
  if (family.clusterRisk && family.giSymptoms && family.childrenUnder5 > 0) {
    return "Vizinho com sintoma gastrointestinal, mesma fonte de água e presença de crianças pequenas.";
  }
  if (family.clusterRisk) return "Família próxima a domicílio com risco e mesma fonte de água.";
  if (family.giSymptoms && family.feverSymptoms) return "Sintoma gastrointestinal e febre registrados.";
  if (family.giSymptoms) return "Sintoma gastrointestinal registrado recentemente.";
  if (family.feverSymptoms) return "Febre registrada recentemente.";
  const late = daysSinceVisit(family, now) >= 30;
  if (late && family.childrenUnder5 > 0) return "Visita atrasada e presença de crianças pequenas.";
  if (!family.vaccinationsUpToDate) return "Vacinação atrasada.";
  if (late) return "Visita atrasada.";
  if (family.childrenUnder5 > 0) return "Crianças pequenas em casa.";
  return "Sem alertas no momento.";
}

// ---------- dataset generation (deterministic) ----------

const NAMES = [
  "Wanjiku", "Osei", "Kimani", "Amara", "Fatima", "Achieng", "Kwame", "Nyambura", "Adebayo", "Zawadi",
  "Mensah", "Njeri", "Chukwu", "Aisha", "Otieno", "Makena", "Baraka", "Imani", "Kofi", "Wambui",
  "Mwangi", "Nia", "Juma", "Halima", "Okoro", "Akinyi", "Tendai", "Sefu", "Chiamaka", "Mutua",
  "Asha", "Kariuki", "Ayodele", "Wairimu", "Obi", "Neema", "Kipchoge", "Abena", "Musa", "Zuri",
  "Odhiambo", "Folami", "Ndungu", "Kesi", "Adjoa", "Waweru", "Eshe", "Onyango", "Thandiwe", "Jabari",
];

const NOW = Date.now();
const isoDaysAgo = (d: number) => new Date(NOW - d * DAY_MS).toISOString();

/** Offset a point by metres north/east. */
function offset(north: number, east: number) {
  const lat = TERRITORY_CENTER.latitude + north / 111_320;
  const lng =
    TERRITORY_CENTER.longitude +
    east / (111_320 * Math.cos((TERRITORY_CENTER.latitude * Math.PI) / 180));
  return { latitude: +lat.toFixed(6), longitude: +lng.toFixed(6) };
}

// Demo cluster: 001–003 share a well, all within ~120 m of each other.
const cluster: FamilyInput[] = [
  { id: "001", name: "Wanjiku", ...offset(0, 0), waterSource: "well", childrenUnder5: 2, lastVisit: isoDaysAgo(39),
    giSymptoms: true, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: true },
  { id: "002", name: "Osei", ...offset(60, 45), waterSource: "well", childrenUnder5: 3, lastVisit: isoDaysAgo(20),
    giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: true },
  { id: "003", name: "Kimani", ...offset(-40, 70), waterSource: "well", childrenUnder5: 2, lastVisit: isoDaysAgo(30),
    giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: true },
];

const SOURCES: WaterSource[] = ["tap", "well", "river"];
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const others: FamilyInput[] = NAMES.slice(3).map((name, k) => {
  const i = k + 4; // ids 004–050
  const r = 350 + ((i * 373) % 1600); // 350–1950 m from centre
  const a = i * GOLDEN;
  return {
    id: String(i).padStart(3, "0"),
    name,
    ...offset(r * Math.cos(a), r * Math.sin(a)),
    waterSource: SOURCES[(i * 7) % 3],
    childrenUnder5: (i * 5) % 4,
    lastVisit: isoDaysAgo(5 + ((i * 17) % 41)), // 5–45 days
    giSymptoms: i % 9 === 0,
    feverSymptoms: i % 11 === 0,
    vaccinationsUpToDate: i % 6 !== 0,
    clusterRisk: false,
  };
});

export const mockFamilies: Family[] = [...cluster, ...others].map((f) => ({
  ...f,
  riskScore: calculateMockRiskScore(f, NOW),
  riskReason: generateRiskReason(f, NOW),
}));

// ---------- selectors for upcoming phases ----------

export type RiskLevel = "high" | "medium" | "low";
export const riskLevelOf = (score: number): RiskLevel =>
  score >= 70 ? "high" : score >= 40 ? "medium" : "low";

export const getFamilyById = (id: string) => mockFamilies.find((f) => f.id === id);
export const getHighRiskFamilies = () =>
  getFamiliesSortedByRisk().filter((f) => riskLevelOf(f.riskScore) === "high");
export const getFamiliesSortedByRisk = () =>
  [...mockFamilies].sort((a, b) => b.riskScore - a.riskScore);

export function getRiskSummary() {
  const count = (l: RiskLevel) => mockFamilies.filter((f) => riskLevelOf(f.riskScore) === l).length;
  return { total: mockFamilies.length, high: count("high"), medium: count("medium"), low: count("low") };
}
