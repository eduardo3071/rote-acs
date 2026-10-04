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
const FAMILIES_CACHE_KEY = "roteacs_families_cache";
const SYNC_QUEUE_KEY = "roteacs_sync_queue";
const SYNC_QUEUE_EVENT = "roteacs:sync-queue";
const LAST_SYNC_KEY = "roteacs.lastSync";

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
  has_pregnant?: boolean | null;
  has_chronic?: boolean | null;
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
    hasPregnant: row.has_pregnant ?? false,
    hasChronic: row.has_chronic ?? false,
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
  let query = supabase.from("families").select("*").eq("acs_id", session.acsId);
  // Territory = the agent's current IBGE municipality code; switching it in Perfil swaps the families.
  if (session.codIbge) query = query.eq("cod_ibge" as never, session.codIbge as never);
  const { data, error } = await query.order("risk_score", { ascending: false });
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

// ---------- offline-first sync queue (roteacs_sync_queue) ----------

/** One visit saved locally, pending upload to Supabase. */
export interface QueuedVisit extends VisitInput {
  id: string;
  familyId: string;
  createdAt: string;
  status: "pending" | "synced";
}

function genLocalId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getSyncQueue(): QueuedVisit[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(SYNC_QUEUE_KEY) ?? "[]") ?? [];
  } catch {
    return [];
  }
}

function writeSyncQueue(queue: QueuedVisit[]) {
  window.localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event(SYNC_QUEUE_EVENT));
}

/** Saves a visit to the local queue as pending, independent of connectivity. */
function enqueueVisit(familyId: string, v: VisitInput): QueuedVisit {
  const record: QueuedVisit = { id: genLocalId(), familyId, createdAt: new Date().toISOString(), status: "pending", ...v };
  writeSyncQueue([...getSyncQueue(), record]);
  return record;
}

export function getSyncQueueCounts(): { pending: number; synced: number } {
  const queue = getSyncQueue();
  return {
    pending: queue.filter((r) => r.status === "pending").length,
    synced: queue.filter((r) => r.status === "synced").length,
  };
}

export function getLastSyncAt(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_SYNC_KEY);
}

/** Inserts the visit into Supabase and recalculates risk. Never throws — reports success via the return value. */
async function trySyncRecord(record: QueuedVisit, acsId: string): Promise<{ ok: boolean; affected: number }> {
  try {
    const { error: insertError } = await supabase.from("visits").insert({
      family_id: record.familyId,
      acs_id: acsId,
      visited_at: record.createdAt,
      gi_symptom: record.symptoms,
      water_source: record.waterSource,
      children_under5: Math.max(0, record.childrenUnder5),
      synced_at: new Date().toISOString(),
      ...(record.details ?? {}),
    } as never);
    if (insertError) return { ok: false, affected: 0 };

    let affected = 0;
    try {
      const { data } = await supabase.functions.invoke<{ affected: number }>("recalculate-risk", {
        body: { family_id: record.familyId },
      });
      affected = data?.affected ?? 0;
    } catch {
      // visit is already saved; the score just stays stale until the next sync
    }
    return { ok: true, affected };
  } catch {
    return { ok: false, affected: 0 };
  }
}

/**
 * Pushes every pending queued visit to Supabase (+ recalculate-risk), marking each as
 * synced on success and leaving it pending on failure. Safe to call anytime — on app
 * open, when the browser comes back online, or from the SINCRONIZAR button.
 */
