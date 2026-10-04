import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Check, AlertCircle } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TerritoryBackdrop } from "@/components/TerritoryBackdrop";
import { Input } from "@/components/ui/input";
import { getSession, login } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — RoteACS" },
      { name: "description", content: "Entre com seu código de agente e senha para acessar seu território no RoteACS." },
      { property: "og:title", content: "Entrar — RoteACS" },
      { property: "og:description", content: "Entre com seu código de agente e senha para acessar seu território no RoteACS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginScreen,
});

const schema = z.object({
  agentCode: z.string().trim().min(1, "Digite seu código").max(20, "Código muito longo"),
  password: z.string().min(1, "Digite sua senha").max(80, "Senha muito longa"),
});
type Errors = { agentCode?: string | undefined; password?: string | undefined };

function LoginScreen() {
  const navigate = useNavigate({ from: "/login" });
  const [agentCode, setAgentCode] = useState("ACS001");
  const [password, setPassword] = useState("roteacs2026");
  const [errors, setErrors] = useState<Errors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSession().then((s) => {
      if (s) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    const r = schema.safeParse({ agentCode, password });
    if (!r.success) {
      const f = r.error.flatten().fieldErrors;
      setErrors({ agentCode: f.agentCode?.[0], password: f.password?.[0] });
      return;
    }
    setSubmitting(true);
    const { error } = await login(r.data.agentCode, r.data.password);
    setSubmitting(false);
    if (error) {
      setAuthError(error);
      return;
    }
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
          <Field id="agentCode" label="Código do agente" placeholder="Ex.: ACS001" value={agentCode}
            autoComplete="username" error={errors.agentCode}
            onChange={(v) => { setAgentCode(v); setErrors((s) => ({ ...s, agentCode: undefined })); setAuthError(null); }} />
          <Field id="password" label="Senha" placeholder="Digite sua senha" value={password} type="password"
            autoComplete="current-password" error={errors.password}
            onChange={(v) => { setPassword(v); setErrors((s) => ({ ...s, password: undefined })); setAuthError(null); }} />
        </div>
        <p className="mt-2 text-center text-small text-muted-foreground">
          Credenciais de demonstração carregadas para avaliação.
        </p>

        {authError && (
          <p role="alert" className="mt-4 flex items-center gap-2 text-small text-risk-high">
            <AlertCircle className="size-4 shrink-0" aria-hidden /> {authError}
          </p>
        )}

        <div className="mt-auto pt-8">
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "ENTRANDO…" : "ENTRAR"}
          </PrimaryButton>
          <p className="mt-4 flex items-center justify-center gap-2 text-small font-semibold text-risk-low">
            <Check className="size-4" aria-hidden /> Funciona offline
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, placeholder, value, onChange, error, autoComplete, type }: {
  id: string; label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string | undefined; autoComplete?: string; type?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="label-caps text-muted-foreground">{label}</label>
      <Input
        id={id}
        type={type ?? "text"}
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
