import { Languages } from "lucide-react";
import { setLocale, useLocale } from "@/lib/i18n";

/** Fixed language switch on the right edge, visible on every screen. */
export function LanguageToggle() {
  const locale = useLocale();
  const next = locale === "pt-BR" ? "en" : "pt-BR";
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={locale === "pt-BR" ? "Mudar idioma para English" : "Switch language to Português"}
      className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-lg border border-r-0 border-primary/40 bg-card/95 px-2 py-2 text-label font-bold text-primary shadow-lg backdrop-blur active:bg-elevated"
    >
      <Languages className="size-4" aria-hidden />
      <span className={locale === "pt-BR" ? "text-primary" : "text-muted-foreground"}>PT</span>
      <span className={locale === "en" ? "text-primary" : "text-muted-foreground"}>EN</span>
    </button>
  );
}
