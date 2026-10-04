// ROTA TEMPORÁRIA DE TESTE — remover após validar o mapa.
import { createFileRoute } from "@tanstack/react-router";
import { TerritoryMap } from "@/components/dashboard/TerritoryMap";
import { mockFamilies } from "@/data/families";

export const Route = createFileRoute("/mapa-teste")({
  component: () => (
    <div className="field-surface min-h-screen p-4">
      <TerritoryMap families={mockFamilies} focusId={mockFamilies[0]?.id} />
    </div>
  ),
});
