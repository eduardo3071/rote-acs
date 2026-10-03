import { cn } from "@/lib/utils";

/** Segmented bar indicator: active segment is long and cyan, others short and dark. */
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
    <div className="flex items-center gap-1" role="tablist">
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
              "block h-1 rounded-pill transition-all duration-500 ease-out",
              i === active ? "w-8 bg-primary shadow-primary" : "w-4 bg-border",
            )}
          />
        </button>
      ))}
    </div>
  );
}
