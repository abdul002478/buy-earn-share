import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Shield, Zap } from "lucide-react";
import { currentUser, useStore } from "@/lib/store";

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
  const [mounted, setMounted] = React.useState(false);
  const user = useStore(() => currentUser());
  const path = useRouterState({ select: (s) => s.location.pathname });
  const titulo = TITULOS[path] ?? "Início";
  const isAuthPage = path === "/login" || path === "/cadastro" || path === "/forgot-password";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthPage) return null;
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">{titulo}</span>
          </Link>
          <div className="flex items-center gap-2" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">{titulo}</span>
        </Link>

        {!user && (
          <div className="flex items-center gap-2">
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary">Entrar</Link>
              <Link to="/cadastro" className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]">Cadastrar</Link>
            </>
          </div>
        )}

        {user?.isAdmin && path !== "/admin" && (
          <Link
            to="/admin"
            aria-label="Painel ADM"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Painel ADM</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return null;
}
