/**
 * Store applicatif — 100 % EN MÉMOIRE.
 *
 * Aucune base de données, aucun appel réseau : toutes les données proviennent
 * du jeu de démonstration (`src/data/demoData.ts`) et toutes les mutations
 * (ajout / modification / suppression / paiement) sont appliquées localement.
 * Les modifications sont perdues au rechargement de la page, ce qui est le
 * comportement attendu d'une démo.
 */
import { create } from 'zustand';
import { todayISO, uid } from '@/lib/utils';
import type {
  User,
  StoreInfo,
  Client,
  Room,
  Service,
  Reservation,
  Payment,
  Worker,
  Advance,
  Absence,
  WorkerPayment,
  Expense,
  Maintenance,
  CashTransaction,
  Mediator,
  MediatorPayment,
  Sale,
  Purchase,
  Permissions,
  ModuleKey,
} from '@/types';
import { createInitialData, createEmptyData, type AppData } from '@/data/seed';
import { STORE_INFO } from '@/data/constants';
import {
  DEMO_ACCOUNTS,
  DEMO_ADMIN,
  DEMO_STORE_INFO,
  type DemoAccount,
} from '@/data/demoData';

// ─── Comptes (en mémoire) ───────────────────────────────────────────────────
//
// Les comptes de démonstration sont disponibles d'entrée ; un compte créé via
// le formulaire d'inscription vient simplement s'ajouter à cette liste pour la
// durée de la session.

const accounts: DemoAccount[] = DEMO_ACCOUNTS.map((a) => ({ ...a }));

function findAccount(identifier: string): DemoAccount | undefined {
  const id = identifier.trim().toLowerCase();
  return accounts.find(
    (a) => a.email.toLowerCase() === id || a.username.toLowerCase() === id,
  );
}

/** Retire le mot de passe avant de placer le compte dans l'état. */
function toUser(a: DemoAccount): User {
  return { ...a, password: '' };
}

// ─── Modèle de statut ──────────────────────────────────────────────────────
//
// Une location suit un CYCLE DE VIE que l'utilisateur fait avancer manuellement :
//   pending → active → (paid | debt)
//
//   • pending   — créée avec une date d'entrée future ; à activer le jour venu.
//   • active    — séjour en cours ; à terminer à partir de la date de sortie.
//   • paid      — terminée et intégralement réglée.
//   • debt      — terminée avec un reliquat (le solder la repasse en `paid`).
//   • cancelled — ne change jamais automatiquement.
//
// Un paiement ne doit JAMAIS faire changer d'étape du cycle de vie : une
// location FUTURE intégralement payée reste `pending`.

function paymentsSum(payments: Payment[]): number {
  return payments.reduce((s, p) => s + p.amount, 0);
}

/** Toute nouvelle location démarre en attente ; l'utilisateur l'active ensuite. */
function initialStatus(_checkIn: string, _today: string): Reservation['status'] {
  return 'pending';
}

/**
 * Réconcilie UNIQUEMENT la distinction payé/impayé d'une location déjà
 * terminée. Les statuts de cycle de vie (pending / active / cancelled) sont
 * pilotés explicitement par l'utilisateur et renvoyés tels quels.
 */
function reconcilePaymentStatus(
  status: Reservation['status'],
  total: number,
  payments: Payment[],
): Reservation['status'] {
  if (status === 'paid' || status === 'debt') {
    return paymentsSum(payments) >= total ? 'paid' : 'debt';
  }
  return status;
}

function nextResCode(reservations: Reservation[]): string {
  return nextCode(reservations, 'RES');
}

