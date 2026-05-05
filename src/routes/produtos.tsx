import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { PRODUTOS, comprarProduto, currentUser, useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Gift, Sparkles, ShoppingCart, Wallet } from "lucide-react";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — RecargaJá" },
      { name: "description", content: "Escolha um plano e comece a render." },
    ],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const user = useStore(() => currentUser());
  const navigate = useNavigate();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const handleBuy = (id: string) => {
    const err = comprarProduto(id);
    if (err) {
      setMsg({ ok: false, text: err });
      return;
    }
    setMsg({ ok: true, text: "Produto adquirido com sucesso!" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Produtos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Olá, {user.nome.split(" ")[0]}! Escolha um plano para investir.
            </p>
          </div>
          <Link
            to="/carteira"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-semibold"
          >
            <Wallet className="h-4 w-4" /> Saldo: {user.saldo} MT
          </Link>
        </div>

        {msg && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              msg.ok
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUTOS.map((p) => {
            const isBonus = !!p.bonus;
            const lucro = p.rendimentoTotal - p.preco;
            return (
              <article
                key={p.id}
                className={`relative overflow-hidden rounded-2xl border p-5 shadow-card ${
                  p.destaque
                    ? "border-primary/60 bg-gradient-card"
                    : "border-border bg-gradient-card"
                }`}
              >
                {p.destaque && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-primary px-2.5 py-1 text-[10px] font-bold uppercase text-primary-foreground shadow-glow">
                    <Sparkles className="h-3 w-3" /> Bônus grátis
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-fire text-primary-foreground">
                    {isBonus ? <Gift className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                  </span>
                  <h3 className="text-lg font-bold">{p.nome}</h3>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Preço</dt>
                    <dd className="font-bold">{isBonus ? "Grátis" : `${p.preco} MT`}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Duração</dt>
                    <dd className="font-bold">
                      {p.duracaoDias} {p.duracaoDias === 1 ? "dia" : "dias"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Rendimento total</dt>
                    <dd className="font-bold text-primary">{p.rendimentoTotal} MT</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Lucro</dt>
                    <dd className="font-bold">{isBonus ? `${p.rendimentoTotal} MT` : `${lucro} MT`}</dd>
                  </div>
                </dl>
                <button
                  disabled={isBonus}
                  onClick={() => handleBuy(p.id)}
                  className="mt-5 w-full rounded-xl bg-gradient-primary py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform enabled:hover:scale-[1.02] disabled:opacity-60"
                >
                  {isBonus ? "Recebido no cadastro" : "Comprar"}
                </button>
              </article>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}