import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Minus, Plus, Users } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getFamilyById, waterSourceLabels, type WaterSource } from "@/data/families";
import { registerVisit } from "@/lib/territory";
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
    const d = "Registro rápido de visita em 3 etapas: sintomas, fonte de água e crianças.";
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

const SOURCES: WaterSource[] = ["well", "river", "tap", "other"];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label={`Etapa ${step} de 3`}>
      {[1, 2, 3].map((n) => {
        const state = n < step ? "done" : n === step ? "current" : "future";
        return (
          <li key={n} className="flex flex-1 items-center gap-2">
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-small font-bold",
              state === "done" && "bg-risk-low text-background",
              state === "current" && "bg-primary text-primary-foreground shadow-primary",
              state === "future" && "bg-border text-muted-foreground")}>
              {state === "done" ? <Check className="size-4" aria-hidden /> : n}
            </span>
            {n < 3 && <span className={cn("h-0.5 flex-1 rounded-full", n < step ? "bg-risk-low" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}

function VisitFlow() {
  const { family } = Route.useLoaderData();
  useAgentSession();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState<boolean | null>(null);
  const [water, setWater] = useState<WaterSource | null>(null);
  const [children, setChildren] = useState(family.childrenUnder5);
  const [raised, setRaised] = useState<number | null>(null);

  const reset = () => { setStep(1); setSymptoms(null); setWater(null); setChildren(family.childrenUnder5); setRaised(null); };
  const confirm = () => {
    if (symptoms === null || !water) return;
    const n = registerVisit(family.id, { symptoms, waterSource: water, childrenUnder5: children });
    if (symptoms) navigate({ to: "/familias/$id/protocolo", params: { id: family.id }, search: { vizinhos: n } });
    else setRaised(n);
  };

  if (raised !== null) {
    return (
      <div className="field-surface flex min-h-screen flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center animate-rise-in">
          <span className="flex size-20 items-center justify-center rounded-full bg-risk-low/15 shadow-risk-low">
            <CheckCircle2 className="size-10 text-risk-low" aria-hidden />
          </span>
          <h1 className="text-display font-bold text-foreground">Visita registrada</h1>
          <p className="text-body text-muted-foreground">Dados salvos no dispositivo.</p>
          {raised > 0 && (
            <p className="flex items-center gap-2 rounded-lg border border-risk-high/40 bg-risk-high/13 p-4 text-small font-semibold text-risk-high">
              <Users className="size-4 shrink-0" aria-hidden />
              {raised === 1 ? "1 família vizinha foi atualizada para alta prioridade." : `${raised} famílias vizinhas foram atualizadas para alta prioridade.`}
            </p>
          )}
        </div>
        <div className="mx-auto flex w-full max-w-md flex-col gap-2 px-6 pb-8">
          <PrimaryButton onClick={() => navigate({ to: "/familias" })}>Ver prioridades</PrimaryButton>
          <button onClick={reset} className="h-14 rounded-lg border border-border bg-elevated text-body font-semibold text-primary">Registrar outra</button>
        </div>
      </div>
    );
  }

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-6">
        <div className="flex items-center justify-between">
          <button onClick={() => (step > 1 ? setStep(step - 1) : navigate({ to: "/familias/$id", params: { id: family.id } }))}
            className="flex items-center gap-2 text-body text-primary">
            <ArrowLeft className="size-5" aria-hidden /> {step > 1 ? "Voltar" : family.name}
          </button>
          <span className="label-caps text-muted-foreground">Etapa {step}/3</span>
        </div>
        <Stepper step={step} />

        {step === 1 && (
          <section key="s1" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-title font-bold text-foreground">A família apresenta diarreia ou febre?</h1>
            <button onClick={() => { setSymptoms(false); setStep(2); }}
              className={cn("h-20 rounded-lg border-2 bg-elevated text-subtitle font-bold text-foreground", symptoms === false ? "border-primary" : "border-border")}>NÃO</button>
            <button onClick={() => { setSymptoms(true); setStep(2); }}
              className="h-20 rounded-lg border-2 border-risk-high bg-risk-high/15 text-subtitle font-bold text-risk-high">SIM</button>
          </section>
        )}

        {step === 2 && (
          <section key="s2" className="flex flex-col gap-4 animate-rise-in">
            <h1 className="text-title font-bold text-foreground">Qual a fonte de água?</h1>
            <div className="grid grid-cols-2 gap-2">
              {SOURCES.map((s) => (
                <button key={s} onClick={() => { setWater(s); setStep(3); }}
                  className={cn("h-20 rounded-lg border-2 bg-elevated text-body font-semibold text-foreground", water === s ? "border-primary shadow-primary" : "border-border")}>
                  {waterSourceLabels[s]}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section key="s3" className="flex flex-col gap-6 animate-rise-in">
            <h1 className="text-title font-bold text-foreground">Crianças menores de 5 anos presentes?</h1>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <button aria-label="Diminuir" disabled={children === 0} onClick={() => setChildren((c) => Math.max(0, c - 1))}
                className="flex size-14 items-center justify-center rounded-lg border border-border bg-elevated text-primary disabled:opacity-40">
                <Minus className="size-6" aria-hidden />
              </button>
              <span className="text-brand leading-none text-foreground" aria-live="polite">{children}</span>
              <button aria-label="Aumentar" onClick={() => setChildren((c) => c + 1)}
                className="flex size-14 items-center justify-center rounded-lg border border-border bg-elevated text-primary">
                <Plus className="size-6" aria-hidden />
              </button>
            </div>
            <PrimaryButton onClick={confirm}>Confirmar visita</PrimaryButton>
          </section>
        )}
      </div>
    </div>
  );
}
