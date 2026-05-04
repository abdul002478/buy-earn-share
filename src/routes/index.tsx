import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Zap, Smartphone, Gamepad2, Gift, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RecargaJá — Recarregue saldo e compre na hora" },
      {
        name: "description",
        content:
          "Adicione saldo na sua carteira, compre produtos digitais e ganhe bônus convidando amigos.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="animate-float-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Bônus de R$ 10 no primeiro depósito
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Recarregue. Compre.{" "}
              <span className="text-gradient-fire">Convide e ganhe.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Carregue saldo na sua carteira RecargaJá e use para comprar produtos
              digitais em segundos. Indique amigos e ganhe bônus em cada compra.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
              >
                Criar conta grátis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/produtos"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-6 py-3 text-base font-bold hover:bg-secondary"
              >
                Ver produtos
              </Link>
            </div>
          </div>

          {/* Floating wallet card */}
          <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { k: "+50k", v: "Usuários ativos" },
                { k: "1M+", v: "Recargas feitas" },
                { k: "4.9★", v: "Avaliação média" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl border border-border bg-gradient-card p-4 shadow-card"
                >
                  <div className="text-2xl font-extrabold text-gradient-fire">{s.k}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="relative animate-pulse-glow rounded-3xl border border-primary/30 bg-gradient-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Carteira
                </span>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-3 text-4xl font-extrabold tracking-tight">R$ 137,50</div>
              <div className="mt-1 text-xs text-muted-foreground">Saldo disponível</div>
              <div className="mt-5 flex items-center gap-2">
                <Link
                  to="/recarga"
                  className="flex-1 rounded-lg bg-gradient-primary py-2.5 text-center text-sm font-bold text-primary-foreground"
                >
                  Recarregar
                </Link>
                <Link
                  to="/produtos"
                  className="flex-1 rounded-lg border border-border bg-background/50 py-2.5 text-center text-sm font-bold"
                >
                  Comprar
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Zap, title: "Recarga instantânea", desc: "Saldo creditado em segundos via Pix." },
            { icon: Smartphone, title: "Compra fácil", desc: "Pague com saldo da carteira em 1 toque." },
            { icon: Gift, title: "Convide e ganhe", desc: "Bônus por cada amigo que se cadastrar." },
            { icon: ShieldCheck, title: "100% seguro", desc: "Criptografia ponta-a-ponta nas transações." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card transition-transform hover:-translate-y-1"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </span>
              <h3 className="mt-4 text-base font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="mb-20 overflow-hidden rounded-3xl border border-primary/40 bg-gradient-fire p-8 text-primary-foreground shadow-glow md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold md:text-3xl">
                Convide amigos. Ganhe R$ 5 por cadastro.
              </h2>
              <p className="mt-2 max-w-xl opacity-90">
                Cada amigo que entrar com seu link vira saldo na sua carteira — sem limite.
              </p>
            </div>
            <Link
              to="/convide"
              className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-base font-bold text-foreground hover:opacity-90"
            >
              <Gamepad2 className="h-5 w-5" /> Pegar meu link
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
