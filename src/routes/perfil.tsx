import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  currentUser, logout, trocarSenha, useStore,
  getOrders, getTxs, PRODUTOS, creditarRendimentos,
  getVipNivel, salvarFotoPerfil, calcularRendimento, vincularConta,
  FUNDOS, comprarFundo, creditarFundos, getFundoCompras,
  getVipNiveis,
  girarRoleta, getRoletaSpins, ROLETA_SEGMENTOS,
} from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import {
  LogOut, User as UserIcon, KeyRound, Mail, Phone, Calendar,
  Sparkles, PiggyBank, History, Package, Smartphone, Dice5, Gem, Camera, Lock,
  TrendingUp, Clock, Link as LinkIcon, Headphones, MessageCircle, Send, Eye, EyeOff,
  MoreVertical,
} from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — RecargaJá" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  useEffect(() => { creditarRendimentos(); creditarFundos(); }, []);
  const user = useStore(() => currentUser());
  const navigate = useNavigate();
  const [view, setView] = useState<"main" | "senha" | "historico" | "produtos" | "vincular" | "fundos" | "fundosHist" | "roleta" | "roletaHist">("main");
  const [suporteOpen, setSuporteOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [antiga, setAntiga] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  if (!user) return null;
  const vip = getVipNivel(user.id);
  const vipNiveis = getVipNiveis(user.id);

  const onPickFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => salvarFotoPerfil(String(r.result));
    r.readAsDataURL(f);
  };

  const sair = () => { logout(); navigate({ to: "/login" }); };

  const trocar = (e: React.FormEvent) => {
    e.preventDefault();
    if (nova !== confirmar) { setMsg({ ok: false, text: "Senhas não coincidem" }); return; }
    const err = trocarSenha(antiga, nova);
    if (err) { setMsg({ ok: false, text: err }); return; }
    setMsg({ ok: true, text: "Senha alterada com sucesso!" });
    setAntiga(""); setNova(""); setConfirmar("");
  };

  const orders = getOrders().filter((o) => o.userId === user.id);
  const rendimento = calcularRendimento(user.id);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {view === "main" && (
        <header className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow"
              aria-label="Trocar foto"
            >
              {user.fotoUrl ? (
                <img src={user.fotoUrl} alt="Foto" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-7 w-7" />
              )}
              <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-tl-lg bg-background/90 text-primary">
                <Camera className="h-3 w-3" />
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFoto} />
            <div>
              <h1 className="flex items-center gap-2 text-xl font-extrabold">
                <span className="rounded-md bg-gradient-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {vipNiveis.length > 0 ? `VIP ${vipNiveis.join(",")}` : `VIP ${vip}`}
                </span>
                {user.nome}
              </h1>
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
        )}

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

        <section className="mt-5 grid grid-cols-4 gap-2">
          <SquareOption icon={<Package className="h-4 w-4" />} label="Meus produtos" onClick={() => setView("produtos")} />
          <SquareOption icon={<History className="h-4 w-4" />} label="Histórico" onClick={() => setView("historico")} />
          <SquareOption icon={<KeyRound className="h-4 w-4" />} label="Trocar senha" onClick={() => setView("senha")} />
          <SquareOption icon={<LinkIcon className="h-4 w-4" />} label="Vincular conta" onClick={() => setView("vincular")} />
          <SquareOption icon={<Headphones className="h-4 w-4" />} label="Linha do cliente" onClick={() => setSuporteOpen(true)} />
          <SquareOption icon={<Smartphone className="h-4 w-4" />} label="Aplicativo" sub="Em breve" disabled />
          <SquareOption icon={<Dice5 className="h-4 w-4" />} label="Roleta" onClick={() => setView("roleta")} />
          <SquareOption icon={<Gem className="h-4 w-4" />} label="Fundo" onClick={() => setView("fundos")} />
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
          <HistoricoPlataformaView onBack={() => setView("main")} />
        )}

        {view === "produtos" && (
          <ProdutosView onBack={() => setView("main")} orders={orders} rendimento={rendimento} />
        )}

        {view === "vincular" && (
          <VincularContaView onBack={() => setView("main")} user={user} />
        )}

        {view === "fundos" && (
          <FundosView
            onBack={() => setView("main")}
            onHist={() => setView("fundosHist")}
            userId={user.id}
          />
        )}

        {view === "fundosHist" && (
          <FundosHistView onBack={() => setView("fundos")} userId={user.id} />
        )}

        {view === "roleta" && (
          <RoletaView onBack={() => setView("main")} onHist={() => setView("roletaHist")} userId={user.id} />
        )}

        {view === "roletaHist" && (
          <RoletaHistView onBack={() => setView("roleta")} userId={user.id} />
        )}
      </main>
      <SiteFooter />
      {suporteOpen && (
        <div
          onClick={() => setSuporteOpen(false)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-gradient-card p-5 shadow-card"
          >
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Headphones className="h-5 w-5 text-primary" /> Linha do cliente
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Fale conosco a qualquer momento.</p>
            <div className="mt-4 grid gap-2">
              <a
                href="https://wa.me/258858601038"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary p-3 text-sm font-bold hover:border-primary/40"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                  <MessageCircle className="h-4 w-4" />
                </span>
                WhatsApp (atendimento)
              </a>
              <a
                href="https://chat.whatsapp.com/LNoznGUnplRF9aVBlQrc3V?mode=gi_t"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary p-3 text-sm font-bold hover:border-primary/40"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                  <MessageCircle className="h-4 w-4" />
                </span>
                Grupo no WhatsApp
              </a>
              <button
                disabled
                className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3 text-sm font-bold opacity-60"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Send className="h-4 w-4" />
                </span>
                Telegram (em breve)
              </button>
            </div>
            <button
              onClick={() => setSuporteOpen(false)}
              className="mt-4 w-full rounded-xl border border-border bg-secondary py-2 text-sm font-bold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VincularContaView({
  onBack, user,
}: {
  onBack: () => void;
  user: ReturnType<typeof currentUser> & object;
}) {
  const [metodo, setMetodo] = useState<"e-mola" | "mpesa">(user.contaVincMetodo ?? "mpesa");
  const [numero, setNumero] = useState(user.contaVincNumero ?? "");
  const [nome, setNome] = useState(user.contaVincNome ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
      <button onClick={onBack} className="mb-3 text-xs font-semibold text-muted-foreground">← Voltar</button>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <LinkIcon className="h-5 w-5 text-primary" /> Vincular conta de saquê
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Os saques serão enviados sempre para esta conta.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const err = vincularConta(metodo, numero, nome);
          setMsg(err ? { ok: false, text: err } : { ok: true, text: "Conta vinculada!" });
        }}
        className="mt-4 grid gap-3"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Método</span>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as "e-mola" | "mpesa")}
            className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm"
          >
            <option value="mpesa">M-Pesa</option>
            <option value="e-mola">E-Mola</option>
          </select>
        </label>
        <Field label="Número (sem +258)" value={numero} onChange={(v) => setNumero(v.replace(/\D/g, ""))} />
        <Field label="Nome do titular" value={nome} onChange={setNome} />
        {msg && <p className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
        <button className="rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow">
          Salvar conta
        </button>
      </form>
    </section>
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

function SquareOption({
  icon, label, sub, onClick, disabled,
}: { icon: React.ReactNode; label: string; sub?: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border p-1.5 text-center shadow-card transition ${
        disabled
          ? "cursor-not-allowed border-border/60 bg-secondary/30 text-muted-foreground opacity-70"
          : "border-border bg-gradient-card hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <span className={`grid h-7 w-7 place-items-center rounded-lg ${disabled ? "bg-muted text-muted-foreground" : "bg-gradient-primary text-primary-foreground shadow-glow"}`}>
        {icon}
      </span>
      <span className="text-[10px] font-bold leading-tight">{label}</span>
      {sub && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1 py-0.5 text-[8px] font-bold uppercase">
          <Lock className="h-2 w-2" />{sub}
        </span>
      )}
    </button>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={show ? "Esconder senha" : "Mostrar senha"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-lg font-extrabold text-gradient-fire">{value}</div>
    </div>
  );
}

function FundosView({
  onBack, onHist, userId,
}: { onBack: () => void; onHist: () => void; userId: string }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const user = useStore(() => currentUser());
  void userId;
  const saldoDisp = Math.floor((user?.saldoRecarga ?? 0) + (user?.saldoProduzido ?? 0));

  const comprar = (id: string) => {
    const v = parseFloat(valores[id] || "0");
    const err = comprarFundo(id, v);
    if (err) setMsg({ ok: false, text: err });
    else {
      setMsg({ ok: true, text: "Fundo comprado com sucesso!" });
      setValores((s) => ({ ...s, [id]: "" }));
    }
  };

  return (
    <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground">← Voltar</button>
        <button
          onClick={onHist}
          aria-label="Histórico de fundos"
          className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-secondary hover:border-primary/40"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Gem className="h-5 w-5 text-primary" /> Fundos de Riqueza
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Saldo disponível: <span className="font-bold text-primary">{saldoDisp} MT</span> (recarga + rendimento)
      </p>
      {msg && (
        <p className={`mt-2 text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>
      )}
      <div className="mt-4 grid gap-3">
        {FUNDOS.map((f) => {
          const v = parseFloat(valores[f.id] || "0");
          const retorno = v > 0 ? Math.floor(v + v * (f.rendimentoDiarioPct / 100) * f.duracaoDias) : 0;
          return (
            <div key={f.id} className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">{f.nome}</p>
                <span className="rounded-md bg-gradient-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {f.rendimentoDiarioPct.toFixed(2)}% / dia
                </span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>Duração: <b className="text-foreground">{f.duracaoDias} dia(s)</b></span>
                <span>Mín.: <b className="text-foreground">{f.minCompra} MT</b></span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={`A partir de ${f.minCompra}`}
                  value={valores[f.id] || ""}
                  onChange={(e) => setValores((s) => ({ ...s, [f.id]: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => comprar(f.id)}
                  className="rounded-lg bg-gradient-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-glow"
                >
                  Comprar
                </button>
              </div>
              {retorno > 0 && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Retorno no fim: <b className="text-primary">{retorno} MT</b>
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        O valor total será creditado apenas ao terminar o período do fundo.
      </p>
    </section>
  );
}

function FundosHistView({ onBack, userId }: { onBack: () => void; userId: string }) {
  useStore(() => currentUser());
  const compras = getFundoCompras()
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.compradoEm - a.compradoEm);
  return (
    <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
      <button onClick={onBack} className="mb-3 text-xs font-semibold text-muted-foreground">← Voltar</button>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <History className="h-5 w-5 text-primary" /> Histórico de fundos
      </h2>
      {compras.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhuma compra de fundo ainda.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {compras.map((c) => {
            const f = FUNDOS.find((x) => x.id === c.fundoId);
            return (
              <li key={c.id} className="rounded-xl border border-border bg-secondary/40 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{f?.nome ?? c.fundoId}</p>
                  <span className={`text-[10px] font-bold uppercase ${c.creditado ? "text-primary" : "text-muted-foreground"}`}>
                    {c.creditado ? "Creditado" : "Em curso"}
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>Comprado: <b className="text-foreground">{new Date(c.compradoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</b></span>
                  <span>Termina: <b className="text-foreground">{new Date(c.expiraEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</b></span>
                  <span>Valor: <b className="text-foreground">{c.valor} MT</b></span>
                  <span>Receberá: <b className="text-primary">{c.retornoTotal} MT</b></span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ProdutosView({
  onBack, orders, rendimento,
}: {
  onBack: () => void;
  orders: ReturnType<typeof getOrders>;
  rendimento: { total: number; futuro: number; hoje: number };
}) {
  const [soEncerrados, setSoEncerrados] = useState(false);
  const agora = Date.now();
  const filtrados = soEncerrados ? orders.filter((o) => o.expiraEm <= agora) : orders;
  return (
    <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground">← Voltar</button>
        <button
          onClick={() => setSoEncerrados((s) => !s)}
          aria-label="Filtrar encerrados"
          className={`grid h-8 w-8 place-items-center rounded-lg border ${soEncerrados ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary"} hover:border-primary/40`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <h2 className="text-lg font-bold">
        {soEncerrados ? "Produtos encerrados" : "Meus produtos"}
      </h2>
      {!soEncerrados && (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Stat icon={<TrendingUp className="h-4 w-4" />} label="Renda total" value={`${rendimento.total} MT`} />
          <Stat icon={<Sparkles className="h-4 w-4" />} label="A render" value={`${rendimento.futuro} MT`} />
          <Stat icon={<Clock className="h-4 w-4" />} label="Renda hoje" value={`${rendimento.hoje} MT`} />
        </div>
      )}
      {filtrados.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {soEncerrados ? "Nenhum produto encerrado ainda." : (
            <>Nenhum produto comprado. <Link to="/produtos" className="font-semibold text-primary hover:underline">Ver planos</Link></>
          )}
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {filtrados.map((o) => {
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
                  Rendimento/dia: <span className="font-bold text-primary">{p.rendimentoDiario} MT</span>
                </p>
                <p className="text-xs">
                  Total: <span className="font-bold">{p.rendimentoTotal} MT</span>
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase">{ativo ? "Ativo" : "Encerrado"}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RoletaView({
  onBack, onHist, userId,
}: { onBack: () => void; onHist: () => void; userId: string }) {
  const user = useStore(() => currentUser());
  void userId;
  const chances = user?.chancesRoleta ?? 0;
  const [angulo, setAngulo] = useState(0);
  const [girando, setGirando] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const segmentos = ROLETA_SEGMENTOS;
  const setor = 360 / segmentos.length;

  const girar = () => {
    if (girando) return;
    if (chances <= 0) {
      setMsg({ ok: false, text: "Você não tem chances. Convide amigos para ganhar!" });
      return;
    }
    setMsg(null);
    const res = girarRoleta();
    if (res.erro || res.indice === undefined || res.valor === undefined) {
      setMsg({ ok: false, text: res.erro || "Erro" });
      return;
    }
    setGirando(true);
    // a seta está no topo (12h). para alinhar o centro do segmento sob a seta:
    const centro = res.indice * setor + setor / 2;
    const voltas = 6 * 360;
    const jitter = (Math.random() - 0.5) * (setor * 0.6);
    const destino = voltas - centro + jitter;
    const base = angulo;
    const target = base + (destino - (base % 360));
    setAngulo(target);
    setTimeout(() => {
      setGirando(false);
      setMsg({ ok: true, text: `Parabéns! Você ganhou ${res.valor} MT 🎉` });
    }, 4200);
  };

  // cores alternadas para os 6 setores
  const cores = ["#7c3aed", "#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#ec4899"];

  return (
    <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onBack} className="text-xs font-semibold text-muted-foreground">← Voltar</button>
        <button
          onClick={onHist}
          aria-label="Histórico da roleta"
          className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-secondary hover:border-primary/40"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Dice5 className="h-5 w-5 text-primary" /> Roleta da sorte
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Chances disponíveis: <span className="font-bold text-primary">{chances}</span> · Convide amigos e ganhe 1 chance a cada primeiro investimento.
      </p>

      <div className="relative mx-auto mt-5 h-64 w-64">
        {/* seta */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
          <div className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-primary drop-shadow" />
        </div>
        {/* disco */}
        <div
          className="h-full w-full rounded-full border-4 border-primary/40 shadow-glow"
          style={{
            transform: `rotate(${angulo}deg)`,
            transition: girando ? "transform 4s cubic-bezier(0.17, 0.67, 0.16, 1)" : "none",
          }}
        >
          <svg viewBox="-100 -100 200 200" className="h-full w-full -rotate-90">
            {segmentos.map((v, i) => {
              const a0 = (i * setor) * Math.PI / 180;
              const a1 = ((i + 1) * setor) * Math.PI / 180;
              const r = 100;
              const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
              const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
              const large = setor > 180 ? 1 : 0;
              const path = `M 0 0 L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
              const mid = (i * setor + setor / 2) * Math.PI / 180;
              const tx = (r * 0.62) * Math.cos(mid);
              const ty = (r * 0.62) * Math.sin(mid);
              const rotDeg = i * setor + setor / 2 + 90;
              return (
                <g key={i}>
                  <path d={path} fill={cores[i % cores.length]} stroke="#fff" strokeWidth={2} />
                  <g transform={`translate(${tx} ${ty}) rotate(${rotDeg})`}>
                    <rect x={-16} y={-10} width={32} height={20} rx={4} fill="rgba(0,0,0,0.35)" />
                    <text
                      x={0}
                      y={0}
                      fill="#fff"
                      fontSize={13}
                      fontWeight={800}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {v}
                    </text>
                  </g>
                </g>
              );
            })}
            <circle r={18} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth={2} />
          </svg>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">MT</div>
        </div>
      </div>

      {msg && (
        <p className={`mt-4 text-center text-sm font-bold ${msg.ok ? "text-primary" : "text-destructive"}`}>
          {msg.text}
        </p>
      )}

      <button
        onClick={girar}
        disabled={girando || chances <= 0}
        className="mt-5 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50"
      >
        {girando ? "Girando..." : "Girar roleta"}
      </button>
    </section>
  );
}

function RoletaHistView({ onBack, userId }: { onBack: () => void; userId: string }) {
  useStore(() => currentUser());
  const spins = getRoletaSpins()
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
  const hojeStr = new Date().toDateString();
  const rendaDiaria = spins
    .filter((s) => new Date(s.createdAt).toDateString() === hojeStr)
    .reduce((acc, s) => acc + s.valor, 0);
  const total = spins.reduce((acc, s) => acc + s.valor, 0);

  return (
    <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
      <button onClick={onBack} className="mb-3 text-xs font-semibold text-muted-foreground">← Voltar</button>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <History className="h-5 w-5 text-primary" /> Histórico da roleta
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Renda diária" value={`${rendaDiaria} MT`} />
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Total ganho" value={`${total} MT`} />
      </div>
      {spins.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhum giro ainda.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {spins.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-semibold">Giro da roleta</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <p className="font-bold text-primary">+{s.valor} MT</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HistoricoPlataformaView({ onBack }: { onBack: () => void }) {
  useStore(() => currentUser());
  const users = (typeof window !== "undefined") ? require("@/lib/store").getUsers() as Array<{ id: string; nome: string }> : [];
  const txs = getTxs().sort((a, b) => b.createdAt - a.createdAt);
  const nomeDe = (id: string) => users.find((u) => u.id === id)?.nome ?? id;
  const totalAprovado = txs.filter((t) => t.status === "aprovado").reduce((a, t) => a + t.valor, 0);
  return (
    <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
      <button onClick={onBack} className="mb-3 text-xs font-semibold text-muted-foreground">← Voltar</button>
      <h2 className="text-lg font-bold">Histórico da plataforma</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Total movimentado (aprovado): <span className="font-bold text-primary">{totalAprovado} MT</span> · {txs.length} transações
      </p>
      {txs.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhuma transação ainda.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {txs.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <div className="min-w-0">
                <p className="font-semibold capitalize">{t.tipo}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {nomeDe(t.userId)} · {new Date(t.createdAt).toLocaleString("pt-BR")}{t.metodo ? ` · ${t.metodo}` : ""}
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
  );
}
