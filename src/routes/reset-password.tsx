import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AuthField } from "@/components/AuthField";
import { Lock, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — RecargaJá" },
      { name: "description", content: "Crie uma nova senha." },
    ],
  }),
  component: ResetPage,
});

const schema = z
  .object({
    senha: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Z]/, "Inclua uma letra maiúscula")
      .regex(/[0-9]/, "Inclua um número"),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });

function ResetPage() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ senha, confirmar });
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const i of r.error.issues) {
        const k = String(i.path[0]);
        if (!map[k]) map[k] = i.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    setDone(true);
    setTimeout(() => navigate({ to: "/login" }), 1600);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <div className="animate-float-up rounded-3xl border border-border bg-gradient-card p-7 shadow-card">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Nova senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma senha forte para proteger sua conta.
          </p>

          {done ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="text-sm font-semibold">Senha alterada!</p>
              <p className="text-xs text-muted-foreground">Redirecionando para o login…</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <AuthField
                icon={<Lock className="h-4 w-4" />}
                label="Nova senha"
                type="password"
                value={senha}
                onChange={setSenha}
                placeholder="Mínimo 8 caracteres"
                error={errors.senha}
                autoComplete="new-password"
              />
              <AuthField
                icon={<Lock className="h-4 w-4" />}
                label="Confirmar nova senha"
                type="password"
                value={confirmar}
                onChange={setConfirmar}
                placeholder="Repita a senha"
                error={errors.confirmar}
                autoComplete="new-password"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                Salvar nova senha
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Lembrou a senha?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}