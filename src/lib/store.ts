// Store local em localStorage — protótipo visual sem backend.

export type TxType = "deposito" | "levantamento" | "compra" | "rendimento" | "bonus" | "checkin" | "indicacao";
export type TxStatus = "pendente" | "aprovado" | "negado";

export interface Transacao {
  id: string;
  userId: string;
  tipo: TxType;
  valor: number;
  status: TxStatus;
  metodo?: "e-mola" | "mpesa";
  numeroOrigem?: string;
  comprovante?: string;
  createdAt: number;
  produtoId?: string;
  taxa?: number;
  liquido?: number;
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  duracaoDias: number;
  rendimentoDiario: number;
  rendimentoTotal: number;
  bonus?: boolean;
  vip?: number;
}

export interface CompraProduto {
  id: string;
  userId: string;
  produtoId: string;
  compradoEm: number;
  expiraEm: number;
  rendimentoCreditado: boolean;
  isPrimeiraCompra?: boolean;
  ultimoCredito?: number;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  saldo: number; // legado/total combinado
  saldoRecarga?: number; // depósitos — não pode levantar
  saldoProduzido?: number; // rendimentos/check-in/indicação — pode levantar
  criadoEm: number;
  isAdmin?: boolean;
  refCode: string;
  referredBy?: string; // refCode do convidador
  recebeuFreebie?: boolean;
  fezPrimeiraCompra?: boolean;
  ultimoCheckin?: number; // timestamp
}

export interface FreebieClaim {
  id: string;
  userId: string;
  data: string; // YYYY-MM-DD
  claimedAt: number;
}

const KEYS = {
  users: "rj.users",
  txs: "rj.txs",
  orders: "rj.orders",
  session: "rj.session",
  freebies: "rj.freebies",
};

// VIP 1 a VIP 10 — 2 por linha, vão até VIP 10
export const PRODUTOS: Produto[] = [
  { id: "free", nome: "Oferta Grátis", preco: 0, duracaoDias: 1, rendimentoDiario: 80, rendimentoTotal: 80, bonus: true },
  { id: "vip1", nome: "VIP 1", preco: 200, duracaoDias: 30, rendimentoDiario: 20, rendimentoTotal: 600, vip: 1 },
  { id: "vip2", nome: "VIP 2", preco: 500, duracaoDias: 30, rendimentoDiario: 55, rendimentoTotal: 1650, vip: 2 },
  { id: "vip3", nome: "VIP 3", preco: 1000, duracaoDias: 30, rendimentoDiario: 120, rendimentoTotal: 3600, vip: 3 },
  { id: "vip4", nome: "VIP 4", preco: 2000, duracaoDias: 30, rendimentoDiario: 250, rendimentoTotal: 7500, vip: 4 },
  { id: "vip5", nome: "VIP 5", preco: 3500, duracaoDias: 35, rendimentoDiario: 450, rendimentoTotal: 15750, vip: 5 },
  { id: "vip6", nome: "VIP 6", preco: 5000, duracaoDias: 40, rendimentoDiario: 700, rendimentoTotal: 28000, vip: 6 },
  { id: "vip7", nome: "VIP 7", preco: 8000, duracaoDias: 40, rendimentoDiario: 1200, rendimentoTotal: 48000, vip: 7 },
  { id: "vip8", nome: "VIP 8", preco: 12000, duracaoDias: 45, rendimentoDiario: 2000, rendimentoTotal: 90000, vip: 8 },
  { id: "vip9", nome: "VIP 9", preco: 20000, duracaoDias: 50, rendimentoDiario: 3500, rendimentoTotal: 175000, vip: 9 },
  { id: "vip10", nome: "VIP 10", preco: 35000, duracaoDias: 60, rendimentoDiario: 7000, rendimentoTotal: 420000, vip: 10 },
];

export const DEPOSITO_INFO = {
  emola: { numero: "861181963", nome: "Abibo" },
  mpesa: { numero: "858601038", nome: "Abono" },
};

export const LEVANTAMENTO_MINIMO = 100;
export const DEPOSITO_MINIMO = 100;
export const TAXA_LEVANTAMENTO = 0.1; // 10%
export const SAQUE_HORA_INICIO = 9 * 60 + 30; // 09:30
export const SAQUE_HORA_FIM = 18 * 60 + 30; // 18:30
export const FREEBIE_LIMITE_DIA = 5;
export const FREEBIE_HORA_INICIO = 13;
export const FREEBIE_MIN_INICIO = 0;
export const FREEBIE_MIN_FIM = 10; // 13:00 a 13:10

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

