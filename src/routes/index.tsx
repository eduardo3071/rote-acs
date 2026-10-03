import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLogo } from "@/components/AppLogo";

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
      navigate({ to: "/onboarding", replace: true });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="field-surface flex min-h-screen flex-col items-center justify-center px-8">
      <div className="flex w-full max-w-[430px] animate-splash-in flex-col items-center gap-4 text-center">
        <AppLogo glow className="mb-4" />
        <h1 className="text-display text-primary">RoteACS</h1>
        <p className="text-body text-ink-soft">
          Voz do Agente Comunitário de Saúde
        </p>
        <p className="text-small text-ink-faint">
          Inteligência offline para quem está em campo
        </p>
      </div>
    </div>
  );
}
