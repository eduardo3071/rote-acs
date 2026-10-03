/**
 * Local territory store: mockFamilies + visit overrides persisted in localStorage.
 * A future backend replaces this module; screens only use useFamilies/useFamily/registerVisit.
 */
import { useEffect, useState } from "react";
import {
  calculateMockRiskScore,
  generateRiskReason,
  mockFamilies,
  type Family,
  type FamilyInput,
  type WaterSource,
} from "@/data/families";

const KEY = "roteacs.territory";
const EVENT = "roteacs:territory";
const NEIGHBOR_RADIUS_M = 200;
const HIGH_PRIORITY_FLOOR = 70;
const LOG_KEY = "roteacs.visits";

/** One locally recorded visit, kept until synced. */
export interface VisitRecord extends VisitInput {
  familyId: string;
  at: string;
  neighboursRaised: number;
  synced?: boolean;
}

export function getVisitLog(): VisitRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(LOG_KEY) ?? "[]") ?? []; } catch { return []; }
}

function logVisit(r: VisitRecord) {
  window.localStorage.setItem(LOG_KEY, JSON.stringify([...getVisitLog(), r]));
}

/** Marks every local visit as sent (mock sync, no network). */
export function markAllSynced() {
  window.localStorage.setItem(LOG_KEY, JSON.stringify(getVisitLog().map((r) => ({ ...r, synced: true }))));
}

type Override = Partial<FamilyInput> & { riskFloor?: number };
type Overrides = Record<string, Override>;

/** Haversine distance in metres. */
export function distanceMeters(a: Pick<Family, "latitude" | "longitude">, b: Pick<Family, "latitude" | "longitude">) {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const isWithinRadius = (a: Family, b: Family, radius = NEIGHBOR_RADIUS_M) => distanceMeters(a, b) < radius;

function read(): Overrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function write(o: Overrides) {
  window.localStorage.setItem(KEY, JSON.stringify(o));
  window.dispatchEvent(new Event(EVENT));
}

export function getFamilies(overrides: Overrides = read()): Family[] {
  return mockFamilies.map((base) => {
    const o = overrides[base.id];
    if (!o) return base;
    const { riskFloor, ...fields } = o;
    const input: FamilyInput = { ...base, ...fields };
    const score = Math.max(calculateMockRiskScore(input), riskFloor ?? 0);
    return { ...input, riskScore: Math.min(100, score), riskReason: generateRiskReason(input) };
  });
}

export interface VisitInput {
  symptoms: boolean;
  waterSource: WaterSource;
  childrenUnder5: number;
}

/** Saves the visit; on symptoms, raises neighbours (<200 m, same water) to high priority. Returns their count. */
export function registerVisit(id: string, v: VisitInput): number {
  const overrides = read();
  const current = getFamilies(overrides);
  const visited = current.find((f) => f.id === id);
  if (!visited) return 0;
  overrides[id] = {
    ...overrides[id],
    lastVisit: new Date().toISOString(),
    giSymptoms: v.symptoms,
    feverSymptoms: v.symptoms,
    waterSource: v.waterSource,
    childrenUnder5: Math.max(0, v.childrenUnder5),
  };
  let raised = 0;
  if (v.symptoms) {
    const updated = { ...visited, waterSource: v.waterSource };
    for (const f of current) {
      if (f.id === id || f.waterSource !== v.waterSource || !isWithinRadius(updated, f)) continue;
      overrides[f.id] = { ...overrides[f.id], clusterRisk: true, riskFloor: HIGH_PRIORITY_FLOOR };
      raised++;
    }
  }
  write(overrides);
  logVisit({ familyId: id, at: new Date().toISOString(), ...v, neighboursRaised: raised });
  return raised;
}

/** Families with local visits applied. Starts from mock data, swaps to stored data after hydration. */
export function useFamilies(): Family[] {
  const [list, setList] = useState<Family[]>(mockFamilies);
  useEffect(() => {
    const sync = () => setList(getFamilies());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}

export const useFamily = (id: string) => useFamilies().find((f) => f.id === id);
