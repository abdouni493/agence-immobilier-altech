import type {
  Client,
  Floor,
  Category,
  Room,
  Service,
  Reservation,
  Worker,
  Expense,
  ExpenseCategory,
  Maintenance,
  CashTransaction,
  Mediator,
  Sale,
  Purchase,
} from '@/types';
import { createDemoData } from './demoData';

export interface AppData {
  clients: Client[];
  floors: Floor[];
  categories: Category[];
  rooms: Room[];
  services: Service[];
  reservations: Reservation[];
  workers: Worker[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  maintenances: Maintenance[];
  cashTransactions: CashTransaction[];
  mediators: Mediator[];
  sales: Sale[];
  purchases: Purchase[];
  roles: string[];
}

/**
 * Données initiales de l'application. L'application fonctionne entièrement en
 * mémoire (aucune base de données) : on démarre donc sur le jeu de données de
 * démonstration afin que toutes les interfaces soient remplies.
 */
export function createInitialData(): AppData {
  return createDemoData();
}

/** Jeu de données vide — utilisé par « Réinitialiser les données ». */
export function createEmptyData(): AppData {
  return {
    clients: [],
    floors: [],
    categories: [],
    rooms: [],
    services: [],
    reservations: [],
    workers: [],
    expenses: [],
    expenseCategories: [],
    maintenances: [],
    cashTransactions: [],
    mediators: [],
    sales: [],
    purchases: [],
    roles: [],
  };
}
