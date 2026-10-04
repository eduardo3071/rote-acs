import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Cloud, Copy, Database, Languages, Loader2, LogOut, MapPin, Share2, ShieldCheck, Users, User } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportToDhis2, getFamiliesCacheMeta, getLastSyncAt, getSyncQueueCounts, notifyFamiliesChanged, syncQueue } from "@/lib/territory";
import { logout, updateTerritory } from "@/lib/session";
import { useAgentSession } from "@/lib/useAgentSession";

/** País → Estado → Município — kept explicit in the UI as the scalability story: swapping
 *  territory is a parameter (an IBGE municipality code), not a rebuild. Only Anapu-PA has real
 *  CNEFE/CNES data loaded in this demo; every other option is shown but marked as not loaded,
 *  so the extensibility claim stays honest instead of implied. */
const UF_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
  ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima",
  SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};
/** Only Anapu has a verified cod_ibge (matches the `acs`/`health_facilities` rows already in
 *  the database). The others are shown disabled, without a fabricated code, to be honest about
 *  what's unconfirmed — IBGE CNEFE and DATASUS CNES do cover every one of these nationally, this
 *  demo just hasn't loaded them (see the "Território" dialog copy below). */
const PA_MUNICIPALITIES: { name: string; codIbge: string | null; loaded: boolean }[] = [
  { name: "Anapu", codIbge: "1500859", loaded: true },
  { name: "Altamira", codIbge: "1500602", loaded: true },
  { name: "Senador José Porfírio", codIbge: null, loaded: false },
  { name: "Vitória do Xingu", codIbge: null, loaded: false },
  { name: "Pacajá", codIbge: null, loaded: false },
];

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
  const [territoryOpen, setTerritoryOpen] = useState(false);
  const [territoryOverride, setTerritoryOverride] = useState<string | null>(null);
  const [uf, setUf] = useState("PA");
  const [municipio, setMunicipio] = useState("Anapu");
  const [savingTerritory, setSavingTerritory] = useState(false);
  const [territoryError, setTerritoryError] = useState<string | null>(null);

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

  const saveTerritory = async () => {
    const found = uf === "PA" ? PA_MUNICIPALITIES.find((m) => m.name === municipio) : null;
    if (!session || !found?.loaded || !found.codIbge) return;
    setSavingTerritory(true);
    setTerritoryError(null);
    const { error } = await updateTerritory(session.acsId, found.name, found.codIbge);
    setSavingTerritory(false);
    if (error) { setTerritoryError(error); return; }
    setTerritoryOverride(`${found.name}, ${uf}`);
    setTerritoryOpen(false);
    // loadRemoteFamilies() re-reads the session (and its cod_ibge) fresh on every call, so this
    // alone is enough to swap the family list — no page reload needed.
    notifyFamiliesChanged();
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
          <button onClick={() => setTerritoryOpen(true)} className="flex items-center gap-1 text-small text-ink-faint underline decoration-dotted">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            Território: {territoryOverride ?? (session.municipio ? `${session.municipio}, PA` : session.territory ?? "Não informado")}
          </button>
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
          <p className="text-label text-ink-faint">
            Visitas registradas sem rede ficam na fila do celular e sobem sozinhas quando a conexão volta —
            é como o app cumpre a regra do desafio de funcionar offline sem perder nenhum registro.
          </p>
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

        <div className="flex flex-col gap-2">
          <button onClick={openExport} disabled={exporting}
            className="flex h-14 items-center justify-center gap-2 rounded-lg border border-border bg-elevated text-body font-semibold text-primary disabled:opacity-40">
            {exporting ? <><Loader2 className="size-5 animate-spin" aria-hidden /> Gerando…</> : <><Share2 className="size-5" aria-hidden /> Exportar para DHIS2</>}
          </button>
          <p className="text-label text-ink-faint">
            DHIS2 é o sistema de informação em saúde usado por ministérios da saúde em mais de 70 países
            (incluído no SUS). Exportar nesse formato é o que torna o RoteACS plugável num sistema de
            saúde que já existe, em vez de criar mais um silo de dados isolado.
          </p>
        </div>
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

      <Dialog open={territoryOpen} onOpenChange={setTerritoryOpen}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Território</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              <span>
                País → Estado → Município. A arquitetura do RoteACS usa o código IBGE do município (coluna
                <code className="mx-1 rounded bg-elevated px-1 py-0.5 text-label">cod_ibge</code>
                nas tabelas <code className="rounded bg-elevated px-1 py-0.5 text-label">acs</code> e
                <code className="mx-1 rounded bg-elevated px-1 py-0.5 text-label">health_facilities</code>)
                como parâmetro — trocar de cidade é um dado novo, não um rebuild do app.
              </span>
              <span>
                IBGE CNEFE e CNES/DATASUS são bases <strong>nacionais e públicas</strong>: existe dado real
                para qualquer município do Brasil, não só Anapu. Esta demo só carregou um (por tempo de
                hackathon, e porque este ambiente de desenvolvimento bloqueia a rede para baixar dados
                externos ao vivo) — por isso os outros municípios aparecem aqui desabilitados, em vez de
                escondidos.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-small text-muted-foreground">País</span>
              <select disabled value="BR"
                className="h-12 rounded-lg border border-border bg-elevated px-4 text-body text-foreground opacity-70">
                <option value="BR">Brasil</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-small text-muted-foreground">Estado</span>
              <select value={uf} onChange={(e) => { setUf(e.target.value); setMunicipio(""); }}
                className="h-12 rounded-lg border border-border bg-card px-4 text-body text-foreground outline-none focus:border-primary">
                {Object.entries(UF_NAMES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-small text-muted-foreground">Município</span>
              {uf === "PA" ? (
                <select value={municipio} onChange={(e) => setMunicipio(e.target.value)}
                  className="h-12 rounded-lg border border-border bg-card px-4 text-body text-foreground outline-none focus:border-primary">
                  {PA_MUNICIPALITIES.map((m) => (
                    <option key={m.name} value={m.name} disabled={!m.loaded}>
                      {m.name}{m.loaded ? "" : " (sem dados carregados)"}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-elevated px-4 py-3 text-small text-muted-foreground">
                  Nenhum município com dados carregados neste estado ainda.
                </p>
              )}
            </label>
          </div>
          {territoryError && (
            <p role="alert" className="flex items-center gap-2 text-small text-risk-high">
              <AlertCircle className="size-4 shrink-0" aria-hidden /> {territoryError}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveTerritory}
              disabled={savingTerritory || !(uf === "PA" && PA_MUNICIPALITIES.find((m) => m.name === municipio)?.loaded)}
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-body font-semibold text-primary-foreground disabled:opacity-40">
              {savingTerritory ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />} Salvar
            </button>
            <button onClick={() => setTerritoryOpen(false)} className="h-12 rounded-lg border border-border bg-elevated text-body font-semibold text-foreground">Fechar</button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
