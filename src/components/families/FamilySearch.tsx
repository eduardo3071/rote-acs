import { Search, X } from "lucide-react";
import { useAppTranslations } from "@/lib/app-translations";

export function FamilySearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { m } = useAppTranslations();
  return (
    <label className="flex h-12 items-center gap-2 rounded-lg border border-border bg-card px-4 focus-within:ring-2 focus-within:ring-primary">
      <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value)}
        placeholder={m.familiesList.search}
        aria-label={m.familiesList.searchAria}
        className="h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" aria-label={m.familiesList.clear} onClick={() => onChange("")} className="text-muted-foreground">
          <X className="size-4" />
        </button>
      )}
    </label>
  );
}
