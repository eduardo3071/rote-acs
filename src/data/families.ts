/**
 * Local territory dataset — 50 fictional families in Anapu, PA.
 * Coordinates come from the IBGE CNEFE 2022 rural-household survey (domínio público);
 * names are fictional, for demonstration only. Mirrors the 50 rows seeded into the
 * Supabase `families` table (see Fase 11) so the ids line up: this file is the instant,
 * synchronous paint + offline fallback, while `src/lib/territory.ts` swaps in live
 * Supabase data once it loads. A future backend can replace this module without
 * touching screens.
 */

export type WaterSource = "well" | "river" | "igarape" | "tap" | "other";

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
  /** Pregnant woman registered in the household (database only). */
  hasPregnant?: boolean;
  /** Elderly/adult with chronic disease registered (database only). */
  hasChronic?: boolean;
}

export type FamilyInput = Omit<Family, "riskScore" | "riskReason">;

/** Real centre of Anapu, PA (sede do município) — see Fase 11 seed. */
export const TERRITORY_CENTER = { latitude: -3.47222, longitude: -51.19778 } as const;
export const TERRITORY_RADIUS_M = 5000;

export const waterSourceLabels: Record<WaterSource, string> = {
  well: "Poço",
  river: "Rio",
  igarape: "Igarapé",
  tap: "Torneira",
  other: "Outra",
};

const DAY_MS = 86_400_000;

export function daysSinceVisit(family: Pick<Family, "lastVisit">, now = Date.now()): number {
  return Math.max(0, Math.round((now - new Date(family.lastVisit).getTime()) / DAY_MS));
}

/** Deterministic, explainable score (no ML yet). Always 0–100. Mirrors the Supabase seed. */
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

