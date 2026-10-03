import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Check, AlertCircle } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TerritoryBackdrop } from "@/components/TerritoryBackdrop";
import { Input } from "@/components/ui/input";
import { getSession, saveSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — RoteACS" },
      { name: "description", content: "Entre com seu nome e código de agente para acessar seu território no RoteACS." },
      { property: "og:title", content: "Entrar — RoteACS" },
      { property: "og:description", content: "Entre com seu nome e código de agente para acessar seu território no RoteACS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginScreen,
});

const schema = z.object({
  name: z.string().trim().min(1, "Digite seu nome").max(80, "Nome muito longo"),
  agentCode: z.string().trim().min(1, "Digite seu código").max(20, "Código muito longo"),
});
type Errors = { name?: string | undefined; agentCode?: string | undefined };

function LoginScreen() {
  const navigate = useNavigate({ from: "/login" });
  const [name, setName] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (getSession()) navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = schema.safeParse({ name, agentCode });
    if (!r.success) {
      const f = r.error.flatten().fieldErrors;
      setErrors({ name: f.name?.[0], agentCode: f.agentCode?.[0] });
      return;
    }
    saveSession(r.data.name, r.data.agentCode.toUpperCase());
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="field-surface relative flex min-h-screen flex-col overflow-hidden">
      <div className="opacity-60"><TerritoryBackdrop /></div>
      <form
        onSubmit={submit}
        noValidate
        className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-8 pt-16"
      >
        <div className="flex flex-col items-center text-center animate-rise-in">
          <AppLogo glow className="size-24" />
          <h1 className="mt-6 text-title font-bold text-foreground">Bem-vindo ao RoteACS</h1>
          <p className="mt-2 text-body text-muted-foreground">Entre para acessar seu território</p>
        </div>

        <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-4">
          <Field id="name" label="Nome do agente" placeholder="Digite seu nome" value={name}
            autoComplete="name" error={errors.name}
            onChange={(v) => { setName(v); setErrors((s) => ({ ...s, name: undefined })); }} />
          <Field id="agentCode" label="Código do agente" placeholder="Ex.: ACS-001" value={agentCode}
            autoComplete="off" error={errors.agentCode}
            onChange={(v) => { setAgentCode(v); setErrors((s) => ({ ...s, agentCode: undefined })); }} />
        </div>

        <div className="mt-auto pt-8">
          <PrimaryButton type="submit">ENTRAR</PrimaryButton>
          <p className="mt-4 flex items-center justify-center gap-2 text-small font-semibold text-risk-low">
            <Check className="size-4" aria-hidden /> Funciona offline
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, placeholder, value, onChange, error, autoComplete }: {
  id: string; label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string | undefined; autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="label-caps text-muted-foreground">{label}</label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={80}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-14 rounded-lg border-border bg-elevated px-4 text-body text-foreground md:text-body placeholder:text-ink-faint focus-visible:ring-2 focus-visible:ring-primary",
          error && "border-risk-high focus-visible:ring-risk-high",
        )}
      />
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1 text-small text-risk-high">
          <AlertCircle className="size-4" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}
