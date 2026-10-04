import { Hospital } from "lucide-react";
import type { NearestFacility } from "@/lib/territory";
import { useAppTranslations } from "@/lib/app-translations";

/** Real CNES/DATASUS reference facility for the priority family — grounds the map in real data. */
export function NearestFacilityCard({ facility }: { facility: NearestFacility }) {
  const { m, locale } = useAppTranslations();
  const km = (facility.distanceM / 1000).toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  return (
    <section className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 animate-rise-in">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
        <Hospital className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="label-caps text-muted-foreground">{m.dashboard.nearestFacility}</p>
        <p className="truncate text-small font-semibold text-foreground">{facility.name} · {km} km</p>
      </div>
      <span className="shrink-0 text-label text-ink-faint">CNES/DATASUS 2024</span>
    </section>
  );
}
