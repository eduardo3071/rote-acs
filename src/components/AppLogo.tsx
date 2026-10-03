import { cn } from "@/lib/utils";

/**
 * RoteACS mark: a location pin whose head holds a medical cross,
 * sitting on a dashed route that ends in a destination dot.
 */
export function AppLogo({ className, glow = false }: { className?: string; glow?: boolean }) {
  return (
    <div className={cn("relative grid size-28 place-items-center", className)}>
      {glow && (
        <div
          aria-hidden
          className="absolute inset-2 animate-logo-glow rounded-pill bg-primary/25 blur-2xl"
        />
      )}
      <svg viewBox="0 0 64 64" fill="none" className="relative size-full text-primary" aria-hidden>
        <path
          d="M10 56c8-2 12-8 22-8s14 4 22 2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 6"
          opacity="0.55"
        />
        <circle cx="54" cy="50" r="3" fill="currentColor" opacity="0.7" />
        <path
          d="M32 4c-10 0-18 7.6-18 17.4C14 34 32 48 32 48s18-14 18-26.6C50 11.6 42 4 32 4Z"
          fill="currentColor"
        />
        <path
          d="M29 13h6v6h6v6h-6v6h-6v-6h-6v-6h6Z"
          fill="var(--color-background)"
        />
      </svg>
    </div>
  );
}
