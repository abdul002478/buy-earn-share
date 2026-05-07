import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Package, Wallet, Users, User as UserIcon } from "lucide-react";
import { currentUser, useStore } from "@/lib/store";

const items = [
  { to: "/" as const, label: "Início", icon: Home, exact: true },
  { to: "/produtos" as const, label: "Produtos", icon: Package },
  { to: "/carteira" as const, label: "Carteira", icon: Wallet },
  { to: "/convide" as const, label: "Convide", icon: Users },
  { to: "/perfil" as const, label: "Perfil", icon: UserIcon },
];

export function BottomNav() {
  const user = useStore(() => currentUser());
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!user) return null;
  return (
    <>
      <div className="h-20" aria-hidden />
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl">
        <ul className="mx-auto flex max-w-6xl items-stretch justify-around px-2 py-1.5">
          {items.map((it) => {
            const Icon = it.icon;
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            return (
              <li key={it.to} className="flex-1">
                <Link
                  to={it.to}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}