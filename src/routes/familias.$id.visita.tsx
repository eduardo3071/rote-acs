import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle, AlertTriangle, ArrowLeft, Baby, Calendar, Check, CheckCircle2, CloudOff, Droplets, Heart,
  Loader2, Mic, Minus, Plus, Thermometer, Users, Wind, X, type LucideIcon,
} from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getFamilyById, type WaterSource } from "@/data/families";
import { confirmVisit, useFamily } from "@/lib/territory";
import { loadRemoteFamily } from "@/lib/territory";
import { useAgentSession } from "@/lib/useAgentSession";
import { cn } from "@/lib/utils";
import {
  isVoiceSupported, listenOnce, parseDehydrationSigns, parseLatrineCondition, parseNumber,
  parseReason, parseSymptoms, parseWaterSource, parseYesNo, parseYesNoUnknown, speak,
} from "@/lib/voice";
import { fill, useAppTranslations } from "@/lib/app-translations";
import { localizedWater } from "@/lib/localized-family";

export const Route = createFileRoute("/familias/$id/visita")({
  ssr: false,
  loader: async ({ params }) => {
    const family = getFamilyById(params.id) ?? (await loadRemoteFamily(params.id));
    if (!family) throw notFound();
    return { family };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Família não encontrada — RoteACS" }, { name: "robots", content: "noindex" }] };
    const t = `Registrar visita — ${loaderData.family.name} — RoteACS`;
    const d = "Registro de visita: motivo, sintomas, condições WASH, grupos prioritários e doenças crônicas.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t },
      { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  notFoundComponent: () => (
    <div className="field-surface flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-subtitle font-bold text-foreground">Família não encontrada</p>
      <Link to="/familias" className="text-body text-primary">Voltar para a lista</Link>
    </div>
  ),
  component: VisitFlow,
});

type SectionId = "reason" | "symptoms" | "wash" | "groups" | "chronic" | "confirm";
type Tone = "good" | "bad" | "neutral";
type Opt<T> = { label: string; value: T; tone: Tone };

const SOURCES: WaterSource[] = ["well", "river", "igarape", "tap", "other"];

const toneActive: Record<Tone, string> = {
  good: "border-risk-low bg-risk-low/20 text-risk-low",
  bad: "border-risk-high bg-risk-high/20 text-risk-high",
  neutral: "border-primary bg-primary/20 text-primary",
};

/**
 * Push-to-talk mic button: tap, speak, the Web Speech API (native, pt-BR) transcribes,
 * and `onTranscript` parses it against a closed vocabulary. Voice is always additive —
 * every question keeps its tap controls, so a failed/unsupported recognition never
 * blocks the ACS. Hidden entirely on browsers without Web Speech support.
 */
function VoiceButton({ onTranscript }: { onTranscript: (transcript: string) => boolean }) {
  const { m } = useAppTranslations();
  const [state, setState] = useState<"idle" | "listening" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  if (!isVoiceSupported()) return null;

  const run = async () => {
    setState("listening");
    setMsg(null);
    try {
      const transcript = await listenOnce();
      const ok = onTranscript(transcript);
      setState(ok ? "idle" : "error");
      setMsg(ok ? null : fill(m.visit.misunderstood, { text: transcript }));
      if (ok) window.dispatchEvent(new Event("roteacs:voice-used"));
    } catch (e) {
      setState("error");
      setMsg(e instanceof Error ? e.message : m.visit.micError);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={state === "listening"}
        className={cn("flex h-9 items-center gap-2 rounded-pill border px-3 text-label font-semibold",
          state === "listening" ? "border-primary bg-primary/15 text-primary" : "border-border bg-elevated text-muted-foreground")}>
        <Mic className={cn("size-3.5", state === "listening" && "animate-pulse")} aria-hidden />
        {state === "listening" ? m.visit.listening : m.visit.speak}
      </button>
      {msg && <p className="text-label text-risk-high">{msg}</p>}
    </div>
  );
}

function Choice<T>({ label, options, value, onChange, voiceParser }: {
  label: string; options: Opt<T>[]; value: T | null; onChange: (v: T) => void; voiceParser?: (transcript: string) => T | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body text-foreground">{label}</span>
        {voiceParser && (
          <VoiceButton onTranscript={(t) => {
            const parsed = voiceParser(t);
            if (parsed === null) return false;
            onChange(parsed);
            return true;
          }} />
        )}
      </div>
      <div className="flex gap-2">
        {options.map((o) => (
          <button key={o.label} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
            className={cn("h-12 flex-1 rounded-lg border-2 px-2 text-small font-bold",
              value === o.value ? toneActive[o.tone] : "border-border bg-elevated text-muted-foreground")}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Counter({ label, value, min, max, onChange, format, voice }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; format?: (v: number) => string; voice?: boolean;
}) {
  const { m } = useAppTranslations();
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body text-foreground">{label}</span>
        {voice && (
          <VoiceButton onTranscript={(t) => {
            const n = parseNumber(t, max);
            if (n === null) return false;
            onChange(Math.max(min, n));
            return true;
          }} />
        )}
      </div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label={m.visit.decrease} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}
          className="flex size-12 items-center justify-center rounded-lg border border-border bg-elevated text-primary disabled:opacity-40">
          <Minus className="size-5" aria-hidden />
        </button>
        <span className="text-title font-bold text-foreground" aria-live="polite">{format ? format(value) : value}</span>
        <button type="button" aria-label={m.visit.increase} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}
          className="flex size-12 items-center justify-center rounded-lg border border-border bg-elevated text-primary disabled:opacity-40">
          <Plus className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-small text-muted-foreground">{label}</span>
      <input inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
        className="h-12 rounded-lg border border-border bg-card px-4 text-body text-foreground outline-none focus:border-primary" />
    </label>
  );
}

function Caps({ children }: { children: ReactNode }) {
  return <span className="label-caps text-muted-foreground">{children}</span>;
}

function Stepper({ total, current }: { total: number; current: number }) {
  const { m } = useAppTranslations();
  return (
    <ol className="flex items-center gap-1" aria-label={fill(m.visit.step, { current: current + 1, total })}>
      {Array.from({ length: total }, (_, i) => {
        const state = i < current ? "done" : i === current ? "current" : "future";
        return (
          <li key={i} className={cn("flex items-center gap-1", i < total - 1 && "flex-1")}>
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-small font-bold",
              state === "done" && "bg-risk-low text-background",
              state === "current" && "bg-primary text-primary-foreground shadow-primary",
              state === "future" && "bg-border text-muted-foreground")}>
              {state === "done" ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            {i < total - 1 && <span className={cn("h-0.5 flex-1 rounded-full", i < current ? "bg-risk-low" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}

const toInt = (s: string) => (s ? Number(s) : null);

function VisitFlow() {
  const { m } = useAppTranslations();
  const { family: initial } = Route.useLoaderData();
  const family = useFamily(initial.id) ?? initial;
  useAgentSession();
  const navigate = useNavigate();
  const REASONS: { id: string; label: string; icon: LucideIcon }[] = [
    { id: "routine", label: m.visit.routine, icon: Calendar }, { id: "symptom", label: m.visit.reported, icon: AlertTriangle },
    { id: "prenatal", label: m.visit.prenatal, icon: Baby }, { id: "chronic", label: m.visit.chronic, icon: Heart },
  ];
  const SYMPTOMS: { id: string; label: string; icon: LucideIcon }[] = [
    { id: "diarrhea", label: m.visit.diarrhea, icon: Droplets }, { id: "fever", label: m.visit.fever, icon: Thermometer },
    { id: "respiratory", label: m.visit.respiratory, icon: Wind }, { id: "vomit", label: m.visit.vomit, icon: X },
    { id: "none", label: m.visit.noSymptoms, icon: Check },
  ];
  const DEHYDRATION = [m.visit.sunkenEyes, m.visit.dryMouth, m.visit.lethargic];
  const YES_GOOD: Opt<boolean>[] = [{ label: m.common.yes, value: true, tone: "good" }, { label: m.common.no, value: false, tone: "bad" }];
  const YES_BAD: Opt<boolean>[] = [{ label: m.common.yes, value: true, tone: "bad" }, { label: m.common.no, value: false, tone: "good" }];
  const YES_NO_UNKNOWN: Opt<string>[] = [{ label: m.common.yes, value: "yes", tone: "good" }, { label: m.common.no, value: "no", tone: "bad" }, { label: m.common.unknown, value: "unknown", tone: "neutral" }];
  const LATRINE_COND: Opt<string>[] = [{ label: m.common.yes, value: "good", tone: "good" }, { label: m.common.no, value: "bad", tone: "bad" }, { label: m.common.na, value: "na", tone: "neutral" }];

  const hasChildren = family.childrenUnder5 > 0;
  const hasPregnant = !!family.hasPregnant;
  const hasChronic = !!family.hasChronic;
  const sections = useMemo<SectionId[]>(() => {
    const s: SectionId[] = ["reason", "symptoms", "wash"];
    if (hasChildren || hasPregnant) s.push("groups");
    if (hasChronic) s.push("chronic");
    s.push("confirm");
    return s;
  }, [hasChildren, hasPregnant, hasChronic]);

  const [idx, setIdx] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState(1);
  const [dehydration, setDehydration] = useState<string[]>([]);
  const [water, setWater] = useState<WaterSource>(family.waterSource);
  const [latrine, setLatrine] = useState<boolean | null>(null);
  const [latrineCond, setLatrineCond] = useState<string | null>(null);
  const [handwash, setHandwash] = useState<boolean | null>(null);
  const [trash, setTrash] = useState<boolean | null>(null);
  const [vaccines, setVaccines] = useState<string | null>(null);
  const [vaccinesLate, setVaccinesLate] = useState("");
  const [weeks, setWeeks] = useState(12);
  const [consults, setConsults] = useState(0);
  const [pBp, setPBp] = useState<boolean | null>(null);
  const [pSys, setPSys] = useState("");
  const [pDia, setPDia] = useState("");
  const [meds, setMeds] = useState<string | null>(null);
  const [cBp, setCBp] = useState<boolean | null>(null);
  const [cSys, setCSys] = useState("");
  const [cDia, setCDia] = useState("");
  const [gluc, setGluc] = useState<boolean | null>(null);
  const [glucVal, setGlucVal] = useState("");
  const [result, setResult] = useState<{ affected: number; synced: boolean; urgent: boolean; symptomatic: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedVoice, setUsedVoice] = useState(false);
  const [conversationMode, setConversationMode] = useState<"idle" | "running" | "done">("idle");
  const [conversationStatus, setConversationStatus] = useState<string | null>(null);

  useEffect(() => {
    const onVoiceUsed = () => setUsedVoice(true);
    window.addEventListener("roteacs:voice-used", onVoiceUsed);
    return () => window.removeEventListener("roteacs:voice-used", onVoiceUsed);
  }, []);

  /**
   * Asks a question out loud, listens once, and retries once more on a failed/unrecognized
   * answer before giving up — the building block of "Modo Conversa" (speak → listen → parse,
   * with the same closed-vocabulary parsers the tap-fallback voice buttons already use).
   */
  const voiceAsk = async <T,>(prompt: string, attempt: (transcript: string) => T | null): Promise<T | null> => {
    await speak(prompt);
    for (let i = 0; i < 2; i++) {
      try {
        const transcript = await listenOnce();
        const parsed = attempt(transcript);
        if (parsed !== null) {
          window.dispatchEvent(new Event("roteacs:voice-used"));
          return parsed;
        }
      } catch { /* no speech detected — fall through to retry/give-up below */ }
      if (i === 0) await speak(m.visit.retryVoice);
    }
    return null;
  };

  /**
   * "Modo Conversa": the app asks each question out loud and auto-advances on the answer
   * instead of waiting for a tap, covering motivo → sintomas → saneamento (the questions
   * voice fits well). It stops and hands control back to the tap flow the moment a question
   * isn't understood twice, or once it reaches grupos/crônicas/confirmação — sections kept
   * tap-only since they involve numbers and medical readings a misheard word could corrupt.
   */
  const runConversation = async () => {
    setConversationMode("running");
    setIdx(0);

    setConversationStatus(m.visit.listeningReason);
    const reason = await voiceAsk("Qual o motivo da visita? Diga rotina, sintoma, gestante ou crônica.", parseReason);
    if (reason === null) {
      setConversationStatus(m.visit.reasonManual);
      setConversationMode("idle");
      return;
    }
    setReasons([reason]);
    setIdx(1);

    setConversationStatus(m.visit.listeningSymptoms);
    const symptomsFound = await voiceAsk(
      "A família apresenta diarreia, febre, tosse, vômito, ou nenhum sintoma?",
      (t) => { const found = parseSymptoms(t); return found.length > 0 ? found : null; },
    );
    if (symptomsFound === null) {
      setConversationStatus(m.visit.symptomsManual);
      setConversationMode("idle");
      return;
    }
    setSymptoms(symptomsFound);

    if (symptomsFound.includes("diarrhea") || symptomsFound.includes("fever")) {
      const days = await voiceAsk("Há quantos dias? Diga um número de um a sete.", (t) => parseNumber(t, 7));
      if (days !== null) setDuration(days);
    }
    if (symptomsFound.includes("diarrhea") && hasChildren) {
      const signs = await voiceAsk(
        "A criança está com olhos fundos, boca seca ou letárgica? Pode dizer mais de um, ou diga nenhum.",
        (t) => parseDehydrationSigns(t),
      );
      if (signs !== null) setDehydration(signs);
    }

    setIdx(2);
    setConversationStatus(m.visit.listeningWash);

    const waterSrc = await voiceAsk("Qual a fonte de água usada esta semana? Poço, rio, igarapé, torneira ou outra?", parseWaterSource);
    if (waterSrc !== null) setWater(waterSrc);

    const latrineOk = await voiceAsk("A casa tem latrina ou banheiro disponível? Sim ou não.", parseYesNo);
    if (latrineOk !== null) setLatrine(latrineOk);

    const latrineCondVal = await voiceAsk("A latrina está coberta e em boas condições? Sim, não, ou não se aplica.", parseLatrineCondition);
    if (latrineCondVal !== null) setLatrineCond(latrineCondVal);

    const handwashOk = await voiceAsk("Tem ponto de lavagem de mãos com sabão visível? Sim ou não.", parseYesNo);
    if (handwashOk !== null) setHandwash(handwashOk);

    const trashOk = await voiceAsk("Tem lixo a céu aberto perto da casa? Sim ou não.", parseYesNo);
    if (trashOk !== null) setTrash(trashOk);

    await speak("Entrevista por voz concluída. Complete o restante das perguntas tocando na tela.");
    setConversationStatus(m.visit.voiceComplete);
    setConversationMode("done");
    setIdx(3);
  };

  const section = sections[idx];
  const diarrhea = symptoms.includes("diarrhea");
  const fever = symptoms.includes("fever");
  const showDuration = diarrhea || fever;
  const showDehydration = diarrhea && hasChildren;
  const urgent = showDehydration && dehydration.length > 0;

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const toggleSymptom = (id: string) => {
    if (id === "none") return setSymptoms(symptoms.includes("none") ? [] : ["none"]);
    const next = symptoms.filter((x) => x !== "none");
    setSymptoms(next.includes(id) ? next.filter((x) => x !== id) : [...next, id]);
  };

  const canNext = section === "reason" ? reasons.length > 0 : section === "symptoms" ? symptoms.length > 0 : true;

  const reset = () => {
    setIdx(0); setReasons([]); setSymptoms([]); setDuration(1); setDehydration([]); setWater(family.waterSource);
    setLatrine(null); setLatrineCond(null); setHandwash(null); setTrash(null); setVaccines(null); setVaccinesLate("");
    setWeeks(12); setConsults(0); setPBp(null); setPSys(""); setPDia(""); setMeds(null); setCBp(null); setCSys(""); setCDia("");
    setGluc(null); setGlucVal(""); setResult(null); setError(null); setUsedVoice(false);
    setConversationMode("idle"); setConversationStatus(null);
  };

  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const realSymptoms = symptoms.filter((s) => s !== "none");
    const bpSys = hasPregnant && pBp ? toInt(pSys) : hasChronic && cBp ? toInt(cSys) : null;
    const bpDia = hasPregnant && pBp ? toInt(pDia) : hasChronic && cBp ? toInt(cDia) : null;
    try {
      const r = await confirmVisit(family.id, {
        symptoms: diarrhea,
        waterSource: water,
        childrenUnder5: family.childrenUnder5,
        details: {
          visit_reasons: reasons,
          symptoms: realSymptoms,
          fever_symptom: fever,
          symptom_duration: showDuration ? duration : null,
          dehydration_signs: showDehydration ? dehydration : [],
          wash_latrine: latrine,
          wash_latrine_condition: latrineCond,
          wash_handwashing: handwash,
          wash_soap: handwash,
          wash_trash: trash,
          vaccines_status: hasChildren ? vaccines : null,
          vaccines_late: hasChildren && vaccines === "no" ? vaccinesLate.trim() || null : null,
          prenatal_weeks: hasPregnant ? weeks : null,
          prenatal_consults: hasPregnant ? consults : null,
          bp_systolic: bpSys,
          bp_diastolic: bpDia,
          chronic_meds: hasChronic ? meds : null,
          glucose_mgdl: hasChronic && gluc ? toInt(glucVal) : null,
          urgent_referral: urgent,
          voice_input: usedVoice,
        },
      });
      setResult({ ...r, urgent, symptomatic: diarrhea || fever });
    } catch (e) {
      setError(e instanceof Error ? e.message : m.visit.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="field-surface flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center animate-rise-in">
          <CheckCircle2 className="size-16 text-risk-low" aria-hidden />
          <h1 className="text-title font-bold text-risk-low">{m.visit.registered}</h1>
          <p className="text-small text-muted-foreground">{m.visit.saved}</p>
          {usedVoice && (
            <p className="flex items-center gap-2 rounded-pill border border-primary/40 bg-primary/10 px-3 py-1.5 text-label font-semibold text-primary">
              <Mic className="size-3.5 shrink-0" aria-hidden /> {m.visit.voiceProcessed}
            </p>
          )}
          {!result.synced && (
            <p className="flex items-center gap-2 rounded-lg border border-border bg-elevated p-4 text-small font-semibold text-muted-foreground">
              <CloudOff className="size-4 shrink-0" aria-hidden /> {m.visit.offlineSaved}
            </p>
          )}
          {result.urgent && (
            <p className="flex items-start gap-2 rounded-lg border border-risk-high bg-risk-high/15 p-4 text-left text-small font-semibold text-risk-high">
              <AlertTriangle className="size-5 shrink-0" aria-hidden />
              {m.visit.urgent}
            </p>
          )}
          {result.affected > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-risk-medium bg-risk-medium/15 p-4 text-left text-small font-semibold text-risk-medium">
              <Users className="size-5 shrink-0" aria-hidden />
              {result.affected === 1 ? m.visit.oneNeighbor : fill(m.visit.neighbors, { count: result.affected })}
            </p>
          )}
          {result.symptomatic && (
            <Link to="/familias/$id/protocolo" params={{ id: family.id }}
              search={{ vizinhos: result.affected, pendente: !result.synced, urgente: result.urgent }}
              className="text-body font-semibold text-primary">{m.visit.careProtocol}</Link>
          )}
        </div>
        <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-6 pb-8">
          <PrimaryButton onClick={() => navigate({ to: "/familias" })}>{m.visit.viewPriorities}</PrimaryButton>
          <button onClick={reset} className="h-14 rounded-lg border border-border bg-elevated text-body font-semibold text-primary">{m.visit.another}</button>
        </div>
      </div>
    );
  }

  const summary: { title: string; value: string }[] = [
    { title: m.visit.summaryReason, value: REASONS.filter((r) => reasons.includes(r.id)).map((r) => r.label).join(", ") || "—" },
    {
      title: m.visit.summarySymptoms,
      value: (SYMPTOMS.filter((s) => symptoms.includes(s.id)).map((s) => s.label).join(", ") || "—") +
        (showDuration ? ` · ${duration >= 7 ? m.visit.sevenDays : duration === 1 ? m.visit.oneDay : fill(m.visit.days, { count: duration })}` : "") +
        (urgent ? ` · ${m.visit.dehydration}: ${dehydration.join(", ")}` : ""),
    },
    {
      title: m.visit.summaryWash,
      value: [`${m.visit.water}: ${localizedWater(water, m)}`,
        latrine !== null && `${m.visit.latrine}: ${latrine ? m.common.yes : m.common.no}`,
        handwash !== null && `${m.visit.handwashing}: ${handwash ? m.common.yes : m.common.no}`,
        trash !== null && `${m.visit.openTrash}: ${trash ? m.common.yes : m.common.no}`].filter(Boolean).join(" · "),
    },
  ];
  const groups = [hasChildren && m.visit.underFive, hasPregnant && m.visit.pregnant, hasChronic && m.visit.chronicGroup].filter(Boolean);
  if (groups.length) summary.push({ title: m.visit.servedGroups, value: groups.join(", ") });

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-32 pt-6">
        <div className="flex items-center justify-between">
          <button onClick={() => (idx > 0 ? setIdx(idx - 1) : navigate({ to: "/familias/$id", params: { id: family.id } }))}
            disabled={conversationMode === "running"}
            className="flex items-center gap-2 text-body text-primary disabled:opacity-40">
            <ArrowLeft className="size-5" aria-hidden /> {idx > 0 ? m.visit.previous : family.name}
          </button>
          <span className="label-caps text-muted-foreground">{fill(m.visit.stepShort, { current: idx + 1, total: sections.length })}</span>
        </div>
        <Stepper total={sections.length} current={idx} />

        {conversationStatus && (
          <p role="status" className={cn("flex items-center gap-2 rounded-lg border p-3 text-small font-semibold",
            conversationMode === "running" ? "border-primary bg-primary/10 text-primary" : "border-border bg-elevated text-muted-foreground")}>
            <Mic className={cn("size-4 shrink-0", conversationMode === "running" && "animate-pulse")} aria-hidden />
            {conversationStatus}
          </p>
        )}

        {section === "reason" && (
          <section key="reason" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-center text-subtitle font-bold text-foreground">{m.visit.reasonQuestion}</h1>
            {isVoiceSupported() && conversationMode !== "running" && (
              <div className="flex flex-col gap-1">
                <button type="button" onClick={runConversation}
                  className="flex h-14 items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary/10 text-body font-bold text-primary">
                  <Mic className="size-5" aria-hidden /> {m.visit.startVoice}
                  <span className="rounded-pill border border-primary/40 bg-primary/15 px-2 py-0.5 text-label font-semibold text-primary">{m.visit.onDevice}</span>
                </button>
                <p className="text-center text-label text-muted-foreground">
                  {m.visit.voiceHelp}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" aria-pressed={reasons.includes(id)} onClick={() => toggle(reasons, setReasons, id)}
                  className={cn("flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 bg-card p-4 text-center text-small font-semibold text-foreground",
                    reasons.includes(id) ? "border-primary shadow-primary" : "border-border")}>
                  <Icon className={cn("size-7", reasons.includes(id) ? "text-primary" : "text-muted-foreground")} aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </section>
        )}

        {section === "symptoms" && (
          <section key="symptoms" className="flex flex-col gap-4 animate-rise-in">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-subtitle font-bold text-foreground">{m.visit.symptomsQuestion}</h1>
              <VoiceButton onTranscript={(t) => {
                const found = parseSymptoms(t);
                if (found.length === 0) return false;
                if (found.includes("none")) setSymptoms(["none"]);
                else setSymptoms([...symptoms.filter((s) => s !== "none"), ...found.filter((id) => !symptoms.includes(id))]);
                return true;
              }} />
            </div>
            <div className="flex flex-col gap-2">
              {SYMPTOMS.map(({ id, label, icon: Icon }) => {
                const on = symptoms.includes(id);
                return (
                  <button key={id} type="button" aria-pressed={on} onClick={() => toggleSymptom(id)}
                    className={cn("flex h-14 items-center gap-4 rounded-lg border-2 bg-card px-4 text-left text-body text-foreground",
                      on ? "border-primary" : "border-border")}>
                    <Icon className={cn("size-5 shrink-0", on ? "text-primary" : "text-muted-foreground")} aria-hidden />
                    <span className="flex-1">{label}</span>
                    {on && <Check className="size-5 text-primary" aria-hidden />}
                  </button>
                );
              })}
            </div>
            {showDuration && (
              <Counter label={m.visit.duration} value={duration} min={1} max={7} onChange={setDuration} voice
                format={(v) => (v >= 7 ? m.visit.sevenDays : v === 1 ? m.visit.oneDay : fill(m.visit.days, { count: v }))} />
            )}
            {showDehydration && (
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-body font-semibold text-foreground">{m.visit.dehydrationQuestion}</span>
                  <VoiceButton onTranscript={(t) => {
                    const found = parseDehydrationSigns(t);
                    if (found.length === 0) return false;
                    setDehydration([...dehydration, ...found.filter((d) => !dehydration.includes(d))]);
                    return true;
                  }} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {DEHYDRATION.map((d) => {
                    const on = dehydration.includes(d);
                    return (
                      <button key={d} type="button" aria-pressed={on} onClick={() => toggle(dehydration, setDehydration, d)}
                        className={cn("h-10 rounded-pill border px-4 text-small font-semibold",
                          on ? "border-risk-high bg-risk-high/15 text-risk-high" : "border-border bg-elevated text-muted-foreground")}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {section === "wash" && (
          <section key="wash" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-subtitle font-bold text-foreground">{m.visit.washTitle}</h1>
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body text-foreground">{m.visit.waterWeek}</span>
                <VoiceButton onTranscript={(t) => {
                  const parsed = parseWaterSource(t);
                  if (!parsed) return false;
                  setWater(parsed);
                  return true;
                }} />
              </div>
              <select value={water} onChange={(e) => setWater(e.target.value as WaterSource)}
                className="h-12 rounded-lg border border-border bg-card px-4 text-body text-foreground outline-none focus:border-primary">
                {SOURCES.map((s) => <option key={s} value={s}>{localizedWater(s, m)}</option>)}
              </select>
            </div>
            <Choice label={m.visit.latrineAvailable} options={YES_GOOD} value={latrine} onChange={setLatrine} voiceParser={parseYesNo} />
            <Choice label={m.visit.latrineGood} options={LATRINE_COND} value={latrineCond} onChange={setLatrineCond} voiceParser={parseLatrineCondition} />
            <Choice label={m.visit.handwashVisible} options={YES_GOOD} value={handwash} onChange={setHandwash} voiceParser={parseYesNo} />
            <Choice label={m.visit.trashNearby} options={YES_BAD} value={trash} onChange={setTrash} voiceParser={parseYesNo} />
          </section>
        )}

        {section === "groups" && (
          <section key="groups" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-subtitle font-bold text-foreground">{m.visit.priorityGroups}</h1>
            {hasChildren && (
              <>
                <Caps>{m.visit.children}</Caps>
                <Choice label={m.visit.vaccinesCurrent} options={YES_NO_UNKNOWN} value={vaccines} onChange={setVaccines} voiceParser={parseYesNoUnknown} />
                {vaccines === "no" && (
                  <input value={vaccinesLate} onChange={(e) => setVaccinesLate(e.target.value)} placeholder={m.visit.vaccinesPlaceholder}
                    className="h-12 rounded-lg border border-border bg-card px-4 text-small text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
                )}
              </>
            )}
            {hasPregnant && (
              <>
                <Caps>{m.visit.pregnant}</Caps>
                <Counter label={m.visit.pregnancyWeeks} value={weeks} min={1} max={42} onChange={setWeeks} />
                <Counter label={m.visit.prenatalVisits} value={consults} min={0} max={12} onChange={setConsults} />
                <Choice label={m.visit.bpVisit} options={YES_GOOD} value={pBp} onChange={setPBp} />
                {pBp && (
                  <div className="flex gap-2">
                    <NumField label={m.visit.systolic} value={pSys} onChange={setPSys} />
                    <NumField label={m.visit.diastolic} value={pDia} onChange={setPDia} />
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {section === "chronic" && (
          <section key="chronic" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-subtitle font-bold text-foreground">{m.visit.healthFollowup}</h1>
            <Choice label={m.visit.tookMeds} options={YES_NO_UNKNOWN} value={meds} onChange={setMeds} />
            <Choice label={m.visit.bpTaken} options={YES_GOOD} value={cBp} onChange={setCBp} />
            {cBp && (
              <div className="flex gap-2">
                <NumField label={m.visit.systolic} value={cSys} onChange={setCSys} />
                <NumField label={m.visit.diastolic} value={cDia} onChange={setCDia} />
              </div>
            )}
            <Choice label={m.visit.glucoseTaken} options={YES_GOOD} value={gluc} onChange={setGluc} />
            {gluc && <NumField label={m.visit.result} value={glucVal} onChange={setGlucVal} />}
          </section>
        )}

        {section === "confirm" && (
          <section key="confirm" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-title font-bold text-foreground">{m.visit.summary}</h1>
            {summary.map((s) => (
              <div key={s.title} className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
                <Caps>{s.title}</Caps>
                <span className="text-body text-foreground">{s.value}</span>
              </div>
            ))}
            {urgent && (
              <p className="flex items-center gap-2 text-small font-semibold text-risk-high">
                <AlertTriangle className="size-4 shrink-0" aria-hidden /> {m.visit.urgentDehydration}
              </p>
            )}
            {error && (
              <p role="alert" className="flex items-center gap-2 text-small text-risk-high">
                <AlertCircle className="size-4 shrink-0" aria-hidden /> {error}
              </p>
            )}
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-6 py-4">
          {section === "confirm" ? (
            <PrimaryButton onClick={confirm} disabled={submitting} arrow={false} className="rounded-md">
              {submitting ? <><Loader2 className="!size-5 animate-spin" aria-hidden /> {m.visit.saving}</> : m.visit.confirm}
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => setIdx(idx + 1)} disabled={!canNext || conversationMode === "running"}>{m.common.next}</PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
