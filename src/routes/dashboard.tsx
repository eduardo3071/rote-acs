import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLogoInline } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { getSession, logout, type AgentSession } from "@/lib/session";
import { getRiskSummary } from "@/data/families";

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
  component: DashboardPlaceholder,
});

/** Temporary landing until the FASE 4 dashboard replaces this file. */
function DashboardPlaceholder() {
  const navigate = useNavigate({ from: "/dashboard" });
  const [session, setSession] = useState<AgentSession | null>(null);
  const summary = getRiskSummary();

  useEffect(() => {
    const s = getSession();
    if (!s) navigate({ to: "/login", replace: true });
    else setSession(s);
  }, [navigate]);

  if (!session) return <div className="field-surface min-h-screen" />;

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <AppLogoInline />
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate({ to: "/login", replace: true }); }}>
            Sair
          </Button>
        </div>
        <div>
          <h1 className="text-title font-bold text-foreground">Olá, {session.name}</h1>
          <p className="mt-1 text-body text-muted-foreground">
            {session.agentCode} · {summary.total} famílias no território
          </p>
        </div>
        <p className="rounded-xl border border-border bg-card p-4 text-small text-muted-foreground">
          O painel completo chega na próxima fase.
        </p>
      </div>
    </div>
  );
}
