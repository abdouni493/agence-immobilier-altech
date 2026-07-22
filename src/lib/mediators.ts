import type { AppData } from '@/data/seed';
import type { Mediator, Worker } from '@/types';

/**
 * Un employé dont l'intitulé de poste contient « médiateur » (fr) ou « وسيط »
 * (ar) travaille aussi comme médiateur : il doit apparaître dans la recherche
 * de médiateurs (fiche appartement, vente, achat).
 */
const MEDIATOR_ROLE_RE = /m[ée]diat|وسيط/i;

export function isMediatorRole(role: string | undefined): boolean {
  return !!role && MEDIATOR_ROLE_RE.test(role);
}

/** Employés actifs ayant le rôle « Médiateur ». */
export function mediatorWorkers(data: AppData): Worker[] {
  return data.workers.filter((w) => w.active && isMediatorRole(w.role));
}

export interface MediatorOption {
  /** id de la fiche médiateur, ou id de l'employé tant qu'elle n'existe pas. */
  id: string;
  name: string;
  phone: string;
  /** 'mediator' = fiche médiateur ; 'worker' = employé au rôle Médiateur. */
  source: 'mediator' | 'worker';
  /** Renseigné pour `source === 'worker'` — sert à créer la fiche à la volée. */
  worker?: Worker;
  /** Ligne secondaire affichée dans la liste (rôle, ville…). */
  hint?: string;
}

/**
 * Liste unifiée « médiateurs + employés médiateurs ».
 *
 * Un employé déjà converti en fiche médiateur (`Mediator.workerId`) n'est pas
 * répété : seule sa fiche est proposée.
 */
export function mediatorOptions(data: AppData): MediatorOption[] {
  const linkedWorkerIds = new Set(
    data.mediators.map((m) => m.workerId).filter((id): id is string => !!id),
  );

  const fromMediators: MediatorOption[] = data.mediators.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`.trim(),
    phone: m.phone,
    source: 'mediator',
    hint: m.workerId ? 'Médiateur · Employé' : m.city || undefined,
  }));

  const fromWorkers: MediatorOption[] = mediatorWorkers(data)
    .filter((w) => !linkedWorkerIds.has(w.id))
    .map((w) => ({
      id: w.id,
      name: w.name,
      phone: w.phone,
      source: 'worker',
      worker: w,
      hint: w.role,
    }));

  return [...fromMediators, ...fromWorkers];
}

/** Filtre la liste sur le nom ou le téléphone. */
export function filterMediatorOptions(options: MediatorOption[], query: string): MediatorOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (o) => o.name.toLowerCase().includes(q) || o.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')),
  );
}

/** Découpe un nom complet en prénom / nom pour créer une fiche médiateur. */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() ?? '';
  return { firstName, lastName: parts.join(' ') };
}

/** Fiche médiateur à créer à partir d'un employé au rôle « Médiateur ». */
export function mediatorDraftFromWorker(w: Worker): Omit<Mediator, 'id' | 'createdAt' | 'payments'> {
  const { firstName, lastName } = splitFullName(w.name);
  return {
    firstName,
    lastName,
    phone: w.phone,
    phone2: '',
    email: w.account?.email ?? '',
    address: '',
    city: '',
    cin: w.cin ?? '',
    notes: `Employé — ${w.role}`,
    workerId: w.id,
  };
}
