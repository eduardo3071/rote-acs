import type { LucideIcon } from "lucide-react";
import { IconContainer } from "@/components/IconContainer";

export function OnboardingSlide({
  icon,
  title,
  text,
  hidden,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  hidden?: boolean;
}) {
  return (
    <section
      aria-hidden={hidden}
      className="flex w-full shrink-0 snap-center flex-col items-center justify-center gap-8 px-8 text-center"
    >
      <IconContainer icon={icon} />
      <div className="flex max-w-[320px] flex-col gap-4">
        <h2 className="text-title text-ink text-balance">{title}</h2>
        <p className="text-body text-ink-soft">{text}</p>
      </div>
    </section>
  );
}
