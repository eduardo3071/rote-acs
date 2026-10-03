import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "RoteACS — Boas-vindas" },
      {
        name: "description",
        content:
          "Conheça o RoteACS: priorização por risco, funcionamento offline e score em tempo real.",
      },
      { property: "og:title", content: "RoteACS — Boas-vindas" },
      {
        property: "og:description",
        content:
          "Priorize quem mais precisa, funcione sem internet e acompanhe o risco em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingScreen,
});

const slides = [
  {
    icon: "🗂️",
    title: "Priorize quem mais precisa",
    text: "O RoteACS ordena as famílias do seu território pelo risco real — não pela distância ou ordem de cadastro.",
  },
  {
    icon: "📡",
    title: "Funciona sem internet",
    text: "Todos os dados ficam no seu celular. Quando houver sinal, sincroniza com o sistema do Ministério.",
  },
  {
    icon: "🔴",
    title: "Score de risco em tempo real",
    text: "Quando você registra um sintoma, as famílias vizinhas sobem de prioridade automaticamente.",
  },
] as const;

function OnboardingScreen() {
  const navigate = useNavigate({ from: "/onboarding" });
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isLast = active === slides.length - 1;

  // Snap tracking: the scroll position is the source of truth for the active
  // slide, so swipes and button taps stay in sync.
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  const advance = () => {
    if (isLast) {
      navigate({ to: "/login" });
      return;
    }
    goTo(active + 1);
  };

  useEffect(() => {
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.documentElement.style.overflowX = "";
    };
  }, []);

  return (
    <div className="field-surface flex h-dvh min-h-screen flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col overflow-hidden">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => (
            <section
              key={slide.title}
              className="flex w-full shrink-0 snap-center flex-col justify-center gap-6 px-8"
              aria-hidden={i !== active}
            >
              <div className="grid size-20 place-items-center rounded-lg border border-border bg-elevated shadow-raised">
                <span className="text-4xl leading-none">{slide.icon}</span>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-title text-ink">{slide.title}</h2>
                <p className="text-body text-ink-soft">{slide.text}</p>
              </div>
            </section>
          ))}
        </div>

        <footer className="flex flex-col gap-6 px-8 pt-4 pb-10">
          <div className="flex items-center justify-center gap-2" role="tablist">
            {slides.map((slide, i) => (
              <button
                key={slide.title}
                role="tab"
                aria-label={`Ir para o slide ${i + 1}`}
                aria-selected={i === active}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 rounded-pill transition-all duration-300",
                  i === active ? "w-6 bg-primary" : "w-2 bg-border",
                )}
              />
            ))}
          </div>
          <Button block size="lg" onClick={advance}>
            {isLast ? "Começar" : "Continuar"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
