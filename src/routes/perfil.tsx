import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  currentUser, logout, trocarSenha, useStore,
  getOrders, getTxs, PRODUTOS, creditarRendimentos,
  getVipNivel, salvarFotoPerfil, calcularRendimento, vincularConta,
} from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import {
  LogOut, User as UserIcon, KeyRound, Mail, Phone, Calendar,
  Sparkles, PiggyBank, History, Package, Smartphone, Dice5, Gem, Camera, Lock,
  TrendingUp, Clock, Link as LinkIcon, Headphones, MessageCircle, Send, Eye, EyeOff,
} from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — RecargaJá" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  useEffect(() => { creditarRendimentos(); }, []);
  const user = useStore(() => currentUser());
  const navigate = useNavigate();
  const [view, setView] = useState<"main" | "senha" | "historico" | "produtos" | "vincular">("main");
  const [suporteOpen, setSuporteOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [antiga, setAntiga] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { if (!user) navigate({ to: "/login" }); }, [user, navigate]);
  if (!user) return null;
  const vip = getVipNivel(user.id);

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

  const txs = getTxs().filter((t) => t.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
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
                <span className="rounded-md bg-gradient-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">VIP {vip}</span>
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
          <SquareOption icon={<Dice5 className="h-4 w-4" />} label="Roleta" sub="Em breve" disabled />
          <SquareOption icon={<Gem className="h-4 w-4" />} label="Fundo" sub="Em breve" disabled />
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
          <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <button onClick={() => setView("main")} className="mb-3 text-xs font-semibold text-muted-foreground">← Voltar</button>
            <h2 className="text-lg font-bold">Meus produtos</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Stat icon={<TrendingUp className="h-4 w-4" />} label="Renda total" value={`${rendimento.total} MT`} />
              <Stat icon={<Sparkles className="h-4 w-4" />} label="A render" value={`${rendimento.futuro} MT`} />
              <Stat icon={<Clock className="h-4 w-4" />} label="Renda hoje" value={`${rendimento.hoje} MT`} />
            </div>
            {orders.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhum produto comprado.{" "}
                <Link to="/produtos" className="font-semibold text-primary hover:underline">Ver planos</Link>
              </p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
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
        )}

        {view === "vincular" && (
          <VincularContaView onBack={() => setView("main")} user={user} />
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
