import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AuthField } from "@/components/AuthField";
import { Mail, Lock, Zap, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { recuperarSenha } from "@/lib/store";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recuperar senha — RecargaJá" }] }),
  component: ForgotPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
  confirmar: z.string(),
}).refine((d) => d.senha === d.confirmar, { message: "Senhas não coincidem", path: ["confirmar"] });

function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ email, senha, confirmar });
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const i of r.error.issues) { const k = String(i.path[0]); if (!map[k]) map[k] = i.message; }
      setErrors(map); return;
    }
    const err = recuperarSenha(email, senha);
    if (err) { setErrors({ email: err }); return; }
    setErrors({});
    setDone(true);
    setTimeout(() => navigate({ to: "/login" }), 1200);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <div className="animate-float-up rounded-3xl border border-border bg-gradient-card p-7 shadow-card">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Restaurar senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe seu Gmail e a nova senha. A senha será restaurada na hora.
          </p>

          {done ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="text-sm font-semibold">Senha restaurada!</p>
              <p className="text-xs text-muted-foreground">Redirecionando para o login…</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <AuthField icon={<Mail className="h-4 w-4" />} label="Gmail / E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@gmail.com" error={errors.email} autoComplete="email" />
              <AuthField icon={<Lock className="h-4 w-4" />} label="Nova senha" type="password" value={senha} onChange={setSenha} placeholder="Mínimo 6 caracteres" error={errors.senha} autoComplete="new-password" />
              <AuthField icon={<Lock className="h-4 w-4" />} label="Confirmar nova senha" type="password" value={confirmar} onChange={setConfirmar} placeholder="Repita a senha" error={errors.confirmar} autoComplete="new-password" />
              <button type="submit" className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
                Restaurar senha
              </button>
            </form>
          )}

          <Link to="/login" className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao login
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
