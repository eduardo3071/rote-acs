import { supabase } from "@/integrations/supabase/client";

/** Agent session resolved from Supabase Auth + the matching `acs` row. */
export interface AgentSession {
  acsId: string;
  name: string;
  agentCode: string;
  territory: string | null;
  municipio: string | null;
  codIbge: string | null;
  loggedIn: true;
}

function emailForCode(code: string) {
  return `${code.trim().toLowerCase()}@roteacs.app`;
}

/** Resolves the current session from Supabase Auth, or null if not logged in. */
export async function getSession(): Promise<AgentSession | null> {
  const { data: { session: authSession } } = await supabase.auth.getSession();
  if (!authSession?.user.email) return null;

  const code = authSession.user.email.split("@")[0]?.toUpperCase();
  if (!code) return null;

  const { data: acs } = await supabase.from("acs").select("id,name,code,territory,municipio,cod_ibge").eq("code", code).single();
  if (!acs) return null;

  return {
    acsId: acs.id, name: acs.name, agentCode: acs.code, territory: acs.territory,
    municipio: acs.municipio, codIbge: acs.cod_ibge, loggedIn: true,
  };
}

/** Signs in with the agent code and password via Supabase Auth. */
export async function login(agentCode: string, password: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailForCode(agentCode),
    password,
  });
  if (error) return { error: "Código ou senha incorretos" };
  return {};
}

export async function logout() {
  await supabase.auth.signOut();
}

/**
 * Updates the agent's território by writing the real scalability parameter the schema already
 * has — `municipio` + `cod_ibge` (the IBGE municipality code) — rather than a free-text label.
 * This is what "swap the IBGE code, not the codebase" means concretely: `families` and
 * `health_facilities` are keyed by this same code, so pointing an agent at a new one is a data
 * question, not a rebuild.
 */
export async function updateTerritory(acsId: string, municipio: string, codIbge: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("acs").update({ municipio, cod_ibge: codIbge }).eq("id", acsId);
  if (error) return { error: "Não foi possível salvar o território." };
  return {};
}
