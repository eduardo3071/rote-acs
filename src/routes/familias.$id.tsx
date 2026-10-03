import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Baby, CalendarClock, Droplets, Info, Stethoscope, Syringe, Users, Clock, ClipboardPlus } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { PrimaryButton } from "@/components/PrimaryButton";
import { daysSinceVisit, getFamilyById, type Family } from "@/data/families";
import { daysAgoLabel, riskLevel, waterLabel, type RiskLevel } from "@/lib/risk";
import { useFamily } from "@/lib/territory";
import { useAgentSession } from "@/lib/useAgentSession";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/familias/$id")({
  loader: ({ params }) => {
    const family = getFamilyById(params.id);
    if (!family) throw notFound();
    return { family };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Família não encontrada — RoteACS" }, { name: "robots", content: "noindex" }] };
    const t = `Família ${loaderData.family.name} — RoteACS`;
    const d = "Prioridade de visita, motivos e dados da família no território.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t },
      { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  notFoundComponent: FamilyNotFound,
  component: FamilyDetail,
});

const classLabel: Record<RiskLevel, string> = { high: "ALTA PRIORIDADE", medium: "ATENÇÃO", low: "MONITORAMENTO" };
const classText: Record<RiskLevel, string> = { high: "text-risk-high", medium: "text-risk-medium", low: "text-risk-low" };

function reasons(f: Family) {
  const out: { icon: typeof Users; text: string }[] = [];
  if (f.clusterRisk) out.push({ icon: Users, text: "Vizinho com sintoma registrado" });
  if (f.clusterRisk) out.push({ icon: Droplets, text: `Mesma fonte de água: ${waterLabel(f).toLowerCase()}` });
  if (f.giSymptoms) out.push({ icon: Stethoscope, text: "Diarreia registrada" });
  if (f.feverSymptoms) out.push({ icon: Stethoscope, text: "Febre registrada" });
  if (f.childrenUnder5 > 0)
    out.push({ icon: Baby, text: f.childrenUnder5 === 1 ? "1 criança menor de 5 anos" : `${f.childrenUnder5} crianças menores de 5 anos` });
  const d = daysSinceVisit(f);
  if (d >= 15) out.push({ icon: Clock, text: `Sem visita há ${d} dias` });
  if (!f.vaccinationsUpToDate) out.push({ icon: Syringe, text: "Vacinação atrasada" });
  return out;
}

function FamilyDetail() {
  const { family: initial } = Route.useLoaderData();
  const family = useFamily(initial.id) ?? initial;
  useAgentSession();
  const level = riskLevel(family.riskScore);
  const why = reasons(family);
  const symptoms = [family.giSymptoms && "Diarreia", family.feverSymptoms && "Febre"].filter(Boolean).join(" e ");
  const facts = [
    { icon: Baby, label: "Crianças menores de 5 anos", value: String(family.childrenUnder5) },
    { icon: Droplets, label: "Fonte de água", value: waterLabel(family) },
    { icon: CalendarClock, label: "Última visita", value: daysAgoLabel(family) },
    { icon: Syringe, label: "Vacinas", value: family.vaccinationsUpToDate ? "Em dia" : "Atrasadas" },
    { icon: Stethoscope, label: "Sintomas registrados", value: symptoms || "Nenhum" },
  ];

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-32 pt-6">
        <Link to="/familias" className="flex items-center gap-2 text-body text-primary">
          <ArrowLeft className="size-5" aria-hidden /> Famílias
        </Link>

        <section className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-rise-in">
          <RiskBadge score={family.riskScore} className="size-20 text-display" />
          <div className="min-w-0">
            <h1 className="truncate text-title font-bold text-foreground">{family.name}</h1>
            <p className="text-small text-muted-foreground">RiskScore {family.riskScore} de 100</p>
            <p className={cn("mt-1 text-label font-bold tracking-[0.5px]", classText[level])}>{classLabel[level]}</p>
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-small text-foreground">
          <Info className="mt-px size-4 shrink-0 text-primary" aria-hidden />
          <p>Prioridade de visita ≠ diagnóstico. Avalie ao chegar.</p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="label-caps text-muted-foreground">Por que esta família?</h2>
          {why.length === 0 ? (
            <p className="rounded-lg border border-border bg-card p-4 text-small text-muted-foreground">Sem alertas no momento.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {why.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-small text-foreground">
                  <Icon className={cn("size-4 shrink-0", classText[level])} aria-hidden /> {text}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="label-caps text-muted-foreground">Dados da família</h2>
          <dl className="divide-y divide-border rounded-lg border border-border bg-card">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 p-4">
                <dt className="flex items-center gap-2 text-small text-muted-foreground"><Icon className="size-4" aria-hidden />{label}</dt>
                <dd className="text-small font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-6 py-4">
          <PrimaryButton asChild arrow={false}>
            <Link to="/familias/$id/visita" params={{ id: family.id }}>
              <ClipboardPlus className="!size-5" aria-hidden /> Registrar visita
            </Link>
          </PrimaryButton>
        </div>
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
