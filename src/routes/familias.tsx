import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/familias")({
  head: () => ({
    meta: [
      { title: "Famílias prioritárias — RoteACS" },
      { name: "description", content: "Famílias do território ordenadas por prioridade de visita." },
      { property: "og:title", content: "Famílias prioritárias — RoteACS" },
      { property: "og:description", content: "Famílias do território ordenadas por prioridade de visita." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FamiliasPlaceholder,
});

/** Placeholder until the families list phase replaces this file. */
function FamiliasPlaceholder() {
  return (
    <div className="field-surface min-h-screen">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-body text-primary">
          <ArrowLeft className="size-5" aria-hidden /> Voltar
        </Link>
        <h1 className="text-title font-bold text-foreground">Famílias prioritárias</h1>
        <p className="rounded-xl border border-border bg-card p-4 text-small text-muted-foreground">
          A lista de famílias chega na próxima fase.
        </p>
      </div>
    </div>
  );
}
