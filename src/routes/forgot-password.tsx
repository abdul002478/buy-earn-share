import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AuthField } from "@/components/AuthField";
import { Mail, Zap, MailCheck, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — RecargaJá" },
      { name: "description", content: "Recupere o acesso à sua conta." },
    ],
  }),
  component: ForgotPage,
});

const schema = z.object({ email: z.string().trim().email("E-mail inválido").max(255) });

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ email });
    if (!r.success) {
      setError(r.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setSent(true);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <div className="animate-float-up rounded-3xl border border-border bg-gradient-card p-7 shadow-card">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Recuperar senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          {sent ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
              <MailCheck className="h-10 w-10 text-primary" />
              <p className="text-sm font-semibold">Verifique seu e-mail</p>
              <p className="text-xs text-muted-foreground">
                Se <span className="font-semibold text-foreground">{email}</span> tiver uma conta,
                você receberá o link em instantes.
              </p>
              <Link
                to="/reset-password"
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Já tenho o código →
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <AuthField
                icon={<Mail className="h-4 w-4" />}
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="voce@email.com"
                error={error}
                autoComplete="email"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                Enviar link de recuperação
              </button>
            </form>
          )}

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}