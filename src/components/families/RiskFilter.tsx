import { type RiskFilterValue } from "@/lib/risk";
import { cn } from "@/lib/utils";
import { useAppTranslations } from "@/lib/app-translations";

export function RiskFilter({ value, onChange, counts }: {
  value: RiskFilterValue; onChange: (v: RiskFilterValue) => void; counts: Record<RiskFilterValue, number>;
}) {
  const { m } = useAppTranslations();
  const options = [
    { value: "all", label: m.familiesList.all }, { value: "high", label: m.risk.highShort },
    { value: "medium", label: m.risk.mediumShort }, { value: "low", label: m.risk.lowShort },
  ] satisfies { value: RiskFilterValue; label: string }[];
  return (
    <div role="tablist" aria-label={m.familiesList.filter} className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button key={o.value} role="tab" aria-selected={active} onClick={() => onChange(o.value)}
            className={cn("flex h-10 shrink-0 items-center gap-2 rounded-pill px-4 text-small font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground shadow-primary" : "bg-elevated text-muted-foreground")}>
            {o.label}
            <span className={cn("tabular-nums", active ? "opacity-70" : "text-ink-faint")}>{counts[o.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
