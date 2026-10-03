import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Eye, CheckCircle2, CalendarClock, ListOrdered, Map as MapIcon } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TerritoryRiskChart } from "@/components/dashboard/TerritoryRiskChart";
import { TerritoryMap } from "@/components/dashboard/TerritoryMap";
import { PriorityFamilyCard } from "@/components/dashboard/PriorityFamilyCard";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { logout } from "@/lib/session";
import { useAgentSession } from "@/lib/useAgentSession";
import { daysSinceVisit } from "@/data/families";
import { useFamilies } from "@/lib/territory";
import { countByLevel, priorityLabels, type RiskLevel } from "@/lib/risk";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — RoteACS" },
      { name: "description", content: "Seu território e as famílias que mais precisam de visita." },
      { property: "og:title", content: "Painel — RoteACS" },
      { property: "og:description", content: "Seu território e as famílias que mais precisam de visita." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const dot: Record<RiskLevel, string> = { high: "bg-risk-high", medium: "bg-risk-medium", low: "bg-risk-low" };

function Dashboard() {
  const navigate = useNavigate({ from: "/dashboard" });
  const session = useAgentSession();
  const [syncedAt] = useState(() => new Date());
  const mockFamilies = useFamilies();

  if (!session) return <div className="field-surface min-h-screen" />;

  const counts = countByLevel(mockFamilies);
  const top = [...mockFamilies].sort((a, b) => b.riskScore - a.riskScore)[0];
  const visitedToday = mockFamilies.filter((f) => daysSinceVisit(f) === 0).length;
  const overdue = mockFamilies.filter((f) => daysSinceVisit(f) >= 30).length;

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-32 pt-6 md:max-w-2xl">
        <DashboardHeader session={session} hasAlerts={counts.high > 0} syncedAt={syncedAt}
          onLogout={() => { logout(); navigate({ to: "/login", replace: true }); }} />

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-border bg-gradient-to-b from-elevated to-card p-4 shadow-primary/0 animate-rise-in">
            <p className="label-caps text-muted-foreground">Resumo do território</p>
            <div className="mt-4"><TerritoryRiskChart counts={counts} total={mockFamilies.length} /></div>
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {(["high", "medium", "low"] as RiskLevel[]).map((l) => (
                <li key={l} className="rounded-lg bg-background/60 p-2 text-center">
                  <p className="text-subtitle font-bold tabular-nums text-foreground">{counts[l]}</p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-label text-muted-foreground">
                    <span className={`size-2 rounded-pill ${dot[l]}`} />{priorityLabels[l]}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 animate-rise-in">
            <div className="flex items-center justify-between">
              <p className="label-caps flex items-center gap-1 text-muted-foreground"><MapIcon className="size-3" aria-hidden /> Território</p>
              <span className="text-label text-ink-faint">Ilustrativo</span>
            </div>
            <div className="mx-auto mt-2 max-w-[14rem]"><TerritoryMap families={mockFamilies} focusId={top?.id} /></div>
            <p className="mt-2 text-small text-muted-foreground">
              Área circulada: famílias próximas com a mesma fonte de água.
            </p>
          </section>
        </div>

        {top && <PriorityFamilyCard family={top} />}

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <DashboardMetricCard icon={Flame} tone="high" value={counts.high} label="Alta prioridade" />
          <DashboardMetricCard icon={Eye} tone="medium" value={counts.medium} label="Atenção" />
          <DashboardMetricCard icon={CheckCircle2} tone="low" value={visitedToday} label="Visitadas hoje" />
          <DashboardMetricCard icon={CalendarClock} tone="primary" value={overdue} label="Sem visita há 30 dias" />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent px-6 pb-6 pt-8">
        <div className="mx-auto max-w-md md:max-w-2xl">
          <PrimaryButton arrow={false} onClick={() => navigate({ to: "/familias" })}>
            <ListOrdered className="!size-5" aria-hidden /> Ver famílias prioritárias
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
