import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  PRODUTOS, comprarProduto, currentUser, useStore,
  freebieJanelaAberta, freebieRestantesHoje, pegarFreebie,
} from "@/lib/store";
import { useEffect, useState } from "react";
import { ShoppingCart, Wallet, Gift } from "lucide-react";

export const Route = createFileRoute("/produtos")({
  head: () => ({ meta: [{ title: "Produtos VIP — RecargaJá" }] }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const user = useStore(() => currentUser());
  const navigate = useNavigate();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  if (!user) return null;

  const vips = PRODUTOS.filter((p) => p.vip);
  const free = PRODUTOS.find((p) => p.id === "free")!;
  const freebieDisponivel = freebieJanelaAberta() && freebieRestantesHoje() > 0 && !user.recebeuFreebie;

  const buy = (id: string) => {
    const err = comprarProduto(id);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: "Produto adquirido!" });
  };
  const onFree = () => {
    const err = pegarFreebie();
    setMsg(err ? { ok: false, text: err } : { ok: true, text: "Oferta grátis adquirida!" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">Produtos VIP</h1>
            <p className="mt-1 text-sm text-muted-foreground">Escolha um plano de VIP 1 a VIP 10.</p>
          </div>
          <Link to="/carteira" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-semibold">
            <Wallet className="h-4 w-4" /> {user.saldo} MT
          </Link>
        </div>

        {msg && (
          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${msg.ok ? "border-primary/40 bg-primary/10 text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
            {msg.text}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
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
                Comprar
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
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nível {p.vip}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><dt className="text-muted-foreground">Preço</dt><dd className="font-bold">{p.preco} MT</dd></div>
                <div><dt className="text-muted-foreground">Dias</dt><dd className="font-bold">{p.duracaoDias}</dd></div>
                <div><dt className="text-muted-foreground">/dia</dt><dd className="font-bold text-primary">{p.rendimentoDiario} MT</dd></div>
                <div><dt className="text-muted-foreground">Total</dt><dd className="font-bold text-primary">{p.rendimentoTotal} MT</dd></div>
              </dl>
              <button onClick={() => buy(p.id)} className="mt-3 w-full rounded-xl bg-gradient-primary py-2 text-xs font-bold text-primary-foreground shadow-glow">
                Comprar
              </button>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
