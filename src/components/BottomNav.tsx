import { Link } from "@tanstack/react-router";
import { Home, Map, User } from "lucide-react";
import { useT } from "@/lib/i18n";

/** Persistent 3-tab navigation for the main screens. */
export function BottomNav() {
  const t = useT();
  const TABS = [
    { to: "/dashboard", label: t("nav.home"), icon: Home },
    { to: "/familias", label: t("nav.families"), icon: Map },
    { to: "/perfil", label: t("nav.profile"), icon: User },
  ] as const;

  return (
    <nav aria-label={t("nav.aria")} className="fixed inset-x-0 bottom-0 z-20 h-16 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto grid h-full max-w-md grid-cols-3 md:max-w-2xl">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link to={to} activeOptions={{ exact: to !== "/familias" }}
              className="flex h-full flex-col items-center justify-center gap-1 text-label font-semibold text-ink-faint"
              activeProps={{ className: "!text-primary", "aria-current": "page" }}>
              <Icon className="size-6" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
