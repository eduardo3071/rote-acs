import { Check, Database, RefreshCw, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Chip({
  icon: Icon,
  text,
  className,
  delay,
  play,
}: {
  icon: LucideIcon;
  text: string;
  className: string;
  delay: number;
  play: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute flex items-center gap-2 rounded-pill border border-border bg-elevated px-3 py-2 shadow-raised",
        play ? "animate-rise-in" : "opacity-0",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="size-4 text-primary" aria-hidden />
      <span className="text-small font-medium text-ink">{text}</span>
    </div>
  );
}

/** A phone keeps recording visits with no signal; chips show storage and later sync. */
export function OfflineIllustration({ play }: { play: boolean }) {
  return (
    <div className="relative grid aspect-square w-full max-w-[300px] place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-primary" fill="none" aria-hidden>
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="36" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.4" strokeDasharray="1 2" />
      </svg>

      <div
        className={cn(
          "relative flex h-[62%] w-[38%] flex-col gap-2 rounded-xl border-2 border-primary/40 bg-card p-2 shadow-primary",
          play ? "animate-pop-in" : "opacity-0",
        )}
      >
        <div className="mx-auto h-1 w-6 rounded-pill bg-border" />
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-soft">Offline</span>
          <WifiOff className="size-3 text-risk-medium" aria-hidden />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 rounded-sm bg-elevated p-2">
            <span className="grid size-4 place-items-center rounded-pill bg-risk-low/20">
              <Check className="size-3 text-risk-low" aria-hidden />
            </span>
            <span className="h-1 flex-1 rounded-pill bg-border" />
          </div>
        ))}
      </div>

      <Chip play={play} delay={250} icon={WifiOff} text="Sem sinal" className="left-0 top-[10%]" />
      <Chip play={play} delay={400} icon={Database} text="Salvo no celular" className="right-0 top-[42%]" />
      <Chip play={play} delay={550} icon={RefreshCw} text="Sincroniza depois" className="bottom-[8%] left-[2%]" />
    </div>
  );
}
