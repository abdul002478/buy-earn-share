import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  DEPOSITO_INFO,
  DEPOSITO_MINIMO,
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
  Copy,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

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
    { id: "deposito", label: "Recarregar", icon: <ArrowDownToLine className="h-4 w-4" /> },
    { id: "levantamento", label: "Saquê", icon: <ArrowUpFromLine className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <nav className="flex flex-wrap gap-2">
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
          {aba === "levantamento" && (
            <Levantamento
              saldo={Math.floor(user.saldoProduzido ?? 0)}
              vinc={
                user.contaVincNumero && user.contaVincMetodo
                  ? { metodo: user.contaVincMetodo, numero: user.contaVincNumero, nome: user.contaVincNome ?? "" }
                  : null
              }
            />
          )}
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
  const [nomeNumero, setNomeNumero] = useState("");
  const [comprovante, setComprovante] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const info = metodo === "e-mola" ? DEPOSITO_INFO.emola : DEPOSITO_INFO.mpesa;

  return (
    <div>
      <h2 className="text-xl font-bold">Recarregar</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Mínimo {DEPOSITO_MINIMO} MT. Envie o valor para o número abaixo e cole a mensagem
        de confirmação.
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
      <div className="mt-3">
        <Field
          label="Nome do número que vai pagar"
          value={nomeNumero}
          onChange={setNomeNumero}
          placeholder="Ex: João Silva"
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
          if (!v || !numero || !nomeNumero.trim() || !comprovante.trim()) {
            setMsg({ ok: false, text: "Preencha todos os campos" });
            return;
          }
          const err = pedirDeposito(v, metodo, numero, comprovante.trim(), nomeNumero.trim());
          if (err) {
            setMsg({ ok: false, text: err });
            return;
          }
          setMsg({ ok: true, text: "Pedido enviado! Processamento em até 5h." });
          setValor("");
          setNumero("");
          setNomeNumero("");
          setComprovante("");
        }}
        className="mt-5 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow"
      >
        Confirmar recarga
      </button>
    </div>
  );
}

function Levantamento({
  saldo, vinc,
}: {
  saldo: number;
  vinc: { metodo: "e-mola" | "mpesa"; numero: string; nome: string } | null;
}) {
  const [valor, setValor] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const v = Number(valor) || 0;
  const taxa = Math.floor(v * TAXA_LEVANTAMENTO);
  const liquido = Math.max(0, v - taxa);
  const janela = janelaSaqueAberta();

  return (
    <div>
      <h2 className="text-xl font-bold">Saquê</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Taxa de <strong>10%</strong>. Processamento até 5h.
        Horário: <strong>09:30 às 18:30</strong>.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">Saldo produzido disponível: {saldo} MT</p>
      {!janela && (
        <p className="mt-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Fora do horário de saque (09:30 – 18:30).
        </p>
      )}

      {!vinc ? (
        <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
          Vincule a sua conta de pagamento no <Link to="/perfil" className="font-bold text-primary underline">perfil</Link> para sacar.
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-3 text-xs">
          <p className="font-semibold uppercase text-muted-foreground">Conta vinculada</p>
          <p className="mt-1">{vinc.metodo === "mpesa" ? "M-Pesa" : "E-Mola"} · <span className="font-mono font-bold">{vinc.numero}</span> · {vinc.nome}</p>
        </div>
      )}
      <div className="mt-3">
        <Field label="Valor (MT)" type="number" value={valor} onChange={setValor} placeholder="Valor (MT)" />
      </div>
      {v > 0 && (
        <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3 text-xs">
          <div className="flex justify-between"><span>Taxa (10%)</span><span className="font-bold">{taxa} MT</span></div>
          <div className="mt-1 flex justify-between"><span>Você recebe</span><span className="font-bold text-primary">{liquido} MT</span></div>
        </div>
      )}

      {msg && (
        <p className={`mt-3 text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>
          {msg.text}
        </p>
      )}

      <button
        disabled={!janela || !vinc}
        onClick={() => {
          const v = Number(valor);
          if (!v) {
            setMsg({ ok: false, text: "Preencha o valor" });
            return;
          }
          const err = pedirLevantamento(v);
          if (err) {
            setMsg({ ok: false, text: err });
            return;
          }
          setMsg({ ok: true, text: "Pedido enviado! Processamento em até 5h." });
          setValor("");
        }}
        className="mt-5 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50"
      >
        Pedir saquê
      </button>
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