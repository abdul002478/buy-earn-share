// Store local em localStorage — protótipo visual sem backend.
// Em produção, migrar para Lovable Cloud.

export type TxType = "deposito" | "levantamento" | "compra" | "rendimento" | "bonus";
export type TxStatus = "pendente" | "aprovado" | "negado";

export interface Transacao {
  id: string;
  userId: string;
  tipo: TxType;
  valor: number; // MT
  status: TxStatus;
  metodo?: "e-mola" | "mpesa";
  numeroOrigem?: string; // número que enviou
  comprovante?: string;
  createdAt: number;
  produtoId?: string;
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  duracaoDias: number;
  rendimentoTotal: number; // MT no final
  bonus?: boolean;
  destaque?: boolean;
}

export interface CompraProduto {
  id: string;
  userId: string;
  produtoId: string;
  compradoEm: number;
  expiraEm: number;
  rendimentoCreditado: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senha: string; // texto puro (mock)
  saldo: number; // MT
  criadoEm: number;
  isAdmin?: boolean;
}

const KEYS = {
  users: "rj.users",
  txs: "rj.txs",
  orders: "rj.orders",
  session: "rj.session",
};

export const PRODUTOS: Produto[] = [
  { id: "bonus-80", nome: "Bônus de Boas-vindas", preco: 0, duracaoDias: 1, rendimentoTotal: 80, bonus: true, destaque: true },
  { id: "p1", nome: "Plano Bronze", preco: 150, duracaoDias: 5, rendimentoTotal: 250 },
  { id: "p2", nome: "Plano Prata", preco: 300, duracaoDias: 7, rendimentoTotal: 560 },
  { id: "p3", nome: "Plano Ouro", preco: 500, duracaoDias: 10, rendimentoTotal: 1100 },
  { id: "p4", nome: "Plano Diamante", preco: 1000, duracaoDias: 15, rendimentoTotal: 2500 },
  { id: "p5", nome: "Plano Rubi", preco: 1500, duracaoDias: 20, rendimentoTotal: 4200 },
  { id: "p6", nome: "Plano Safira", preco: 2500, duracaoDias: 25, rendimentoTotal: 7500 },
  { id: "p7", nome: "Plano Esmeralda", preco: 4000, duracaoDias: 30, rendimentoTotal: 13000 },
  { id: "p8", nome: "Plano Platina", preco: 6000, duracaoDias: 40, rendimentoTotal: 21000 },
  { id: "p9", nome: "Plano Master VIP", preco: 10000, duracaoDias: 60, rendimentoTotal: 38000 },
];

export const DEPOSITO_INFO = {
  emola: { numero: "861181963", nome: "Abibo" },
  mpesa: { numero: "858601038", nome: "Abono" },
};

export const LEVANTAMENTO_MINIMO = 100;

const ADMIN_EMAIL = "admin@recargaja.com";
const ADMIN_SENHA = "admin123";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("rj:update"));
}

export function getUsers(): Usuario[] {
  const list = read<Usuario[]>(KEYS.users, []);
  // garante admin
  if (!list.find((u) => u.email === ADMIN_EMAIL)) {
    list.push({
      id: "admin",
      nome: "Administrador",
      email: ADMIN_EMAIL,
      telefone: "—",
      senha: ADMIN_SENHA,
      saldo: 0,
      criadoEm: Date.now(),
      isAdmin: true,
    });
    write(KEYS.users, list);
  }
  return list;
}
export function saveUsers(list: Usuario[]) {
  write(KEYS.users, list);
}
export function getTxs(): Transacao[] {
  return read<Transacao[]>(KEYS.txs, []);
}
export function saveTxs(list: Transacao[]) {
  write(KEYS.txs, list);
}
export function getOrders(): CompraProduto[] {
  return read<CompraProduto[]>(KEYS.orders, []);
}
export function saveOrders(list: CompraProduto[]) {
  write(KEYS.orders, list);
}

export function currentUserId(): string | null {
  return read<string | null>(KEYS.session, null);
}
export function currentUser(): Usuario | null {
  const id = currentUserId();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}
export function setSession(userId: string | null) {
  write(KEYS.session, userId);
}

export function login(email: string, senha: string): Usuario | null {
  const u = getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase() && x.senha === senha);
  if (u) setSession(u.id);
  return u ?? null;
}

