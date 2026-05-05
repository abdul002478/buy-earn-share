import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AuthField } from "@/components/AuthField";
import { Mail, Lock, User, Zap, Phone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { register } from "@/lib/store";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — RecargaJá" },
      { name: "description", content: "Crie sua conta RecargaJá em segundos." },
    ],
  }),
  component: CadastroPage,
});

const schema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome completo").max(80),
    email: z.string().trim().email("E-mail inválido").max(255),
    telefone: z
      .string()
      .trim()
      .min(10, "Telefone inválido")
      .max(20)
      .regex(/^[0-9()+\-\s]+$/, "Use apenas números"),
    senha: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .regex(/[A-Z]/, "Inclua uma letra maiúscula")
      .regex(/[0-9]/, "Inclua um número"),
    confirmar: z.string(),
    aceite: z.literal(true, { errorMap: () => ({ message: "Você precisa aceitar os termos" }) }),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  });

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmar: "",
    aceite: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const k = String(issue.path[0]);
        if (!map[k]) map[k] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    const r = register({
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      senha: form.senha,
    });
    if (typeof r === "string") {
      setErrors({ email: r });
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/produtos" }), 1200);
  };

  const s = strength(form.senha);
  const strengthLabel = ["Muito fraca", "Fraca", "Média", "Boa", "Forte"][s];
  const strengthColor = ["bg-destructive", "bg-destructive", "bg-accent", "bg-primary-glow", "bg-primary"][s];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-10">
        <div className="animate-float-up rounded-3xl border border-border bg-gradient-card p-7 shadow-card">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Crie sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rápido, grátis e com bônus de boas-vindas.
          </p>

          {done ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="text-sm font-semibold">Conta criada com sucesso!</p>
              <p className="text-xs text-muted-foreground">Redirecionando para o login…</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <AuthField
                icon={<User className="h-4 w-4" />}
                label="Nome completo"
                value={form.nome}
                onChange={(v) => set("nome", v)}
                placeholder="Seu nome"
                error={errors.nome}
                autoComplete="name"
              />
              <AuthField
                icon={<Mail className="h-4 w-4" />}
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                placeholder="voce@email.com"
                error={errors.email}
                autoComplete="email"
              />
              <AuthField
                icon={<Phone className="h-4 w-4" />}
                label="Telefone"
                type="tel"
                value={form.telefone}
                onChange={(v) => set("telefone", v)}
                placeholder="(11) 99999-9999"
                error={errors.telefone}
                autoComplete="tel"
              />
              <div>
                <AuthField
                  icon={<Lock className="h-4 w-4" />}
                  label="Senha"
                  type="password"
                  value={form.senha}
                  onChange={(v) => set("senha", v)}
                  placeholder="Mínimo 8 caracteres"
                  error={errors.senha}
                  autoComplete="new-password"
                />
                {form.senha && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-1.5 flex-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={`flex-1 rounded-full ${i < s ? strengthColor : "bg-border"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>
              <AuthField
                icon={<Lock className="h-4 w-4" />}
                label="Confirmar senha"
                type="password"
                value={form.confirmar}
                onChange={(v) => set("confirmar", v)}
                placeholder="Repita a senha"
                error={errors.confirmar}
                autoComplete="new-password"
              />

              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.aceite}
                  onChange={(e) => set("aceite", e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[var(--primary)]"
                />
                <span>
                  Li e aceito os{" "}
                  <a href="#" className="font-semibold text-primary hover:underline">
                    termos de uso
                  </a>{" "}
                  e a{" "}
                  <a href="#" className="font-semibold text-primary hover:underline">
                    política de privacidade
                  </a>
                  .
                </span>
              </label>
              {errors.aceite && (
                <p className="-mt-2 text-xs font-medium text-destructive">{errors.aceite}</p>
              )}

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                Criar conta
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
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