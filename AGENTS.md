<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# RoteACS

## Shared template components

Files under `src/components/ui/` come from the shadcn template and are imported by sibling components (`pagination.tsx` imports `ButtonProps`; `form.tsx`, `sidebar.tsx`, `calendar.tsx` and `carousel.tsx` pass `ref` to `Button` and `Label`). Extend such a file in place when RoteACS needs new looks — keep its exported names, its `forwardRef` signature and its existing variant/size keys, adding new ones alongside — and put RoteACS-specific components with no shadcn counterpart outside `ui/` (e.g. `src/components/RiskBadge.tsx`, `src/components/labels.tsx`). Replacing one of these files with a fresh implementation silently breaks the components that import it, while the new screen itself still looks fine.

## Design tokens

All colors, type sizes, spacing and radii are semantic tokens defined in `src/styles.css`; components reference them through Tailwind utilities or shadcn variants and never hardcode a hex or an arbitrary color class. New screens import the same tokens rather than restating any value, so the FASE 1 identity stays the single source of truth.