function genRef(): string {
  return "RJ" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function getUsers(): Usuario[] {
  const list = read<Usuario[]>(KEYS.users, []);
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
      refCode: "ADMIN",
    });
    write(KEYS.users, list);
  }
  // garante refCode em usuários antigos
  let changed = false;
  for (const u of list) {
    if (!u.refCode) { u.refCode = genRef(); changed = true; }
    if (u.saldoRecarga === undefined || u.saldoProduzido === undefined) {
      u.saldoRecarga = u.saldo ?? 0;
      u.saldoProduzido = 0;
      changed = true;
    }
    // mantém saldo total = recarga + produzido
    const total = (u.saldoRecarga ?? 0) + (u.saldoProduzido ?? 0);
    if (u.saldo !== total) { u.saldo = total; changed = true; }
  }
  if (changed) write(KEYS.users, list);
  return list;
}
export function saveUsers(list: Usuario[]) { write(KEYS.users, list); }
export function getTxs(): Transacao[] { return read<Transacao[]>(KEYS.txs, []); }
export function saveTxs(list: Transacao[]) { write(KEYS.txs, list); }
export function getOrders(): CompraProduto[] { return read<CompraProduto[]>(KEYS.orders, []); }
export function saveOrders(list: CompraProduto[]) { write(KEYS.orders, list); }
export function getFreebies(): FreebieClaim[] { return read<FreebieClaim[]>(KEYS.freebies, []); }
export function saveFreebies(list: FreebieClaim[]) { write(KEYS.freebies, list); }

export function currentUserId(): string | null {
  return read<string | null>(KEYS.session, null);
}
export function currentUser(): Usuario | null {
  const id = currentUserId();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}
export function setSession(userId: string | null) { write(KEYS.session, userId); }

export function login(email: string, senha: string): Usuario | null {
  const u = getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase() && x.senha === senha);
  if (u) setSession(u.id);
  return u ?? null;
}

export function register(data: { nome: string; email: string; telefone: string; senha: string; ref?: string }): Usuario | string {
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
    saldoRecarga: 0,
    saldoProduzido: 0,
    criadoEm: Date.now(),
    refCode: genRef(),
    referredBy: data.ref?.toUpperCase(),
  };
  users.push(u);
  saveUsers(users);
  setSession(u.id);
  return u;
}

export function logout() { setSession(null); }

export function trocarSenha(antiga: string, nova: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (u.senha !== antiga) return "Senha atual incorreta";
  if (nova.length < 6) return "Nova senha muito curta";
  const users = getUsers();
  const i = users.findIndex((x) => x.id === u.id);
  users[i].senha = nova;
  saveUsers(users);
  return null;
}

export function recuperarSenha(email: string, novaSenha: string): string | null {
  if (novaSenha.length < 6) return "Senha muito curta";
  const users = getUsers();
  const i = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (i < 0) return "E-mail não encontrado";
  users[i].senha = novaSenha;
  saveUsers(users);
  return null;
}

export function pedirDeposito(valor: number, metodo: "e-mola" | "mpesa", numeroOrigem: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (valor <= 0) return "Valor inválido";
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id, tipo: "deposito", valor, metodo, numeroOrigem,
    status: "pendente", createdAt: Date.now(),
  });
  saveTxs(txs);
  return null;
}

export function pedirLevantamento(valor: number, metodo: "e-mola" | "mpesa", numeroDestino: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (valor < LEVANTAMENTO_MINIMO) return `Mínimo ${LEVANTAMENTO_MINIMO} MT`;
  if (u.saldo < valor) return "Saldo insuficiente";
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  users[idx].saldo -= valor;
  saveUsers(users);
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id, tipo: "levantamento", valor, metodo, numeroOrigem: numeroDestino,
    status: "pendente", createdAt: Date.now(),
  });
  saveTxs(txs);
  return null;
}

export function comprarProduto(produtoId: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  const p = PRODUTOS.find((x) => x.id === produtoId);
  if (!p) return "Produto não existe";
  if (p.bonus) return "Use o botão de oferta grátis";
  if (u.saldo < p.preco) return "Saldo insuficiente. Faça um depósito.";
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  users[idx].saldo -= p.preco;
  const isPrimeira = !users[idx].fezPrimeiraCompra;
  if (isPrimeira) users[idx].fezPrimeiraCompra = true;
  saveUsers(users);

  const orders = getOrders();
  orders.push({
    id: "o_" + Math.random().toString(36).slice(2, 10),
    userId: u.id, produtoId: p.id, compradoEm: Date.now(),
    expiraEm: Date.now() + p.duracaoDias * 86400000,
    rendimentoCreditado: false,
    isPrimeiraCompra: isPrimeira,
  });
  saveOrders(orders);
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id, tipo: "compra", valor: p.preco, status: "aprovado",
    createdAt: Date.now(), produtoId: p.id,
  });

  // Bônus de indicação 25% da PRIMEIRA compra
  if (isPrimeira && users[idx].referredBy) {
    const refIdx = users.findIndex((x) => x.refCode === users[idx].referredBy);
    if (refIdx >= 0) {
      const bonus = Math.floor(p.preco * 0.25);
      users[refIdx].saldo += bonus;
      txs.push({
        id: "t_" + Math.random().toString(36).slice(2, 10),
        userId: users[refIdx].id, tipo: "indicacao", valor: bonus,
        status: "aprovado", createdAt: Date.now(),
      });
      saveUsers(users);
    }
  }
  saveTxs(txs);
  return null;
}

