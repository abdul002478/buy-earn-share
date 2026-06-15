import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { currentUser, getEquipe, getUsers, getOrders, getFundoCompras, PRODUTOS, useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Copy, Users, Gift } from "lucide-react";

export const Route = createFileRoute("/convide")({
  head: () => ({ meta: [{ title: "Convide e ganhe — RecargaJá" }] }),
  component: ConvidePage,
});

function ConvidePage() {
  const user = useStore(() => currentUser());
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  if (!user) return null;

  const equipe = getEquipe(user.refCode);
  const users = getUsers();
  const orders = getOrders();
  const fundos = getFundoCompras();
  const ganhoDe = (telefone: string): number => {
    const inv = users.find((u) => u.telefone === telefone && u.referredBy === user.refCode);
    if (!inv) return 0;
    const compras: { valor: number; quando: number }[] = [];
    for (const o of orders.filter((x) => x.userId === inv.id)) {
      const p = PRODUTOS.find((x) => x.id === o.produtoId);
      if (p && !p.bonus) compras.push({ valor: p.preco, quando: o.compradoEm });
    }
    for (const f of fundos.filter((x) => x.userId === inv.id)) {
      compras.push({ valor: f.valor, quando: f.compradoEm });
    }
    if (compras.length === 0) return 0;
    compras.sort((a, b) => a.quando - b.quando);
    return Math.floor(compras[0].valor * 0.25);
  };
  const link = typeof window !== "undefined"
    ? `${window.location.origin}/cadastro?ref=${user.refCode}`
    : `/cadastro?ref=${user.refCode}`;

  const copiar = () => {
    navigator.clipboard?.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-extrabold">Convide e ganhe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ganhe <strong>25% da primeira compra</strong> de cada amigo que você convidar.
        </p>

        <section className="mt-6 rounded-2xl border border-primary/40 bg-gradient-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Gift className="h-4 w-4 text-primary" /> Seu link de convite
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input readOnly value={link} className="flex-1 rounded-xl border border-border bg-input px-3 py-2.5 text-xs" />
            <button onClick={copiar} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">
              <Copy className="h-4 w-4" /> {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Código: <span className="font-mono font-bold text-foreground">{user.refCode}</span>
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Users className="h-5 w-5 text-primary" /> Minha equipe ({equipe.length})
          </h2>
          {equipe.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Ninguém entrou ainda. Compartilhe seu link!
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {equipe.map((m, i) => {
                const ganho = ganhoDe(m.telefone);
                return (
                  <li key={i} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold">{m.nome}</p>
                      <p className="text-xs text-muted-foreground">{m.telefone}</p>
                    </div>
                    <div className="text-right">
                      {ganho > 0 ? (
                        <p className="font-bold text-primary">+{ganho} MZN</p>
                      ) : (
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Sem investimento</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(m.criadoEm).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
