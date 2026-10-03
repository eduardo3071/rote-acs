import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

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

/** Location pin with a medical cross cut out of the head — the RoteACS mark. */
function BrandMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-24 text-primary drop-shadow-[0_12px_32px_rgba(22,168,255,0.35)]"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
        fill="currentColor"
      />
      <path
        d="M11 6.2h2v2.6h2.6v2H13v2.6h-2v-2.6H8.4v-2H11Z"
        fill="var(--color-background)"
      />
    </svg>
  );
}

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
      <div className="flex w-full max-w-[430px] animate-fade-in flex-col items-center gap-6 text-center">
        <BrandMark />
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
