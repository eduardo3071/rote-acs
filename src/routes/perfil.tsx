import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Cloud, Copy, Database, Languages, Loader2, Share2, ShieldCheck, User } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFamilies, getVisitLog, markAllSynced } from "@/lib/territory";
import { useAgentSession } from "@/lib/useAgentSession";

export const Route = createFileRoute("/perfil")({
  head: () => {
    const t = "Perfil e sincronização — RoteACS";
    const d = "Dados do agente, registros aguardando envio, exportação DHIS2 e configurações.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t },
      { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: ProfilePage,
});

const SYNC_KEY = "roteacs.lastSync";

function formatSync(iso: string | null) {
  if (!iso) return "Ontem, 17:42";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === new Date().toDateString() ? `Hoje, ${time}` : `${d.toLocaleDateString("pt-BR")}, ${time}`;
}

function storageUsed() {
  let chars = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith("roteacs.")) chars += k.length + (localStorage.getItem(k)?.length ?? 0);
  }
  const kb = (chars * 2) / 1024;
  return kb < 1 ? "< 1 KB" : `~${kb.toFixed(1).replace(".", ",")} KB`;
}

function ProfilePage() {
  const session = useAgentSession();
  const [pending, setPending] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "syncing" | "done">("idle");
  const [storage, setStorage] = useState("");
  const [json, setJson] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = () => {
    setPending(getVisitLog().filter((r) => !r.synced).length);
    setLastSync(localStorage.getItem(SYNC_KEY));
    setStorage(storageUsed());
  };
  useEffect(refresh, []);

  const sync = () => {
    setState("syncing");
    setTimeout(() => {
      markAllSynced();
      localStorage.setItem(SYNC_KEY, new Date().toISOString());
      refresh();
      setState("done");
    }, 2000);
  };

  const openExport = () => {
    const visits = getVisitLog();
    const families = getFamilies();
    const payload = {
      source: "RoteACS",
      agent: session ? { name: session.name, code: session.agentCode } : null,
      exportedAt: new Date().toISOString(),
      events: visits.map((v) => {
        const f = families.find((x) => x.id === v.familyId);
        return { familyId: v.familyId, familyName: f?.name, visitedAt: v.at, diarrheaOrFever: v.symptoms,
          waterSource: v.waterSource, childrenUnder5: v.childrenUnder5, riskScore: f?.riskScore };
      }),
    };
    setCopied(false);
    setJson(JSON.stringify(payload, null, 2));
  };

  const copy = async () => {
    if (!json) return;
    try { await navigator.clipboard.writeText(json); setCopied(true); } catch { setCopied(false); }
  };

  if (!session) return <div className="field-surface min-h-screen" />;

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-24 pt-8 animate-rise-in">
        <header className="flex flex-col items-center gap-2 text-center">
          <span className="grid size-20 place-items-center rounded-full border border-border bg-elevated text-primary">
            <User className="size-10" aria-hidden />
          </span>
          <h1 className="text-title font-bold text-foreground">{session.name}</h1>
          <p className="text-body text-muted-foreground">Agente Comunitário de Saúde</p>
          <p className="text-small text-ink-faint">Território: Comunidade Wanjiku · Kenya</p>
        </header>

        <section className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Cloud className="size-6 shrink-0 text-primary" aria-hidden />
            <p className="flex-1 text-body font-semibold text-foreground">Registros aguardando envio</p>
            <span className="min-w-8 rounded-full bg-primary px-2 py-1 text-center text-small font-bold text-primary-foreground">{pending}</span>
          </div>
          <p className="text-small text-muted-foreground">Última sincronização: {formatSync(lastSync)}</p>
          {state === "done" ? (
            <p role="status" className="flex h-14 items-center justify-center gap-2 rounded-lg border border-risk-low bg-risk-low/15 text-body font-bold text-risk-low">
              <CheckCircle2 className="size-5" aria-hidden /> Sincronizado
            </p>
          ) : (
            <PrimaryButton arrow={false} onClick={sync} disabled={state === "syncing"}>
              {state === "syncing" ? <><Loader2 className="!size-5 animate-spin" aria-hidden /> Sincronizando…</> : "SINCRONIZAR"}
            </PrimaryButton>
          )}
        </section>

        <button onClick={openExport}
          className="flex h-14 items-center justify-center gap-2 rounded-lg border border-border bg-elevated text-body font-semibold text-primary">
          <Share2 className="size-5" aria-hidden /> Exportar para DHIS2
        </button>

        <section className="flex flex-col gap-2">
          <h2 className="label-caps text-muted-foreground">Configurações</h2>
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {[
              { icon: Languages, label: "Idioma", value: "Swahili" },
              { icon: Database, label: "Armazenamento", value: storage },
              { icon: ShieldCheck, label: "Privacidade", value: "Dados no dispositivo" },
            ].map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-4 p-4">
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="flex-1 text-body text-foreground">{label}</span>
                <span className="text-small text-muted-foreground">{value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Dialog open={json !== null} onOpenChange={(o) => !o && setJson(null)}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Exportar para DHIS2</DialogTitle>
            <DialogDescription>Registros locais. Nada é enviado nesta versão.</DialogDescription>
          </DialogHeader>
          <pre className="max-h-72 overflow-auto rounded-sm border border-border bg-background p-2 text-label text-foreground">{json}</pre>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={copy} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-body font-semibold text-primary-foreground">
              {copied ? <CheckCircle2 className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />} {copied ? "Copiado" : "Copiar"}
            </button>
            <button onClick={() => setJson(null)} className="h-12 rounded-lg border border-border bg-elevated text-body font-semibold text-foreground">Fechar</button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
