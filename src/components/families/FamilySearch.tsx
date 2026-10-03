import { Search, X } from "lucide-react";

export function FamilySearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex h-12 items-center gap-2 rounded-lg border border-border bg-card px-4 focus-within:ring-2 focus-within:ring-primary">
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar família..."
        aria-label="Buscar família"
        className="h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" aria-label="Limpar busca" onClick={() => onChange("")} className="text-muted-foreground">
          <X className="size-4" />
        </button>
      )}
    </label>
  );
}
