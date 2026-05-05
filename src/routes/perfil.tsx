import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { currentUser, logout, trocarSenha, useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { LogOut, User as UserIcon, KeyRound, Mail, Phone, Calendar } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — RecargaJá" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const user = useStore(() => currentUser());
  const navigate = useNavigate();
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
        </header>

        <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
          <h2 className="text-lg font-bold">Meus dados</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            <Linha icon={<Mail className="h-4 w-4" />} label="E-mail" value={user.email} />
            <Linha icon={<Phone className="h-4 w-4" />} label="Telefone" value={user.telefone} />
            <Linha icon={<Calendar className="h-4 w-4" />} label="Conta criada em"
                   value={new Date(user.criadoEm).toLocaleString("pt-BR")} />
          </ul>
        </section>

        <section className="mt-5 rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
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

        <button onClick={sair} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
          <LogOut className="h-4 w-4" /> Sair da conta
        </button>
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

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
             className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}
