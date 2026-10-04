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

export type Locale = "pt-BR" | "en" | "es";

const KEY = "roteacs.locale";
const EVENT = "roteacs:locale";
const VALID_LOCALES: Locale[] = ["pt-BR", "en", "es"];

export const LOCALE_NAMES: Record<Locale, string> = {
  "pt-BR": "Português",
  en: "English",
  es: "Español",
};

export function getLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  try {
    const stored = window.localStorage.getItem(KEY);
    return (VALID_LOCALES as string[]).includes(stored ?? "") ? (stored as Locale) : "pt-BR";
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
  "onboarding.territory.area": "Área",
  "onboarding.offline.status": "Offline",
  "onboarding.offline.noSignal": "Sem sinal",
  "onboarding.offline.saved": "Salvo no celular",
  "onboarding.offline.syncLater": "Sincroniza depois",
  "onboarding.priority.familyA": "Família A",
  "onboarding.priority.familyB": "Família B",
  "onboarding.priority.familyC": "Família C",
  "onboarding.priority.high": "Risco alto",
  "onboarding.priority.medium": "Risco médio",
  "onboarding.priority.low": "Risco baixo",
  "onboarding.priority.up": "subiu 2 posições",
  "onboarding.priority.same": "mantida",
  "onboarding.priority.down": "desceu 2 posições",
  "onboarding.position": "{position}º",
  "onboarding.goToSlide": "Ir para a tela {slide} de {total}",

  "login.welcome": "Bem-vindo ao RoteACS",
  "login.subtitle": "Entre para acessar seu território",
  "login.agentCode": "Código do agente",
  "login.agentCodePlaceholder": "Ex.: ACS001",
  "login.password": "Senha",
  "login.passwordPlaceholder": "Digite sua senha",
  "login.signingIn": "ENTRANDO…",
  "login.signIn": "ENTRAR",
  "login.worksOffline": "Funciona offline",
  "login.demoCreds": "Credenciais de demonstração carregadas para avaliação.",
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
  "perfil.today": "Hoje",
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
  "perfil.exportError": "Não foi possível gerar a exportação.",
  "perfil.brazil": "Brasil",
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
  "onboarding.territory.area": "Area",
  "onboarding.offline.status": "Offline",
  "onboarding.offline.noSignal": "No signal",
  "onboarding.offline.saved": "Saved on device",
  "onboarding.offline.syncLater": "Syncs later",
  "onboarding.priority.familyA": "Family A",
  "onboarding.priority.familyB": "Family B",
  "onboarding.priority.familyC": "Family C",
  "onboarding.priority.high": "High risk",
  "onboarding.priority.medium": "Medium risk",
  "onboarding.priority.low": "Low risk",
  "onboarding.priority.up": "moved up 2 places",
  "onboarding.priority.same": "unchanged",
  "onboarding.priority.down": "moved down 2 places",
  "onboarding.position": "#{position}",
  "onboarding.goToSlide": "Go to screen {slide} of {total}",

  "login.welcome": "Welcome to RoteACS",
  "login.subtitle": "Sign in to access your territory",
  "login.agentCode": "Agent code",
  "login.agentCodePlaceholder": "e.g., ACS001",
  "login.password": "Password",
  "login.passwordPlaceholder": "Enter your password",
  "login.signingIn": "SIGNING IN…",
  "login.signIn": "SIGN IN",
  "login.worksOffline": "Works offline",
  "login.demoCreds": "Demo credentials pre-filled for evaluation.",
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
  "perfil.today": "Today",
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
  "perfil.exportError": "Could not generate the export.",
  "perfil.brazil": "Brazil",
};

