import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSession } from "@/lib/session";
import { AppLogo } from "@/components/AppLogo";
import { TerritoryBackdrop } from "@/components/TerritoryBackdrop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RoteACS" },
      {
        name: "description",
        content:
          "RoteACS — Roteamento de Agentes Comunitários de Saúde. Inteligência offline para quem está em campo.",
      },
      { property: "og:title", content: "RoteACS" },
      {
        property: "og:description",
        content: "Inteligência offline para quem está em campo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SplashScreen,
});

function SplashScreen() {
  const navigate = useNavigate({ from: "/" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate({ to: getSession() ? "/dashboard" : "/onboarding", replace: true });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="field-surface relative flex min-h-dvh flex-col overflow-hidden">
      <TerritoryBackdrop />
      <div className="relative mx-auto flex w-full max-w-[430px] flex-1 flex-col items-center px-8">
        <div className="flex flex-1 flex-col items-center justify-center pt-8">
          <div className="animate-splash-in" style={{ animationDelay: "250ms" }}>
            <AppLogo glow orbit />
          </div>
          <h1
            className="mt-16 animate-rise-in text-brand text-ink"
            style={{ animationDelay: "550ms" }}
          >
            Rote<span className="text-primary">ACS</span>
          </h1>
          <div
            className="mt-4 h-px w-12 animate-rise-in bg-primary/60"
            style={{ animationDelay: "700ms" }}
          />
          <p
            className="mt-4 max-w-[240px] animate-rise-in text-center text-subtitle font-medium text-ink"
            style={{ animationDelay: "800ms" }}
          >
            Voz do Agente Comunitário de Saúde
          </p>
        </div>
        <div
          className="flex w-full animate-rise-in flex-col items-center gap-4 pb-12"
          style={{ animationDelay: "1000ms" }}
        >
          <p className="max-w-[220px] text-center text-small text-ink-soft">
            Inteligência offline para quem está em campo
          </p>
          <div className="h-1 w-24 overflow-hidden rounded-pill bg-border">
            <div className="h-full w-full animate-fill-bar rounded-pill bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
