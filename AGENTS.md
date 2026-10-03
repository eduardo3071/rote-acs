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

---
name: shadcn ui files are shared template files
description: Extend src/components/ui shadcn files in place instead of replacing them, because other template components import their exact exports
type: constraint
---
Files under `src/components/ui/` come from the shadcn template and are imported by sibling components (`pagination.tsx` imports `ButtonProps`, `form.tsx`/`sidebar.tsx`/`calendar.tsx`/`carousel.tsx` pass `ref` to `Button` and `Label`).

Rule: when a RoteACS base component overlaps an existing `ui/` file, extend that file in place — keep its exported names, its `forwardRef` signature and its existing variant/size keys, adding new ones alongside. Never overwrite it with a fresh implementation, and never add a second button-like component to avoid editing it.

Why: overwriting `ui/button.tsx` or `ui/label.tsx` with a custom version silently broke seven unrelated template components (typecheck failures on `ref` and on the missing `ButtonProps` export) while the new screen itself still looked fine.

RoteACS-specific components that have no shadcn counterpart live outside `ui/` (e.g. `src/components/RiskBadge.tsx`, `src/components/labels.tsx`).
