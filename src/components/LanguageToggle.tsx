import { Languages } from "lucide-react";
import { setLocale, useLocale, type Locale } from "@/lib/i18n";

const ORDER: Locale[] = ["pt-BR", "en", "es"];
const SHORT: Record<Locale, string> = { "pt-BR": "PT", en: "EN", es: "ES" };
const NEXT_LABEL: Record<Locale, string> = {
  "pt-BR": "Switch language to English",
  en: "Cambiar idioma a Español",
  es: "Mudar idioma para Português",
};

/** Fixed language switch on the right edge, visible on every screen. Cycles pt-BR → en → es → pt-BR. */
export function LanguageToggle() {
  const locale = useLocale() ?? "pt-BR";
  const next = ORDER[(ORDER.indexOf(locale) + 1) % ORDER.length];
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={NEXT_LABEL[locale]}
      className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1 rounded-l-lg border border-r-0 border-primary/40 bg-card/95 px-2 py-2 text-label font-bold text-primary shadow-lg backdrop-blur active:bg-elevated"
    >
      <Languages className="size-4" aria-hidden />
      {ORDER.map((l) => (
        <span key={l} className={l === locale ? "text-primary" : "text-muted-foreground"}>{SHORT[l]}</span>
      ))}
    </button>
  );
}
