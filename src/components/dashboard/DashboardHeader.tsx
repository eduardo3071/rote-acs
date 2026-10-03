import { Bell, LogOut, WifiOff } from "lucide-react";
import type { AgentSession } from "@/lib/session";

function greeting(h: number) {
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export function DashboardHeader({
  session, hasAlerts, syncedAt, onLogout,
}: { session: AgentSession; hasAlerts: boolean; syncedAt: Date; onLogout: () => void }) {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const time = syncedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const firstName = session.name.split(" ")[0];

  return (
    <header className="flex flex-col gap-4 animate-rise-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-primary/15 text-small font-bold text-primary">
            {firstName.charAt(0).toUpperCase()}
          </span>
          <span className="truncate text-small text-muted-foreground">
            {session.agentCode} · <span className="capitalize">{date}</span>
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          <button aria-label="Notificações" className="relative grid size-10 place-items-center rounded-lg border border-border bg-card text-foreground transition-colors active:bg-elevated">
            <Bell className="size-5" />
            {hasAlerts && <span className="absolute right-2 top-2 size-2 rounded-pill bg-risk-high ring-2 ring-card" />}
          </button>
          <button aria-label="Sair" onClick={onLogout} className="grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors active:bg-elevated">
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
      <div>
        <h1 className="text-title font-bold text-foreground">{greeting(now.getHours())}, {firstName}</h1>
        <p className="mt-1 flex items-center gap-2 text-small text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-pill bg-risk-low/15 px-2 py-1 text-label font-semibold text-risk-low">
            <WifiOff className="size-3" aria-hidden /> Funcionando offline
          </span>
          Sincronizado às {time}
        </p>
      </div>
    </header>
  );
}
