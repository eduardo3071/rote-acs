// RoteACS — Fase 12: recalcula o RiskScore da família visitada e propaga
// prioridade para vizinhas (<200m, mesma fonte de água) quando há sintoma GI.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAY_MS = 86_400_000;
const NEIGHBOR_RADIUS_M = 200;
const PROPAGATION_BONUS = 30;

function daysSince(iso: string, now = Date.now()): number {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / DAY_MS));
}

/** Mirrors calculateMockRiskScore in src/data/families.ts — the 6 frontend variables. */
function calculateRiskScore(f: {
  days: number;
  giSymptom: boolean;
  childrenUnder5: number;
  vaccinationsOk: boolean;
  clusterRisk: boolean;
}): number {
  const days = Math.min(f.days, 45);
  let score = 5;
  score += (days / 45) * 20;
  if (f.giSymptom) score += 30; // gi + fever share one "symptoms" answer in this app
  if (f.giSymptom) score += 20;
  score += Math.min(f.childrenUnder5, 3) * 5;
  if (!f.vaccinationsOk) score += 10;
  if (f.clusterRisk) score += 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Mirrors generateRiskReason in src/data/families.ts. */
function generateRiskReason(f: {
  days: number;
  giSymptom: boolean;
  childrenUnder5: number;
  vaccinationsOk: boolean;
  clusterRisk: boolean;
}): string {
  if (f.clusterRisk && f.giSymptom && f.childrenUnder5 > 0)
    return "Vizinho com sintoma gastrointestinal, mesma fonte de água e presença de crianças pequenas.";
  if (f.clusterRisk) return "Família próxima a domicílio com risco e mesma fonte de água.";
  if (f.giSymptom) return "Sintoma gastrointestinal ou febre registrados.";
  if (f.days >= 30 && f.childrenUnder5 > 0) return "Visita atrasada e presença de crianças pequenas.";
  if (!f.vaccinationsOk) return "Vacinação atrasada.";
  if (f.days >= 30) return "Visita atrasada.";
  if (f.childrenUnder5 > 0) return "Crianças pequenas em casa.";
  return "Sem alertas no momento.";
}

function haversineMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { family_id } = await req.json();
    if (!family_id || typeof family_id !== "string") {
      return new Response(JSON.stringify({ error: "family_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id, acs_id, lat, lon, cluster_risk, vaccinations_ok")
      .eq("id", family_id)
      .single();
    if (familyError || !family) {
      return new Response(JSON.stringify({ error: "Família não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lastVisit, error: visitError } = await supabase
      .from("visits")
      .select("id, visited_at, gi_symptom, water_source, children_under5, urgent_referral")
      .eq("family_id", family_id)
      .order("visited_at", { ascending: false })
      .limit(1)
      .single();
    if (visitError || !lastVisit) {
      return new Response(JSON.stringify({ error: "Nenhuma visita encontrada para esta família" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const giSymptom = lastVisit.gi_symptom ?? false;
    const childrenUnder5 = lastVisit.children_under5 ?? 0;
    const waterSource = lastVisit.water_source ?? "other";
    const days = daysSince(lastVisit.visited_at);

    const riskScore = calculateRiskScore({
      days,
      giSymptom,
      childrenUnder5,
      vaccinationsOk: family.vaccinations_ok ?? true,
      clusterRisk: family.cluster_risk ?? false,
    });
    const urgent = lastVisit.urgent_referral === true;
    const finalScore = Math.min(100, riskScore + (urgent ? 25 : 0));
    const riskReason = urgent
      ? "Sinais de desidratação em criança — encaminhamento urgente."
      : generateRiskReason({
          days,
          giSymptom,
          childrenUnder5,
          vaccinationsOk: family.vaccinations_ok ?? true,
          clusterRisk: family.cluster_risk ?? false,
        });

    await supabase
      .from("families")
      .update({
        risk_score: finalScore,
        risk_reason: riskReason,
        children_under5: childrenUnder5,
        water_source: waterSource,
        last_visit_at: lastVisit.visited_at,
      })
      .eq("id", family_id);

    let affected = 0;

    if (giSymptom) {
      const { data: neighbours } = await supabase
        .from("families")
        .select("id, lat, lon, water_source, risk_score")
        .eq("acs_id", family.acs_id)
        .neq("id", family_id);

      for (const n of neighbours ?? []) {
        if (n.water_source !== waterSource) continue;
        const distance = haversineMeters(
          { lat: Number(family.lat), lon: Number(family.lon) },
          { lat: Number(n.lat), lon: Number(n.lon) },
        );
        if (distance >= NEIGHBOR_RADIUS_M) continue;

        const newScore = Math.min(100, (n.risk_score ?? 0) + PROPAGATION_BONUS);
        await supabase
          .from("families")
          .update({
            risk_score: newScore,
            risk_reason: "Vizinho com sintoma gastrointestinal, mesma fonte de água.",
            cluster_risk: true,
          })
          .eq("id", n.id);

        await supabase.from("cluster_events").insert({
          trigger_visit: lastVisit.id,
          trigger_family: family_id,
          affected_family: n.id,
          distance_m: distance,
        });

        affected++;
      }
    }

    return new Response(JSON.stringify({ affected }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
