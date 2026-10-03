import { supabase } from "@/integrations/supabase/client";

/** Agent session resolved from Supabase Auth + the matching `acs` row. */
export interface AgentSession {
  acsId: string;
  name: string;
  agentCode: string;
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

  const { data: acs } = await supabase.from("acs").select("id,name,code").eq("code", code).single();
  if (!acs) return null;

  return { acsId: acs.id, name: acs.name, agentCode: acs.code, loggedIn: true };
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