function nextCode(list: { code: string }[], prefix: string): string {
  const max = list.reduce((m, r) => {
    const n = parseInt(r.code.replace(/\D/g, ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

/** Réconciliation payé/impayé des ventes & achats (pas de cycle de vie). */
function settleStatus(total: number, payments: Payment[]): 'paid' | 'debt' {
  return paymentsSum(payments) >= total ? 'paid' : 'debt';
}

/** Attribue un id aux paiements saisis dans les assistants. */
function withIds(payments: Payment[], prefix: string): Payment[] {
  return payments.map((p) => ({ ...p, id: p.id || uid(prefix) }));
}

// ─── Interface d'état ──────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
}

interface AppState extends AppData, AuthState {
  storeInfo: StoreInfo;
  loading: boolean;

  // Helpers internes (conservés pour compatibilité — sans effet réseau)
  setUser: (user: User | null) => void;
  loadAll: () => Promise<void>;
  loadStoreInfo: () => Promise<void>;

  // Auth
  login: (identifier: string, password: string) => Promise<boolean>;
  loginDemo: () => Promise<boolean>;
  signup: (p: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateAccount: (patch: Partial<User>) => Promise<void>;
  changePassword: (oldPw: string, newPw: string) => Promise<boolean>;

  // Clients
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Biens / zones / catégories
  addRoom: (r: Omit<Room, 'id' | 'status'>) => Promise<Room | null>;
  updateRoom: (id: string, patch: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  setRoomMaintenance: (id: string, note?: string) => Promise<void>;
  endRoomMaintenance: (id: string) => Promise<void>;
  addFloor: (name: string) => Promise<void>;
  deleteFloor: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Services
  addService: (s: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, patch: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Locations
  addReservation: (r: Omit<Reservation, 'id' | 'code' | 'createdAt'>) => Promise<void>;
  updateReservation: (id: string, patch: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  addPayment: (resId: string, amount: number, note?: string) => Promise<void>;

  // Employés
  addWorker: (w: Omit<Worker, 'id' | 'advances' | 'absences' | 'payments'>) => Promise<void>;
  updateWorker: (id: string, patch: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  addWorkerAdvance: (workerId: string, a: Omit<Advance, 'id' | 'deducted'>) => Promise<void>;
  addWorkerAbsence: (workerId: string, a: Omit<Absence, 'id'>) => Promise<void>;
  addWorkerPayment: (workerId: string, p: Omit<WorkerPayment, 'id'>) => Promise<void>;
  setWorkerPermissions: (workerId: string, perms: Permissions) => Promise<void>;
  addRole: (name: string) => Promise<void>;

  // Dépenses
  addExpense: (e: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, patch: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addExpenseCategory: (name: string) => Promise<void>;
  deleteExpenseCategory: (id: string) => Promise<void>;

  // Maintenances
  addMaintenance: (m: Omit<Maintenance, 'id'>) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;

  // Caisse
  addCashTransaction: (t: Omit<CashTransaction, 'id'>) => Promise<void>;

  // Médiateurs
  addMediator: (m: Omit<Mediator, 'id' | 'createdAt' | 'payments'>) => Promise<Mediator>;
  updateMediator: (id: string, patch: Partial<Mediator>) => Promise<void>;
  deleteMediator: (id: string) => Promise<void>;
  addMediatorPayment: (mediatorId: string, amount: number, note?: string) => Promise<MediatorPayment | null>;

  // Ventes
  addSale: (s: Omit<Sale, 'id' | 'code' | 'createdAt'>) => Promise<Sale | null>;
  updateSale: (id: string, patch: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addSalePayment: (saleId: string, amount: number, note?: string) => Promise<Payment | null>;

  // Achats
  addPurchase: (p: Omit<Purchase, 'id' | 'code' | 'createdAt'>) => Promise<Purchase | null>;
  updatePurchase: (id: string, patch: Partial<Purchase>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  addPurchasePayment: (purchaseId: string, amount: number, note?: string) => Promise<Payment | null>;

  // Paramètres / données
  updateStoreInfo: (patch: Partial<StoreInfo>) => Promise<void>;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useApp = create<AppState>()((set, get) => ({
  ...createInitialData(),
  storeInfo: DEMO_STORE_INFO,
  user: null,
  loading: false,

  setUser: (user) => set({ user }),

  // Les données sont déjà en mémoire : ces deux appels ne font rien mais sont
  // conservés pour ne pas casser les composants qui les invoquent.
  loadAll: async () => {},
  loadStoreInfo: async () => {},

  // ── AUTH ─────────────────────────────────────────────────────────────────

  login: async (identifier, password) => {
    const account = findAccount(identifier);
    if (!account || account.password !== password) return false;
    set({ user: toUser(account) });
    return true;
  },

  /** Connexion immédiate avec le compte administrateur de démonstration. */
  loginDemo: async () => {
    const admin = findAccount(DEMO_ADMIN.username) ?? DEMO_ADMIN;
    set({ user: toUser(admin) });
    return true;
  },

  signup: async ({ firstName, lastName, email, username, password }) => {
    const mail = email.trim().toLowerCase();
    const uname = username.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === mail)) {
      return { ok: false, error: 'Cet email est déjà utilisé' };
    }
    if (accounts.some((a) => a.username.toLowerCase() === uname)) {
      return { ok: false, error: "Ce nom d'utilisateur est déjà pris" };
    }

    const account: DemoAccount = {
      id: uid('user'),
      name: `${firstName} ${lastName}`.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      role: 'admin',
      avatar: null,
    };
    accounts.push(account);
    set({ user: toUser(account) });
    return { ok: true };
  },

  logout: async () => {
    // On garde storeInfo (identité publique de l'agence) pour que l'écran de
    // connexion affiche toujours le bon nom / logo après déconnexion.
    set({ user: null });
  },

  updateAccount: async (patch) => {
    const u = get().user;
    if (!u) return;
    const account = accounts.find((a) => a.id === u.id);
    if (account) Object.assign(account, { ...patch, password: account.password });
    set((s) => ({ user: s.user ? { ...s.user, ...patch } : null }));
  },

  changePassword: async (oldPw, newPw) => {
    const u = get().user;
    if (!u) return false;
    const account = accounts.find((a) => a.id === u.id);
    if (!account || account.password !== oldPw) return false;
    account.password = newPw;
    return true;
  },

  // ── CLIENTS ──────────────────────────────────────────────────────────────

  addClient: async (c) => {
    const client: Client = {
      ...c,
      id: uid('cli'),
      createdAt: todayISO(),
      photos: c.photos ?? [],
    };
    set((s) => ({ clients: [client, ...s.clients] }));
    return client;
  },

  updateClient: async (id, patch) => {
    set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  },

  deleteClient: async (id) => {
    set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }));
  },

  // ── BIENS / ZONES / CATÉGORIES ───────────────────────────────────────────

  addRoom: async (r) => {
    const room: Room = { ...r, id: uid('apt'), status: 'available' };
    set((s) => ({ rooms: [...s.rooms, room] }));
    return room;
  },

  updateRoom: async (id, patch) => {
    set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  },

  deleteRoom: async (id) => {
    set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) }));
  },

  setRoomMaintenance: async (id, note) => {
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === id ? { ...r, status: 'maintenance', maintenanceNote: note } : r,
      ),
    }));
  },

  endRoomMaintenance: async (id) => {
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === id ? { ...r, status: 'available', maintenanceNote: undefined } : r,
      ),
    }));
  },

  addFloor: async (name) => {
    set((s) => ({ floors: [...s.floors, { id: uid('flr'), name }] }));
  },

  deleteFloor: async (id) => {
    set((s) => ({
      floors: s.floors.filter((f) => f.id !== id),
      rooms: s.rooms.filter((r) => r.floorId !== id),
    }));
  },

  addCategory: async (name) => {
    set((s) => ({ categories: [...s.categories, { id: uid('cat'), name }] }));
  },

  deleteCategory: async (id) => {
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },

  // ── SERVICES ─────────────────────────────────────────────────────────────

  addService: async (svc) => {
    set((s) => ({ services: [...s.services, { ...svc, id: uid('srv') }] }));
  },

  updateService: async (id, patch) => {
    set((s) => ({ services: s.services.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  },

  deleteService: async (id) => {
    set((s) => ({ services: s.services.filter((x) => x.id !== id) }));
  },

  // ── LOCATIONS ────────────────────────────────────────────────────────────

  addReservation: async (r) => {
    const today = todayISO();
    const newRes: Reservation = {
      ...r,
      id: uid('res'),
      code: nextResCode(get().reservations),
      payments: withIds(r.payments, 'pay'),
      // Le statut vient de l'assistant (basé sur les dates) ; repli défensif.
      status: r.status ?? initialStatus(r.checkIn, today),
      createdAt: today,
      notes: r.notes || undefined,
    };
    set((s) => ({ reservations: [newRes, ...s.reservations] }));
  },

  updateReservation: async (id, patch) => {
    set((s) => ({
      reservations: s.reservations.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...patch };
        if (patch.payments !== undefined) merged.payments = withIds(patch.payments, 'pay');
        // Un statut explicite dans le patch est une transition manuelle
        // (Activer / Terminer) et l'emporte ; sinon seule la distinction
        // payé/impayé est réconciliée.
        merged.status =
          patch.status ?? reconcilePaymentStatus(merged.status, merged.total, merged.payments);
        return merged;
      }),
    }));
  },

  deleteReservation: async (id) => {
    set((s) => ({ reservations: s.reservations.filter((r) => r.id !== id) }));
  },

  addPayment: async (resId, amount, note) => {
    const payment: Payment = { id: uid('pay'), amount, date: todayISO(), note: note || undefined };
    set((s) => ({
      reservations: s.reservations.map((r) => {
        if (r.id !== resId) return r;
        const payments = [...r.payments, payment];
        // Solder une dette la repasse en `paid` ; une location en attente ou en
        // cours conserve son statut de cycle de vie.
        return { ...r, payments, status: reconcilePaymentStatus(r.status, r.total, payments) };
      }),
    }));
  },

  // ── EMPLOYÉS ─────────────────────────────────────────────────────────────

  addWorker: async (w) => {
    const id = uid('wrk');
    const worker: Worker = {
      ...w,
      id,
      account:
        w.hasAccount && w.account
          ? { email: w.account.email, username: w.account.username, password: '' }
          : undefined,
      permissions: w.permissions || {},
      advances: [],
      absences: [],
      payments: [],
      active: w.active ?? true,
    };

    // Un employé avec compte peut se connecter immédiatement à la démo.
    if (w.hasAccount && w.account?.email && w.account?.password) {
      const authUserId = uid('user');
      worker.authUserId = authUserId;
      accounts.push({
        id: authUserId,
        name: w.name,
        username: w.account.username,
        email: w.account.email,
        password: w.account.password,
        role: 'worker',
        avatar: null,
        workerId: id,
        permissions: w.permissions || {},
      });
    }

    set((s) => ({
      workers: [...s.workers, worker],
      roles: s.roles.includes(w.role) ? s.roles : [...s.roles, w.role],
    }));
  },

  updateWorker: async (id, patch) => {
    set((s) => ({
      workers: s.workers.map((w) => (w.id === id ? { ...w, ...patch } : w)),
      roles:
        patch.role && !s.roles.includes(patch.role) ? [...s.roles, patch.role] : s.roles,
    }));
  },

  deleteWorker: async (id) => {
    set((s) => ({ workers: s.workers.filter((w) => w.id !== id) }));
  },

  addWorkerAdvance: async (workerId, a) => {
    const advance: Advance = { ...a, id: uid('adv'), deducted: false };
    set((s) => ({
      workers: s.workers.map((w) =>
        w.id === workerId ? { ...w, advances: [...w.advances, advance] } : w,
      ),
    }));
  },

  addWorkerAbsence: async (workerId, a) => {
    const absence: Absence = { ...a, id: uid('abs') };
    set((s) => ({
      workers: s.workers.map((w) =>
        w.id === workerId ? { ...w, absences: [...w.absences, absence] } : w,
      ),
    }));
  },

  addWorkerPayment: async (workerId, p) => {
    const payment: WorkerPayment = { ...p, id: uid('wp') };
    // Un paiement de salaire solde toutes les avances en attente.
    set((s) => ({
      workers: s.workers.map((w) =>
        w.id === workerId
          ? {
              ...w,
              payments: [...w.payments, payment],
              advances: w.advances.map((adv) => ({ ...adv, deducted: true })),
            }
          : w,
      ),
    }));
  },

  setWorkerPermissions: async (workerId, perms) => {
    const account = accounts.find((a) => a.workerId === workerId);
    if (account) account.permissions = perms;
    set((s) => ({
      workers: s.workers.map((w) => (w.id === workerId ? { ...w, permissions: perms } : w)),
      // Rafraîchit les permissions de l'utilisateur courant s'il est concerné.
      user:
        s.user && s.user.workerId === workerId ? { ...s.user, permissions: perms } : s.user,
    }));
  },

  addRole: async (name) => {
    if (get().roles.includes(name)) return;
    set((s) => ({ roles: [...s.roles, name] }));
  },

  // ── DÉPENSES ─────────────────────────────────────────────────────────────

  addExpense: async (e) => {
    set((s) => ({ expenses: [{ ...e, id: uid('exp') }, ...s.expenses] }));
  },

  updateExpense: async (id, patch) => {
    set((s) => ({ expenses: s.expenses.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  },

  deleteExpense: async (id) => {
    set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) }));
  },

  addExpenseCategory: async (name) => {
    set((s) => ({ expenseCategories: [...s.expenseCategories, { id: uid('exc'), name }] }));
  },

  deleteExpenseCategory: async (id) => {
    set((s) => ({ expenseCategories: s.expenseCategories.filter((c) => c.id !== id) }));
  },

  // ── MAINTENANCES ─────────────────────────────────────────────────────────

  addMaintenance: async (m) => {
    set((s) => ({ maintenances: [{ ...m, id: uid('mnt') }, ...s.maintenances] }));
  },

  deleteMaintenance: async (id) => {
    set((s) => ({ maintenances: s.maintenances.filter((m) => m.id !== id) }));
  },

  // ── CAISSE ───────────────────────────────────────────────────────────────

  addCashTransaction: async (t) => {
    set((s) => ({ cashTransactions: [{ ...t, id: uid('csh') }, ...s.cashTransactions] }));
  },

  // ── MÉDIATEURS ───────────────────────────────────────────────────────────

  addMediator: async (m) => {
    const mediator: Mediator = { ...m, id: uid('med'), payments: [], createdAt: todayISO() };
    set((s) => ({ mediators: [mediator, ...s.mediators] }));
    return mediator;
  },

  updateMediator: async (id, patch) => {
    set((s) => ({ mediators: s.mediators.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  },

  deleteMediator: async (id) => {
    set((s) => ({ mediators: s.mediators.filter((m) => m.id !== id) }));
  },

  addMediatorPayment: async (mediatorId, amount, note) => {
    const payment: MediatorPayment = {
      id: uid('medp'),
      amount,
      date: todayISO(),
      note: note || undefined,
    };
    set((s) => ({
      mediators: s.mediators.map((m) =>
        m.id === mediatorId ? { ...m, payments: [...m.payments, payment] } : m,
      ),
    }));
    return payment;
  },

  // ── VENTES ───────────────────────────────────────────────────────────────

  addSale: async (sale) => {
    const payments = withIds(sale.payments, 'sap');
    const newSale: Sale = {
      ...sale,
      id: uid('sal'),
      code: nextCode(get().sales, 'VEN'),
      payments,
      status: settleStatus(sale.price, payments),
      createdAt: todayISO(),
    };
    set((s) => ({ sales: [newSale, ...s.sales] }));
    return newSale;
  },

  updateSale: async (id, patch) => {
    set((s) => ({
      sales: s.sales.map((x) => {
        if (x.id !== id) return x;
        const merged = { ...x, ...patch };
        if (patch.payments !== undefined) merged.payments = withIds(patch.payments, 'sap');
        merged.status = settleStatus(merged.price, merged.payments);
        return merged;
      }),
    }));
  },

  deleteSale: async (id) => {
    set((s) => ({ sales: s.sales.filter((x) => x.id !== id) }));
  },

  addSalePayment: async (saleId, amount, note) => {
    const payment: Payment = { id: uid('sap'), amount, date: todayISO(), note: note || undefined };
    set((s) => ({
      sales: s.sales.map((x) => {
        if (x.id !== saleId) return x;
        const payments = [...x.payments, payment];
        return { ...x, payments, status: settleStatus(x.price, payments) };
      }),
    }));
    return payment;
  },

  // ── ACHATS ───────────────────────────────────────────────────────────────

  addPurchase: async (purchase) => {
    const payments = withIds(purchase.payments, 'pup');
    const newPurchase: Purchase = {
      ...purchase,
      id: uid('pur'),
      code: nextCode(get().purchases, 'ACH'),
      payments,
      status: settleStatus(purchase.purchasePrice, payments),
      createdAt: todayISO(),
    };
    set((s) => ({ purchases: [newPurchase, ...s.purchases] }));
    return newPurchase;
  },

  updatePurchase: async (id, patch) => {
    set((s) => ({
      purchases: s.purchases.map((x) => {
        if (x.id !== id) return x;
        const merged = { ...x, ...patch };
        if (patch.payments !== undefined) merged.payments = withIds(patch.payments, 'pup');
        merged.status = settleStatus(merged.purchasePrice, merged.payments);
        return merged;
      }),
    }));
  },

  deletePurchase: async (id) => {
    set((s) => ({ purchases: s.purchases.filter((x) => x.id !== id) }));
  },

  addPurchasePayment: async (purchaseId, amount, note) => {
    const payment: Payment = { id: uid('pup'), amount, date: todayISO(), note: note || undefined };
    set((s) => ({
      purchases: s.purchases.map((x) => {
        if (x.id !== purchaseId) return x;
        const payments = [...x.payments, payment];
        return { ...x, payments, status: settleStatus(x.purchasePrice, payments) };
      }),
    }));
    return payment;
  },

  // ── PARAMÈTRES / DONNÉES ─────────────────────────────────────────────────

  updateStoreInfo: async (patch) => {
    set((s) => ({ storeInfo: { ...s.storeInfo, ...patch } }));
  },

  exportData: () => {
    const s = get();
    const snapshot = {
      storeInfo: s.storeInfo,
      clients: s.clients,
      floors: s.floors,
      categories: s.categories,
      rooms: s.rooms,
      services: s.services,
      reservations: s.reservations,
      workers: s.workers,
      expenses: s.expenses,
      expenseCategories: s.expenseCategories,
      maintenances: s.maintenances,
      cashTransactions: s.cashTransactions,
      mediators: s.mediators,
      sales: s.sales,
      purchases: s.purchases,
      roles: s.roles,
    };
    return JSON.stringify(snapshot, null, 2);
  },

  importData: (json) => {
    try {
      const d = JSON.parse(json);
      set({
        storeInfo: d.storeInfo ?? get().storeInfo,
        clients: d.clients ?? [],
        floors: d.floors ?? [],
        categories: d.categories ?? [],
        rooms: d.rooms ?? [],
        services: d.services ?? [],
        reservations: d.reservations ?? [],
        workers: d.workers ?? [],
        expenses: d.expenses ?? [],
        expenseCategories: d.expenseCategories ?? [],
        maintenances: d.maintenances ?? [],
        cashTransactions: d.cashTransactions ?? [],
        mediators: d.mediators ?? [],
        sales: d.sales ?? [],
        purchases: d.purchases ?? [],
        roles: d.roles ?? [],
      });
      return true;
    } catch {
      return false;
    }
  },

  resetData: () => set({ ...createEmptyData(), storeInfo: STORE_INFO }),
}));

// ─── Helpers de permissions ─────────────────────────────────────────────────

export function useCurrentPermissions(): Permissions | null {
  const user = useApp((s) => s.user);
  const workers = useApp((s) => s.workers);
  if (!user || user.role === 'admin') return null;
  // On retrouve la fiche employé via le lien du profil (workerId) ou via
  // authUserId, qui vaut toujours l'id de l'utilisateur connecté.
  const worker = workers.find(
    (w) => (!!user.workerId && w.id === user.workerId) || (!!w.authUserId && w.authUserId === user.id),
  );
  if (worker) return worker.permissions ?? {};
  // Dernier recours : l'instantané des permissions porté par le compte.
  return user.permissions ?? {};
}

export function canAccess(perms: Permissions | null, module: ModuleKey): boolean {
  if (perms === null) return true;
  const actions = perms[module];
  return !!actions && actions.length > 0;
}

export function can(perms: Permissions | null, module: ModuleKey, action: string): boolean {
  if (perms === null) return true;
  return !!perms[module]?.includes(action as never);
}
