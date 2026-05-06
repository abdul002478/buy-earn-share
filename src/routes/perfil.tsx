import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  currentUser, logout, trocarSenha, useStore,
  getOrders, getTxs, PRODUTOS, creditarRendimentos,
} from "@/lib/store";
import { useEffect, useState } from "react";
import {
  LogOut, User as UserIcon, KeyRound, Mail, Phone, Calendar,
  ChevronRight, Sparkles, PiggyBank, History, Package,
} from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — RecargaJá" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  useEffect(() => { creditarRendimentos(); }, []);
  const user = useStore(() => currentUser());
  const navigate = useNavigate();
  const [view, setView] = useState<"main" | "senha" | "historico" | "produtos">("main");
  const [antiga, setAntiga] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  if (!user) return null;

  const sair = () => { logout(); navigate({ to: "/login" }); };

  const trocar = (e: React.FormEvent) => {
    e.preventDefault();
    if (nova !== confirmar) { setMsg({ ok: false, text: "Senhas não coincidem" }); return; }
    const err = trocarSenha(antiga, nova);
    if (err) { setMsg({ ok: false, text: err }); return; }
    setMsg({ ok: true, text: "Senha alterada com sucesso!" });
    setAntiga(""); setNova(""); setConfirmar("");
  };

  const txs = getTxs().filter((t) => t.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  const orders = getOrders().filter((o) => o.userId === user.id);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <header className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <UserIcon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold">{user.nome}</h1>
              <p className="text-xs text-muted-foreground">Código: <span className="font-mono">{user.refCode}</span></p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> Saldo produzido
              </div>
              <p className="mt-1 text-2xl font-extrabold text-primary">{Math.floor(user.saldoProduzido ?? 0)} MT</p>
              <p className="text-[10px] text-muted-foreground">Pode ser levantado</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <PiggyBank className="h-4 w-4" /> Saldo de recarga
              </div>
              <p className="mt-1 text-2xl font-extrabold">{Math.floor(user.saldoRecarga ?? 0)} MT</p>
              <p className="text-[10px] text-muted-foreground">Apenas para compras</p>
            </div>
          </div>
        </header>

        {view === "main" && (
          <>
        <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
          <h2 className="text-lg font-bold">Meus dados</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            <Linha icon={<Mail className="h-4 w-4" />} label="E-mail" value={user.email} />
            <Linha icon={<Phone className="h-4 w-4" />} label="Telefone" value={user.telefone} />
            <Linha icon={<Calendar className="h-4 w-4" />} label="Conta criada em"
                   value={new Date(user.criadoEm).toLocaleString("pt-BR")} />
          </ul>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card">
          <OptionRow icon={<Package className="h-5 w-5 text-primary" />} label="Meus produtos"
                     onClick={() => setView("produtos")} />
          <OptionRow icon={<History className="h-5 w-5 text-primary" />} label="Histórico de transações"
                     onClick={() => setView("historico")} />
          <OptionRow icon={<KeyRound className="h-5 w-5 text-primary" />} label="Trocar palavra-passe"
                     onClick={() => setView("senha")} />
        </section>

        <button onClick={sair} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
          <LogOut className="h-4 w-4" /> Sair da conta
        </button>
          </>
        )}

        {view === "senha" && (
          <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <button onClick={() => setView("main")} className="mb-3 text-xs font-semibold text-muted-foreground">← Voltar</button>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <KeyRound className="h-5 w-5 text-primary" /> Trocar senha
            </h2>
            <form onSubmit={trocar} className="mt-4 grid gap-3">
              <Field label="Senha atual" type="password" value={antiga} onChange={setAntiga} />
              <Field label="Nova senha" type="password" value={nova} onChange={setNova} />
              <Field label="Confirmar nova senha" type="password" value={confirmar} onChange={setConfirmar} />
              {msg && <p className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
              <button className="rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow">
                Salvar nova senha
              </button>
            </form>
          </section>
        )}

        {view === "historico" && (
          <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <button onClick={() => setView("main")} className="mb-3 text-xs font-semibold text-muted-foreground">← Voltar</button>
            <h2 className="text-lg font-bold">Histórico de transações</h2>
            {txs.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma transação ainda.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {txs.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold capitalize">{t.tipo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleString("pt-BR")}{t.metodo ? ` · ${t.metodo}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{t.valor} MT</p>
                      <span className={`text-[10px] font-bold uppercase ${
                        t.status === "aprovado" ? "text-primary" :
                        t.status === "negado" ? "text-destructive" : "text-accent-foreground"
                      }`}>{t.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {view === "produtos" && (
          <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <button onClick={() => setView("main")} className="mb-3 text-xs font-semibold text-muted-foreground">← Voltar</button>
            <h2 className="text-lg font-bold">Meus produtos</h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum produto comprado.{" "}
                <Link to="/produtos" className="font-semibold text-primary hover:underline">Ver planos</Link>
              </p>
            ) : (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {orders.map((o) => {
                  const p = PRODUTOS.find((x) => x.id === o.produtoId);
                  if (!p) return null;
                  const ativo = o.expiraEm > Date.now();
                  return (
                    <li key={o.id} className="rounded-xl border border-border bg-secondary p-4">
                      <p className="font-bold">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Comprado em {new Date(o.compradoEm).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="mt-1 text-xs">
                        Rendimento: <span className="font-bold text-primary">{p.rendimentoTotal} MT</span>
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase">{ativo ? "Ativo" : "Encerrado"}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Linha({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between py-3">
      <span className="flex items-center gap-2 text-muted-foreground">{icon}{label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}

function OptionRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 border-b border-border px-5 py-4 text-left last:border-b-0 hover:bg-secondary/40">
      <span className="flex items-center gap-3 text-sm font-semibold">{icon}{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
             className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}
