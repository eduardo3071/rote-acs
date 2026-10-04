import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ClipboardList, CloudOff, Droplets, Users } from "lucide-react";
import { z } from "zod";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getFamilyById, type WaterSource } from "@/data/families";
import { useFamily } from "@/lib/territory";
import { useAgentSession } from "@/lib/useAgentSession";

export const Route = createFileRoute("/familias/$id/protocolo")({
  validateSearch: z.object({
    vizinhos: z.number().int().min(0).optional(),
    pendente: z.boolean().optional(),
    urgente: z.boolean().optional(),
  }),
  loader: ({ params }) => {
    const family = getFamilyById(params.id);
    if (!family) throw notFound();
    return { family };
  },
  head: () => {
    const t = "Protocolo e orientação WASH — RoteACS";
    const d = "Orientação de conduta para o agente após visita com diarreia ou febre. Não é diagnóstico.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t },
      { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  notFoundComponent: () => (
    <div className="field-surface flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-subtitle font-bold text-foreground">Família não encontrada</p>
      <Link to="/familias" className="text-body text-primary">Voltar para a lista</Link>
    </div>
  ),
  component: ProtocolPage,
});

const STEPS = [
  "Verifique sinais de desidratação.",
  "Ofereça Sais de Reidratação Oral se disponível.",
  "Oriente sobre higiene das mãos com água e sabão.",
];

const WASH: Partial<Record<WaterSource, string>> = {
  well: "Esta família usa água de poço. Oriente ferver por 1 minuto antes do consumo.",
  river: "Esta família usa água de rio. Oriente filtrar e tratar com cloro.",
  igarape: "Esta família usa água de igarapé. Oriente filtrar e tratar com cloro antes do consumo.",
  tap: "Verifique se o recipiente de armazenamento tem tampa.",
};

/** Shown when the visit flagged IMCI dehydration danger signs — encaminhamento urgente. */
export function ReferralCard() {
  return (
    <div role="alert" className="flex gap-4 rounded-lg border border-risk-high bg-risk-high/15 p-4">
      <AlertTriangle className="size-6 shrink-0 text-risk-high" aria-hidden />
      <p className="text-body font-semibold text-foreground">
        Não consigo avaliar este caso com segurança. Encaminhe esta família para a clínica imediatamente.
      </p>
    </div>
  );
}

function ProtocolPage() {
  const { family: base } = Route.useLoaderData();
  const { vizinhos = 0, pendente = false, urgente = false } = Route.useSearch();
  useAgentSession();
  const navigate = useNavigate();
  const family = useFamily(base.id) ?? base;
  const wash = WASH[family.waterSource];
  const severe = urgente;

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pb-32 pt-6 animate-rise-in">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-lg bg-risk-medium/15 text-risk-medium">
            <ClipboardList className="size-6" aria-hidden />
          </span>
          <div>
            <p className="label-caps text-muted-foreground">Visita registrada · {family.name}</p>
            <h1 className="text-title font-bold text-foreground">O que fazer agora</h1>
          </div>
        </div>
        <p className="text-small text-muted-foreground">Orientação de conduta. Não é diagnóstico.</p>

        {severe && <ReferralCard />}

        <section className="rounded-lg border-l-[3px] border-risk-medium bg-card p-4">
          <h2 className="label-caps text-risk-medium">Protocolo</h2>
          <p className="mt-2 text-body font-semibold text-foreground">Foram identificados sinais que exigem avaliação.</p>
          <ol className="mt-4 flex flex-col gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-2 text-body text-foreground">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-risk-medium/15 text-small font-bold text-risk-medium">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        {wash && (
          <section className="rounded-lg border-l-[3px] border-primary bg-card p-4">
            <h2 className="label-caps flex items-center gap-2 text-primary"><Droplets className="size-4" aria-hidden /> Orientação WASH</h2>
            <p className="mt-2 text-body text-foreground">{wash}</p>
          </section>
        )}

        {pendente && (
          <p className="flex items-center gap-2 rounded-lg border border-border bg-elevated p-4 text-small font-semibold text-muted-foreground">
            <CloudOff className="size-4 shrink-0" aria-hidden /> Sem conexão — será enviada quando a internet voltar.
          </p>
        )}

        {vizinhos > 0 && (
          <p className="flex items-center gap-2 rounded-lg border border-risk-high/40 bg-risk-high/13 p-4 text-small font-semibold text-risk-high">
            <Users className="size-4 shrink-0" aria-hidden />
            {vizinhos === 1 ? "1 família vizinha foi atualizada para alta prioridade." : `${vizinhos} famílias vizinhas foram atualizadas para alta prioridade.`}
          </p>
        )}
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-6 pb-6 pt-4 backdrop-blur">
        <div className="mx-auto max-w-md">
          <PrimaryButton arrow={false} onClick={() => navigate({ to: "/familias" })}>Entendido</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
