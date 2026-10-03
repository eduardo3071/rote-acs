import { cn } from "@/lib/utils";

export function PageIndicator({
  count,
  active,
  onSelect,
}: {
  count: number;
  active: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2" role="tablist">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-label={`Ir para a tela ${i + 1} de ${count}`}
          aria-selected={i === active}
          onClick={() => onSelect?.(i)}
          className="grid h-8 place-items-center px-1"
        >
          <span
            className={cn(
              "block h-2 rounded-pill transition-all duration-300",
              i === active ? "w-6 bg-primary" : "w-2 bg-border",
            )}
          />
        </button>
      ))}
    </div>
  );
}
