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
  nomePagamento?: string; // nome do número (recarga) ou nome da conta vinculada (saque)
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
  fotoUrl?: string;
  contaVincMetodo?: "e-mola" | "mpesa";
  contaVincNumero?: string;
  contaVincNome?: string;
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
  fundos: "rj.fundoOrders",
};

// VIP 1 a VIP 10 — 2 por linha, vão até VIP 10
export const PRODUTOS: Produto[] = [
  { id: "free", nome: "Oferta Grátis", preco: 80, duracaoDias: 1, rendimentoDiario: 100, rendimentoTotal: 100, bonus: true },
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

const ADMIN_EMAIL = "abiboatuman01@gmail.com";
const ADMIN_SENHA = "12345@Aa";

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

// ====== FUNDOS DE RIQUEZA ======
export interface Fundo {
  id: string;
  nome: string;
  duracaoDias: number;
  minCompra: number;
  rendimentoDiarioPct: number; // ex.: 1.9 = 1,90% ao dia
}

export const FUNDOS: Fundo[] = [
  { id: "f1", nome: "Início",    duracaoDias: 1,   minCompra: 100, rendimentoDiarioPct: 1.90 },
  { id: "f2", nome: "Consta",    duracaoDias: 3,   minCompra: 100, rendimentoDiarioPct: 1.92 },
  { id: "f3", nome: "Crescer",   duracaoDias: 15,  minCompra: 100, rendimentoDiarioPct: 1.80 },
  { id: "f4", nome: "Prosperar", duracaoDias: 30,  minCompra: 100, rendimentoDiarioPct: 1.50 },
  { id: "f5", nome: "Fortuna",   duracaoDias: 365, minCompra: 100, rendimentoDiarioPct: 2.00 },
];

export interface FundoCompra {
  id: string;
  userId: string;
  fundoId: string;
  valor: number;
  compradoEm: number;
  expiraEm: number;
  retornoTotal: number; // valor + rendimento total
  creditado: boolean;
}

export function getFundoCompras(): FundoCompra[] {
  return read<FundoCompra[]>(KEYS.fundos, []);
}
export function saveFundoCompras(list: FundoCompra[]) {
  write(KEYS.fundos, list);
}

export function comprarFundo(fundoId: string, valor: number): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  const f = FUNDOS.find((x) => x.id === fundoId);
  if (!f) return "Fundo não existe";
  if (!Number.isFinite(valor) || valor <= 0) return "Valor inválido";
  if (valor < f.minCompra) return `Mínimo ${f.minCompra} MT`;
  const total = (u.saldoRecarga ?? 0) + (u.saldoProduzido ?? 0);
  if (total < valor) return "Saldo insuficiente.";
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  // debita recarga primeiro, depois produzido
  let resto = valor;
  const rec = users[idx].saldoRecarga ?? 0;
  const usaRec = Math.min(rec, resto);
  users[idx].saldoRecarga = rec - usaRec;
  resto -= usaRec;
  users[idx].saldoProduzido = (users[idx].saldoProduzido ?? 0) - resto;
  users[idx].saldo = (users[idx].saldoRecarga ?? 0) + (users[idx].saldoProduzido ?? 0);
  const isPrimeira = !users[idx].fezPrimeiraCompra;
  if (isPrimeira) users[idx].fezPrimeiraCompra = true;
  saveUsers(users);

  const rendimentoTotal = valor * (f.rendimentoDiarioPct / 100) * f.duracaoDias;
  const retornoTotal = Math.floor(valor + rendimentoTotal);
  const list = getFundoCompras();
  list.push({
    id: "fo_" + Math.random().toString(36).slice(2, 10),
    userId: u.id,
    fundoId: f.id,
    valor,
    compradoEm: Date.now(),
    expiraEm: Date.now() + f.duracaoDias * 86400000,
    retornoTotal,
    creditado: false,
  });
  saveFundoCompras(list);

  // Bônus de indicação 25/5/1% na PRIMEIRA compra do convidado
  if (isPrimeira) {
    const percent = [0.25, 0.05, 0.01];
    const txs = getTxs();
    let atualRef = users[idx].referredBy;
    for (let nivel = 0; nivel < percent.length && atualRef; nivel++) {
      const refIdx = users.findIndex((x) => x.refCode === atualRef);
      if (refIdx < 0) break;
      const bonus = Math.floor(valor * percent[nivel]);
      if (bonus > 0) {
        users[refIdx].saldoProduzido = (users[refIdx].saldoProduzido ?? 0) + bonus;
        users[refIdx].saldo = (users[refIdx].saldoRecarga ?? 0) + (users[refIdx].saldoProduzido ?? 0);
        txs.push({
          id: "t_" + Math.random().toString(36).slice(2, 10),
          userId: users[refIdx].id, tipo: "indicacao", valor: bonus,
          status: "aprovado", createdAt: Date.now(),
        });
      }
      atualRef = users[refIdx].referredBy;
    }
    saveUsers(users);
    saveTxs(txs);
  }
  return null;
}

