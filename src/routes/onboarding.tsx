import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PageIndicator } from "@/components/PageIndicator";
import { OnboardingSlide } from "@/components/OnboardingSlide";
import { onboardingSteps as slides } from "@/data/onboarding";
import { AppLogoInline } from "@/components/AppLogo";
import { TerritoryIllustration } from "@/components/onboarding/TerritoryIllustration";
import { OfflineIllustration } from "@/components/onboarding/OfflineIllustration";
import { PriorityIllustration } from "@/components/onboarding/PriorityIllustration";
import { cn } from "@/lib/utils";

const illustrations = {
  territory: TerritoryIllustration,
  offline: OfflineIllustration,
  priority: PriorityIllustration,
};

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
    <div className="field-surface flex h-dvh flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col overflow-hidden">
        <header className="flex flex-col items-center gap-2 px-6 pt-6">
          <div className="flex w-full items-center justify-between">
            <AppLogoInline />
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className={cn(
                "h-11 rounded-md px-3 text-small font-medium text-ink-soft transition-opacity active:text-ink",
                isLast && "pointer-events-none opacity-0",
              )}
              tabIndex={isLast ? -1 : 0}
            >
              Pular
            </button>
          </div>
          <div className="flex w-full items-center justify-between">
            <span className="label-caps text-ink-faint">
              {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <PageIndicator count={slides.length} active={active} onSelect={goTo} />
          </div>
        </header>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => {
            const Illustration = illustrations[slide.id];
            return (
              <OnboardingSlide
                key={slide.id}
                title={slide.title}
                text={slide.text}
                active={i === active}
                illustration={<Illustration key={i === active ? "on" : "off"} play={i === active} />}
              />
            );
          })}
        </div>

        <footer className="px-6 pt-6 pb-8">
          <PrimaryButton onClick={advance}>{isLast ? "Começar" : "Continuar"}</PrimaryButton>
        </footer>
      </div>
    </div>
  );
}
