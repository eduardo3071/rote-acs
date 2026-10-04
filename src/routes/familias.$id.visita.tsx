import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle, AlertTriangle, ArrowLeft, Baby, Calendar, Check, CheckCircle2, CloudOff, Droplets, Heart,
  Loader2, Minus, Plus, Thermometer, Users, Wind, X, type LucideIcon,
} from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getFamilyById, waterSourceLabels, type WaterSource } from "@/data/families";
import { confirmVisit, useFamily } from "@/lib/territory";
import { useAgentSession } from "@/lib/useAgentSession";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/familias/$id/visita")({
  loader: ({ params }) => {
    const family = getFamilyById(params.id);
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

const REASONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "routine", label: "Visita de rotina", icon: Calendar },
  { id: "symptom", label: "Sintoma relatado", icon: AlertTriangle },
  { id: "prenatal", label: "Acompanhamento de gestante", icon: Baby },
  { id: "chronic", label: "Acompanhamento de doença crônica", icon: Heart },
];
const SYMPTOMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "diarrhea", label: "Diarreia", icon: Droplets },
  { id: "fever", label: "Febre", icon: Thermometer },
  { id: "respiratory", label: "Tosse ou dificuldade de respirar", icon: Wind },
  { id: "vomit", label: "Vômito", icon: X },
  { id: "none", label: "Nenhum sintoma", icon: Check },
];
const DEHYDRATION = ["Olhos fundos", "Boca seca", "Criança letárgica"];
const SOURCES: WaterSource[] = ["well", "river", "igarape", "tap", "other"];

const YES_GOOD: Opt<boolean>[] = [{ label: "SIM", value: true, tone: "good" }, { label: "NÃO", value: false, tone: "bad" }];
const YES_BAD: Opt<boolean>[] = [{ label: "SIM", value: true, tone: "bad" }, { label: "NÃO", value: false, tone: "good" }];
const YES_NO_UNKNOWN: Opt<string>[] = [
  { label: "SIM", value: "yes", tone: "good" }, { label: "NÃO", value: "no", tone: "bad" }, { label: "NÃO SEI", value: "unknown", tone: "neutral" },
];
const LATRINE_COND: Opt<string>[] = [
  { label: "SIM", value: "good", tone: "good" }, { label: "NÃO", value: "bad", tone: "bad" }, { label: "NÃO SE APLICA", value: "na", tone: "neutral" },
];

const toneActive: Record<Tone, string> = {
  good: "border-risk-low bg-risk-low/20 text-risk-low",
  bad: "border-risk-high bg-risk-high/20 text-risk-high",
  neutral: "border-primary bg-primary/20 text-primary",
};

