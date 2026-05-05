import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
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
            <Field icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@email.com" />
            <Field icon={<Lock className="h-4 w-4" />} label="Senha" type="password" value={senha} onChange={setSenha} placeholder="••••••••" />
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

function Field({ icon, label, type, value, onChange, placeholder }: { icon: React.ReactNode; label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
        <span className="text-muted-foreground">{icon}</span>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" required />
      </div>
    </label>
  );
}
