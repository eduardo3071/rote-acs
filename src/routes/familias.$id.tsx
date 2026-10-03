import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Baby, Droplets, Syringe, Users } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { getFamilyById } from "@/data/families";
import { daysAgoLabel, priorityLabels, riskLevel, waterLabel } from "@/lib/risk";
import { useAgentSession } from "@/lib/useAgentSession";

export const Route = createFileRoute("/familias/$id")({
  loader: ({ params }) => {
    const family = getFamilyById(params.id);
    if (!family) throw notFound();
    return { family };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Família não encontrada — RoteACS" }, { name: "robots", content: "noindex" }] };
    const t = `Família ${loaderData.family.name} — RoteACS`;
    const d = "Prioridade de visita e informações da família no território.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t },
      { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  notFoundComponent: FamilyNotFound,
  component: FamilyDetail,
});

function FamilyDetail() {
  const { family } = Route.useLoaderData();
  useAgentSession();
  const level = riskLevel(family.riskScore);
  const facts = [
    { icon: CalendarClock, label: "Última visita", value: daysAgoLabel(family) },
    { icon: Baby, label: "Crianças menores de 5 anos", value: String(family.childrenUnder5) },
    { icon: Droplets, label: "Fonte de água", value: waterLabel(family) },
    { icon: Syringe, label: "Vacinação", value: family.vaccinationsUpToDate ? "Em dia" : "Atrasada" },
    { icon: Users, label: "Vizinhos em risco", value: family.clusterRisk ? "Sim" : "Não" },
  ];
  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-6">
        <Link to="/familias" className="flex items-center gap-2 text-body text-primary">
          <ArrowLeft className="size-5" aria-hidden /> Famílias
        </Link>
        <div className="flex items-center gap-4">
          <RiskBadge score={family.riskScore} className="size-16 text-display" />
          <div>
            <h1 className="text-title font-bold text-foreground">{family.name}</h1>
            <p className="text-small text-muted-foreground">{priorityLabels[level]} · prioridade de visita</p>
          </div>
        </div>
        <p className="rounded-lg border border-border bg-card p-4 text-body text-foreground">{family.riskReason}</p>
        <dl className="divide-y divide-border rounded-lg border border-border bg-card">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 p-4">
              <dt className="flex items-center gap-2 text-small text-muted-foreground"><Icon className="size-4" aria-hidden />{label}</dt>
              <dd className="text-small font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function FamilyNotFound() {
  return (
    <div className="field-surface flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-subtitle font-bold text-foreground">Família não encontrada</p>
      <Link to="/familias" className="text-body text-primary">Voltar para a lista</Link>
    </div>
  );
}
