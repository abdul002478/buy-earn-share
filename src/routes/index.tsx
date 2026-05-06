import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  Gift, ShoppingCart, ArrowRight, CalendarCheck, Wallet,
  TrendingUp, Sparkles, Clock,
} from "lucide-react";
import {
  PRODUTOS, calcularRendimento, comprarProduto, currentUser,
  fazerCheckIn, freebieJanelaAberta, freebieRestantesHoje,
  pegarFreebie, podeCheckIn, useStore,
} from "@/lib/store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RecargaJá — Recarregue, invista e ganhe" },
      { name: "description", content: "Planos VIP, oferta grátis diária, check-in e bônus por convite." },
    ],
  }),
  component: Index,
});

function Index() {
  const user = useStore(() => currentUser());
  const navigate = useNavigate();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const vips = PRODUTOS.filter((p) => p.vip);
  const free = PRODUTOS.find((p) => p.id === "free")!;
  const rendimento = user ? calcularRendimento(user.id) : { total: 0, futuro: 0, hoje: 0 };

  const onBuy = (id: string) => {
    if (!user) { navigate({ to: "/cadastro" }); return; }
    const err = comprarProduto(id);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: "Produto adquirido!" });
  };

  const onFree = () => {
    if (!user) { navigate({ to: "/cadastro" }); return; }
    const err = pegarFreebie();
    setMsg(err ? { ok: false, text: err } : { ok: true, text: "Oferta grátis adicionada aos seus produtos!" });
  };

  const onCheckin = () => {
    const r = fazerCheckIn();
    setMsg(r.ok ? { ok: true, text: `Check-in! +${r.valor} MT` } : { ok: false, text: r.msg ?? "Erro" });
  };

  const janelaOk = freebieJanelaAberta();
  const restantes = freebieRestantesHoje();
  const freebieDisponivel = janelaOk && restantes > 0 && !user?.recebeuFreebie;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4">
        {/* Hero / Dashboard */}
        {user ? (
          <section className="pt-6 pb-8">
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Olá, {user.nome.split(" ")[0]}</p>
                  <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold">
                    <Wallet className="h-7 w-7 text-primary" /> {user.saldo} MT
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/carteira" className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow">Depositar / Levantar</Link>
                  <button
                    onClick={onCheckin}
                    disabled={!podeCheckIn()}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary disabled:opacity-50"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    {podeCheckIn() ? "Check-in diário" : "Check-in feito"}
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Stat icon={<TrendingUp className="h-4 w-4" />} label="Rendimento total ganho" value={`${rendimento.total} MT`} />
                <Stat icon={<Sparkles className="h-4 w-4" />} label="A render (futuro)" value={`${rendimento.futuro} MT`} />
                <Stat icon={<Clock className="h-4 w-4" />} label="Renda de hoje" value={`${rendimento.hoje} MT`} />
              </div>
            </div>
          </section>
        ) : (
          <section className="pt-12 pb-8">
            <div className="animate-float-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Planos VIP 1 a 10
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                Invista. <span className="text-gradient-fire">Renda todo dia.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                Planos VIP 1 a 10, check-in diário e bônus de 25% por amigo convidado.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/cadastro" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-glow">
                  Criar conta grátis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-6 py-3 text-base font-bold">
                  Entrar
                </Link>
              </div>
            </div>
          </section>
        )}

        {msg && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.ok ? "border-primary/40 bg-primary/10 text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
            {msg.text}
          </div>
        )}

        {/* Produtos VIP — 2 por linha */}
        <section className="pb-16">
          <h2 className="mb-4 text-xl font-extrabold">Produtos VIP</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {freebieDisponivel && (
              <article className="rounded-2xl border border-primary/40 bg-gradient-fire p-4 text-primary-foreground shadow-glow">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-background/20">
                    <Gift className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold">{free.nome}</h3>
                    <p className="text-[10px] uppercase tracking-wider opacity-90">Disponível agora</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><dt className="opacity-80">Preço</dt><dd className="font-bold">{free.preco} MT</dd></div>
                  <div><dt className="opacity-80">Dias</dt><dd className="font-bold">{free.duracaoDias}</dd></div>
                  <div><dt className="opacity-80">/dia</dt><dd className="font-bold">{free.rendimentoDiario} MT</dd></div>
                  <div><dt className="opacity-80">Total</dt><dd className="font-bold">{free.rendimentoTotal} MT</dd></div>
                </dl>
                <button onClick={onFree} className="mt-3 w-full rounded-xl bg-background py-2 text-xs font-bold text-foreground">
                  Comprar grátis
                </button>
              </article>
            )}
            {vips.map((p) => (
              <article key={p.id} className="rounded-2xl border border-border bg-gradient-card p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-fire text-primary-foreground">
                    <ShoppingCart className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold">{p.nome}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plano nível {p.vip}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><dt className="text-muted-foreground">Preço</dt><dd className="font-bold">{p.preco} MT</dd></div>
                  <div><dt className="text-muted-foreground">Dias</dt><dd className="font-bold">{p.duracaoDias}</dd></div>
                  <div><dt className="text-muted-foreground">/dia</dt><dd className="font-bold text-primary">{p.rendimentoDiario} MT</dd></div>
                  <div><dt className="text-muted-foreground">Total</dt><dd className="font-bold text-primary">{p.rendimentoTotal} MT</dd></div>
                </dl>
                <button
                  onClick={() => onBuy(p.id)}
                  className="mt-3 w-full rounded-xl bg-gradient-primary py-2 text-xs font-bold text-primary-foreground shadow-glow"
                >
                  Comprar
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-xl font-extrabold text-gradient-fire">{value}</div>
    </div>
  );
}
