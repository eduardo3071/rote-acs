import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSession, type AgentSession } from "@/lib/session";

/** Reads the local session after hydration; sends visitors without one to /login. */
export function useAgentSession() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AgentSession | null>(null);
  useEffect(() => {
    const s = getSession();
    if (!s) navigate({ to: "/login", replace: true });
    else setSession(s);
  }, [navigate]);
  return session;
}
