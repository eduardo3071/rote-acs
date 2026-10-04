/**
 * Minimal, dependency-free i18n. This sandbox can't install new npm packages (same constraint
 * documented in voice.ts), so this follows the codebase's own pattern instead of a library:
 * localStorage + a window event, same shape as territory.ts's local store.
 *
 * Scope: Splash, Onboarding, Login, bottom navigation and Perfil (where the selector itself
 * lives) are fully translated. Dashboard, Famílias and the visit flow are still Portuguese-only
 * — `t()` falls back to the key name for anything not yet in the dictionary, so an untranslated
 * screen never crashes, it just isn't translated yet.
 */
import { useEffect, useState } from "react";

export type Locale = "pt-BR" | "en";

const KEY = "roteacs.locale";
const EVENT = "roteacs:locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  "pt-BR": "Português",
  en: "English",
};

export function getLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  try {
    return window.localStorage.getItem(KEY) === "en" ? "en" : "pt-BR";
  } catch {
    return "pt-BR";
  }
}

export function setLocale(locale: Locale) {
  try {
    window.localStorage.setItem(KEY, locale);
  } catch {
    // storage unavailable — locale just won't persist across reloads
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Re-renders the calling component whenever the locale changes anywhere in the app. */
export function useLocale(): Locale {
  const [locale, setLocaleState] = useState<Locale>(getLocale());
  useEffect(() => {
    const sync = () => setLocaleState(getLocale());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return locale;
}

// ---------- dictionary ----------

const pt = {
  "nav.home": "Início",
  "nav.families": "Famílias",
  "nav.profile": "Perfil",
  "nav.aria": "Navegação principal",

  "splash.tagline": "Voz do Agente Comunitário de Saúde",
  "splash.subtitle": "Inteligência offline para quem está em campo",

  "onboarding.skip": "Pular",
  "onboarding.continue": "Continuar",
  "onboarding.start": "Começar",
  "onboarding.territory.title": "Priorize quem mais precisa",
  "onboarding.territory.text":
    "O RoteACS organiza as famílias do seu território por nível de prioridade, ajudando você a identificar quais visitas precisam acontecer primeiro.",
  "onboarding.offline.title": "Funciona sem internet",
  "onboarding.offline.text":
    "Continue trabalhando mesmo sem conexão. Seus registros permanecem no dispositivo e podem ser sincronizados quando houver sinal.",
  "onboarding.priority.title": "O território muda. A prioridade também.",
  "onboarding.priority.text":
    "Quando novas informações são registradas, a prioridade das famílias pode ser atualizada para ajudar você a decidir onde ir primeiro.",

  "login.welcome": "Bem-vindo ao RoteACS",
  "login.subtitle": "Entre para acessar seu território",
  "login.agentCode": "Código do agente",
  "login.agentCodePlaceholder": "Ex.: ACS001",
  "login.password": "Senha",
  "login.passwordPlaceholder": "Digite sua senha",
  "login.signingIn": "ENTRANDO…",
  "login.signIn": "ENTRAR",
  "login.worksOffline": "Funciona offline",
  "login.err.code": "Digite seu código",
  "login.err.codeLong": "Código muito longo",
  "login.err.password": "Digite sua senha",
  "login.err.passwordLong": "Senha muito longa",

  "perfil.role": "Agente Comunitário de Saúde",
  "perfil.territory": "Território",
  "perfil.familiesLoaded": "Famílias carregadas do banco",
  "perfil.lastOfflineCache": "Último cache offline",
  "perfil.noOfflineCache": "Ainda sem cache offline",
  "perfil.territoryScopeNote": "Conta só o território ativo ({territory}) — trocar de município na seção abaixo troca esse número, não soma os dois.",
  "perfil.pendingRecords": "Registros aguardando envio",
  "perfil.syncedRecords": "registros sincronizados",
  "perfil.lastSync": "Última sincronização",
  "perfil.never": "Nunca",
  "perfil.offlineQueueNote": "Visitas registradas sem rede ficam na fila do celular e sobem sozinhas quando a conexão volta — é como o app cumpre a regra do desafio de funcionar offline sem perder nenhum registro.",
  "perfil.synced": "Sincronizado",
  "perfil.sync": "SINCRONIZAR",
  "perfil.syncing": "Sincronizando…",
  "perfil.exportDhis2": "Exportar para DHIS2",
  "perfil.generating": "Gerando…",
  "perfil.dhis2Note": "DHIS2 é o sistema de informação em saúde usado por ministérios da saúde em mais de 70 países (incluído no SUS). Exportar nesse formato é o que torna o RoteACS plugável num sistema de saúde que já existe, em vez de criar mais um silo de dados isolado.",
  "perfil.dataSources": "Fontes de dados e transparência da IA",
  "perfil.settings": "Configurações",
  "perfil.language": "Idioma",
  "perfil.storage": "Armazenamento",
  "perfil.privacy": "Privacidade",
  "perfil.privacyValue": "Dados no dispositivo",
  "perfil.logout": "Sair",
  "perfil.dhis2DialogTitle": "Exportar para DHIS2",
  "perfil.dhis2DialogDesc": "Visitas sincronizadas ainda não exportadas. Nada é enviado a um servidor DHIS2 nesta versão.",
  "perfil.copy": "Copiar",
  "perfil.copied": "Copiado",
  "perfil.close": "Fechar",
  "perfil.territoryDialogTitle": "Território",
  "perfil.territoryDialogDesc1": "País → Estado → Município. A arquitetura do RoteACS usa o código IBGE do município (coluna cod_ibge nas tabelas acs e health_facilities) como parâmetro — trocar de cidade é um dado novo, não um rebuild do app.",
  "perfil.territoryDialogDesc2": "IBGE CNEFE e CNES/DATASUS são bases nacionais e públicas: existe dado real para qualquer município do Brasil, não só Anapu. Esta demo só carregou dois (por tempo de hackathon, e porque este ambiente de desenvolvimento bloqueia a rede para baixar dados externos ao vivo) — por isso os outros municípios aparecem aqui desabilitados, em vez de escondidos.",
  "perfil.country": "País",
  "perfil.state": "Estado",
  "perfil.municipality": "Município",
  "perfil.noMunicipalityData": "Nenhum município com dados carregados neste estado ainda.",
  "perfil.noDataLoaded": "(sem dados carregados)",
  "perfil.save": "Salvar",
} as const;

const en: Record<keyof typeof pt, string> = {
  "nav.home": "Home",
  "nav.families": "Families",
  "nav.profile": "Profile",
  "nav.aria": "Main navigation",

  "splash.tagline": "Voice of the Community Health Agent",
  "splash.subtitle": "Offline intelligence for people in the field",

  "onboarding.skip": "Skip",
  "onboarding.continue": "Continue",
  "onboarding.start": "Start",
  "onboarding.territory.title": "Prioritize who needs it most",
  "onboarding.territory.text":
    "RoteACS ranks the families in your territory by priority level, helping you see which visits need to happen first.",
  "onboarding.offline.title": "Works without internet",
  "onboarding.offline.text":
    "Keep working even without a connection. Your records stay on the device and sync once there's a signal.",
  "onboarding.priority.title": "The territory changes. So does priority.",
  "onboarding.priority.text":
    "As new information is recorded, a family's priority can update to help you decide where to go first.",

  "login.welcome": "Welcome to RoteACS",
  "login.subtitle": "Sign in to access your territory",
  "login.agentCode": "Agent code",
  "login.agentCodePlaceholder": "e.g., ACS001",
  "login.password": "Password",
  "login.passwordPlaceholder": "Enter your password",
  "login.signingIn": "SIGNING IN…",
  "login.signIn": "SIGN IN",
  "login.worksOffline": "Works offline",
  "login.err.code": "Enter your code",
  "login.err.codeLong": "Code is too long",
  "login.err.password": "Enter your password",
  "login.err.passwordLong": "Password is too long",

  "perfil.role": "Community Health Agent",
  "perfil.territory": "Territory",
  "perfil.familiesLoaded": "Families loaded from the database",
  "perfil.lastOfflineCache": "Last offline cache",
  "perfil.noOfflineCache": "No offline cache yet",
  "perfil.territoryScopeNote": "Counts only the active territory ({territory}) — switching municipality below changes this number, it doesn't add the two together.",
  "perfil.pendingRecords": "Records waiting to sync",
  "perfil.syncedRecords": "records synced",
  "perfil.lastSync": "Last sync",
  "perfil.never": "Never",
  "perfil.offlineQueueNote": "Visits recorded without a connection sit in the phone's queue and upload on their own once it comes back — this is how the app meets the challenge's offline rule without losing a single record.",
  "perfil.synced": "Synced",
  "perfil.sync": "SYNC",
  "perfil.syncing": "Syncing…",
  "perfil.exportDhis2": "Export to DHIS2",
  "perfil.generating": "Generating…",
  "perfil.dhis2Note": "DHIS2 is the health information system used by ministries of health in more than 70 countries (including Brazil's SUS). Exporting in this format is what makes RoteACS pluggable into a health system that already exists, instead of creating one more isolated data silo.",
  "perfil.dataSources": "Data sources and AI transparency",
  "perfil.settings": "Settings",
  "perfil.language": "Language",
  "perfil.storage": "Storage",
  "perfil.privacy": "Privacy",
  "perfil.privacyValue": "Data on device",
  "perfil.logout": "Log out",
  "perfil.dhis2DialogTitle": "Export to DHIS2",
  "perfil.dhis2DialogDesc": "Synced visits not yet exported. Nothing is sent to a real DHIS2 server in this version.",
  "perfil.copy": "Copy",
  "perfil.copied": "Copied",
  "perfil.close": "Close",
  "perfil.territoryDialogTitle": "Territory",
  "perfil.territoryDialogDesc1": "Country → State → Municipality. RoteACS uses the municipality's IBGE code (the cod_ibge column on the acs and health_facilities tables) as a parameter — switching city is a data question, not an app rebuild.",
  "perfil.territoryDialogDesc2": "IBGE CNEFE and CNES/DATASUS are national, public datasets: real data exists for any Brazilian municipality, not just Anapu. This demo only loaded two (hackathon time, and this dev environment blocks live downloads from external hosts) — so the other municipalities show up here disabled, instead of hidden.",
  "perfil.country": "Country",
  "perfil.state": "State",
  "perfil.municipality": "Municipality",
  "perfil.noMunicipalityData": "No municipality with loaded data in this state yet.",
  "perfil.noDataLoaded": "(no data loaded)",
  "perfil.save": "Save",
};

const DICTS: Record<Locale, Record<string, string>> = { "pt-BR": pt, en };

/** Translates a key in the current locale, with `{token}` interpolation; falls back to pt-BR, then the key itself. */
export function useT() {
  const locale = useLocale();
  return (key: keyof typeof pt, vars?: Record<string, string>) => {
    let text = DICTS[locale][key] ?? DICTS["pt-BR"][key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v);
    return text;
  };
}
