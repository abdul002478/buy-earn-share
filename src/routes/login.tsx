import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AuthField } from "@/components/AuthField";
import { Mail, Lock, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { login, currentUser, useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — RecargaJá" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const user = useStore(() => currentUser());

  useEffect(() => { if (user) navigate({ to: user.isAdmin ? "/admin" : "/" }); }, [user, navigate]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <div className="animate-float-up rounded-3xl border border-border bg-gradient-card p-7 shadow-card">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Bem-vindo de volta</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const u = login(email, senha);
              if (!u) { setErro("E-mail ou senha incorretos"); return; }
              setErro("");
              navigate({ to: u.isAdmin ? "/admin" : "/" });
            }}
            className="mt-6 space-y-4"
          >
            <AuthField icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@email.com" autoComplete="email" />
            <AuthField icon={<Lock className="h-4 w-4" />} label="Senha" type="password" value={senha} onChange={setSenha} placeholder="••••••••" autoComplete="current-password" />
            {erro && <p className="text-xs font-medium text-destructive">{erro}</p>}

            <div className="flex items-center justify-end text-xs">
              <Link to="/forgot-password" className="font-semibold text-primary hover:underline">Esqueci a senha</Link>
            </div>

            <button type="submit" className="mt-2 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
              Entrar
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta? <Link to="/cadastro" className="font-semibold text-primary hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
