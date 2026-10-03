import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Navigation, Phone, Search } from "lucide-react";
import { RiskBadge, riskLabels, riskLevel } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Panel, PanelMeta, PanelTitle } from "@/components/ui/panel";
import { Chip, LabelCaps } from "@/components/labels";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "RoteACS — Sistema de Design" },
      {
        name: "description",
        content:
          "Base visual do RoteACS: paleta de alto contraste para uso em campo, escala tipográfica Inter e componentes base, incluindo o RiskBadge.",
      },
      { property: "og:title", content: "RoteACS — Sistema de Design" },
      {
        property: "og:description",
        content:
          "Paleta escura de alto contraste, tipografia Inter e componentes base para o roteamento de agentes comunitários de saúde.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignSystemScreen,
});

const surfaces = [
  { name: "background", hex: "#0A0F1E", cls: "bg-background", role: "Fundo do app" },
  { name: "card", hex: "#111827", cls: "bg-card", role: "Cards" },
  { name: "elevated", hex: "#1C2537", cls: "bg-elevated", role: "Elementos elevados" },
  { name: "border", hex: "#1E2D45", cls: "bg-border", role: "Bordas e divisores" },
];

const actions = [
  { name: "primary", hex: "#16A8FF", cls: "bg-primary", role: "Ação principal" },
  { name: "primary-dark", hex: "#0877D1", cls: "bg-primary-dark", role: "Pressionado / foco" },
];

const risks = [
  { name: "risk-high", hex: "#FF5263", cls: "bg-risk-high", role: "70–100 · alto" },
  { name: "risk-medium", hex: "#FFC83D", cls: "bg-risk-medium", role: "40–69 · médio" },
  { name: "risk-low", hex: "#19D98B", cls: "bg-risk-low", role: "0–39 · baixo" },
];

const inks = [
  { name: "ink", hex: "#F0F4FF", cls: "bg-ink", role: "Texto principal" },
  { name: "ink-soft", hex: "#7B92B2", cls: "bg-ink-soft", role: "Texto secundário" },
  { name: "ink-faint", hex: "#3D5170", cls: "bg-ink-faint", role: "Texto mudo" },
];

const typeScale = [
  { token: "display", cls: "text-display", spec: "28 / bold", sample: "Roteiro de hoje" },
  { token: "title", cls: "text-title", spec: "22 / bold", sample: "Microárea 07 — Centro" },
  { token: "subtitle", cls: "text-subtitle", spec: "18 / semibold", sample: "12 famílias pendentes" },
  { token: "body", cls: "text-body", spec: "15 / regular", sample: "Dona Marlene falta à consulta desde março." },
  { token: "small", cls: "text-small", spec: "13 / regular", sample: "Última visita há 34 dias" },
  { token: "label", cls: "text-label uppercase", spec: "11 / semibold", sample: "Roteiro · terça" },
];

const spacing = [
  { token: "4", cls: "w-1" },
  { token: "8", cls: "w-2" },
  { token: "16", cls: "w-4" },
  { token: "24", cls: "w-6" },
  { token: "32", cls: "w-8" },
];

const radii = [
  { token: "8", cls: "rounded-sm" },
  { token: "12", cls: "rounded-md" },
  { token: "16", cls: "rounded-lg" },
  { token: "100", cls: "rounded-pill" },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <LabelCaps>{title}</LabelCaps>
        {hint ? <p className="text-small text-ink-faint">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex, cls, role }: (typeof surfaces)[number]) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "h-14 rounded-md border border-border shadow-card",
          cls,
          name === "background" && "border-ink-faint/50",
        )}
      />
      <div className="flex flex-col">
        <span className="text-small text-ink">{name}</span>
        <span className="text-small text-ink-faint">{hex}</span>
        <span className="text-small text-ink-faint">{role}</span>
      </div>
    </div>
  );
}

