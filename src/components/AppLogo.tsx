import { cn } from "@/lib/utils";

/**
 * RoteACS mark: a location pin carrying a medical cross, sitting on a route
 * that ends in a destination node. `orbit` adds rings for the splash hero.
 */
export function AppLogo({
  className,
  glow = false,
  orbit = false,
}: {
  className?: string;
  glow?: boolean;
  orbit?: boolean;
}) {
  return (
    <div className={cn("relative grid size-28 place-items-center", className)}>
      {glow && (
        <div aria-hidden className="absolute inset-0 animate-logo-glow rounded-pill bg-primary/30 blur-3xl" />
      )}
      {orbit && (
        <div aria-hidden className="absolute -inset-10">
          <div className="absolute inset-0 rounded-pill border border-primary/15" />
          <div className="absolute inset-5 animate-orbit rounded-pill border border-dashed border-primary/25">
            <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-pill bg-primary shadow-primary" />
          </div>
        </div>
      )}
      <div className="relative grid size-full place-items-center rounded-[28%] border border-primary/30 bg-elevated shadow-raised">
        <svg viewBox="0 0 68 64" fill="none" className="size-[70%] text-primary" aria-hidden>
          {/* Pin with a hollow head (vital-sign lens) */}
          <path
            d="M20 4C28.8 4 36 11.2 36 20C36 29.5 26.5 37.5 20 46C13.5 37.5 4 29.5 4 20C4 11.2 11.2 4 20 4Z"
            fill="currentColor"
          />
          <circle cx="20" cy="20" r="6.5" fill="var(--color-elevated)" />
          {/* Pulse line flowing out of the pin tip */}
          <path
            d="M20 46H29L34.5 34L41 56L46.5 43H50"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dotted route to the destination */}
          <circle cx="54" cy="43" r="1.7" fill="currentColor" opacity="0.7" />
          <circle cx="58" cy="43" r="1.7" fill="currentColor" opacity="0.7" />
          <circle cx="62.5" cy="43" r="4.8" stroke="var(--color-elevated)" strokeWidth="1.5" />
          <circle cx="62.5" cy="43" r="3.2" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

/** Compact mark + wordmark for headers. */
export function AppLogoInline() {
  return (
    <div className="flex items-center gap-2">
      <AppLogo className="size-8" />
      <span className="text-subtitle font-bold tracking-tight text-ink">
        Rote<span className="text-primary">ACS</span>
      </span>
    </div>
  );
}