// ====== FREEBIE (Oferta grátis) ======
export function freebieJanelaAberta(now = new Date()): boolean {
  const h = now.getHours();
  const m = now.getMinutes();
  if (h !== FREEBIE_HORA_INICIO) return false;
  return m >= FREEBIE_MIN_INICIO && m < FREEBIE_MIN_FIM;
}
function diaStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
export function freebieRestantesHoje(): number {
  const hoje = diaStr();
  const list = getFreebies().filter((f) => f.data === hoje);
  return Math.max(0, FREEBIE_LIMITE_DIA - list.length);
}
export function pegarFreebie(): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (u.recebeuFreebie) return "Você já pegou sua oferta grátis";
  if (!freebieJanelaAberta()) return "Janela fechada. Disponível das 13:00 às 13:10.";
  if (freebieRestantesHoje() <= 0) return "Os 5 produtos grátis de hoje acabaram.";
  const hoje = diaStr();
  const list = getFreebies();
  list.push({
    id: "f_" + Math.random().toString(36).slice(2, 8),
    userId: u.id, data: hoje, claimedAt: Date.now(),
  });
  saveFreebies(list);
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  users[idx].recebeuFreebie = true;
  saveUsers(users);
  const free = PRODUTOS.find((p) => p.id === "free")!;
  const orders = getOrders();
  orders.push({
    id: "o_" + Math.random().toString(36).slice(2, 10),
    userId: u.id, produtoId: free.id, compradoEm: Date.now(),
    expiraEm: Date.now() + free.duracaoDias * 86400000,
    rendimentoCreditado: false,
  });
  saveOrders(orders);
  return null;
}

// ====== CHECK-IN diário ======
export function podeCheckIn(): boolean {
  const u = currentUser();
  if (!u) return false;
  if (!u.ultimoCheckin) return true;
  return diaStr(new Date(u.ultimoCheckin)) !== diaStr();
}
export function fazerCheckIn(): { ok: boolean; valor?: number; msg?: string } {
  const u = currentUser();
  if (!u) return { ok: false, msg: "Não autenticado" };
  if (!podeCheckIn()) return { ok: false, msg: "Já fez check-in hoje" };
  const valor = Math.floor(Math.random() * 5) + 1; // 1..5
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  users[idx].saldo += valor;
  users[idx].ultimoCheckin = Date.now();
  saveUsers(users);
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id, tipo: "checkin", valor, status: "aprovado", createdAt: Date.now(),
  });
  saveTxs(txs);
  return { ok: true, valor };
}

// ====== Equipe ======
export function getEquipe(refCode: string): { nome: string; telefone: string; criadoEm: number }[] {
  return getUsers()
    .filter((u) => u.referredBy === refCode)
    .map((u) => ({ nome: u.nome, telefone: u.telefone, criadoEm: u.criadoEm }));
}

// ====== Rendimento (calculado em runtime) ======
export function calcularRendimento(userId: string) {
  const orders = getOrders().filter((o) => o.userId === userId);
  let total = 0; // já rendido
  let futuro = 0; // ainda vai render
  let hoje = 0;
  const agora = Date.now();
  const inicioHoje = new Date(); inicioHoje.setHours(0,0,0,0);
  for (const o of orders) {
    const p = PRODUTOS.find((x) => x.id === o.produtoId);
    if (!p) continue;
    const totalMs = p.duracaoDias * 86400000;
    const decorridoMs = Math.max(0, Math.min(agora - o.compradoEm, totalMs));
    const fracTotal = decorridoMs / totalMs;
    const rendido = p.rendimentoTotal * fracTotal;
    total += rendido;
    futuro += p.rendimentoTotal - rendido;
    // hoje
    const inicioCalc = Math.max(o.compradoEm, inicioHoje.getTime());
    const fimCalc = Math.min(agora, o.compradoEm + totalMs);
    if (fimCalc > inicioCalc) {
      hoje += (p.rendimentoTotal / totalMs) * (fimCalc - inicioCalc);
    }
  }
  return { total: Math.floor(total), futuro: Math.floor(futuro), hoje: Math.floor(hoje) };
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
  if (t.tipo === "levantamento") u.saldo += t.valor;
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

import { useEffect, useState } from "react";
export function useStore<T>(getter: () => T): T {
  const [v, setV] = useState<T>(getter());
  useEffect(() => {
    const update = () => setV(getter());
    window.addEventListener("rj:update", update);
    window.addEventListener("storage", update);
    const tick = setInterval(update, 30000);
    return () => {
      window.removeEventListener("rj:update", update);
      window.removeEventListener("storage", update);
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}