// Demo cluster: the first three ids share an igarapé and sit within ~110 m of each other.
export const mockFamilies: Family[] = [
  { id: "f12d3e13-99ee-418d-a95f-cd2761d748ca", name: "Raimunda Silva", latitude: -3.47222, longitude: -51.19778, waterSource: "igarape", childrenUnder5: 2, lastVisit: "2026-08-25T22:18:14.054Z", giSymptoms: true, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: true, riskScore: 87, riskReason: "Vizinho com sintoma gastrointestinal, mesma fonte de água e presença de crianças pequenas." },
  { id: "0c96c82e-0360-4321-a1e8-626cd6dd6ec2", name: "Francisco Pantoja", latitude: -3.471681, longitude: -51.197375, waterSource: "igarape", childrenUnder5: 3, lastVisit: "2026-09-13T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: true, riskScore: 44, riskReason: "Família próxima a domicílio com risco e mesma fonte de água." },
  { id: "a92adc9a-6d7a-4599-aa76-ca497de96981", name: "Maria do Carmo Figueiredo", latitude: -3.472579, longitude: -51.19715, waterSource: "igarape", childrenUnder5: 2, lastVisit: "2026-09-03T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: true, riskScore: 53, riskReason: "Família próxima a domicílio com risco e mesma fonte de água." },
  { id: "29bef017-97ff-4b24-8c13-73966e54be38", name: "Marinalva Guimarães", latitude: -3.488514, longitude: -51.200667, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-09-01T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 19, riskReason: "Visita atrasada." },
  { id: "faba17dc-9281-4fb6-9aae-1aecc4cff83d", name: "Nazaré Viana", latitude: -3.455431, longitude: -51.208479, waterSource: "well", childrenUnder5: 1, lastVisit: "2026-09-25T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 14, riskReason: "Crianças pequenas em casa." },
  { id: "ad51c11d-c9b8-4328-8e4b-523f1d9df858", name: "Valdir Souza", latitude: -3.478255, longitude: -51.175287, waterSource: "igarape", childrenUnder5: 2, lastVisit: "2026-09-08T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: false, riskScore: 36, riskReason: "Vacinação atrasada." },
  { id: "68eb48f1-203a-4898-ae33-8c4738da4782", name: "Rita Serrão", latitude: -3.48448, longitude: -51.221429, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-08-22T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 39, riskReason: "Visita atrasada e presença de crianças pequenas." },
  { id: "b9e8f084-51bf-41bb-bc40-038dda590459", name: "Carmelita Lameira", latitude: -3.444088, longitude: -51.187487, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-09-15T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 13, riskReason: "Sem alertas no momento." },
  { id: "7a1a1d27-f57e-4270-96bd-904eaf28eb5c", name: "Gilvan Esteves", latitude: -3.503001, longitude: -51.185051, waterSource: "other", childrenUnder5: 1, lastVisit: "2026-08-29T22:18:14.054Z", giSymptoms: true, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 56, riskReason: "Sintoma gastrointestinal registrado recentemente." },
  { id: "e1084598-348c-4f80-bc48-71adedfc0d94", name: "Francinete Figueiredo", latitude: -3.456686, longitude: -51.231037, waterSource: "tap", childrenUnder5: 2, lastVisit: "2026-09-22T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 20, riskReason: "Crianças pequenas em casa." },
  { id: "e6f05442-d99a-4124-a343-ccfb708eadc4", name: "Walmir Monteiro", latitude: -3.460248, longitude: -51.159542, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-09-05T22:18:14.054Z", giSymptoms: false, feverSymptoms: true, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 52, riskReason: "Febre registrada recentemente." },
  { id: "04b8e30e-eaff-465d-b38a-5845a815732f", name: "Dorinha Quaresma", latitude: -3.509729, longitude: -51.219557, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-08-19T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: false, riskScore: 35, riskReason: "Vacinação atrasada." },
  { id: "94e7e1ed-744c-4f4f-a6a0-3a2d38d331da", name: "Edivan Castro", latitude: -3.466087, longitude: -51.199131, waterSource: "well", childrenUnder5: 1, lastVisit: "2026-09-12T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 19, riskReason: "Crianças pequenas em casa." },
  { id: "9598233d-be82-4c4d-b1d4-0571fcc8458f", name: "Conceição Sarmento", latitude: -3.477758, longitude: -51.189888, waterSource: "igarape", childrenUnder5: 2, lastVisit: "2026-08-26T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 32, riskReason: "Visita atrasada e presença de crianças pequenas." },
  { id: "bee7be88-01ae-4234-9448-09264618adfa", name: "Aldeci Brabo", latitude: -3.473888, longitude: -51.210677, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-09-19T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 26, riskReason: "Crianças pequenas em casa." },
  { id: "13137de2-d2ce-4ea9-9a5f-338f06e0cc69", name: "Raimunda Pinheiro", latitude: -3.459732, longitude: -51.187236, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-09-02T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 19, riskReason: "Visita atrasada." },
  { id: "c375be61-bfa8-4955-8e23-e6cadbef0d25", name: "José Vilhena", latitude: -3.491885, longitude: -51.196965, waterSource: "other", childrenUnder5: 1, lastVisit: "2026-09-26T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 13, riskReason: "Crianças pequenas em casa." },
  { id: "b0b38ccc-a030-4f27-bd08-de18898e01f3", name: "Rosilene Belfort", latitude: -3.455894, longitude: -51.214057, waterSource: "tap", childrenUnder5: 2, lastVisit: "2026-09-09T22:18:14.054Z", giSymptoms: true, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: false, riskScore: 66, riskReason: "Sintoma gastrointestinal registrado recentemente." },
  { id: "5e595451-6891-4009-8bc7-f8542f20c497", name: "Jorge Gaia", latitude: -3.473439, longitude: -51.171376, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-08-23T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 38, riskReason: "Visita atrasada e presença de crianças pequenas." },
  { id: "b03bd5e2-230d-4ce1-8ea6-d9323fa10649", name: "Marinalva Pereira da Costa", latitude: -3.491271, longitude: -51.220651, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-09-16T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 13, riskReason: "Sem alertas no momento." },
  { id: "368730d2-bf15-466b-af30-27c0340f3909", name: "Nazaré Brasil", latitude: -3.439431, longitude: -51.19336, waterSource: "well", childrenUnder5: 1, lastVisit: "2026-08-30T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 25, riskReason: "Visita atrasada e presença de crianças pequenas." },
  { id: "0571d563-d719-4db1-9993-569f2bcfec5b", name: "Valdir Amoras", latitude: -3.502128, longitude: -51.176932, waterSource: "igarape", childrenUnder5: 2, lastVisit: "2026-09-23T22:18:14.054Z", giSymptoms: false, feverSymptoms: true, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 39, riskReason: "Febre registrada recentemente." },
  { id: "eea44429-e921-49fb-b1fb-69aedc9df5c5", name: "Rita Barata", latitude: -3.463488, longitude: -51.236667, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-09-06T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 32, riskReason: "Crianças pequenas em casa." },
  { id: "039e776a-a2bf-42ab-9af5-329d1b077d3e", name: "Carmelita Chaves", latitude: -3.450773, longitude: -51.160284, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-08-20T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: false, riskScore: 35, riskReason: "Vacinação atrasada." },
  { id: "eb8fc2e3-f10a-4f19-afab-2b26715b28ee", name: "Gilvan Farias", latitude: -3.477997, longitude: -51.199626, waterSource: "other", childrenUnder5: 1, lastVisit: "2026-09-13T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 19, riskReason: "Crianças pequenas em casa." },
  { id: "5a51a4be-07c3-4c82-8271-5894f69d4f23", name: "Francinete Picanço", latitude: -3.463674, longitude: -51.201736, waterSource: "tap", childrenUnder5: 2, lastVisit: "2026-08-27T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 31, riskReason: "Visita atrasada e presença de crianças pequenas." },
  { id: "2b8598fe-6994-46c1-95c2-a999b9fc1f9e", name: "Walmir Gonçalves", latitude: -3.477148, longitude: -51.185983, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-09-20T22:18:14.054Z", giSymptoms: true, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 56, riskReason: "Sintoma gastrointestinal registrado recentemente." },
  { id: "6420569a-cd7e-4f29-aa19-80949c0f6411", name: "Dorinha Diniz", latitude: -3.477674, longitude: -51.212973, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-09-03T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 18, riskReason: "Visita atrasada." },
  { id: "d4d3a119-7618-44bb-8d52-f4bb3d8d54c5", name: "Edivan Pantoja", latitude: -3.454989, longitude: -51.188707, waterSource: "well", childrenUnder5: 1, lastVisit: "2026-09-27T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 13, riskReason: "Crianças pequenas em casa." },
  { id: "4df0bd43-7ef7-4747-8792-6851f7dd88cc", name: "Conceição Ribeiro", latitude: -3.494283, longitude: -51.191953, waterSource: "igarape", childrenUnder5: 2, lastVisit: "2026-09-10T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: false, riskScore: 35, riskReason: "Vacinação atrasada." },
  { id: "a26a5afa-f690-4e63-9148-0bc99132edaf", name: "Aldeci Furtado", latitude: -3.458067, longitude: -51.219831, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-08-24T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 38, riskReason: "Visita atrasada e presença de crianças pequenas." },
  { id: "df0ddcd1-086c-46c7-a139-158446510819", name: "Raimunda Miranda", latitude: -3.46722, longitude: -51.168634, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-09-17T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 12, riskReason: "Sem alertas no momento." },
  { id: "041b1e6c-4048-4a32-8e83-9ff0c289190a", name: "José Palheta", latitude: -3.498207, longitude: -51.217943, waterSource: "other", childrenUnder5: 1, lastVisit: "2026-08-31T22:18:14.054Z", giSymptoms: false, feverSymptoms: true, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 45, riskReason: "Febre registrada recentemente." },
  { id: "46296aae-dd2b-4ad6-8f50-62a058dfd301", name: "Rosilene Moraes", latitude: -3.436124, longitude: -51.200776, waterSource: "tap", childrenUnder5: 2, lastVisit: "2026-09-24T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 19, riskReason: "Crianças pequenas em casa." },
  { id: "48e2a21c-c587-4d6b-98ab-db81006b4e8b", name: "Jorge Costa", latitude: -3.499092, longitude: -51.168679, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-09-07T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 32, riskReason: "Crianças pequenas em casa." },
  { id: "f436cac6-8f59-4201-b167-1ca4a0b0a1e3", name: "Marinalva Trindade", latitude: -3.472011, longitude: -51.24078, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-08-21T22:18:14.054Z", giSymptoms: true, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: false, riskScore: 64, riskReason: "Sintoma gastrointestinal registrado recentemente." },
  { id: "52b75d82-b88f-4e2e-9261-198352ee99ea", name: "Nazaré Azevedo", latitude: -3.468291, longitude: -51.193441, waterSource: "well", childrenUnder5: 1, lastVisit: "2026-09-14T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 18, riskReason: "Crianças pequenas em casa." },
  { id: "50fad74b-2e42-4a8e-b996-13ea023326e2", name: "Valdir Fonseca", latitude: -3.481379, longitude: -51.19863, waterSource: "igarape", childrenUnder5: 2, lastVisit: "2026-08-28T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 31, riskReason: "Visita atrasada e presença de crianças pequenas." },
  { id: "71d7c10b-0713-4f04-8502-e92e0d56d094", name: "Rita Nogueira", latitude: -3.462224, longitude: -51.205381, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-09-21T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 25, riskReason: "Crianças pequenas em casa." },
  { id: "54bdc2ce-08af-4fd7-8f81-ba819a311b40", name: "Carmelita Tavares", latitude: -3.475066, longitude: -51.182108, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-09-04T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 18, riskReason: "Sem alertas no momento." },
  { id: "6c789f49-1e18-4597-91c7-9657fbf41a5f", name: "Gilvan Teixeira", latitude: -3.482473, longitude: -51.214103, waterSource: "other", childrenUnder5: 1, lastVisit: "2026-09-28T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 12, riskReason: "Crianças pequenas em casa." },
  { id: "76a56bed-1835-4153-9d97-53258f08a532", name: "Francinete Lobato", latitude: -3.450422, longitude: -51.191795, waterSource: "tap", childrenUnder5: 2, lastVisit: "2026-09-11T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: false, riskScore: 35, riskReason: "Vacinação atrasada." },
  { id: "af044e0c-4e71-4eff-a2db-13ad88561ac5", name: "Walmir Bentes", latitude: -3.495309, longitude: -51.185909, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-08-25T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 37, riskReason: "Visita atrasada e presença de crianças pequenas." },
  { id: "ccc981ba-5ea4-4815-b810-c165be8dc962", name: "Dorinha Dias", latitude: -3.462034, longitude: -51.225306, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-09-18T22:18:14.054Z", giSymptoms: false, feverSymptoms: true, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 32, riskReason: "Febre registrada recentemente." },
  { id: "37aa566f-179c-4821-ba0f-7850c8e579a1", name: "Edivan Araújo", latitude: -3.459908, longitude: -51.167481, waterSource: "well", childrenUnder5: 1, lastVisit: "2026-09-01T22:18:14.054Z", giSymptoms: true, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 54, riskReason: "Sintoma gastrointestinal registrado recentemente." },
  { id: "da2631cd-4e6a-46d2-b40f-b31d8c845e21", name: "Conceição Freitas", latitude: -3.504756, longitude: -51.213228, waterSource: "igarape", childrenUnder5: 2, lastVisit: "2026-09-25T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 19, riskReason: "Crianças pequenas em casa." },
  { id: "c4de8d73-ca2f-40e6-b430-f6ae18892f74", name: "Aldeci Cunha", latitude: -3.434612, longitude: -51.209396, waterSource: "river", childrenUnder5: 3, lastVisit: "2026-09-08T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 31, riskReason: "Crianças pequenas em casa." },
  { id: "130bde00-6f0d-4c14-9aa4-b879538ed664", name: "Raimunda Silva", latitude: -3.493813, longitude: -51.160868, waterSource: "igarape", childrenUnder5: 0, lastVisit: "2026-08-22T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: false, clusterRisk: false, riskScore: 34, riskReason: "Vacinação atrasada." },
  { id: "141c217b-5dff-4857-b1d4-66fac87d6986", name: "José Cardoso", latitude: -3.473403, longitude: -51.203297, waterSource: "other", childrenUnder5: 1, lastVisit: "2026-09-15T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 18, riskReason: "Crianças pequenas em casa." },
  { id: "c8b837b4-a027-457b-9cfd-f2e483f5b74e", name: "Rosilene Corrêa", latitude: -3.464897, longitude: -51.192568, waterSource: "tap", childrenUnder5: 2, lastVisit: "2026-08-29T22:18:14.054Z", giSymptoms: false, feverSymptoms: false, vaccinationsUpToDate: true, clusterRisk: false, riskScore: 31, riskReason: "Visita atrasada e presença de crianças pequenas." },
];

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
