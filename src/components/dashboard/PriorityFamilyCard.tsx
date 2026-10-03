import { Link } from "@tanstack/react-router";
import { CalendarClock, Baby, Droplets, ChevronRight, Zap } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import type { Family } from "@/data/families";
import { daysAgoLabel, priorityLabels, riskLevel, shortRiskReason, waterLabel } from "@/lib/risk";

/** "Prioridade agora" — whichever family currently has the highest score. */
export function PriorityFamilyCard({ family }: { family: Family }) {
  const level = riskLevel(family.riskScore);
  return (
    <section className="relative overflow-hidden rounded-xl border border-risk-high/40 bg-gradient-to-br from-risk-high/10 via-card to-card p-4 animate-rise-in">
      <p className="label-caps flex items-center gap-1 text-risk-high">
        <Zap className="size-3" aria-hidden /> Prioridade agora
      </p>
      <div className="mt-4 flex items-center gap-4">
        <RiskBadge score={family.riskScore} className="size-16 text-display" />
        <div className="min-w-0">
          <h2 className="truncate text-subtitle font-bold text-foreground">{family.name}</h2>
          <p className="text-small font-semibold text-risk-high">{priorityLabels[level]} · Score {family.riskScore}</p>
          <p className="mt-1 text-small text-muted-foreground">{shortRiskReason(family)}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        <Fact icon={CalendarClock} label="Última visita" value={daysAgoLabel(family)} />
        <Fact icon={Baby} label="Menores de 5" value={String(family.childrenUnder5)} />
        <Fact icon={Droplets} label="Água" value={waterLabel(family)} />
      </dl>
      <Link to="/familias/$id" params={{ id: family.id }}
        className="mt-4 flex h-11 items-center justify-center gap-1 rounded-lg border border-border bg-elevated text-body font-semibold text-primary transition-colors active:bg-card">
        Ver detalhes <ChevronRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Baby; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/60 p-2">
      <dt className="flex items-center gap-1 text-label text-muted-foreground"><Icon className="size-3" aria-hidden />{label}</dt>
      <dd className="mt-1 text-small font-semibold text-foreground">{value}</dd>
    </div>
  );
}
