import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Cloud, Copy, Database, Languages, Loader2, LogOut, Share2, ShieldCheck, Users, User } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportToDhis2, getFamiliesCacheMeta, getLastSyncAt, getSyncQueueCounts, syncQueue } from "@/lib/territory";
import { logout } from "@/lib/session";
import { useAgentSession } from "@/lib/useAgentSession";

export const Route = createFileRoute("/perfil/")({
  head: () => {
    const t = "Perfil e sincronização — RoteACS";
    const d = "Dados do agente, registros aguardando envio, exportação DHIS2 e configurações.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t },
      { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: ProfilePage,
});

function formatSync(iso: string | null) {
  if (!iso) return "Nunca";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === new Date().toDateString() ? `Hoje, ${time}` : `${d.toLocaleDateString("pt-BR")}, ${time}`;
}

function storageUsed() {
  let chars = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith("roteacs.") || k.startsWith("roteacs_")) chars += k.length + (localStorage.getItem(k)?.length ?? 0);
  }
  const kb = (chars * 2) / 1024;
  return kb < 1 ? "< 1 KB" : `~${kb.toFixed(1).replace(".", ",")} KB`;
}

function ProfilePage() {
  const navigate = useNavigate();
  const session = useAgentSession();
  const [queue, setQueue] = useState({ pending: 0, synced: 0 });
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "syncing" | "done">("idle");
  const [storage, setStorage] = useState("");
  const [json, setJson] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [familiesCache, setFamiliesCache] = useState({ count: 0, cachedAt: null as string | null });

  const refresh = () => {
    setQueue(getSyncQueueCounts());
    setLastSync(getLastSyncAt());
    setStorage(storageUsed());
    setFamiliesCache(getFamiliesCacheMeta());
  };
  useEffect(refresh, []);

  const sync = async () => {
    setState("syncing");
    await syncQueue();
    refresh();
    setState("done");
  };

  const openExport = async () => {
    setExporting(true);
    setExportError(null);
    setCopied(false);
    try {
      const { payload } = await exportToDhis2();
      setJson(payload);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Não foi possível gerar o export.");
    } finally {
      setExporting(false);
    }
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
          <p className="text-small text-ink-faint">Território: {session.territory ?? "Não informado"}</p>
        </header>

        <section className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Users className="size-6 shrink-0 text-primary" aria-hidden />
            <p className="flex-1 text-body font-semibold text-foreground">Famílias carregadas do banco</p>
            <span className="min-w-8 rounded-full bg-primary px-2 py-1 text-center text-small font-bold text-primary-foreground">{familiesCache.count}</span>
          </div>
          <p className="text-small text-muted-foreground">
            {familiesCache.cachedAt ? `Último cache offline: ${formatSync(familiesCache.cachedAt)}` : "Ainda sem cache offline"}
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <Cloud className="size-6 shrink-0 text-primary" aria-hidden />
            <p className="flex-1 text-body font-semibold text-foreground">Registros aguardando envio</p>
            <span className="min-w-8 rounded-full bg-primary px-2 py-1 text-center text-small font-bold text-primary-foreground">{queue.pending}</span>
          </div>
          <p className="flex items-center gap-2 text-small text-muted-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-risk-low" aria-hidden /> {queue.synced} registros sincronizados
          </p>
          <p className="text-small text-muted-foreground">Última sincronização: {formatSync(lastSync)}</p>
          {state === "done" && queue.pending === 0 ? (
            <p role="status" className="flex h-14 items-center justify-center gap-2 rounded-lg border border-risk-low bg-risk-low/15 text-body font-bold text-risk-low">
              <CheckCircle2 className="size-5" aria-hidden /> Sincronizado
            </p>
          ) : (
            <PrimaryButton arrow={false} onClick={sync} disabled={state === "syncing"}>
              {state === "syncing" ? <><Loader2 className="!size-5 animate-spin" aria-hidden /> Sincronizando…</> : "SINCRONIZAR"}
            </PrimaryButton>
          )}
        </section>

        <button onClick={openExport} disabled={exporting}
          className="flex h-14 items-center justify-center gap-2 rounded-lg border border-border bg-elevated text-body font-semibold text-primary disabled:opacity-40">
          {exporting ? <><Loader2 className="size-5 animate-spin" aria-hidden /> Gerando…</> : <><Share2 className="size-5" aria-hidden /> Exportar para DHIS2</>}
        </button>
        {exportError && (
          <p role="alert" className="flex items-center gap-2 text-small text-risk-high">
            <AlertCircle className="size-4 shrink-0" aria-hidden /> {exportError}
          </p>
        )}

        <Link to="/perfil/dados"
          className="flex h-14 items-center justify-center gap-2 rounded-lg border border-border bg-elevated text-body font-semibold text-primary">
          <Database className="size-5" aria-hidden /> Fontes de dados e transparência da IA
        </Link>

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

        <button
          onClick={async () => { await logout(); navigate({ to: "/login", replace: true }); }}
          className="flex h-14 items-center justify-center gap-2 rounded-lg border border-risk-high/40 bg-risk-high/10 text-body font-semibold text-risk-high"
        >
          <LogOut className="size-5" aria-hidden /> Sair
        </button>
      </div>

      <Dialog open={json !== null} onOpenChange={(o) => !o && setJson(null)}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Exportar para DHIS2</DialogTitle>
            <DialogDescription>Visitas sincronizadas ainda não exportadas. Nada é enviado a um servidor DHIS2 nesta versão.</DialogDescription>
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