export function register(data: { nome: string; email: string; telefone: string; senha: string }): Usuario | string {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return "E-mail já cadastrado";
  }
  const u: Usuario = {
    id: "u_" + Math.random().toString(36).slice(2, 10),
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    senha: data.senha,
    saldo: 0,
    criadoEm: Date.now(),
  };
  users.push(u);
  saveUsers(users);

  // entrega bônus 80MT (produto bonus de 1 dia)
  const bonus = PRODUTOS.find((p) => p.bonus)!;
  const orders = getOrders();
  orders.push({
    id: "o_" + Math.random().toString(36).slice(2, 10),
    userId: u.id,
    produtoId: bonus.id,
    compradoEm: Date.now(),
    expiraEm: Date.now() + bonus.duracaoDias * 86400000,
    rendimentoCreditado: false,
  });
  saveOrders(orders);

  // credita imediatamente o bônus como saldo (rendimento total = 80MT)
  u.saldo += bonus.rendimentoTotal;
  saveUsers(users);
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id,
    tipo: "bonus",
    valor: bonus.rendimentoTotal,
    status: "aprovado",
    createdAt: Date.now(),
    produtoId: bonus.id,
  });
  saveTxs(txs);

  setSession(u.id);
  return u;
}

export function logout() {
  setSession(null);
}

export function pedirDeposito(valor: number, metodo: "e-mola" | "mpesa", numeroOrigem: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (valor <= 0) return "Valor inválido";
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id,
    tipo: "deposito",
    valor,
    metodo,
    numeroOrigem,
    status: "pendente",
    createdAt: Date.now(),
  });
  saveTxs(txs);
  return null;
}

export function pedirLevantamento(valor: number, metodo: "e-mola" | "mpesa", numeroDestino: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (valor < LEVANTAMENTO_MINIMO) return `Mínimo ${LEVANTAMENTO_MINIMO} MT`;
  if (u.saldo < valor) return "Saldo insuficiente";
  // reserva o valor já (debita; se negado, devolve)
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  users[idx].saldo -= valor;
  saveUsers(users);
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id,
    tipo: "levantamento",
    valor,
    metodo,
    numeroOrigem: numeroDestino,
    status: "pendente",
    createdAt: Date.now(),
  });
  saveTxs(txs);
  return null;
}

export function comprarProduto(produtoId: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  const p = PRODUTOS.find((x) => x.id === produtoId);
  if (!p) return "Produto não existe";
  if (p.bonus) return "Produto bônus já entregue";
  if (u.saldo < p.preco) return "Saldo insuficiente. Faça um depósito.";
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  users[idx].saldo -= p.preco;
  saveUsers(users);
  const orders = getOrders();
  orders.push({
    id: "o_" + Math.random().toString(36).slice(2, 10),
    userId: u.id,
    produtoId: p.id,
    compradoEm: Date.now(),
    expiraEm: Date.now() + p.duracaoDias * 86400000,
    rendimentoCreditado: false,
  });
  saveOrders(orders);
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id,
    tipo: "compra",
    valor: p.preco,
    status: "aprovado",
    createdAt: Date.now(),
    produtoId: p.id,
  });
  saveTxs(txs);
  return null;
}

// ==== ADMIN ====
export function adminAprovarTx(txId: string) {
  const txs = getTxs();
  const t = txs.find((x) => x.id === txId);
  if (!t || t.status !== "pendente") return;
  const users = getUsers();
  const u = users.find((x) => x.id === t.userId);
  if (!u) return;
  if (t.tipo === "deposito") u.saldo += t.valor;
  // levantamento: já foi debitado ao pedir, então só marca aprovado
  t.status = "aprovado";
  saveUsers(users);
  saveTxs(txs);
}
export function adminNegarTx(txId: string) {
  const txs = getTxs();
  const t = txs.find((x) => x.id === txId);
  if (!t || t.status !== "pendente") return;
  const users = getUsers();
  const u = users.find((x) => x.id === t.userId);
  if (!u) return;
  if (t.tipo === "levantamento") u.saldo += t.valor; // devolve
  t.status = "negado";
  saveUsers(users);
  saveTxs(txs);
}
export function adminEditarSaldo(userId: string, novoSaldo: number) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  users[idx].saldo = novoSaldo;
  saveUsers(users);
}

// hook util
import { useEffect, useState } from "react";
export function useStore<T>(getter: () => T): T {
  const [v, setV] = useState<T>(getter());
  useEffect(() => {
    const update = () => setV(getter());
    window.addEventListener("rj:update", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("rj:update", update);
      window.removeEventListener("storage", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}