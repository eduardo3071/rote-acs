import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LabelCaps } from "@/components/labels";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "RoteACS — Entrar" },
      {
        name: "description",
        content: "Acesse sua conta no RoteACS com o cadastro do Ministério da Saúde.",
      },
      { property: "og:title", content: "RoteACS — Entrar" },
      {
        property: "og:description",
        content: "Acesse sua conta no RoteACS com o cadastro do Ministério da Saúde.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginScreen,
});

function LoginScreen() {
  const navigate = useNavigate({ from: "/login" });

  return (
    <div className="field-surface flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center gap-6 px-8">
        <div className="flex flex-col gap-2">
          <LabelCaps>Acesso</LabelCaps>
          <h1 className="text-display text-ink">Entrar no RoteACS</h1>
          <p className="text-body text-ink-soft">
            Use o cadastro do Ministério da Saúde. A tela completa de login é a
            próxima etapa do app.
          </p>
        </div>
        <Button block size="lg" onClick={() => navigate({ to: "/onboarding" })}>
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
