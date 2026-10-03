import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Map, AlertTriangle, ShieldCheck, Flame, Eye, CheckCircle2, CalendarClock, LogOut, type LucideIcon } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getSession, logout, type AgentSession } from "@/lib/session";
import { mockFamilies, daysSinceVisit } from "@/data/families";
import { cn } from "@/lib/utils";

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

function getDashboardStats(now = Date.now()) {
  return {
    high: mockFamilies.filter((f) => f.riskScore >= 70).length,
    medium: mockFamilies.filter((f) => f.riskScore >= 40 && f.riskScore < 70).length,
    visitedToday: mockFamilies.filter((f) => daysSinceVisit(f, now) === 0).length,
    overdue: mockFamilies.filter((f) => daysSinceVisit(f, now) >= 30).length,
  };
}

type Tone = "high" | "medium" | "low" | "primary";
const toneClass: Record<Tone, string> = {
  high: "text-risk-high bg-risk-high/15",
  medium: "text-risk-medium bg-risk-medium/15",
  low: "text-risk-low bg-risk-low/15",
  primary: "text-primary bg-primary/15",
};

function Dashboard() {
  const navigate = useNavigate({ from: "/dashboard" });
  const [session, setSession] = useState<AgentSession | null>(null);
  const stats = getDashboardStats();

  useEffect(() => {
    const s = getSession();
    if (!s) navigate({ to: "/login", replace: true });
    else setSession(s);
  }, [navigate]);

  if (!session) return <div className="field-surface min-h-screen" />;

  const alert = stats.high > 0;
  const firstName = session.name.split(" ")[0];

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 pb-8 pt-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-title font-bold text-foreground">Bom dia, {firstName}</h1>
            <p className="mt-1 text-small text-muted-foreground">Seu território está atualizado</p>
          </div>
          <div className="flex gap-2">
            <button aria-label="Notificações" className="relative grid size-11 place-items-center rounded-lg border border-border bg-card text-foreground">
              <Bell className="size-5" />
              {alert && <span className="absolute right-2 top-2 size-2 rounded-pill bg-risk-high" />}
            </button>
            <button aria-label="Sair" onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}
              className="grid size-11 place-items-center rounded-lg border border-border bg-card text-muted-foreground">
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        <div role="status" className={cn("flex items-center gap-4 rounded-xl border p-4",
          alert ? "border-risk-high bg-risk-high/10" : "border-risk-low bg-risk-low/10")}>
          {alert ? <AlertTriangle className="size-6 shrink-0 text-risk-high" /> : <ShieldCheck className="size-6 shrink-0 text-risk-low" />}
          <p className="text-body font-semibold text-foreground">
            {alert ? `${stats.high} ${stats.high === 1 ? "família precisa" : "famílias precisam"} de atenção hoje` : "Território sob controle"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Stat icon={Flame} tone="high" value={stats.high} label="Alta prioridade" />
          <Stat icon={Eye} tone="medium" value={stats.medium} label="Atenção" />
          <Stat icon={CheckCircle2} tone="low" value={stats.visitedToday} label="Visitadas hoje" />
          <Stat icon={CalendarClock} tone="primary" value={stats.overdue} label="Sem visita há 30 dias" />
        </div>

        <div className="mt-auto pt-4">
          <PrimaryButton arrow={false} onClick={() => navigate({ to: "/familias" })}>
            <Map className="!size-5" aria-hidden /> Ver famílias prioritárias
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, tone, value, label }: { icon: LucideIcon; tone: Tone; value: number; label: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <span className={cn("grid size-10 place-items-center rounded-lg", toneClass[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className={cn("text-display font-bold", toneClass[tone].split(" ")[0])}>{value}</p>
        <p className="mt-1 text-small text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
