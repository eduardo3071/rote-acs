import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Full-height slide: large illustration stage on top, title and copy below. */
export function OnboardingSlide({
  illustration,
  title,
  text,
  active,
}: {
  illustration: ReactNode;
  title: string;
  text: string;
  active: boolean;
}) {
  return (
    <section
      aria-hidden={!active}
      className="flex w-full shrink-0 snap-center flex-col items-center px-6"
    >
      <div className="relative flex w-full flex-1 items-center justify-center py-4">
        <div aria-hidden className="absolute size-56 rounded-pill bg-primary/10 blur-3xl" />
        <div className="relative flex w-full justify-center">{illustration}</div>
      </div>
      <div
        key={active ? "on" : "off"}
        className={cn("flex max-w-[340px] flex-col gap-3 pb-2 text-center", active ? "animate-rise-in" : "opacity-0")}
        style={{ animationDelay: "120ms" }}
      >
        <h2 className="text-title text-ink text-balance">{title}</h2>
        <p className="text-body text-ink-soft">{text}</p>
      </div>
    </section>
  );
}
