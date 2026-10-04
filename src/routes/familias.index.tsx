import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, SearchX, ArrowDownWideNarrow } from "lucide-react";
import { FamilySearch } from "@/components/families/FamilySearch";
import { RiskFilter } from "@/components/families/RiskFilter";
import { FamilyRiskCard } from "@/components/families/FamilyRiskCard";
import { BottomNav } from "@/components/BottomNav";
import { useAgentSession } from "@/lib/useAgentSession";
import { useFamilies } from "@/lib/territory";
import { countByLevel, matchesFilter, type RiskFilterValue } from "@/lib/risk";
import { fill, useAppTranslations } from "@/lib/app-translations";

export const Route = createFileRoute("/familias/")({
  head: () => ({
    meta: [
      { title: "Famílias do território — RoteACS" },
      { name: "description", content: "Famílias ordenadas por prioridade de visita, com busca e filtros." },
      { property: "og:title", content: "Famílias do território — RoteACS" },
      { property: "og:description", content: "Famílias ordenadas por prioridade de visita, com busca e filtros." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FamiliesList,
});

function FamiliesList() {
  const { m } = useAppTranslations();
  const session = useAgentSession();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RiskFilterValue>("all");
  const families = useFamilies();
  const all = useMemo(() => [...families].sort((a, b) => b.riskScore - a.riskScore), [families]);

  const searched = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pt-BR");
    return q ? all.filter((f) => f.name.toLocaleLowerCase("pt-BR").includes(q)) : all;
  }, [all, query]);
  const visible = searched.filter((f) => matchesFilter(f, filter));
  const c = countByLevel(searched);
  const counts = { all: searched.length, ...c };

  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 pb-24 pt-6 md:max-w-2xl">
        <header className="flex items-center gap-4">
          <Link to="/dashboard" aria-label={m.familiesList.back}
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-title font-bold text-foreground">{m.familiesList.title}</h1>
            <p className="flex items-center gap-2 text-small text-muted-foreground">
              {fill(m.familiesList.count, { count: all.length })}
              <span className="inline-flex items-center gap-1 text-primary">
                <ArrowDownWideNarrow className="size-3" aria-hidden /> {m.familiesList.sorted}
              </span>
            </p>
          </div>
        </header>

        <div className="sticky top-0 z-10 -mx-6 flex flex-col gap-4 bg-background/90 px-6 py-2 backdrop-blur">
          <FamilySearch value={query} onChange={setQuery} />
          <RiskFilter value={filter} onChange={setFilter} counts={counts} />
        </div>

        {!session ? (
          <ul className="flex flex-col gap-2" aria-label={m.familiesList.loading}>
            {[0, 1, 2, 3].map((i) => <li key={i} className="h-24 animate-pulse rounded-lg border border-border bg-card" />)}
          </ul>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <SearchX className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-body font-semibold text-foreground">{m.familiesList.empty}</p>
            <p className="text-small text-muted-foreground">
              {all.length === 0 ? m.familiesList.noneTerritory : query ? m.familiesList.trySearch : m.familiesList.nonePriority}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 md:grid md:grid-cols-2">
            {visible.map((f, i) => (
              <li key={f.id}><FamilyRiskCard family={f} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }} /></li>
            ))}
          </ul>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
