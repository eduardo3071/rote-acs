import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Database, Mic, ShieldCheck } from "lucide-react";
import { useAgentSession } from "@/lib/useAgentSession";
import { useLocale } from "@/lib/i18n";

export const Route = createFileRoute("/perfil/dados")({
  head: () => ({ meta: [
    { title: "RoteACS — Data sources and AI transparency" },
    { name: "description", content: "RoteACS data sources, AI operation and declared limitations." },
    { property: "og:title", content: "RoteACS — Data sources and AI transparency" },
    { property: "og:description", content: "RoteACS data sources, AI operation and declared limitations." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: DataSourcesPage,
});

type Copy = {
  back: string; title: string; intro: string; datasets: string; covers: string; notCovers: string;
  aiTitle: string; ai1: string; ai2: string; ai3: string; limits: string; limitItems: string[]; note: string;
  rows: { name: string; source: string; license: string; covers: string; doesNotCover: string }[];
};

const COPY: Record<"pt-BR" | "en" | "es", Copy> = {
  "pt-BR": {
    back: "Perfil", title: "Fontes de dados e transparência da IA", intro: "De onde vêm os dados do RoteACS, o que a IA faz e o que ela não faz.", datasets: "Dados usados", covers: "Cobre", notCovers: "Não cobre",
    aiTitle: "Como a IA funciona aqui", ai1: "O RiskScore é uma fórmula explicável baseada em visitas, sintomas, crianças pequenas, vacinação e risco de proximidade. Não é uma caixa-preta e não usa IA.", ai2: "A IA é usada no reconhecimento de voz: um modelo Vosk pequeno roda no celular com vocabulário fechado para cada pergunta.", ai3: "A voz é opcional. Todas as perguntas também possuem controles de toque.", limits: "Limites e responsabilidade",
    limitItems: ["RiskScore indica prioridade de visita, nunca diagnóstico.", "Toda resposta por voz aparece para confirmação antes de ser salva.", "Sinais de desidratação geram alerta de encaminhamento urgente.", "Os dados de cada família são restritos ao próprio agente.", "O cache local do celular não é criptografado.", "Com Vosk, o áudio é processado no aparelho e descartado; o modo reserva do navegador pode depender da internet."],
    note: "Esta página permite conferir as fontes de dados e os limites da IA sem consultar o código.",
    rows: [
      { name: "Coordenadas de domicílios", source: "IBGE CNEFE 2022", license: "Domínio público", covers: "Coordenadas reais de domicílios em Anapu e Altamira, PA.", doesNotCover: "Nomes e históricos familiares são fictícios e existem apenas para demonstração." },
      { name: "Unidades de saúde", source: "CNES/DATASUS 2024", license: "Dado público", covers: "UBS reais dos territórios carregados, com nome, tipo e código CNES.", doesNotCover: "Não representa vínculo clínico com as famílias fictícias." },
      { name: "Interoperabilidade", source: "DHIS2", license: "Padrão aberto", covers: "Exportação das visitas sincronizadas em formato de evento compatível.", doesNotCover: "Esta versão não envia dados para uma instância real do DHIS2." },
      { name: "Sinais de alerta clínico", source: "IMCI / OMS", license: "Domínio público", covers: "Perguntas sobre desidratação e sintomas respiratórios.", doesNotCover: "Não diagnostica; apenas sinaliza prioridade e encaminhamento." },
      { name: "Reconhecimento de voz", source: "Vosk on-device", license: "Apache 2.0", covers: "Respostas curtas em português processadas no aparelho e disponíveis offline após o primeiro download.", doesNotCover: "A precisão em sotaques regionais ainda não foi validada em campo." },
      { name: "Famílias e visitas", source: "Dados sintéticos", license: "—", covers: "Cenários plausíveis para demonstração.", doesNotCover: "Não representa pessoas nem eventos clínicos reais." },
    ],
  },
  en: {
    back: "Profile", title: "Data sources and AI transparency", intro: "Where RoteACS data comes from, what AI does, and what it does not do.", datasets: "Data used", covers: "Covers", notCovers: "Does not cover",
    aiTitle: "How AI works here", ai1: "RiskScore is an explainable formula based on visits, symptoms, young children, vaccination and proximity risk. It is not a black box and does not use AI.", ai2: "AI is used for voice recognition: a small Vosk model runs on the phone with a closed vocabulary for each question.", ai3: "Voice is optional. Every question also has touch controls.", limits: "Limits and responsibility",
    limitItems: ["RiskScore shows visit priority, never a diagnosis.", "Every voice answer is shown for confirmation before saving.", "Dehydration signs trigger an urgent referral alert.", "Each family's data is restricted to its assigned health worker.", "The phone's local cache is not encrypted.", "With Vosk, audio is processed and discarded on-device; the browser fallback may require internet."],
    note: "This page lets anyone review the data sources and AI limits without reading the code.",
    rows: [
      { name: "Household coordinates", source: "IBGE CNEFE 2022", license: "Public domain", covers: "Real household coordinates in Anapu and Altamira, Pará.", doesNotCover: "Family names and histories are fictional and used only for demonstration." },
      { name: "Health facilities", source: "CNES/DATASUS 2024", license: "Public data", covers: "Real clinics in loaded territories, with name, type and CNES code.", doesNotCover: "It does not represent clinical links to fictional families." },
      { name: "Interoperability", source: "DHIS2", license: "Open standard", covers: "Exports synced visits in a compatible event format.", doesNotCover: "This version does not send data to a live DHIS2 instance." },
      { name: "Clinical warning signs", source: "IMCI / WHO", license: "Public domain", covers: "Questions about dehydration and respiratory symptoms.", doesNotCover: "It does not diagnose; it only indicates priority and referral." },
      { name: "Voice recognition", source: "On-device Vosk", license: "Apache 2.0", covers: "Short Portuguese answers processed on the phone and available offline after the first download.", doesNotCover: "Accuracy across regional accents has not yet been field-tested." },
      { name: "Families and visits", source: "Synthetic data", license: "—", covers: "Plausible demonstration scenarios.", doesNotCover: "It does not represent real people or clinical events." },
    ],
  },
  es: {
    back: "Perfil", title: "Fuentes de datos y transparencia de la IA", intro: "De dónde vienen los datos de RoteACS, qué hace la IA y qué no hace.", datasets: "Datos usados", covers: "Cubre", notCovers: "No cubre",
    aiTitle: "Cómo funciona la IA aquí", ai1: "RiskScore es una fórmula explicable basada en visitas, síntomas, niños pequeños, vacunación y riesgo de proximidad. No es una caja negra y no usa IA.", ai2: "La IA se usa para reconocer voz: un modelo Vosk pequeño funciona en el teléfono con vocabulario cerrado para cada pregunta.", ai3: "La voz es opcional. Todas las preguntas también tienen controles táctiles.", limits: "Límites y responsabilidad",
    limitItems: ["RiskScore indica prioridad de visita, nunca un diagnóstico.", "Cada respuesta de voz se muestra para confirmación antes de guardarse.", "Los signos de deshidratación generan una alerta de derivación urgente.", "Los datos de cada familia están restringidos a su agente asignado.", "La caché local del teléfono no está cifrada.", "Con Vosk, el audio se procesa y descarta en el dispositivo; el modo de reserva del navegador puede necesitar internet."],
    note: "Esta página permite revisar las fuentes de datos y los límites de la IA sin leer el código.",
    rows: [
      { name: "Coordenadas de domicilios", source: "IBGE CNEFE 2022", license: "Dominio público", covers: "Coordenadas reales de domicilios en Anapu y Altamira, Pará.", doesNotCover: "Los nombres e historiales familiares son ficticios y solo se usan para la demostración." },
      { name: "Centros de salud", source: "CNES/DATASUS 2024", license: "Dato público", covers: "Centros reales de los territorios cargados, con nombre, tipo y código CNES.", doesNotCover: "No representa vínculos clínicos con las familias ficticias." },
      { name: "Interoperabilidad", source: "DHIS2", license: "Estándar abierto", covers: "Exporta visitas sincronizadas en un formato de evento compatible.", doesNotCover: "Esta versión no envía datos a una instancia real de DHIS2." },
      { name: "Signos clínicos de alerta", source: "AIEPI / OMS", license: "Dominio público", covers: "Preguntas sobre deshidratación y síntomas respiratorios.", doesNotCover: "No diagnostica; solo indica prioridad y derivación." },
      { name: "Reconocimiento de voz", source: "Vosk en el dispositivo", license: "Apache 2.0", covers: "Respuestas cortas en portugués procesadas en el teléfono y disponibles sin conexión después de la primera descarga.", doesNotCover: "La precisión con acentos regionales aún no se ha probado en campo." },
      { name: "Familias y visitas", source: "Datos sintéticos", license: "—", covers: "Escenarios plausibles para demostración.", doesNotCover: "No representa personas ni eventos clínicos reales." },
    ],
  },
};

function DataCard({ row, copy }: { row: Copy["rows"][number]; copy: Copy }) {
  return <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-body font-bold text-foreground">{row.name}</h3><span className="rounded-pill border border-border bg-elevated px-2 py-0.5 text-label font-semibold text-muted-foreground">{row.license}</span></div>
    <p className="text-small text-primary">{row.source}</p>
    <div className="flex flex-col gap-1"><p className="label-caps text-risk-low">{copy.covers}</p><p className="text-small text-foreground">{row.covers}</p></div>
    <div className="flex flex-col gap-1"><p className="label-caps text-risk-high">{copy.notCovers}</p><p className="text-small text-foreground">{row.doesNotCover}</p></div>
  </div>;
}

function DataSourcesPage() {
  const session = useAgentSession();
  const copy = COPY[useLocale()];
  if (!session) return <div className="field-surface min-h-screen" />;
  return <div className="field-surface min-h-screen"><div className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-16 pt-6 animate-rise-in">
    <Link to="/perfil" className="flex items-center gap-2 text-body text-primary"><ArrowLeft className="size-5" aria-hidden /> {copy.back}</Link>
    <header className="flex flex-col gap-2"><span className="grid size-12 place-items-center rounded-lg bg-primary/15 text-primary"><Database className="size-6" aria-hidden /></span><h1 className="text-title font-bold text-foreground">{copy.title}</h1><p className="text-small text-muted-foreground">{copy.intro}</p></header>
    <section className="flex flex-col gap-3"><h2 className="label-caps text-muted-foreground">{copy.datasets}</h2>{copy.rows.map((row) => <DataCard key={row.name} row={row} copy={copy} />)}</section>
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"><h2 className="flex items-center gap-2 text-body font-bold text-foreground"><Mic className="size-5 text-primary" aria-hidden /> {copy.aiTitle}</h2><p className="text-small text-foreground">{copy.ai1}</p><p className="text-small text-foreground">{copy.ai2}</p><p className="text-small text-muted-foreground">{copy.ai3}</p></section>
    <section className="flex flex-col gap-3 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-4"><h2 className="flex items-center gap-2 text-body font-bold text-foreground"><ShieldCheck className="size-5 text-risk-medium" aria-hidden /> {copy.limits}</h2><ul className="flex flex-col gap-2 text-small text-foreground">{copy.limitItems.map((item) => <li key={item}>• {item}</li>)}</ul></section>
    <p className="flex items-start gap-2 rounded-lg border border-border bg-elevated p-4 text-label text-muted-foreground"><AlertTriangle className="size-4 shrink-0 text-muted-foreground" aria-hidden />{copy.note}</p>
  </div></div>;
}