export function creditarFundos() {
  const list = getFundoCompras();
  const users = getUsers();
  const agora = Date.now();
  let mudou = false;
  for (const c of list) {
    if (c.creditado) continue;
    if (c.expiraEm > agora) continue;
    const idx = users.findIndex((u) => u.id === c.userId);
    if (idx < 0) continue;
    users[idx].saldoProduzido = (users[idx].saldoProduzido ?? 0) + c.retornoTotal;
    users[idx].saldo = (users[idx].saldoRecarga ?? 0) + (users[idx].saldoProduzido ?? 0);
    c.creditado = true;
    mudou = true;
  }
  if (mudou) { saveFundoCompras(list); saveUsers(users); }
}

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

export function janelaSaqueAberta(now = new Date()): boolean {
  const m = now.getHours() * 60 + now.getMinutes();
  return m >= SAQUE_HORA_INICIO && m <= SAQUE_HORA_FIM;
}

export function pedirDeposito(valor: number, metodo: "e-mola" | "mpesa", numeroOrigem: string, comprovante?: string, nomePagamento?: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (valor < DEPOSITO_MINIMO) return `Mínimo ${DEPOSITO_MINIMO} MT`;
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id, tipo: "deposito", valor, metodo, numeroOrigem, comprovante, nomePagamento,
    status: "pendente", createdAt: Date.now(),
  });
  saveTxs(txs);
  return null;
}

