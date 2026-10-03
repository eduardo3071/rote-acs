import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSession, type AgentSession } from "@/lib/session";

/** Reads the Supabase Auth session; sends visitors without one to /login. */
export function useAgentSession() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AgentSession | null>(null);

  useEffect(() => {
    let active = true;

    getSession().then((s) => {
      if (!active) return;
      if (!s) navigate({ to: "/login", replace: true });
      else setSession(s);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!active) return;
      if (!authSession) {
        setSession(null);
        navigate({ to: "/login", replace: true });
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [navigate]);

  return session;
}