export async function syncQueue(): Promise<{ synced: number; pending: number }> {
  const queue = getSyncQueue();
  const session = await getSession();
  if (session) {
    let changed = false;
    for (const record of queue) {
      if (record.status !== "pending") continue;
      const result = await trySyncRecord(record, session.acsId);
      if (result.ok) {
        record.status = "synced";
        changed = true;
      }
    }
    if (changed) {
      writeSyncQueue(queue);
      notifyFamiliesChanged();
    }
    window.localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  }
  return {
    synced: queue.filter((r) => r.status === "synced").length,
    pending: queue.filter((r) => r.status === "pending").length,
  };
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

export interface NearestFacility {
  name: string;
  type: string;
  distanceM: number;
}

/** Nearest real health facility (CNES/DATASUS) to a point — surfaces real reference data on the Dashboard. */
export async function getNearestHealthFacility(lat: number, lon: number): Promise<NearestFacility | null> {
  const { data, error } = await supabase.from("health_facilities").select("name, type, lat, lon");
  if (error || !data || data.length === 0) return null;

  let nearest: NearestFacility | null = null;
  let minDist = Infinity;
  for (const f of data) {
    const d = distanceMeters(
      { latitude: lat, longitude: lon },
      { latitude: Number(f.lat), longitude: Number(f.lon) },
    );
    if (d < minDist) {
      minDist = d;
      nearest = { name: f.name, type: f.type ?? "UBS", distanceM: d };
    }
  }
  return nearest;
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
  /** Extra visit columns (symptoms, WASH, prenatal, chronic, urgent_referral…). */
  details?: VisitDetails;
}

export interface VisitDetails {
  visit_reasons?: string[];
  symptoms?: string[];
  fever_symptom?: boolean;
  symptom_duration?: number | null;
  dehydration_signs?: string[];
  wash_latrine?: boolean | null;
  wash_latrine_condition?: string | null;
  wash_handwashing?: boolean | null;
  wash_soap?: boolean | null;
  wash_trash?: boolean | null;
  vaccines_status?: string | null;
  vaccines_late?: string | null;
  prenatal_weeks?: number | null;
  prenatal_consults?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  chronic_meds?: string | null;
  glucose_mgdl?: number | null;
  urgent_referral?: boolean;
  /** True if any answer in this visit was captured via voice recognition (Small AI). */
  voice_input?: boolean;
}

/**
 * Saves a visit to the offline-first sync queue, then tries to push it to Supabase right
 * away. If the device is offline, the visit stays queued as pending and uploads later via
 * `syncQueue()` (app open, the browser's `online` event, or the SINCRONIZAR button).
 */
export async function confirmVisit(familyId: string, v: VisitInput): Promise<{ affected: number; synced: boolean }> {
  const session = await getSession();
  if (!session) throw new Error("Sessão expirada. Faça login novamente.");

  const record = enqueueVisit(familyId, v);
  const result = await trySyncRecord(record, session.acsId);

  if (result.ok) {
    const queue = getSyncQueue();
    const idx = queue.findIndex((r) => r.id === record.id);
    const existing = queue[idx];
    if (existing) queue[idx] = { ...existing, status: "synced" };
    writeSyncQueue(queue);
    window.localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    notifyFamiliesChanged();
  }

  return { affected: result.affected, synced: result.ok };
}

// ---------- Fase 14: exportação DHIS2 real ----------

interface VisitExportRow {
  id: string;
  visited_at: string;
  gi_symptom: boolean | null;
  water_source: string | null;
  children_under5: number | null;
  families: { name: string } | null;
}

export interface Dhis2ExportResult {
  /** Full text to show/copy — starts with the `// Payload pronto…` comment line. */
  payload: string;
  count: number;
}

/**
 * Builds a DHIS2 Tracker Events payload from this agent's synced-but-not-yet-exported
 * visits, then marks them as exported. Never sends anything to a real DHIS2 server —
 * only generates and returns the payload for the Perfil export modal.
 */
export async function exportToDhis2(): Promise<Dhis2ExportResult> {
  const session = await getSession();
  if (!session) throw new Error("Sessão expirada. Faça login novamente.");

  const { data, error } = await supabase
    .from("visits")
    .select("id, visited_at, gi_symptom, water_source, children_under5, families(name)")
    .eq("acs_id", session.acsId)
    .not("synced_at", "is", null)
    .is("dhis2_exported_at", null);
  if (error) throw error;

  const visits = (data ?? []) as unknown as VisitExportRow[];

  const events = visits.map((v) => ({
    program: "RoteACS_CHW",
    orgUnit: "ROTEACS_TERRITORY",
    eventDate: new Date(v.visited_at).toISOString(),
    dataValues: [
      { dataElement: "gi_symptom", value: v.gi_symptom ?? false },
      { dataElement: "water_source", value: v.water_source ?? "other" },
      { dataElement: "children_under5", value: v.children_under5 ?? 0 },
      { dataElement: "family_name", value: v.families?.name ?? "" },
    ],
  }));

  const payload = `// Payload pronto para importação via DHIS2 Import/Export\n${JSON.stringify({ events }, null, 2)}`;

  if (visits.length > 0) {
    await supabase
      .from("visits")
      .update({ dhis2_exported_at: new Date().toISOString() })
      .in("id", visits.map((v) => v.id));
  }

  return { payload, count: visits.length };
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