export function pedirLevantamento(valor: number): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (!u.contaVincNumero || !u.contaVincMetodo) return "Vincule uma conta no perfil antes de sacar.";
  if (!janelaSaqueAberta()) return "Saques apenas das 09:30 às 18:30.";
  if (valor < LEVANTAMENTO_MINIMO) return `Mínimo ${LEVANTAMENTO_MINIMO} MT`;
  if ((u.saldoProduzido ?? 0) < valor) return "Saldo produzido insuficiente. Apenas saldo produzido pode ser levantado.";
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  users[idx].saldoProduzido = (users[idx].saldoProduzido ?? 0) - valor;
  users[idx].saldo = (users[idx].saldoRecarga ?? 0) + (users[idx].saldoProduzido ?? 0);
  saveUsers(users);
  const taxa = Math.floor(valor * TAXA_LEVANTAMENTO);
  const liquido = valor - taxa;
  const txs = getTxs();
  txs.push({
    id: "t_" + Math.random().toString(36).slice(2, 10),
    userId: u.id, tipo: "levantamento", valor,
    metodo: u.contaVincMetodo, numeroOrigem: u.contaVincNumero, nomePagamento: u.contaVincNome,
    status: "pendente", createdAt: Date.now(), taxa, liquido,
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
  const total = (u.saldoRecarga ?? 0) + (u.saldoProduzido ?? 0);
  if (total < p.preco) return "Saldo insuficiente. Faça um depósito.";
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  // debita primeiro do saldo de recarga, depois do produzido
  let resto = p.preco;
  const recarga = users[idx].saldoRecarga ?? 0;
  const usaRec = Math.min(recarga, resto);
  users[idx].saldoRecarga = recarga - usaRec;
  resto -= usaRec;
  users[idx].saldoProduzido = (users[idx].saldoProduzido ?? 0) - resto;
  users[idx].saldo = (users[idx].saldoRecarga ?? 0) + (users[idx].saldoProduzido ?? 0);
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

  // Bônus de indicação multinível na PRIMEIRA compra: 25% / 5% / 1%
  if (isPrimeira) {
    const percent = [0.25, 0.05, 0.01];
    let atualRef = users[idx].referredBy;
    for (let nivel = 0; nivel < percent.length && atualRef; nivel++) {
      const refIdx = users.findIndex((x) => x.refCode === atualRef);
      if (refIdx < 0) break;
      const bonus = Math.floor(p.preco * percent[nivel]);
      if (bonus > 0) {
        users[refIdx].saldoProduzido = (users[refIdx].saldoProduzido ?? 0) + bonus;
        users[refIdx].saldo = (users[refIdx].saldoRecarga ?? 0) + (users[refIdx].saldoProduzido ?? 0);
        txs.push({
          id: "t_" + Math.random().toString(36).slice(2, 10),
          userId: users[refIdx].id, tipo: "indicacao", valor: bonus,
          status: "aprovado", createdAt: Date.now(),
        });
      }
      atualRef = users[refIdx].referredBy;
    }
    saveUsers(users);
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
  if (!freebieJanelaAberta()) return "Indisponível no momento.";
  if (freebieRestantesHoje() <= 0) return "Esgotado.";
  const free = PRODUTOS.find((p) => p.id === "free")!;
  const total = (u.saldoRecarga ?? 0) + (u.saldoProduzido ?? 0);
  if (total < free.preco) return "Saldo insuficiente. Faça um depósito.";
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  let resto = free.preco;
  const recarga = users[idx].saldoRecarga ?? 0;
  const usaRec = Math.min(recarga, resto);
  users[idx].saldoRecarga = recarga - usaRec;
  resto -= usaRec;
  users[idx].saldoProduzido = (users[idx].saldoProduzido ?? 0) - resto;
  users[idx].saldo = (users[idx].saldoRecarga ?? 0) + (users[idx].saldoProduzido ?? 0);
  users[idx].recebeuFreebie = true;
  saveUsers(users);
  const hoje = diaStr();
  const list = getFreebies();
  list.push({
    id: "f_" + Math.random().toString(36).slice(2, 8),
    userId: u.id, data: hoje, claimedAt: Date.now(),
  });
  saveFreebies(list);
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
  users[idx].saldoProduzido = (users[idx].saldoProduzido ?? 0) + valor;
  users[idx].saldo = (users[idx].saldoRecarga ?? 0) + (users[idx].saldoProduzido ?? 0);
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
export function creditarRendimentos() {
  const orders = getOrders();
  const users = getUsers();
  const agora = Date.now();
  let mudouOrders = false;
  let mudouUsers = false;
  for (const o of orders) {
    const p = PRODUTOS.find((x) => x.id === o.produtoId);
    if (!p) continue;
    const totalMs = p.duracaoDias * 86400000;
    const fim = o.compradoEm + totalMs;
    const desde = o.ultimoCredito ?? o.compradoEm;
    const ate = Math.min(agora, fim);
    if (ate <= desde) continue;
    const ganho = (p.rendimentoTotal / totalMs) * (ate - desde);
    if (ganho <= 0) continue;
    const idx = users.findIndex((u) => u.id === o.userId);
    if (idx < 0) continue;
    users[idx].saldoProduzido = (users[idx].saldoProduzido ?? 0) + ganho;
    users[idx].saldo = (users[idx].saldoRecarga ?? 0) + (users[idx].saldoProduzido ?? 0);
    o.ultimoCredito = ate;
    mudouOrders = true;
    mudouUsers = true;
  }
  if (mudouOrders) saveOrders(orders);
  if (mudouUsers) saveUsers(users);
}

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
  if (t.tipo === "deposito") {
    u.saldoRecarga = (u.saldoRecarga ?? 0) + t.valor;
    u.saldo = (u.saldoRecarga ?? 0) + (u.saldoProduzido ?? 0);
  }
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
  if (t.tipo === "levantamento") {
    u.saldoProduzido = (u.saldoProduzido ?? 0) + t.valor;
    u.saldo = (u.saldoRecarga ?? 0) + (u.saldoProduzido ?? 0);
  }
  t.status = "negado";
  saveUsers(users);
  saveTxs(txs);
}
export function adminEditarSaldo(userId: string, novoSaldo: number) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  // edita saldo produzido por padrão (o que pode ser levantado)
  users[idx].saldoProduzido = novoSaldo;
  users[idx].saldo = (users[idx].saldoRecarga ?? 0) + (users[idx].saldoProduzido ?? 0);
  saveUsers(users);
}

export function getVipNivel(userId: string): number {
  const orders = getOrders().filter((o) => o.userId === userId);
  let max = 0;
  for (const o of orders) {
    const p = PRODUTOS.find((x) => x.id === o.produtoId);
    if (p?.vip && p.vip > max) max = p.vip;
  }
  return max;
}
export function salvarFotoPerfil(dataUrl: string) {
  const u = currentUser();
  if (!u) return;
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  if (idx < 0) return;
  users[idx].fotoUrl = dataUrl;
  saveUsers(users);
}

export function vincularConta(metodo: "e-mola" | "mpesa", numero: string, nome: string): string | null {
  const u = currentUser();
  if (!u) return "Não autenticado";
  if (!/^8[2-7][0-9]{7}$/.test(numero)) return "Número MZ inválido";
  if (nome.trim().length < 2) return "Informe o nome";
  const users = getUsers();
  const idx = users.findIndex((x) => x.id === u.id);
  if (idx < 0) return "Usuário não encontrado";
  users[idx].contaVincMetodo = metodo;
  users[idx].contaVincNumero = numero;
  users[idx].contaVincNome = nome.trim();
  saveUsers(users);
  return null;
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