function DesignSystemScreen() {
  const checks = [87, 55, 23];

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-8 px-4 pt-8 pb-16">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground shadow-primary">
                <Navigation className="size-5" strokeWidth={2.4} />
              </div>
              <div className="flex flex-col">
                <span className="text-title text-ink">RoteACS</span>
                <span className="text-small text-ink-soft">
                  Roteamento de Agentes Comunitários de Saúde
                </span>
              </div>
            </div>
            <Chip>Fase 1</Chip>
          </div>
          <p className="text-body text-ink-soft">
            Sistema de design para uso em campo: sol forte, tela barata, luva na mão. Tudo aqui foi
            medido para ler de relance, mesmo no meio da rua.
          </p>
        </header>

        <Section
          title="RiskBadge"
          hint="Círculo 52×52, borda 2px, fundo 13%. A cor vem da pontuação: 70+ vermelho, 40–69 amarelo, abaixo de 40 verde."
        >
          <Panel>
            <div className="flex items-center justify-between gap-3">
              {checks.map((score) => (
                <div key={score} className="flex flex-col items-center gap-2">
                  <RiskBadge score={score} />
                  <span
                    className={cn(
                      "text-small",
                      riskLevel(score) === "high" && "text-risk-high",
                      riskLevel(score) === "medium" && "text-risk-medium",
                      riskLevel(score) === "low" && "text-risk-low",
                    )}
                  >
                    {riskLabels[riskLevel(score)]}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </Section>

        <Section title="Superfícies" hint="Do fundo ao card elevado, a diferença é discreta o bastante para não cansar.">
          <div className="grid grid-cols-2 gap-3">
            {surfaces.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
        </Section>

        <Section title="Ação" hint="O azul ciano é a única cor de comando. Nada clicável aparece sem ela.">
          <div className="grid grid-cols-2 gap-3">
            {actions.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button>
              <Navigation className="size-4" />
              Iniciar roteiro
            </Button>
            <Button variant="secondary">
              <Phone className="size-4" />
              Ligar
            </Button>
            <Button variant="outline">
              <Search className="size-4" />
              Buscar
            </Button>
            <Button variant="ghost">Depois</Button>
          </div>
        </Section>

        <Section title="Risco" hint="As três cores de risco nunca aparecem juntas num mesmo número: um dado, uma leitura.">
          <div className="grid grid-cols-3 gap-3">
            {risks.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
          <div className="grid gap-2">
            <Panel tone="high" pad="sm">
              <div className="flex items-center gap-3">
                <RiskBadge score={87} />
                <div className="flex flex-col">
                  <PanelTitle>Dona Marlene A.</PanelTitle>
                  <PanelMeta>Falta à consulta desde março · visita hoje</PanelMeta>
                </div>
              </div>
            </Panel>
            <Panel tone="medium" pad="sm">
              <div className="flex items-center gap-3">
                <RiskBadge score={55} />
                <div className="flex flex-col">
                  <PanelTitle>Sr. Jorge M.</PanelTitle>
                  <PanelMeta>Pressão alta oscilando · revisar em 15 dias</PanelMeta>
                </div>
              </div>
            </Panel>
            <Panel tone="low" pad="sm">
              <div className="flex items-center gap-3">
                <RiskBadge score={23} />
                <div className="flex flex-col">
                  <PanelTitle>Ana Beatriz C.</PanelTitle>
                  <PanelMeta>Caderneta em dia · retorno em 2 meses</PanelMeta>
                </div>
              </div>
            </Panel>
          </div>
        </Section>

        <Section title="Texto" hint="Três níveis bastam. Se algo não cabe em um deles, provavelmente não precisa aparecer.">
          <div className="grid grid-cols-3 gap-3">
            {inks.map((s) => (
              <Swatch key={s.name} {...s} />
            ))}
          </div>
        </Section>

        <Section title="Tipografia" hint="Inter, sempre. Os pesos carregam a hierarquia — não o tamanho puro.">
          <Panel tone="raised" pad="lg">
            <div className="flex flex-col gap-4">
              {typeScale.map((t) => (
                <div key={t.token} className="flex flex-col gap-1">
                  <span className="label-caps">{t.token}</span>
                  <p className={cn(t.cls, "text-ink")}>{t.sample}</p>
                  <span className="text-small text-ink-faint">{t.spec}</span>
                </div>
              ))}
            </div>
          </Panel>
        </Section>

        <Section title="Espaçamento" hint="Só cinco medidas: 4, 8, 16, 24 e 32. Tudo se resolve entre elas.">
          <Panel>
            <div className="flex items-end gap-4">
              {spacing.map((s) => (
                <div key={s.token} className="flex flex-col items-center gap-2">
                  <div className={cn("h-8 rounded-sm bg-primary/70", s.cls)} />
                  <span className="text-small text-ink-soft">{s.token}</span>
                </div>
              ))}
            </div>
          </Panel>
        </Section>

        <Section title="Bordas" hint="8 para controles, 12 para cards, 16 para painéis, pill para etiquetas.">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              {radii.map((r) => (
                <div key={r.token} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "size-12 border border-primary/50 bg-primary/13",
                      r.cls,
                    )}
                  />
                  <span className="text-small text-ink-soft">{r.token}</span>
                </div>
              ))}
            </div>
          </Panel>
        </Section>

        <Section title="Em uso" hint="Uma tela de roteiro montada só com as peças acima.">
          <Panel pad="none" className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-elevated px-4 py-3">
              <MapPin className="size-4 text-primary" />
              <span className="text-body text-ink">Microárea 07 — Centro</span>
              <span className="ml-auto text-small text-ink-faint">12 paradas</span>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {[
                { n: "Dona Marlene A.", s: 87, meta: "Falta à consulta desde março" },
                { n: "Sr. Jorge M.", s: 55, meta: "Pressão alta oscilando" },
                { n: "Ana Beatriz C.", s: 23, meta: "Caderneta em dia" },
              ].map((row) => (
                <div key={row.n} className="flex items-center gap-3 px-4 py-3">
                  <RiskBadge score={row.s} />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-body text-ink">{row.n}</span>
                    <span className="text-small text-ink-soft">{row.meta}</span>
                  </div>
                  <span className="label-caps ml-auto shrink-0">
                    {riskLabels[riskLevel(row.s)]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-border bg-card p-4">
              <Button block>
                <Navigation className="size-4" />
                Roteiro do dia
              </Button>
              <Button variant="secondary" size="md">
                <Phone className="size-4" />
              </Button>
            </div>
          </Panel>
        </Section>
      </div>
    </div>
  );
}
