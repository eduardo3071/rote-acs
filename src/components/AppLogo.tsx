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
        <svg viewBox="0 0 64 64" fill="none" className="size-[70%] text-primary" aria-hidden>
          <path
            d="M10 56c8-2 12-8 22-8s14 4 22 2"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1 6"
            opacity="0.6"
          />
          <circle cx="54" cy="50" r="3" fill="currentColor" />
          <path d="M32 4c-10 0-18 7.6-18 17.4C14 34 32 48 32 48s18-14 18-26.6C50 11.6 42 4 32 4Z" fill="currentColor" />
          <path d="M29 13h6v6h6v6h-6v6h-6v-6h-6v-6h6Z" fill="var(--color-elevated)" />
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