function Choice<T>({ label, options, value, onChange }: { label: string; options: Opt<T>[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <span className="text-body text-foreground">{label}</span>
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

function Counter({ label, value, min, max, onChange, format }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <span className="text-body text-foreground">{label}</span>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Diminuir" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}
          className="flex size-12 items-center justify-center rounded-lg border border-border bg-elevated text-primary disabled:opacity-40">
          <Minus className="size-5" aria-hidden />
        </button>
        <span className="text-title font-bold text-foreground" aria-live="polite">{format ? format(value) : value}</span>
        <button type="button" aria-label="Aumentar" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}
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
  return (
    <ol className="flex items-center gap-1" aria-label={`Etapa ${current + 1} de ${total}`}>
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
  const { family: initial } = Route.useLoaderData();
  const family = useFamily(initial.id) ?? initial;
  useAgentSession();
  const navigate = useNavigate();

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
    setGluc(null); setGlucVal(""); setResult(null); setError(null);
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
        },
      });
      setResult({ ...r, urgent, symptomatic: diarrhea || fever });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar a visita. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="field-surface flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center animate-rise-in">
          <CheckCircle2 className="size-16 text-risk-low" aria-hidden />
          <h1 className="text-title font-bold text-risk-low">Visita registrada</h1>
          <p className="text-small text-muted-foreground">Dados salvos no dispositivo.</p>
          {!result.synced && (
            <p className="flex items-center gap-2 rounded-lg border border-border bg-elevated p-4 text-small font-semibold text-muted-foreground">
              <CloudOff className="size-4 shrink-0" aria-hidden /> Sem conexão — será enviada quando a internet voltar.
            </p>
          )}
          {result.urgent && (
            <p className="flex items-start gap-2 rounded-lg border border-risk-high bg-risk-high/15 p-4 text-left text-small font-semibold text-risk-high">
              <AlertTriangle className="size-5 shrink-0" aria-hidden />
              Encaminhamento urgente recomendado — leve esta família à clínica o quanto antes.
            </p>
          )}
          {result.affected > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-risk-medium bg-risk-medium/15 p-4 text-left text-small font-semibold text-risk-medium">
              <Users className="size-5 shrink-0" aria-hidden />
              {result.affected === 1 ? "1 família vizinha foi atualizada para alta prioridade." : `${result.affected} famílias vizinhas foram atualizadas para alta prioridade.`}
            </p>
          )}
          {result.symptomatic && (
            <Link to="/familias/$id/protocolo" params={{ id: family.id }} search={{ vizinhos: result.affected, pendente: !result.synced }}
              className="text-body font-semibold text-primary">Ver protocolo de cuidado</Link>
          )}
        </div>
        <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-6 pb-8">
          <PrimaryButton onClick={() => navigate({ to: "/familias" })}>Ver prioridades</PrimaryButton>
          <button onClick={reset} className="h-14 rounded-lg border border-border bg-elevated text-body font-semibold text-primary">Registrar outra</button>
        </div>
      </div>
    );
  }

  const summary: { title: string; value: string }[] = [
    { title: "Motivo da visita", value: REASONS.filter((r) => reasons.includes(r.id)).map((r) => r.label).join(", ") || "—" },
    {
      title: "Sintomas",
      value: (SYMPTOMS.filter((s) => symptoms.includes(s.id)).map((s) => s.label).join(", ") || "—") +
        (showDuration ? ` · ${duration >= 7 ? "7 ou mais dias" : duration === 1 ? "1 dia" : `${duration} dias`}` : "") +
        (urgent ? ` · Desidratação: ${dehydration.join(", ")}` : ""),
    },
    {
      title: "Condições WASH",
      value: [`Água: ${waterSourceLabels[water]}`,
        latrine !== null && `Latrina: ${latrine ? "sim" : "não"}`,
        handwash !== null && `Lavagem de mãos: ${handwash ? "sim" : "não"}`,
        trash !== null && `Lixo a céu aberto: ${trash ? "sim" : "não"}`].filter(Boolean).join(" · "),
    },
  ];
  const groups = [hasChildren && "Crianças menores de 5", hasPregnant && "Gestante", hasChronic && "Doença crônica"].filter(Boolean);
  if (groups.length) summary.push({ title: "Grupos atendidos", value: groups.join(", ") });

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-32 pt-6">
        <div className="flex items-center justify-between">
          <button onClick={() => (idx > 0 ? setIdx(idx - 1) : navigate({ to: "/familias/$id", params: { id: family.id } }))}
            className="flex items-center gap-2 text-body text-primary">
            <ArrowLeft className="size-5" aria-hidden /> {idx > 0 ? "Voltar" : family.name}
          </button>
          <span className="label-caps text-muted-foreground">Etapa {idx + 1}/{sections.length}</span>
        </div>
        <Stepper total={sections.length} current={idx} />

        {section === "reason" && (
          <section key="reason" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-center text-subtitle font-bold text-foreground">Qual o motivo da visita?</h1>
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
            <h1 className="text-subtitle font-bold text-foreground">A família apresenta algum destes sintomas?</h1>
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
              <Counter label="Há quantos dias?" value={duration} min={1} max={7} onChange={setDuration}
                format={(v) => (v >= 7 ? "7 ou mais dias" : v === 1 ? "1 dia" : `${v} dias`)} />
            )}
            {showDehydration && (
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
                <span className="text-body font-semibold text-foreground">Sinais de desidratação?</span>
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
            <h1 className="text-subtitle font-bold text-foreground">Condições observadas na visita</h1>
            <label className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
              <span className="text-body text-foreground">Fonte de água usada esta semana</span>
              <select value={water} onChange={(e) => setWater(e.target.value as WaterSource)}
                className="h-12 rounded-lg border border-border bg-card px-4 text-body text-foreground outline-none focus:border-primary">
                {SOURCES.map((s) => <option key={s} value={s}>{waterSourceLabels[s]}</option>)}
              </select>
            </label>
            <Choice label="Latrina ou banheiro disponível?" options={YES_GOOD} value={latrine} onChange={setLatrine} />
            <Choice label="Latrina coberta e em boas condições?" options={LATRINE_COND} value={latrineCond} onChange={setLatrineCond} />
            <Choice label="Ponto de lavagem de mãos com sabão visível?" options={YES_GOOD} value={handwash} onChange={setHandwash} />
            <Choice label="Lixo a céu aberto próximo à casa?" options={YES_BAD} value={trash} onChange={setTrash} />
          </section>
        )}

        {section === "groups" && (
          <section key="groups" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-subtitle font-bold text-foreground">Grupos prioritários</h1>
            {hasChildren && (
              <>
                <Caps>Crianças</Caps>
                <Choice label="Vacinas em dia?" options={YES_NO_UNKNOWN} value={vaccines} onChange={setVaccines} />
                {vaccines === "no" && (
                  <input value={vaccinesLate} onChange={(e) => setVaccinesLate(e.target.value)} placeholder="Quais vacinas estão atrasadas?"
                    className="h-12 rounded-lg border border-border bg-card px-4 text-small text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
                )}
              </>
            )}
            {hasPregnant && (
              <>
                <Caps>Gestante</Caps>
                <Counter label="Semanas de gestação" value={weeks} min={1} max={42} onChange={setWeeks} />
                <Counter label="Consultas de pré-natal realizadas" value={consults} min={0} max={12} onChange={setConsults} />
                <Choice label="Pressão arterial aferida nesta visita?" options={YES_GOOD} value={pBp} onChange={setPBp} />
                {pBp && (
                  <div className="flex gap-2">
                    <NumField label="Sistólica (mmHg)" value={pSys} onChange={setPSys} />
                    <NumField label="Diastólica (mmHg)" value={pDia} onChange={setPDia} />
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {section === "chronic" && (
          <section key="chronic" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-subtitle font-bold text-foreground">Acompanhamento de saúde</h1>
            <Choice label="Tomou os medicamentos prescritos nos últimos 7 dias?" options={YES_NO_UNKNOWN} value={meds} onChange={setMeds} />
            <Choice label="Pressão arterial aferida?" options={YES_GOOD} value={cBp} onChange={setCBp} />
            {cBp && (
              <div className="flex gap-2">
                <NumField label="Sistólica (mmHg)" value={cSys} onChange={setCSys} />
                <NumField label="Diastólica (mmHg)" value={cDia} onChange={setCDia} />
              </div>
            )}
            <Choice label="Glicemia capilar aferida?" options={YES_GOOD} value={gluc} onChange={setGluc} />
            {gluc && <NumField label="Resultado (mg/dL)" value={glucVal} onChange={setGlucVal} />}
          </section>
        )}

        {section === "confirm" && (
          <section key="confirm" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-title font-bold text-foreground">Resumo da visita</h1>
            {summary.map((s) => (
              <div key={s.title} className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
                <Caps>{s.title}</Caps>
                <span className="text-body text-foreground">{s.value}</span>
              </div>
            ))}
            {urgent && (
              <p className="flex items-center gap-2 text-small font-semibold text-risk-high">
                <AlertTriangle className="size-4 shrink-0" aria-hidden /> Sinais de desidratação — encaminhamento urgente.
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
              {submitting ? <><Loader2 className="!size-5 animate-spin" aria-hidden /> Salvando…</> : "Confirmar visita"}
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => setIdx(idx + 1)} disabled={!canNext}>Próximo</PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
