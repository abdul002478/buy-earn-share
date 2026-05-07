import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Zap, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { currentUser, logout, useStore } from "@/lib/store";

const linksPublicos = [
  { to: "/" as const, label: "Início" },
];
const linksLogado = [
  { to: "/" as const, label: "Início" },
  { to: "/produtos" as const, label: "Produtos" },
  { to: "/carteira" as const, label: "Carteira" },
  { to: "/convide" as const, label: "Convide" },
  { to: "/perfil" as const, label: "Perfil" },
];

const TITULOS: Record<string, string> = {
  "/": "Início",
  "/produtos": "Produtos",
  "/carteira": "Carteira",
  "/convide": "Convide",
  "/perfil": "Perfil",
  "/login": "Entrar",
  "/cadastro": "Cadastro",
  "/admin": "Admin",
  "/forgot-password": "Recuperar senha",
  "/recarga": "Recarga",
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useStore(() => currentUser());
  const links = user ? linksLogado : linksPublicos;
  const path = useRouterState({ select: (s) => s.location.pathname });
  const titulo = TITULOS[path] ?? "Início";

  const sair = () => { logout(); navigate({ to: "/login" }); };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">{titulo}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/perfil" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold">
                <UserIcon className="h-4 w-4" /> {user.nome.split(" ")[0]}
              </Link>
              <button onClick={sair} className="inline-flex items-center gap-2 rounded-lg bg-destructive/90 px-3 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary">Entrar</Link>
              <Link to="/cadastro" className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]">Cadastrar</Link>
            </>
          )}
        </div>

        <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-foreground hover:bg-secondary md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {user ? (
                <button onClick={() => { setOpen(false); sair(); }} className="col-span-2 rounded-lg bg-destructive/90 px-3 py-2 text-center text-sm font-semibold text-destructive-foreground">
                  Sair da conta
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-2 text-center text-sm font-semibold">Entrar</Link>
                  <Link to="/cadastro" onClick={() => setOpen(false)} className="rounded-lg bg-gradient-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground">Cadastrar</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return null;
}
