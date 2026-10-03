/**
 * Local territory store: Supabase-backed families (with a mock/offline cache fallback).
 * Visits are persisted to Supabase and the RiskScore/cluster propagation is recalculated
 * server-side by the `recalculate-risk` Edge Function (see Fase 12). Screens only use
 * useFamilies/useFamily/confirmVisit; a future backend swaps the fetch layer only.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSession } from "@/lib/session";
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
const REMOTE_REFRESH_EVENT = "roteacs:families-remote-refresh";
const LOG_KEY = "roteacs.visits";
const FAMILIES_CACHE_KEY = "roteacs_families_cache";

/** Tells every mounted useFamilies/useFamily hook to refetch from Supabase. */
function notifyFamiliesChanged() {
  window.dispatchEvent(new Event(REMOTE_REFRESH_EVENT));
}

// ---------- Supabase-backed families, with local cache fallback ----------

interface FamiliesCache {
  families: Family[];
  cachedAt: string;
}

function mapFamilyRow(row: {
  id: string;
  name: string;
  lat: number;
  lon: number;
  water_source: string | null;
  children_under5: number | null;
  vaccinations_ok: boolean | null;
  risk_score: number | null;
  risk_reason: string | null;
  cluster_risk: boolean | null;
  last_visit_at: string | null;
  created_at: string | null;
}): Family {
  return {
    id: row.id,
    name: row.name,
    latitude: Number(row.lat),
    longitude: Number(row.lon),
    waterSource: (row.water_source as WaterSource) ?? "other",
    childrenUnder5: row.children_under5 ?? 0,
    lastVisit: row.last_visit_at ?? row.created_at ?? new Date().toISOString(),
    giSymptoms: false,
    feverSymptoms: false,
    vaccinationsUpToDate: row.vaccinations_ok ?? true,
    riskScore: row.risk_score ?? 0,
    riskReason: row.risk_reason ?? "",
    clusterRisk: row.cluster_risk ?? false,
  };
}

function readFamiliesCache(): FamiliesCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FAMILIES_CACHE_KEY);
    return raw ? (JSON.parse(raw) as FamiliesCache) : null;
  } catch {
    return null;
  }
}

function writeFamiliesCache(families: Family[]) {
  try {
    window.localStorage.setItem(
      FAMILIES_CACHE_KEY,
      JSON.stringify({ families, cachedAt: new Date().toISOString() } satisfies FamiliesCache),
    );
  } catch {
    // storage unavailable (private mode, quota) — cache is best-effort
  }
}

/** Families loaded from the database and the date they were last cached, for the Perfil screen. */
export function getFamiliesCacheMeta(): { count: number; cachedAt: string | null } {
  const cache = readFamiliesCache();
  return { count: cache?.families.length ?? 0, cachedAt: cache?.cachedAt ?? null };
}

/** Fetches this agent's families from Supabase; on failure, falls back to the last cached fetch. */
async function loadRemoteFamilies(): Promise<Family[]> {
  const session = await getSession();
  if (!session) return mockFamilies;
  const { data, error } = await supabase
    .from("families")
    .select("*")
    .eq("acs_id", session.acsId)
    .order("risk_score", { ascending: false });
  if (error || !data) {
    const cache = readFamiliesCache();
    return cache?.families ?? mockFamilies;
  }
  const families = data.map(mapFamilyRow);
  writeFamiliesCache(families);
  return families;
}

/** Fetches a single family by id from Supabase; falls back to the cache, then the mock dataset. */
async function loadRemoteFamily(id: string): Promise<Family | undefined> {
  const { data, error } = await supabase.from("families").select("*").eq("id", id).single();
  if (error || !data) {
    const cache = readFamiliesCache();
    return cache?.families.find((f) => f.id === id) ?? mockFamilies.find((f) => f.id === id);
  }
  return mapFamilyRow(data);
}

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

export function getFamilies(overrides: Overrides = read(), base: Family[] = mockFamilies): Family[] {
  return base.map((family) => {
    const o = overrides[family.id];
    if (!o) return family;
    const { riskFloor, ...fields } = o;
    const input: FamilyInput = { ...family, ...fields };
    const score = Math.max(calculateMockRiskScore(input), riskFloor ?? 0);
    return { ...input, riskScore: Math.min(100, score), riskReason: generateRiskReason(input) };
  });
}

export interface VisitInput {
  symptoms: boolean;
  waterSource: WaterSource;
  childrenUnder5: number;
}

/**
 * Persists a visit to Supabase, then calls the `recalculate-risk` Edge Function to
 * recompute the family's RiskScore and propagate priority to neighbours (<200 m, same
 * water source, GI symptom). Returns the number of neighbouring families affected.
 */
export async function confirmVisit(familyId: string, v: VisitInput): Promise<number> {
  const session = await getSession();
  if (!session) throw new Error("Sessão expirada. Faça login novamente.");

  const visitedAt = new Date().toISOString();
  const { error: insertError } = await supabase.from("visits").insert({
    family_id: familyId,
    acs_id: session.acsId,
    visited_at: visitedAt,
    gi_symptom: v.symptoms,
    water_source: v.waterSource,
    children_under5: Math.max(0, v.childrenUnder5),
  });
  if (insertError) throw insertError;

  const { data, error: fnError } = await supabase.functions.invoke<{ affected: number }>("recalculate-risk", {
    body: { family_id: familyId },
  });
  if (fnError) throw fnError;

  const affected = data?.affected ?? 0;
  logVisit({ familyId, at: visitedAt, ...v, neighboursRaised: affected, synced: true });
  notifyFamiliesChanged();
  return affected;
}

/**
 * Families with local visit overrides applied. Paints instantly from the mock dataset, then
 * swaps in the agent's families from Supabase (or the offline cache, if the fetch fails).
 */
export function useFamilies(): Family[] {
  const [base, setBase] = useState<Family[]>(mockFamilies);
  const [remoteTick, setRemoteTick] = useState(0);
  useEffect(() => {
    let active = true;
    loadRemoteFamilies().then((families) => {
      if (active) setBase(families);
    });
    return () => {
      active = false;
    };
  }, [remoteTick]);
  useEffect(() => {
    const onRemoteRefresh = () => setRemoteTick((t) => t + 1);
    window.addEventListener(REMOTE_REFRESH_EVENT, onRemoteRefresh);
    return () => window.removeEventListener(REMOTE_REFRESH_EVENT, onRemoteRefresh);
  }, []);

  const [list, setList] = useState<Family[]>(mockFamilies);
  useEffect(() => {
    const sync = () => setList(getFamilies(read(), base));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [base]);
  return list;
}

/** Single family by id, fetched directly from Supabase with local overrides applied. */
export function useFamily(id: string): Family | undefined {
  const [base, setBase] = useState<Family | undefined>(() => mockFamilies.find((f) => f.id === id));
  const [remoteTick, setRemoteTick] = useState(0);
  useEffect(() => {
    let active = true;
    loadRemoteFamily(id).then((family) => {
      if (active && family) setBase(family);
    });
    return () => {
      active = false;
    };
  }, [id, remoteTick]);
  useEffect(() => {
    const onRemoteRefresh = () => setRemoteTick((t) => t + 1);
    window.addEventListener(REMOTE_REFRESH_EVENT, onRemoteRefresh);
    return () => window.removeEventListener(REMOTE_REFRESH_EVENT, onRemoteRefresh);
  }, []);

  const [family, setFamily] = useState<Family | undefined>(base);
  useEffect(() => {
    const sync = () => setFamily(base && getFamilies(read(), [base])[0]);
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [base]);
  return family;
}
