/** Local-only mock session. Swap for real auth when a backend exists. */
export interface AgentSession {
  name: string;
  agentCode: string;
  loggedIn: true;
}

const KEY = "roteacs.session";

export function getSession(): AgentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const s = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    return s?.loggedIn && s.name && s.agentCode ? (s as AgentSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(name: string, agentCode: string): AgentSession {
  const session: AgentSession = { name, agentCode, loggedIn: true };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  window.localStorage.removeItem(KEY);
}
