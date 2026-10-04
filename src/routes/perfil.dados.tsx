import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Database, Mic, ShieldCheck } from "lucide-react";
import { useAgentSession } from "@/lib/useAgentSession";

export const Route = createFileRoute("/perfil/dados")({
  head: () => {
    const t = "Fontes de dados e transparência da IA — RoteACS";
    const d = "De onde vêm os dados do RoteACS, como a IA funciona e o que ela não faz.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t },
      { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: DataSourcesPage,
});

interface DatasetRow {
  name: string;
  source: string;
  license: string;
  covers: string;
  doesNotCover: string;
}

const DATASETS: DatasetRow[] = [
  {
    name: "Coordenadas de domicílios",
    source: "IBGE CNEFE 2022 — equivalente brasileiro ao WorldPop/OpenStreetMap sugeridos no Annex A (seção 7.3-C) para base geográfica",
    license: "Domínio público",
    covers: "Latitude/longitude reais de 50 domicílios em Anapu, PA (código IBGE 1500859).",
    doesNotCover: "Não está ligado a moradores reais — nomes de família e histórico clínico nessas coordenadas são fictícios, criados só para a demonstração.",
  },
  {
    name: "Unidades de saúde (UBS)",
    source: "CNES/DATASUS 2024 — equivalente brasileiro ao healthsites.io e ao Service Delivery Indicators sugeridos no Annex A para registro de unidades de saúde",
    license: "Dado público",
    covers: "2 UBS reais de Anapu-PA (ESF Dinora Terezinha, ESF Vila Nova Canaã) — nome e tipo verdadeiros.",
    doesNotCover: "Coordenadas aproximadas ao centro do município, não ao endereço exato — a consulta geográfica do CNES ficou bloqueada na rede de desenvolvimento.",
  },
  {
    name: "Interoperabilidade de dados (exportação)",
    source: "DHIS2 — citado nominalmente no Annex A como \"o sistema que seu registro mais plausivelmente alimentaria\"",
    license: "Software livre (BSD-3), padrão aberto de dados",
    covers: "Exportação das visitas sincronizadas no formato de evento compatível com DHIS2, o sistema de informação em saúde usado por ministérios da saúde em mais de 70 países, incluindo o SUS no Brasil.",
    doesNotCover: "Esta demo gera o JSON compatível para o agente copiar/baixar; não envia para uma instância real de DHIS2 — a integração direta por API fica para uma próxima etapa.",
  },
  {
    name: "Sinais de alerta clínico",
    source: "IMCI / OMS (Integrated Management of Childhood Illness)",
    license: "Domínio público",
    covers: "Os 3 sinais de desidratação (olhos fundos, boca seca, letargia incomum) e o sintoma respiratório perguntados na visita, e o reforço de +25 pontos no RiskScore quando presentes.",
    doesNotCover: "Não é um modelo de diagnóstico — o IMCI só define quais perguntas são feitas; o app nunca emite um diagnóstico, só um alerta de encaminhamento para o agente avaliar.",
  },
  {
    name: "Reconhecimento de voz em português",
    source: "Vosk (vosk-model-small-pt-0.3, ~31 MB) rodando on-device via WebAssembly",
    license: "Apache 2.0 (modelo) — sem dependência de servidor para transcrever",
    covers: "Frases curtas de vocabulário fechado (sim/não, nomes de fonte de água, números de 0 a 10, palavras-chave de sintomas, motivo da visita) em português, incluindo o Modo Conversa (app fala a pergunta, agente responde por voz). Modelo baixado uma vez e guardado no celular — depois disso, funciona sem internet.",
    doesNotCover: "Acurácia em sotaques regionais ainda não foi medida, e o funcionamento em um celular Android real ainda não foi validado fora do ambiente de desenvolvimento. Se o modelo não carregar (ex.: sem rede no primeiro uso), o app cai automaticamente para a Web Speech API do navegador, que aí sim depende de rede — nunca quebra a demonstração, mas deixa de ser on-device nesse caso de exceção.",
  },
  {
    name: "Identidade de famílias e histórico de visitas",
    source: "Dados sintéticos gerados para esta demonstração",
    license: "—",
    covers: "Sobrenomes paraenses plausíveis e padrões de sintoma/visita realistas para a narrativa de demonstração.",
    doesNotCover: "Não representa pacientes reais nem eventos clínicos reais de nenhuma forma.",
  },
];

function DataCard({ row }: { row: DatasetRow }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-body font-bold text-foreground">{row.name}</h3>
        <span className="rounded-pill border border-border bg-elevated px-2 py-0.5 text-label font-semibold text-muted-foreground">{row.license}</span>
      </div>
      <p className="text-small text-primary">{row.source}</p>
      <div className="flex flex-col gap-1">
        <p className="label-caps text-risk-low">Cobre</p>
        <p className="text-small text-foreground">{row.covers}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="label-caps text-risk-high">Não cobre</p>
        <p className="text-small text-foreground">{row.doesNotCover}</p>
      </div>
    </div>
  );
}

function DataSourcesPage() {
  const session = useAgentSession();
  if (!session) return <div className="field-surface min-h-screen" />;

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-16 pt-6 animate-rise-in">
        <Link to="/perfil" className="flex items-center gap-2 text-body text-primary">
          <ArrowLeft className="size-5" aria-hidden /> Perfil
        </Link>

        <header className="flex flex-col gap-2">
          <span className="grid size-12 place-items-center rounded-lg bg-primary/15 text-primary">
            <Database className="size-6" aria-hidden />
          </span>
          <h1 className="text-title font-bold text-foreground">Fontes de dados e transparência da IA</h1>
          <p className="text-small text-muted-foreground">De onde vêm os dados do RoteACS, o que a IA faz e o que ela não faz.</p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="label-caps text-muted-foreground">Datasets usados</h2>
          {DATASETS.map((row) => <DataCard key={row.name} row={row} />)}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-body font-bold text-foreground">
            <Mic className="size-5 text-primary" aria-hidden /> Como a IA funciona aqui
          </h2>
          <p className="text-small text-foreground">
            O RiskScore é uma fórmula explicável (dias desde a última visita, sintomas, crianças pequenas,
            vacinação, risco de cluster) — não é uma caixa-preta e não usa IA. O componente de IA é o
            reconhecimento de voz: um modelo pequeno (Vosk) rodando no próprio celular, com vocabulário
            fechado por pergunta (ex.: "sim"/"não", nomes de fonte de água, números), o que torna o
            reconhecimento um problema de pattern recognition bem definido, não transcrição livre.
          </p>
          <p className="text-small text-foreground">
            No "Modo Conversa" (registro de visita), o app faz cada pergunta em voz alta e escuta a
            resposta, avançando sozinho — sem precisar tocar na tela entre perguntas. Se uma resposta não
            for entendida duas vezes seguidas, o app pausa naquela pergunta e devolve o controle para os
            botões de toque, que sempre continuam disponíveis.
          </p>
          <p className="text-small text-muted-foreground">
            A voz é sempre opcional — toda pergunta também tem botões de toque, para nunca excluir quem não
            pode ou não quer falar.
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-4">
          <h2 className="flex items-center gap-2 text-body font-bold text-foreground">
            <ShieldCheck className="size-5 text-risk-medium" aria-hidden /> Limites e responsabilidade
          </h2>
          <ul className="flex flex-col gap-2 text-small text-foreground">
            <li>• RiskScore é prioridade de visita, nunca diagnóstico — aviso explícito na tela da família.</li>
            <li>• Toda resposta por voz aparece na tela de confirmação antes de ser salva — o agente sempre decide.</li>
            <li>• Sinais de desidratação disparam um alerta de encaminhamento — o app nunca tenta resolver um caso grave sozinho.</li>
            <li>• Dados de cada família ficam restritos ao próprio agente no banco (Row Level Security).</li>
            <li>• O cache local no celular não é criptografado — limitação conhecida, declarada aqui, não escondida.</li>
            <li>• Com o modelo Vosk, o áudio é processado no celular e descartado na hora — nada é gravado ou enviado a servidor. Só no modo de reserva (Web Speech API, quando o Vosk não carrega) o áudio sai do aparelho para o serviço de transcrição do navegador.</li>
          </ul>
        </section>

        <p className="flex items-start gap-2 rounded-lg border border-border bg-elevated p-4 text-label text-muted-foreground">
          <AlertTriangle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Esta tela existe para que qualquer pessoa avaliando o RoteACS veja as fontes de dados e os
          limites da IA sem precisar ler o código-fonte.
        </p>
      </div>
    </div>
  );
}
