import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AuthField } from "@/components/AuthField";
import { Mail, Lock, User, Zap, Phone, CheckCircle2, Gift } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { register, currentUser, useStore } from "@/lib/store";
import { useEffect } from "react";

export const Route = createFileRoute("/cadastro")({
  validateSearch: (s: Record<string, unknown>) => ({ ref: typeof s.ref === "string" ? s.ref : undefined }),
  head: () => ({ meta: [{ title: "Criar conta — RecargaJá" }] }),
  component: CadastroPage,
});

const schema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome").max(80),
    email: z.string().trim().email("E-mail inválido").max(255),
    telefone: z
      .string()
      .trim()
      .regex(/^8[2-7][0-9]{7}$/, "Número MZ inválido (ex: 84xxxxxxx)"),
    senha: z.string().min(8, "Mínimo 8 caracteres").regex(/[A-Z]/, "Inclua maiúscula").regex(/[0-9]/, "Inclua número"),
    confirmar: z.string(),
    aceite: z.literal(true, { errorMap: () => ({ message: "Aceite os termos" }) }),
  })
  .refine((d) => d.senha === d.confirmar, { message: "Senhas não coincidem", path: ["confirmar"] });

function CadastroPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/cadastro" });
  const user = useStore(() => currentUser());
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "", confirmar: "", aceite: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
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
    const result = register({
      nome: form.nome, email: form.email, telefone: "+258 " + form.telefone,
      senha: form.senha, ref: search.ref,
    });
    if (typeof result === "string") { setErrors({ email: result }); return; }
    setDone(true);
    setTimeout(() => navigate({ to: "/" }), 900);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-8">
        <div className="animate-float-up rounded-3xl border border-border bg-gradient-card p-7 shadow-card">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Crie sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Rápido e grátis.</p>

          {search.ref && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Gift className="h-3.5 w-3.5" /> Convite: <strong>{search.ref}</strong>
            </div>
          )}

          {done ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="text-sm font-semibold">Conta criada!</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <AuthField icon={<User className="h-4 w-4" />} label="Nome completo" value={form.nome} onChange={(v) => set("nome", v)} placeholder="Seu nome" error={errors.nome} autoComplete="name" />
              <AuthField icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="voce@email.com" error={errors.email} autoComplete="email" />
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Telefone (Moçambique)</span>
                <div className={`flex items-center gap-2 rounded-xl border bg-input px-3 py-2.5 ${errors.telefone ? "border-destructive" : "border-border focus-within:border-primary"}`}>
                  <span className="text-muted-foreground"><Phone className="h-4 w-4" /></span>
                  <span className="text-sm font-semibold text-muted-foreground">+258</span>
                  <input
                    inputMode="numeric" maxLength={9}
                    value={form.telefone}
                    onChange={(e) => set("telefone", e.target.value.replace(/\D/g, ""))}
                    placeholder="84xxxxxxx"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    autoComplete="tel-national"
                  />
                </div>
                {errors.telefone && <p className="mt-1 text-xs font-medium text-destructive">{errors.telefone}</p>}
              </div>
              <AuthField icon={<Lock className="h-4 w-4" />} label="Senha" type="password" value={form.senha} onChange={(v) => set("senha", v)} placeholder="Mínimo 8 caracteres" error={errors.senha} autoComplete="new-password" />
              <AuthField icon={<Lock className="h-4 w-4" />} label="Confirmar senha" type="password" value={form.confirmar} onChange={(v) => set("confirmar", v)} placeholder="Repita a senha" error={errors.confirmar} autoComplete="new-password" />

              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={form.aceite} onChange={(e) => set("aceite", e.target.checked)} className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]" />
                <span>Aceito os <a href="#" className="font-semibold text-primary hover:underline">termos de uso</a>.</span>
              </label>
              {errors.aceite && <p className="-mt-2 text-xs font-medium text-destructive">{errors.aceite}</p>}

              <button type="submit" className="mt-2 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
                Criar conta
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="font-semibold text-primary hover:underline">Entrar</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
