import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  DEPOSITO_INFO,
  DEPOSITO_MINIMO,
  LEVANTAMENTO_MINIMO,
  TAXA_LEVANTAMENTO,
  creditarRendimentos,
  janelaSaqueAberta,
  currentUser,
  pedirDeposito,
  pedirLevantamento,
  useStore,
} from "@/lib/store";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Copy,
  Sparkles,
  PiggyBank,
} from "lucide-react";

export const Route = createFileRoute("/carteira")({
  head: () => ({
    meta: [
      { title: "Carteira — RecargaJá" },
      { name: "description", content: "Depósitos, levantamentos e seus produtos." },
    ],
  }),
  component: CarteiraPage,
});

type Aba = "deposito" | "levantamento";

function CarteiraPage() {
  const navigate = useNavigate();
  useEffect(() => { creditarRendimentos(); }, []);
  const user = useStore(() => currentUser());
  const [aba, setAba] = useState<Aba>("deposito");

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const tabs: { id: Aba; label: string; icon: React.ReactNode }[] = [
    { id: "deposito", label: "Depósito", icon: <ArrowDownToLine className="h-4 w-4" /> },
    { id: "levantamento", label: "Levantamento", icon: <ArrowUpFromLine className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <header className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Olá, {user.nome.split(" ")[0]}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> Saldo produzido (levantável)
              </div>
              <p className="mt-1 text-2xl font-extrabold text-primary">{Math.floor(user.saldoProduzido ?? 0)} MT</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <PiggyBank className="h-4 w-4" /> Saldo de recarga (apenas compras)
              </div>
              <p className="mt-1 text-2xl font-extrabold">{Math.floor(user.saldoRecarga ?? 0)} MT</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Link to="/produtos" className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow">
              Comprar plano
            </Link>
            <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs">
              <Wallet className="h-4 w-4 text-primary" /> Total: {Math.floor(user.saldo)} MT
            </span>
          </div>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                aba === t.id
                  ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <section className="mt-6 rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
          {aba === "deposito" && <Deposito />}
          {aba === "levantamento" && <Levantamento saldo={Math.floor(user.saldoProduzido ?? 0)} />}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Deposito() {
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<"e-mola" | "mpesa">("e-mola");
  const [numero, setNumero] = useState("");
  const [comprovante, setComprovante] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const info = metodo === "e-mola" ? DEPOSITO_INFO.emola : DEPOSITO_INFO.mpesa;

  return (
    <div>
      <h2 className="text-xl font-bold">Fazer depósito</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Mínimo {DEPOSITO_MINIMO} MT. Envie o valor para o número abaixo, cole a mensagem
        de confirmação e envie. Aprovação manual.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(["e-mola", "mpesa"] as const).map((m) => {
          const i = m === "e-mola" ? DEPOSITO_INFO.emola : DEPOSITO_INFO.mpesa;
          return (
            <button
              key={m}
              onClick={() => setMetodo(m)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                metodo === m ? "border-primary bg-primary/10" : "border-border bg-secondary"
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {m === "e-mola" ? "E-Mola" : "M-Pesa"}
              </p>
              <p className="mt-1 text-lg font-extrabold">{i.numero}</p>
              <p className="text-xs text-muted-foreground">Nome: {i.nome}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-sm">
        <span className="font-mono font-bold">{info.numero}</span>
        <span className="text-muted-foreground">— {info.nome}</span>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(info.numero)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs font-semibold"
        >
          <Copy className="h-3 w-3" /> Copiar
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Valor (MT)" type="number" value={valor} onChange={setValor} />
        <Field
          label="Seu número de envio"
          value={numero}
          onChange={setNumero}
          placeholder="84/85/86…"
        />
      </div>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Cole aqui a mensagem de confirmação
        </span>
        <textarea
          value={comprovante}
          onChange={(e) => setComprovante(e.target.value)}
          placeholder="Ex.: Confirmado. Você transferiu 200,00 MT para Abibo..."
          className="min-h-[90px] w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>

      {msg && (
        <p
          className={`mt-3 text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}
        >
          {msg.text}
        </p>
      )}

      <button
        onClick={() => {
          const v = Number(valor);
          if (!v || !numero || !comprovante.trim()) {
            setMsg({ ok: false, text: "Preencha valor, número e mensagem de confirmação" });
            return;
          }
          const err = pedirDeposito(v, metodo, numero, comprovante.trim());
          if (err) {
            setMsg({ ok: false, text: err });
            return;
          }
          setMsg({ ok: true, text: "Pedido enviado! Aguarde aprovação do admin." });
          setValor("");
          setNumero("");
          setComprovante("");
        }}
        className="mt-5 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow"
      >
        Confirmar depósito
      </button>
    </div>
  );
}

function Levantamento({ saldo }: { saldo: number }) {
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<"e-mola" | "mpesa">("mpesa");
  const [numero, setNumero] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div>
      <h2 className="text-xl font-bold">Pedir levantamento</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Mínimo de <strong>{LEVANTAMENTO_MINIMO} MT</strong>. Aprovação manual pelo admin.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">Saldo atual: {saldo} MT</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          value={metodo}
          onChange={(e) => setMetodo(e.target.value as "e-mola" | "mpesa")}
          className="rounded-xl border border-border bg-input px-3 py-2.5 text-sm"
        >
          <option value="mpesa">M-Pesa</option>
          <option value="e-mola">E-Mola</option>
        </select>
        <Field label="" type="number" value={valor} onChange={setValor} placeholder="Valor (MT)" />
      </div>
      <div className="mt-3">
        <Field
          label="Número que vai receber"
          value={numero}
          onChange={setNumero}
          placeholder="84/85/86…"
        />
      </div>

      {msg && (
        <p className={`mt-3 text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>
          {msg.text}
        </p>
      )}

      <button
        onClick={() => {
          const v = Number(valor);
          if (!v || !numero) {
            setMsg({ ok: false, text: "Preencha valor e número" });
            return;
          }
          const err = pedirLevantamento(v, metodo, numero);
          if (err) {
            setMsg({ ok: false, text: err });
            return;
          }
          setMsg({ ok: true, text: "Pedido enviado! Aguarde aprovação." });
          setValor("");
          setNumero("");
        }}
        className="mt-5 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow"
      >
        Pedir levantamento
      </button>
    </div>
  );
}

function Historico({ userId }: { userId: string }) {
  const txs = useStore(() => getTxs().filter((t) => t.userId === userId).sort((a, b) => b.createdAt - a.createdAt));
  if (txs.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma transação ainda.</p>;
  }
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Histórico de transações</h2>
      <ul className="mt-3 divide-y divide-border">
        {txs.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-semibold capitalize">{t.tipo}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(t.createdAt).toLocaleString("pt-BR")}
                {t.metodo ? ` · ${t.metodo}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">{t.valor} MT</p>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MeusProdutos({ userId }: { userId: string }) {
  const orders = useStore(() => getOrders().filter((o) => o.userId === userId));
  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum produto comprado.{" "}
        <Link to="/produtos" className="font-semibold text-primary hover:underline">
          Ver planos
        </Link>
      </p>
    );
  }
  return (
    <div>
      <h2 className="text-xl font-bold">Meus produtos</h2>
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
              <p className="mt-1 text-[11px] font-bold uppercase">
                {ativo ? "Ativo" : "Encerrado"}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}