const es: Record<keyof typeof pt, string> = {
  "nav.home": "Inicio",
  "nav.families": "Familias",
  "nav.profile": "Perfil",
  "nav.aria": "Navegación principal",

  "splash.tagline": "Voz del Agente Comunitario de Salud",
  "splash.subtitle": "Inteligencia offline para quienes están en el campo",

  "onboarding.skip": "Omitir",
  "onboarding.continue": "Continuar",
  "onboarding.start": "Empezar",
  "onboarding.territory.title": "Prioriza a quien más lo necesita",
  "onboarding.territory.text":
    "RoteACS organiza las familias de tu territorio por nivel de prioridad, ayudándote a identificar qué visitas deben ocurrir primero.",
  "onboarding.offline.title": "Funciona sin internet",
  "onboarding.offline.text":
    "Sigue trabajando incluso sin conexión. Tus registros permanecen en el dispositivo y se sincronizan cuando haya señal.",
  "onboarding.priority.title": "El territorio cambia. La prioridad también.",
  "onboarding.priority.text":
    "Cuando se registra nueva información, la prioridad de las familias puede actualizarse para ayudarte a decidir adónde ir primero.",
  "onboarding.territory.area": "Área",
  "onboarding.offline.status": "Sin conexión",
  "onboarding.offline.noSignal": "Sin señal",
  "onboarding.offline.saved": "Guardado en el teléfono",
  "onboarding.offline.syncLater": "Sincroniza después",
  "onboarding.priority.familyA": "Familia A",
  "onboarding.priority.familyB": "Familia B",
  "onboarding.priority.familyC": "Familia C",
  "onboarding.priority.high": "Riesgo alto",
  "onboarding.priority.medium": "Riesgo medio",
  "onboarding.priority.low": "Riesgo bajo",
  "onboarding.priority.up": "subió 2 posiciones",
  "onboarding.priority.same": "sin cambios",
  "onboarding.priority.down": "bajó 2 posiciones",
  "onboarding.position": "{position}º",
  "onboarding.goToSlide": "Ir a la pantalla {slide} de {total}",

  "login.welcome": "Bienvenido a RoteACS",
  "login.subtitle": "Inicia sesión para acceder a tu territorio",
  "login.agentCode": "Código del agente",
  "login.agentCodePlaceholder": "Ej.: ACS001",
  "login.password": "Contraseña",
  "login.passwordPlaceholder": "Escribe tu contraseña",
  "login.signingIn": "INICIANDO SESIÓN…",
  "login.signIn": "INICIAR SESIÓN",
  "login.worksOffline": "Funciona sin conexión",
  "login.demoCreds": "Credenciales de demostración precargadas para evaluación.",
  "login.err.code": "Escribe tu código",
  "login.err.codeLong": "Código demasiado largo",
  "login.err.password": "Escribe tu contraseña",
  "login.err.passwordLong": "Contraseña demasiado larga",

  "perfil.role": "Agente Comunitario de Salud",
  "perfil.territory": "Territorio",
  "perfil.familiesLoaded": "Familias cargadas de la base de datos",
  "perfil.lastOfflineCache": "Última caché offline",
  "perfil.noOfflineCache": "Aún sin caché offline",
  "perfil.territoryScopeNote": "Cuenta solo el territorio activo ({territory}) — cambiar de municipio abajo cambia este número, no suma los dos.",
  "perfil.pendingRecords": "Registros pendientes de envío",
  "perfil.syncedRecords": "registros sincronizados",
  "perfil.lastSync": "Última sincronización",
  "perfil.never": "Nunca",
  "perfil.today": "Hoy",
  "perfil.offlineQueueNote": "Las visitas registradas sin conexión quedan en la cola del teléfono y se envían solas cuando vuelve la señal — así la app cumple la regla del desafío de funcionar offline sin perder ningún registro.",
  "perfil.synced": "Sincronizado",
  "perfil.sync": "SINCRONIZAR",
  "perfil.syncing": "Sincronizando…",
  "perfil.exportDhis2": "Exportar a DHIS2",
  "perfil.generating": "Generando…",
  "perfil.dhis2Note": "DHIS2 es el sistema de información en salud usado por ministerios de salud en más de 70 países (incluido el SUS en Brasil). Exportar en este formato es lo que hace que RoteACS sea conectable a un sistema de salud que ya existe, en vez de crear un silo de datos más, aislado.",
  "perfil.dataSources": "Fuentes de datos y transparencia de la IA",
  "perfil.settings": "Configuración",
  "perfil.language": "Idioma",
  "perfil.storage": "Almacenamiento",
  "perfil.privacy": "Privacidad",
  "perfil.privacyValue": "Datos en el dispositivo",
  "perfil.logout": "Cerrar sesión",
  "perfil.dhis2DialogTitle": "Exportar a DHIS2",
  "perfil.dhis2DialogDesc": "Visitas sincronizadas aún no exportadas. Nada se envía a un servidor DHIS2 real en esta versión.",
  "perfil.copy": "Copiar",
  "perfil.copied": "Copiado",
  "perfil.close": "Cerrar",
  "perfil.territoryDialogTitle": "Territorio",
  "perfil.territoryDialogDesc1": "País → Estado → Municipio. La arquitectura de RoteACS usa el código IBGE del municipio (columna cod_ibge en las tablas acs y health_facilities) como parámetro — cambiar de ciudad es un dato nuevo, no una reconstrucción de la app.",
  "perfil.territoryDialogDesc2": "IBGE CNEFE y CNES/DATASUS son bases nacionales y públicas: existen datos reales para cualquier municipio de Brasil, no solo Anapu. Esta demo solo cargó dos (por tiempo de hackathon, y porque este entorno de desarrollo bloquea la red para descargar datos externos en vivo) — por eso los demás municipios aparecen aquí deshabilitados, en vez de ocultos.",
  "perfil.country": "País",
  "perfil.state": "Estado",
  "perfil.municipality": "Municipio",
  "perfil.noMunicipalityData": "Aún no hay ningún municipio con datos cargados en este estado.",
  "perfil.noDataLoaded": "(sin datos cargados)",
  "perfil.save": "Guardar",
  "perfil.exportError": "No se pudo generar la exportación.",
  "perfil.brazil": "Brasil",
};

const DICTS: Record<Locale, Record<string, string>> = { "pt-BR": pt, en, es };

/** Translates a key in the current locale, with `{token}` interpolation; falls back to pt-BR, then the key itself. */
export function useT() {
  const locale = useLocale();
  return (key: keyof typeof pt, vars?: Record<string, string>) => {
    let text = DICTS[locale][key] ?? DICTS["pt-BR"][key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v);
    return text;
  };
}
