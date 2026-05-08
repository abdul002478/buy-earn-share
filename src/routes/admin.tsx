import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  adminAprovarTx,
  adminEditarSaldo,
  adminNegarTx,
  currentUser,
  getTxs,
  getUsers,
  logout,
  useStore,
} from "@/lib/store";
import { useEffect, useState } from "react";
import { Check, X, ShieldCheck, LogOut, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — RecargaJá" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const user = useStore(() => currentUser());
  const txs = useStore(() => getTxs().sort((a, b) => b.createdAt - a.createdAt));
  const users = useStore(() => getUsers().filter((u) => !u.isAdmin));
  const [showSenhas, setShowSenhas] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (!user.isAdmin) navigate({ to: "/carteira" });
  }, [user, navigate]);

  if (!user || !user.isAdmin) return null;

  const pendentes = txs.filter((t) => t.status === "pendente");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-primary/40 bg-gradient-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold">Painel Admin</h1>
              <p className="text-xs text-muted-foreground">
                Aprovar/negar transações, ver dados e editar saldos.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </header>

        <section className="mt-6 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
          <h2 className="text-lg font-bold">
            Transações pendentes{" "}
            <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
              {pendentes.length}
            </span>
          </h2>
          {pendentes.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Sem pendências 🎉</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {pendentes.map((t) => {
                const u = users.find((x) => x.id === t.userId);
                return (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-semibold capitalize">
                        {t.tipo} · {t.valor} MT
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u?.nome} ({u?.email}) · {t.metodo} · nº {t.numeroOrigem}
                        {t.nomePagamento ? ` · ${t.nomePagamento}` : ""} ·{" "}
                        {new Date(t.createdAt).toLocaleString("pt-BR")}
                        {t.tipo === "levantamento" && t.taxa !== undefined && (
                          <> · taxa {t.taxa} MT · líquido {t.liquido} MT</>
                        )}
                      </p>
                      {t.comprovante && (
                        <pre className="mt-1 max-w-xl whitespace-pre-wrap rounded-md border border-border bg-secondary/40 p-2 text-[11px] text-muted-foreground">{t.comprovante}</pre>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => adminAprovarTx(t.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                      >
                        <Check className="h-3.5 w-3.5" /> Aprovar
                      </button>
                      <button
                        onClick={() => adminNegarTx(t.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
                      >
                        <X className="h-3.5 w-3.5" /> Negar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Usuários ({users.length})</h2>
            <button
              onClick={() => setShowSenhas((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
            >
              {showSenhas ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showSenhas ? "Ocultar senhas" : "Ver senhas"}
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2">Nome</th>
                  <th>Gmail / E-mail</th>
                  <th>Telefone</th>
                  <th>Senha</th>
                  <th>Saldo (MT)</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/60">
                    <td className="py-2 font-semibold">{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{u.telefone}</td>
                    <td className="font-mono">{showSenhas ? u.senha : "••••••••"}</td>
                    <td>
                      <input
                        type="number"
                        defaultValue={u.saldo}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v)) adminEditarSaldo(u.id, v);
                        }}
                        className="w-28 rounded-lg border border-border bg-input px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      Sem usuários cadastrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
          <h2 className="text-lg font-bold">Todas as transações</h2>
          <ul className="mt-3 divide-y divide-border">
            {txs.slice(0, 50).map((t) => {
              const u = users.find((x) => x.id === t.userId);
              return (
                <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-semibold capitalize">
                      {t.tipo} · {t.valor} MT
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {u?.email ?? t.userId} · {new Date(t.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      t.status === "aprovado"
                        ? "text-primary"
                        : t.status === "negado"
                          ? "text-destructive"
                          : "text-accent-foreground"
                    }`}
                  >
                    {t.status}
                  </span>
                </li>
              );
            })}
            {txs.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Sem transações ainda.
              </li>
            )}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}