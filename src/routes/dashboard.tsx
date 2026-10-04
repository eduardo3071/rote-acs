import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Eye, CheckCircle2, CalendarClock, ListOrdered, Map as MapIcon } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TerritoryRiskChart } from "@/components/dashboard/TerritoryRiskChart";
import { TerritoryMap } from "@/components/dashboard/TerritoryMap";
import { PriorityFamilyCard } from "@/components/dashboard/PriorityFamilyCard";
import { NearestFacilityCard } from "@/components/dashboard/NearestFacilityCard";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { logout } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";
import { useAgentSession } from "@/lib/useAgentSession";
import { daysSinceVisit } from "@/data/families";
import { getNearestHealthFacility, useFamilies, type NearestFacility } from "@/lib/territory";
import { countByLevel, type RiskLevel } from "@/lib/risk";
import { useAppTranslations } from "@/lib/app-translations";
import { localizedPriority } from "@/lib/localized-family";

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
  const { m } = useAppTranslations();
  const navigate = useNavigate({ from: "/dashboard" });
  const session = useAgentSession();
  const [syncedAt] = useState(() => new Date());
  const mockFamilies = useFamilies();
  const [facility, setFacility] = useState<NearestFacility | null>(null);

  const counts = countByLevel(mockFamilies);
  const top = [...mockFamilies].sort((a, b) => b.riskScore - a.riskScore)[0];

  useEffect(() => {
    if (!top) return;
    let active = true;
    getNearestHealthFacility(top.latitude, top.longitude).then((f) => {
      if (active) setFacility(f);
    });
    return () => {
      active = false;
    };
  }, [top?.id]);

  if (!session) return <div className="field-surface min-h-screen" />;
  const visitedToday = mockFamilies.filter((f) => daysSinceVisit(f) === 0).length;
  const overdue = mockFamilies.filter((f) => daysSinceVisit(f) >= 30).length;

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-48 pt-6 md:max-w-2xl">
        <DashboardHeader session={session} hasAlerts={counts.high > 0} syncedAt={syncedAt}
          onLogout={async () => { await logout(); navigate({ to: "/login", replace: true }); }} />

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-border bg-gradient-to-b from-elevated to-card p-4 shadow-primary/0 animate-rise-in">
            <p className="label-caps text-muted-foreground">{m.dashboard.summary}</p>
            <div className="mt-4"><TerritoryRiskChart counts={counts} total={mockFamilies.length} /></div>
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {(["high", "medium", "low"] as RiskLevel[]).map((l) => (
                <li key={l} className="rounded-lg bg-background/60 p-2 text-center">
                  <p className="text-subtitle font-bold tabular-nums text-foreground">{counts[l]}</p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-label text-muted-foreground">
                    <span className={`size-2 rounded-pill ${dot[l]}`} />{localizedPriority(l, m)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 animate-rise-in">
            <p className="label-caps flex items-center gap-1 text-muted-foreground"><MapIcon className="size-3" aria-hidden /> {m.dashboard.territory}</p>
            <div className="mt-2"><TerritoryMap families={mockFamilies} focusId={top?.id} /></div>
            <p className="mt-2 text-small text-muted-foreground">
              {m.dashboard.circle}
            </p>
            <p className="mt-1 text-label text-ink-faint">{m.dashboard.coordinates}</p>
          </section>
        </div>

        {top && <PriorityFamilyCard family={top} />}
        {facility && <NearestFacilityCard facility={facility} />}

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <DashboardMetricCard icon={Flame} tone="high" value={counts.high} label={m.risk.high} />
          <DashboardMetricCard icon={Eye} tone="medium" value={counts.medium} label={m.risk.medium} />
          <DashboardMetricCard icon={CheckCircle2} tone="low" value={visitedToday} label={m.dashboard.visitedToday} />
          <DashboardMetricCard icon={CalendarClock} tone="primary" value={overdue} label={m.dashboard.overdue} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 bg-gradient-to-t from-background via-background to-transparent px-6 pb-4 pt-8">
        <div className="mx-auto max-w-md md:max-w-2xl">
          <PrimaryButton arrow={false} onClick={() => navigate({ to: "/familias" })}>
            <ListOrdered className="!size-5" aria-hidden /> {m.dashboard.viewPriority}
          </PrimaryButton>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
