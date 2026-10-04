/**
 * RoteACS — reconhecimento de voz em português (push-to-talk) para o registro de
 * visita. Usa a Web Speech API nativa do navegador (sem dependências novas — o
 * ambiente de build deste projeto não consegue instalar pacotes a partir do
 * registry privado da Lovable). O vocabulário de cada pergunta é fechado
 * (sim/não, fonte de água, números 0–10, sintomas conhecidos), então o
 * reconhecimento vira um problema de "pattern recognition" bem definido — a
 * definição de Small AI usada neste projeto — em vez de transcrição livre.
 *
 * Isolado nesta única interface (`listenOnce`) para que trocar por um modelo
 * 100% on-device (ex.: Vosk/WASM) no futuro seja só reescrever este arquivo,
 * sem tocar nas telas.
 */

interface SpeechRecognitionResultLike {
  readonly transcript: string;
}
interface SpeechRecognitionEventLike {
  readonly results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/** Records one short utterance and resolves with the lowercase transcript. */
export function listenOnce(lang = "pt-BR"): Promise<string> {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return Promise.reject(new Error("Reconhecimento de voz não é suportado neste navegador."));

  return new Promise((resolve, reject) => {
    const recognizer = new Ctor();
    recognizer.lang = lang;
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
      recognizer.onresult = null;
      recognizer.onerror = null;
      recognizer.onend = null;
    };

    recognizer.onresult = (ev) => {
      const transcript = ev.results[0]?.[0]?.transcript ?? "";
      finish(() => resolve(transcript.trim().toLowerCase()));
    };
    recognizer.onerror = (ev) => {
      finish(() => reject(new Error(ev.error || "Não entendi, tente de novo.")));
    };
    recognizer.onend = () => {
      finish(() => reject(new Error("Não entendi, tente de novo.")));
    };

    try {
      recognizer.start();
    } catch {
      finish(() => reject(new Error("Não foi possível acessar o microfone.")));
    }
  });
}

/** Speaks a prompt out loud (pt-BR) using the browser's built-in speech synthesis — the
 *  other half of "Modo Conversa": the app asks, the ACS answers, no typing/tapping in between. */
export function speak(text: string, lang = "pt-BR"): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve();
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// ---------- parsers: closed-vocabulary speech → structured field ----------

export function parseReason(transcript: string): "routine" | "symptom" | "prenatal" | "chronic" | null {
  if (/gestante|pr[eé]-?natal|grávida/.test(transcript)) return "prenatal";
  if (/cr[oô]nic/.test(transcript)) return "chronic";
  if (/sintoma/.test(transcript)) return "symptom";
  if (/rotina/.test(transcript)) return "routine";
  return null;
}

export function parseYesNo(transcript: string): boolean | null {
  if (/\bn[aã]o\b/.test(transcript)) return false;
  if (/\bsim\b/.test(transcript)) return true;
  return null;
}

export function parseYesNoUnknown(transcript: string): "yes" | "no" | "unknown" | null {
  if (/n[aã]o sei|sei n[aã]o|n[aã]o sabe/.test(transcript)) return "unknown";
  if (/\bn[aã]o\b/.test(transcript)) return "no";
  if (/\bsim\b/.test(transcript)) return "yes";
  return null;
}

export function parseLatrineCondition(transcript: string): "good" | "bad" | "na" | null {
  if (/n[aã]o se aplica|sem latrina/.test(transcript)) return "na";
  if (/\bn[aã]o\b/.test(transcript)) return "bad";
  if (/\bsim\b/.test(transcript)) return "good";
  return null;
}

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, nenhum: 0, nenhuma: 0,
  um: 1, uma: 1,
  dois: 2, duas: 2,
  "três": 3, tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
};

export function parseNumber(transcript: string, max = 99): number | null {
  const digits = transcript.match(/\d+/);
  if (digits) return Math.min(max, Number(digits[0]));
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`, "i").test(transcript)) return Math.min(max, value);
  }
  return null;
}

export function parseWaterSource(transcript: string): "well" | "river" | "igarape" | "tap" | "other" | null {
  if (/po[çc]o/.test(transcript)) return "well";
  if (/igarap/.test(transcript)) return "igarape"; // check before "rio" (igarapé contains no "rio" but keep order safe)
  if (/\brio\b/.test(transcript)) return "river";
  if (/torneira/.test(transcript)) return "tap";
  if (/outr[ao]/.test(transcript)) return "other";
  return null;
}

/** Keyword-spots known symptoms in a free utterance; returns the matched option ids. */
export function parseSymptoms(transcript: string): string[] {
  const found: string[] = [];
  if (/diarr/.test(transcript)) found.push("diarrhea");
  if (/febre/.test(transcript)) found.push("fever");
  if (/tosse|respir/.test(transcript)) found.push("respiratory");
  if (/v[oô]mit/.test(transcript)) found.push("vomit");
  if (found.length === 0 && /nenhum|sem sintoma/.test(transcript)) found.push("none");
  return found;
}

/** Keyword-spots IMCI dehydration danger signs; returns the matched option labels. */
export function parseDehydrationSigns(transcript: string): string[] {
  const found: string[] = [];
  if (/olho/.test(transcript)) found.push("Olhos fundos");
  if (/boca seca|seca/.test(transcript)) found.push("Boca seca");
  if (/let[aá]rgic|sonol[eê]nci|mole demais|sem energia/.test(transcript)) found.push("Criança letárgica");
  return found;
}
