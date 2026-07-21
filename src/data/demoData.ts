/**
 * DEMO DATASET — 100 % en mémoire, aucune base de données.
 *
 * Toutes les interfaces de l'application (tableau de bord, locations, ventes,
 * achats, appartements, services, clients, médiateurs, employés, dépenses,
 * caisse, rapports, paramètres) sont alimentées par ces constantes.
 *
 * Les dates sont calculées à partir du jour courant pour que la démo reste
 * « vivante » : locations en cours, à venir, terminées, impayées, etc.
 */
import { addDaysISO, todayISO } from '@/lib/utils';
import { fullPermissions } from './constants';
import type {
  CashTransaction,
  Category,
  Client,
  Expense,
  ExpenseCategory,
  Floor,
  Maintenance,
  Mediator,
  Permissions,
  Purchase,
  Reservation,
  Room,
  Sale,
  Service,
  StoreInfo,
  User,
  Worker,
} from '@/types';

// ─── Helpers de dates ───────────────────────────────────────────────────────

const TODAY = todayISO();

/** Date décalée de `n` jours par rapport à aujourd'hui (n négatif = passé). */
const d = (n: number) => addDaysISO(TODAY, n);

/** Le `day` du mois décalé de `months` par rapport au mois courant. */
function m(months: number, day: number): string {
  const [y, mo] = TODAY.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1 + months, day)).toISOString().slice(0, 10);
}

// ─── Identité de l'agence ───────────────────────────────────────────────────

export const DEMO_STORE_INFO: StoreInfo = {
  name: 'Agence Immobilière El Baraka',
  logo: null,
  description:
    "Location, vente et gestion de biens immobiliers à Alger depuis 2012. Démonstration hors-ligne.",
  email: 'contact@elbaraka-immo.dz',
  phone: '0555 12 34 56',
  address: '14, Rue Didouche Mourad, Alger Centre',
  nif: '000216001234567',
  nis: '000216987654321',
  article: '16050123456',
  rc: '16/00-1234567 B 12',
};

// ─── Comptes de démonstration ───────────────────────────────────────────────

export interface DemoAccount extends User {
  password: string;
}

export const DEMO_ADMIN: DemoAccount = {
  id: 'user-admin',
  name: 'Youssef Benali',
  username: 'admin',
  email: 'admin@demo.dz',
  password: 'demo1234',
  role: 'admin',
  avatar: null,
};

/** Compte employé (accès restreint) pour tester le système de permissions. */
export const DEMO_WORKER: DemoAccount = {
  id: 'user-worker',
  name: 'Amina Cherif',
  username: 'amina',
  email: 'amina@demo.dz',
  password: 'demo1234',
  role: 'worker',
  avatar: null,
  workerId: 'wrk-2',
  permissions: {
    dashboard: ['view'],
    reservations: ['view', 'create', 'edit', 'print', 'pay'],
    clients: ['view', 'create', 'edit'],
    chambres: ['view'],
    services: ['view'],
  },
};

export const DEMO_ACCOUNTS: DemoAccount[] = [DEMO_ADMIN, DEMO_WORKER];

// ─── Étages / zones ─────────────────────────────────────────────────────────

const floors: Floor[] = [
  { id: 'flr-1', name: 'Alger Centre' },
  { id: 'flr-2', name: 'Hydra' },
  { id: 'flr-3', name: 'Bab Ezzouar' },
  { id: 'flr-4', name: 'Chéraga' },
];

// ─── Catégories de biens ────────────────────────────────────────────────────

const categories: Category[] = [
  { id: 'cat-1', name: 'Studio' },
  { id: 'cat-2', name: 'F2' },
  { id: 'cat-3', name: 'F3' },
  { id: 'cat-4', name: 'F4' },
  { id: 'cat-5', name: 'Villa' },
  { id: 'cat-6', name: 'Local commercial' },
];

// ─── Clients ────────────────────────────────────────────────────────────────

const clients: Client[] = [
  {
    id: 'cli-1', firstName: 'Karim', lastName: 'Belkacem',
    birthDate: '1985-04-12', birthPlace: 'Alger', sexe: 'M', profession: 'Ingénieur',
    address: '22 Rue Larbi Ben M\'hidi', city: 'Alger', phone: '0661 23 45 67', phone2: '0770 11 22 33',
    email: 'karim.belkacem@mail.dz', documentType: 'cin', documentNumber: '160512345',
    documentIssueDate: '2018-03-02', documentExpiryDate: '2028-03-01', documentIssuePlace: 'Alger',
    photos: [], createdAt: m(-8, 5),
  },
  {
    id: 'cli-2', firstName: 'Nadia', lastName: 'Hamdi',
    birthDate: '1990-09-30', birthPlace: 'Blida', sexe: 'F', profession: 'Pharmacienne',
    address: '5 Cité des Roses', city: 'Blida', phone: '0555 98 76 54',
    email: 'nadia.hamdi@mail.dz', documentType: 'cin', documentNumber: '090998877',
    documentIssueDate: '2019-06-11', documentExpiryDate: '2029-06-10', documentIssuePlace: 'Blida',
    photos: [], createdAt: m(-7, 18),
  },
  {
    id: 'cli-3', firstName: 'Sofiane', lastName: 'Merbah',
    birthDate: '1978-01-22', birthPlace: 'Oran', sexe: 'M', profession: 'Commerçant',
    address: '77 Boulevard Front de Mer', city: 'Oran', phone: '0770 45 67 89',
    email: 'sofiane.merbah@mail.dz', documentType: 'passeport', documentNumber: 'X7712345',
    documentIssueDate: '2021-02-14', documentExpiryDate: '2031-02-13', documentIssuePlace: 'Oran',
    photos: [], createdAt: m(-6, 3),
  },
  {
    id: 'cli-4', firstName: 'Lamia', lastName: 'Zerrouki',
    birthDate: '1993-11-08', birthPlace: 'Constantine', sexe: 'F', profession: 'Architecte',
    address: '12 Rue Abane Ramdane', city: 'Constantine', phone: '0699 33 22 11',
    email: 'lamia.z@mail.dz', documentType: 'cin', documentNumber: '251193322',
    documentIssueDate: '2020-01-20', documentExpiryDate: '2030-01-19', documentIssuePlace: 'Constantine',
    photos: [], createdAt: m(-5, 22),
  },
  {
    id: 'cli-5', firstName: 'Rachid', lastName: 'Ould Ali',
    birthDate: '1969-07-03', birthPlace: 'Tizi Ouzou', sexe: 'M', profession: 'Retraité',
    address: '3 Village Ait Aissa', city: 'Tizi Ouzou', phone: '0554 10 20 30',
    documentType: 'cin', documentNumber: '150769003',
    documentIssueDate: '2017-09-05', documentExpiryDate: '2027-09-04', documentIssuePlace: 'Tizi Ouzou',
    photos: [], createdAt: m(-5, 9),
  },
  {
    id: 'cli-6', firstName: 'Yasmine', lastName: 'Bouzid',
    birthDate: '1996-02-17', birthPlace: 'Alger', sexe: 'F', profession: 'Étudiante',
    address: '9 Cité universitaire, Bab Ezzouar', city: 'Alger', phone: '0781 55 44 33',
    email: 'yasmine.bouzid@mail.dz', documentType: 'cin', documentNumber: '160296217',
    documentIssueDate: '2022-04-18', documentExpiryDate: '2032-04-17', documentIssuePlace: 'Alger',
    photos: [], createdAt: m(-4, 14),
  },
  {
    id: 'cli-7', firstName: 'Mourad', lastName: 'Slimani',
    birthDate: '1982-12-01', birthPlace: 'Sétif', sexe: 'M', profession: 'Chef d\'entreprise',
    address: '40 Zone industrielle', city: 'Sétif', phone: '0662 77 88 99', phone2: '0550 44 55 66',
    email: 'm.slimani@groupe-slimani.dz', documentType: 'permis', documentNumber: 'PC-19-874521',
    documentIssueDate: '2019-10-30', documentExpiryDate: '2029-10-29', documentIssuePlace: 'Sétif',
    photos: [], createdAt: m(-3, 7),
  },
  {
    id: 'cli-8', firstName: 'Samira', lastName: 'Kaci',
    birthDate: '1988-05-25', birthPlace: 'Béjaïa', sexe: 'F', profession: 'Enseignante',
    address: '17 Rue de la Liberté', city: 'Béjaïa', phone: '0771 66 55 44',
    email: 'samira.kaci@mail.dz', documentType: 'cin', documentNumber: '060588525',
    documentIssueDate: '2021-07-12', documentExpiryDate: '2031-07-11', documentIssuePlace: 'Béjaïa',
    photos: [], createdAt: m(-2, 19),
  },
  {
    id: 'cli-9', firstName: 'Djamel', lastName: 'Ferhat',
    birthDate: '1975-03-14', birthPlace: 'Alger', sexe: 'M', profession: 'Promoteur immobilier',
    address: '88 Lotissement El Feth, Hydra', city: 'Alger', phone: '0560 12 12 12',
    email: 'd.ferhat@promo-feth.dz', documentType: 'cin', documentNumber: '160375314',
    documentIssueDate: '2016-11-02', documentExpiryDate: '2026-11-01', documentIssuePlace: 'Alger',
    photos: [], createdAt: m(-2, 2),
  },
  {
    id: 'cli-10', firstName: 'Imene', lastName: 'Bensalah',
    birthDate: '1998-08-09', birthPlace: 'Alger', sexe: 'F', profession: 'Graphiste',
    address: '6 Résidence Les Pins, Chéraga', city: 'Alger', phone: '0556 89 89 89',
    email: 'imene.bensalah@mail.dz', documentType: 'cin', documentNumber: '160898809',
    documentIssueDate: '2023-01-16', documentExpiryDate: '2033-01-15', documentIssuePlace: 'Alger',
    photos: [], createdAt: m(-1, 11),
  },
  {
    id: 'cli-11', firstName: 'Toufik', lastName: 'Aouameur',
    birthDate: '1980-06-21', birthPlace: 'Boumerdès', sexe: 'M', profession: 'Médecin',
    address: '2 Cité 200 logements', city: 'Boumerdès', phone: '0663 21 43 65',
    email: 'dr.aouameur@mail.dz', documentType: 'cin', documentNumber: '350680621',
    documentIssueDate: '2018-05-23', documentExpiryDate: '2028-05-22', documentIssuePlace: 'Boumerdès',
    photos: [], createdAt: d(-24),
  },
  {
    id: 'cli-12', firstName: 'Hakima', lastName: 'Larbi',
    birthDate: '1991-10-04', birthPlace: 'Alger', sexe: 'F', profession: 'Comptable',
    address: '31 Rue Hassiba Ben Bouali', city: 'Alger', phone: '0779 04 10 91',
    email: 'hakima.larbi@mail.dz', documentType: 'cin', documentNumber: '160991004',
    documentIssueDate: '2022-09-08', documentExpiryDate: '2032-09-07', documentIssuePlace: 'Alger',
    photos: [], createdAt: d(-9),
  },
];

// ─── Médiateurs ─────────────────────────────────────────────────────────────

const mediators: Mediator[] = [
  {
    id: 'med-1', firstName: 'Ali', lastName: 'Tounsi', phone: '0550 33 44 55',
    phone2: '0770 33 44 55', email: 'ali.tounsi@mail.dz',
    address: '18 Rue Ben Boulaid', city: 'Alger', cin: '160480112',
    notes: 'Spécialisé dans le centre-ville. Commission habituelle : 2 %.',
    payments: [
      { id: 'medp-1', amount: 120000, date: m(-4, 12), note: 'Acompte VEN-001' },
      { id: 'medp-2', amount: 80000, date: m(-2, 6), note: 'Solde VEN-001' },
    ],
    createdAt: m(-9, 2),
  },
  {
    id: 'med-2', firstName: 'Farid', lastName: 'Boudjema', phone: '0661 88 77 66',
    email: 'farid.boudjema@mail.dz', address: '4 Cité Djenane El Malik', city: 'Hydra',
    cin: '160275443', notes: 'Réseau haut standing Hydra / Ben Aknoun.',
    payments: [{ id: 'medp-3', amount: 250000, date: m(-1, 20), note: 'Commission VEN-003' }],
    createdAt: m(-7, 15),
  },
  {
    id: 'med-3', firstName: 'Sabrina', lastName: 'Meziane', phone: '0778 11 99 22',
    email: 'sabrina.meziane@mail.dz', address: '11 Rue des Frères Bouadou', city: 'Bir Mourad Raïs',
    cin: '160389221', notes: 'Très active sur la location meublée.',
    payments: [],
    createdAt: m(-3, 26),
  },
  {
    id: 'med-4', firstName: 'Nabil', lastName: 'Hadjadj', phone: '0554 65 43 21',
    email: 'nabil.hadjadj@mail.dz', address: '25 Cité AADL, Bab Ezzouar', city: 'Alger',
    cin: '160590876', notes: 'Apporteur d\'affaires — secteur est d\'Alger.',
    payments: [{ id: 'medp-4', amount: 60000, date: d(-12), note: 'Acompte VEN-004' }],
    createdAt: d(-40),
  },
];

// ─── Appartements / biens ───────────────────────────────────────────────────

const rooms: Room[] = [
  {
    id: 'apt-1', name: 'A-101', capacity: 2, floorId: 'flr-1', categoryId: 'cat-2',
    pricePerNight: 4500, status: 'available',
    wilaya: 'Alger', commune: 'Alger Centre', secteur: 'Didouche Mourad',
    description: 'F2 meublé, 2ème étage, balcon donnant sur la rue principale.',
    propertyType: 'rental', ownerClientId: 'cli-5', ownerName: 'Rachid Ould Ali',
    ownerPhone: '0554 10 20 30', mediatorId: 'med-1',
  },
  {
    id: 'apt-2', name: 'A-102', capacity: 3, floorId: 'flr-1', categoryId: 'cat-3',
    pricePerNight: 6500, status: 'available',
    wilaya: 'Alger', commune: 'Alger Centre', secteur: 'Place Audin',
    description: 'F3 lumineux entièrement rénové, ascenseur, proche métro.',
    propertyType: 'rental', ownerClientId: 'cli-9', ownerName: 'Djamel Ferhat',
    ownerPhone: '0560 12 12 12', mediatorId: 'med-1',
  },
  {
    id: 'apt-3', name: 'A-103', capacity: 1, floorId: 'flr-1', categoryId: 'cat-1',
    pricePerNight: 3000, status: 'available',
    wilaya: 'Alger', commune: 'Alger Centre', secteur: 'Telemly',
    description: 'Studio meublé idéal étudiant, charges comprises.',
    propertyType: 'rental', ownerName: 'Société SARL Immo Plus', ownerPhone: '023 55 66 77',
  },
  {
    id: 'apt-4', name: 'H-201', capacity: 4, floorId: 'flr-2', categoryId: 'cat-4',
    pricePerNight: 12000, status: 'available',
    wilaya: 'Alger', commune: 'Hydra', secteur: 'Djenane El Malik',
    description: 'F4 haut standing, 140 m², double garage, vue dégagée.',
    propertyType: 'rental', ownerClientId: 'cli-9', ownerName: 'Djamel Ferhat',
    ownerPhone: '0560 12 12 12', mediatorId: 'med-2',
  },
  {
    id: 'apt-5', name: 'H-202', capacity: 6, floorId: 'flr-2', categoryId: 'cat-5',
    pricePerNight: 25000, status: 'available',
    wilaya: 'Alger', commune: 'Hydra', secteur: 'Paradou',
    description: 'Villa R+1 avec jardin 400 m² et piscine.',
    propertyType: 'sale', ownerClientId: 'cli-7', ownerName: 'Mourad Slimani',
    ownerPhone: '0662 77 88 99', mediatorId: 'med-2',
    salePrice: 78000000, purchasePrice: 65000000,
  },
  {
    id: 'apt-6', name: 'H-203', capacity: 3, floorId: 'flr-2', categoryId: 'cat-3',
    pricePerNight: 9000, status: 'maintenance',
    maintenanceNote: 'Réfection complète de la salle de bain — fin prévue sous 10 jours.',
    wilaya: 'Alger', commune: 'Hydra', secteur: 'Poirson',
    description: 'F3 avec terrasse, immeuble sécurisé.',
    propertyType: 'rental', ownerName: 'Mme Zohra Amrani', ownerPhone: '0770 90 80 70',
  },
  {
    id: 'apt-7', name: 'B-301', capacity: 3, floorId: 'flr-3', categoryId: 'cat-3',
    pricePerNight: 5500, status: 'available',
    wilaya: 'Alger', commune: 'Bab Ezzouar', secteur: 'Cité AADL',
    description: 'F3 AADL, 5ème étage avec ascenseur, proche USTHB.',
    propertyType: 'rental', ownerClientId: 'cli-3', ownerName: 'Sofiane Merbah',
    ownerPhone: '0770 45 67 89', mediatorId: 'med-4',
  },
  {
    id: 'apt-8', name: 'B-302', capacity: 2, floorId: 'flr-3', categoryId: 'cat-2',
    pricePerNight: 4000, status: 'available',
    wilaya: 'Alger', commune: 'Bab Ezzouar', secteur: 'Cité 5 Juillet',
    description: 'F2 non meublé, cuisine équipée, place de parking.',
    propertyType: 'rental', ownerName: 'Hocine Belaid', ownerPhone: '0556 32 32 32',
  },
  {
    id: 'apt-9', name: 'B-303', capacity: 4, floorId: 'flr-3', categoryId: 'cat-4',
    pricePerNight: 7500, status: 'available',
    wilaya: 'Alger', commune: 'Bab Ezzouar', secteur: 'Bab Ezzouar Centre',
    description: 'F4 à vendre, 110 m², acte notarié disponible.',
    propertyType: 'sale', ownerClientId: 'cli-5', ownerName: 'Rachid Ould Ali',
    ownerPhone: '0554 10 20 30', mediatorId: 'med-4',
    salePrice: 21500000, purchasePrice: 18000000,
  },
  {
    id: 'apt-10', name: 'C-401', capacity: 2, floorId: 'flr-4', categoryId: 'cat-2',
    pricePerNight: 5000, status: 'available',
    wilaya: 'Alger', commune: 'Chéraga', secteur: 'Résidence Les Pins',
    description: 'F2 neuf dans résidence fermée avec gardiennage 24h/24.',
    propertyType: 'rental', ownerClientId: 'cli-10', ownerName: 'Imene Bensalah',
    ownerPhone: '0556 89 89 89', mediatorId: 'med-3',
  },
  {
    id: 'apt-11', name: 'C-402', capacity: 5, floorId: 'flr-4', categoryId: 'cat-5',
    pricePerNight: 18000, status: 'available',
    wilaya: 'Alger', commune: 'Chéraga', secteur: 'Ouled Fayet',
    description: 'Villa duplex 250 m², 4 chambres, garage 2 voitures.',
    propertyType: 'sale', ownerClientId: 'cli-7', ownerName: 'Mourad Slimani',
    ownerPhone: '0662 77 88 99', mediatorId: 'med-2',
    salePrice: 52000000, purchasePrice: 44000000,
  },
  {
    id: 'apt-12', name: 'C-403', capacity: 1, floorId: 'flr-4', categoryId: 'cat-6',
    pricePerNight: 8000, status: 'available',
    wilaya: 'Alger', commune: 'Chéraga', secteur: 'Route de Dely Ibrahim',
    description: 'Local commercial 60 m² en rez-de-chaussée, vitrine sur rue.',
    propertyType: 'rental', ownerName: 'SARL Sahara Invest', ownerPhone: '023 44 33 22',
    mediatorId: 'med-3',
  },
];

// ─── Services ───────────────────────────────────────────────────────────────

const services: Service[] = [
  { id: 'srv-1', name: 'Frais de dossier', description: 'Constitution et vérification du dossier locataire', price: 5000 },
  { id: 'srv-2', name: 'État des lieux', description: 'Établissement du constat d\'entrée et de sortie', price: 3500 },
  { id: 'srv-3', name: 'Nettoyage complet', description: 'Nettoyage professionnel avant remise des clés', price: 6000 },
  { id: 'srv-4', name: 'Assurance habitation', description: 'Souscription annuelle multirisque habitation', price: 12000 },
  { id: 'srv-5', name: 'Reportage photo', description: 'Prise de vue professionnelle du bien (12 photos)', price: 8000 },
  { id: 'srv-6', name: 'Publication annonce premium', description: 'Mise en avant 30 jours sur les portails partenaires', price: 4500 },
  { id: 'srv-7', name: 'Rédaction du contrat', description: 'Rédaction et enregistrement du bail', price: 7000 },
];

// ─── Locations (réservations) ───────────────────────────────────────────────

const reservations: Reservation[] = [
  {
    id: 'res-1', code: 'RES-001', clientId: 'cli-1',
    rooms: [{ roomId: 'apt-2', pricePerNight: 6500 }],
    services: [{ serviceId: 'srv-1', quantity: 1, unitPrice: 5000 }, { serviceId: 'srv-2', quantity: 1, unitPrice: 3500 }],
    checkIn: d(-95), checkOut: d(-65), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 30, total: 203500,
    payments: [
      { id: 'pay-1', amount: 100000, date: d(-95), note: 'Acompte à la signature' },
      { id: 'pay-2', amount: 103500, date: d(-66), note: 'Solde' },
    ],
    status: 'paid', createdAt: d(-98), notes: 'Location courte durée — mission professionnelle.',
  },
  {
    id: 'res-2', code: 'RES-002', clientId: 'cli-2',
    rooms: [{ roomId: 'apt-1', pricePerNight: 4500 }],
    services: [{ serviceId: 'srv-1', quantity: 1, unitPrice: 5000 }],
    checkIn: d(-70), checkOut: d(-40), checkInTime: '15:00', checkOutTime: '10:00',
    nights: 30, total: 140000,
    payments: [{ id: 'pay-3', amount: 90000, date: d(-70), note: 'Acompte' }],
    status: 'debt', createdAt: d(-74), notes: 'Reste 50 000 DA à régler.',
  },
  {
    id: 'res-3', code: 'RES-003', clientId: 'cli-6',
    rooms: [{ roomId: 'apt-3', pricePerNight: 3000 }],
    services: [{ serviceId: 'srv-1', quantity: 1, unitPrice: 5000 }, { serviceId: 'srv-7', quantity: 1, unitPrice: 7000 }],
    checkIn: d(-40), checkOut: d(-10), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 30, total: 102000,
    payments: [
      { id: 'pay-4', amount: 52000, date: d(-40), note: 'Acompte' },
      { id: 'pay-5', amount: 50000, date: d(-11), note: 'Solde' },
    ],
    status: 'paid', createdAt: d(-43), notes: 'Étudiante — location studio meublé.',
  },
  {
    id: 'res-4', code: 'RES-004', clientId: 'cli-4',
    rooms: [{ roomId: 'apt-4', pricePerNight: 12000 }],
    services: [{ serviceId: 'srv-2', quantity: 1, unitPrice: 3500 }, { serviceId: 'srv-4', quantity: 1, unitPrice: 12000 }],
    checkIn: d(-12), checkOut: d(18), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 30, total: 375500,
    payments: [{ id: 'pay-6', amount: 200000, date: d(-12), note: 'Acompte 1er mois' }],
    status: 'active', createdAt: d(-16), notes: 'Bail meublé F4 Hydra — en cours.',
  },
  {
    id: 'res-5', code: 'RES-005', clientId: 'cli-7',
    rooms: [{ roomId: 'apt-12', pricePerNight: 8000 }],
    services: [{ serviceId: 'srv-1', quantity: 1, unitPrice: 5000 }, { serviceId: 'srv-6', quantity: 1, unitPrice: 4500 }],
    checkIn: d(-5), checkOut: d(25), checkInTime: '09:00', checkOutTime: '18:00',
    nights: 30, total: 249500,
    payments: [
      { id: 'pay-7', amount: 120000, date: d(-5), note: 'Acompte' },
      { id: 'pay-8', amount: 60000, date: d(-1), note: 'Versement complémentaire' },
    ],
    status: 'active', createdAt: d(-8), notes: 'Local commercial loué pour showroom.',
  },
  {
    id: 'res-6', code: 'RES-006', clientId: 'cli-8',
    rooms: [{ roomId: 'apt-7', pricePerNight: 5500 }],
    services: [{ serviceId: 'srv-1', quantity: 1, unitPrice: 5000 }],
    checkIn: d(0), checkOut: d(30), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 30, total: 170000,
    payments: [{ id: 'pay-9', amount: 85000, date: d(0), note: 'Acompte 50 %' }],
    status: 'pending', createdAt: d(-3), notes: 'Entrée prévue aujourd\'hui — à activer.',
  },
  {
    id: 'res-7', code: 'RES-007', clientId: 'cli-10',
    rooms: [{ roomId: 'apt-10', pricePerNight: 5000 }],
    services: [{ serviceId: 'srv-2', quantity: 1, unitPrice: 3500 }, { serviceId: 'srv-3', quantity: 1, unitPrice: 6000 }],
    checkIn: d(7), checkOut: d(37), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 30, total: 159500,
    payments: [{ id: 'pay-10', amount: 50000, date: d(-2), note: 'Réservation' }],
    status: 'pending', createdAt: d(-2), notes: 'Réservation confirmée par téléphone.',
  },
  {
    id: 'res-8', code: 'RES-008', clientId: 'cli-11',
    rooms: [{ roomId: 'apt-8', pricePerNight: 4000 }],
    services: [],
    checkIn: d(14), checkOut: d(44), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 30, total: 120000,
    payments: [],
    status: 'pending', createdAt: d(-1), notes: 'En attente du premier versement.',
  },
  {
    id: 'res-9', code: 'RES-009', clientId: 'cli-3',
    rooms: [{ roomId: 'apt-1', pricePerNight: 4500 }, { roomId: 'apt-8', pricePerNight: 4000 }],
    services: [{ serviceId: 'srv-3', quantity: 2, unitPrice: 6000 }],
    checkIn: d(-30), checkOut: d(-15), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 15, total: 139500,
    payments: [{ id: 'pay-11', amount: 60000, date: d(-30), note: 'Acompte' }],
    status: 'debt', createdAt: d(-33), notes: 'Deux biens loués simultanément — solde en attente.',
  },
  {
    id: 'res-10', code: 'RES-010', clientId: 'cli-12',
    rooms: [{ roomId: 'apt-10', pricePerNight: 5000 }],
    services: [{ serviceId: 'srv-1', quantity: 1, unitPrice: 5000 }],
    checkIn: d(-60), checkOut: d(-50), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 10, total: 55000,
    payments: [],
    status: 'cancelled', createdAt: d(-63), notes: 'Annulée par le client (désistement).',
  },
  {
    id: 'res-11', code: 'RES-011', clientId: 'cli-2',
    rooms: [{ roomId: 'apt-2', pricePerNight: 6500 }],
    services: [{ serviceId: 'srv-5', quantity: 1, unitPrice: 8000 }],
    checkIn: d(-150), checkOut: d(-120), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 30, total: 203000,
    payments: [
      { id: 'pay-12', amount: 103000, date: d(-150), note: 'Acompte' },
      { id: 'pay-13', amount: 100000, date: d(-121), note: 'Solde' },
    ],
    status: 'paid', createdAt: d(-155),
  },
  {
    id: 'res-12', code: 'RES-012', clientId: 'cli-1',
    rooms: [{ roomId: 'apt-7', pricePerNight: 5500 }],
    services: [],
    checkIn: d(-120), checkOut: d(-100), checkInTime: '14:00', checkOutTime: '11:00',
    nights: 20, total: 110000,
    payments: [{ id: 'pay-14', amount: 110000, date: d(-119), note: 'Paiement intégral' }],
    status: 'paid', createdAt: d(-123),
  },
];

// ─── Ventes ─────────────────────────────────────────────────────────────────

const sales: Sale[] = [
  {
    id: 'sal-1', code: 'VEN-001', roomId: 'apt-9', clientId: 'cli-1', mediatorId: 'med-1',
    commissionType: 'percent', commissionPercent: 1, mediatorCommission: 200000,
    price: 20000000, date: m(-4, 10), time: '10:30',
    payments: [
      { id: 'sap-1', amount: 8000000, date: m(-4, 10), note: 'Compromis de vente' },
      { id: 'sap-2', amount: 12000000, date: m(-3, 8), note: 'Solde chez le notaire' },
    ],
    status: 'paid', notes: 'Vente finalisée — acte notarié signé.', createdAt: m(-4, 8),
  },
  {
    id: 'sal-2', code: 'VEN-002', roomId: 'apt-11', clientId: 'cli-7', mediatorId: 'med-3',
    commissionType: 'amount', mediatorCommission: 150000,
    price: 50000000, date: m(-2, 14), time: '11:00',
    payments: [{ id: 'sap-3', amount: 20000000, date: m(-2, 14), note: 'Premier versement' }],
    status: 'debt', notes: 'Reste 30 000 000 DA — échéancier sur 6 mois.', createdAt: m(-2, 12),
  },
  {
    id: 'sal-3', code: 'VEN-003', roomId: 'apt-5', clientId: 'cli-9', mediatorId: 'med-2',
    commissionType: 'percent', commissionPercent: 2, mediatorCommission: 1500000,
    price: 75000000, date: m(-1, 18), time: '09:45',
    payments: [
      { id: 'sap-4', amount: 30000000, date: m(-1, 18), note: 'Acompte' },
      { id: 'sap-5', amount: 15000000, date: d(-20), note: 'Deuxième tranche' },
    ],
    status: 'debt', notes: 'Villa Hydra — financement bancaire en cours.', createdAt: m(-1, 15),
  },
  {
    id: 'sal-4', code: 'VEN-004', roomId: 'apt-9', clientId: 'cli-11', mediatorId: 'med-4',
    commissionType: 'amount', mediatorCommission: 90000,
    price: 21500000, date: d(-14), time: '14:15',
    payments: [{ id: 'sap-6', amount: 5000000, date: d(-14), note: 'Réservation du bien' }],
    status: 'debt', notes: 'Dossier de crédit CPA déposé.', createdAt: d(-16),
  },
  {
    id: 'sal-5', code: 'VEN-005', roomId: 'apt-11', clientId: 'cli-4',
    commissionType: 'amount', mediatorCommission: 0,
    price: 18000000, date: d(-4), time: '16:00',
    payments: [{ id: 'sap-7', amount: 18000000, date: d(-4), note: 'Paiement comptant' }],
    status: 'paid', notes: 'Vente directe sans médiateur.', createdAt: d(-5),
  },
];

// ─── Achats ─────────────────────────────────────────────────────────────────

const purchases: Purchase[] = [
  {
    id: 'pur-1', code: 'ACH-001', roomId: 'apt-9', clientId: 'cli-5',
    purchasePrice: 18000000, salePrice: 21500000,
    date: m(-5, 6), time: '10:00',
    payments: [
      { id: 'pup-1', amount: 10000000, date: m(-5, 6), note: 'Premier versement' },
      { id: 'pup-2', amount: 8000000, date: m(-4, 3), note: 'Solde' },
    ],
    status: 'paid', notes: 'Acquisition F4 Bab Ezzouar pour revente.', createdAt: m(-5, 4),
  },
  {
    id: 'pur-2', code: 'ACH-002', roomId: 'apt-11', clientId: 'cli-7',
    purchasePrice: 44000000, salePrice: 52000000,
    date: m(-3, 21), time: '11:30',
    payments: [{ id: 'pup-3', amount: 25000000, date: m(-3, 21), note: 'Acompte' }],
    status: 'debt', notes: 'Villa Ouled Fayet — reste 19 000 000 DA.', createdAt: m(-3, 19),
  },
  {
    id: 'pur-3', code: 'ACH-003', roomId: 'apt-5', clientId: 'cli-7',
    purchasePrice: 65000000, salePrice: 78000000,
    date: m(-2, 9), time: '09:00',
    payments: [
      { id: 'pup-4', amount: 30000000, date: m(-2, 9), note: 'Acompte' },
      { id: 'pup-5', amount: 20000000, date: m(-1, 5), note: 'Deuxième tranche' },
    ],
    status: 'debt', notes: 'Villa Paradou — solde prévu après revente.', createdAt: m(-2, 6),
  },
  {
    id: 'pur-4', code: 'ACH-004', roomId: 'apt-8', clientId: 'cli-3',
    purchasePrice: 9500000, salePrice: 12000000,
    date: d(-18), time: '15:30',
    payments: [{ id: 'pup-6', amount: 9500000, date: d(-18), note: 'Paiement comptant' }],
    status: 'paid', notes: 'F2 Bab Ezzouar acquis au comptant.', createdAt: d(-20),
  },
];

// ─── Employés ───────────────────────────────────────────────────────────────

const workers: Worker[] = [
  {
    id: 'wrk-1', name: 'Youssef Benali', birthDate: '1986-02-11', cin: '160286211',
    phone: '0555 12 34 56', role: 'Directeur d\'agence', startDate: m(-24, 1),
    hasSalary: true, salaryType: 'monthly', salaryAmount: 120000,
    hasAccount: true, account: { email: 'admin@demo.dz', username: 'admin', password: '' },
    authUserId: 'user-admin', permissions: fullPermissions(),
    advances: [],
    absences: [],
    payments: [
      { id: 'wp-1', date: m(-3, 28), amount: 120000, description: 'Salaire mensuel' },
      { id: 'wp-2', date: m(-2, 28), amount: 120000, description: 'Salaire mensuel' },
      { id: 'wp-3', date: m(-1, 28), amount: 120000, description: 'Salaire mensuel' },
    ],
    active: true,
  },
  {
    id: 'wrk-2', name: 'Amina Cherif', birthDate: '1994-07-19', cin: '160794719',
    phone: '0661 45 45 45', role: 'Chargée de location', startDate: m(-14, 15),
    hasSalary: true, salaryType: 'monthly', salaryAmount: 65000,
    hasAccount: true, account: { email: 'amina@demo.dz', username: 'amina', password: '' },
    authUserId: 'user-worker',
    permissions: DEMO_WORKER.permissions as Permissions,
    advances: [{ id: 'adv-1', date: d(-9), description: 'Avance sur salaire', amount: 15000, deducted: false }],
    absences: [{ id: 'abs-1', date: d(-21), description: 'Absence non justifiée', cost: 2500 }],
    payments: [
      { id: 'wp-4', date: m(-2, 28), amount: 65000, description: 'Salaire mensuel' },
      { id: 'wp-5', date: m(-1, 28), amount: 62500, description: 'Salaire mensuel (retenue absence)' },
    ],
    active: true,
  },
  {
    id: 'wrk-3', name: 'Bilal Saïdi', birthDate: '1997-03-05', cin: '160397305',
    phone: '0770 78 78 78', role: 'Agent commercial', startDate: m(-9, 2),
    hasSalary: true, salaryType: 'monthly', salaryAmount: 55000,
    hasAccount: false, permissions: {},
    advances: [
      { id: 'adv-2', date: m(-2, 12), description: 'Avance exceptionnelle', amount: 20000, deducted: true },
      { id: 'adv-3', date: d(-4), description: 'Avance carburant', amount: 8000, deducted: false },
    ],
    absences: [],
    payments: [
      { id: 'wp-6', date: m(-2, 28), amount: 35000, description: 'Salaire (avance déduite)' },
      { id: 'wp-7', date: m(-1, 28), amount: 55000, description: 'Salaire mensuel' },
    ],
    active: true,
  },
  {
    id: 'wrk-4', name: 'Meriem Talbi', birthDate: '1999-12-23', cin: '160999223',
    phone: '0556 34 34 34', role: 'Secrétaire', startDate: m(-6, 10),
    hasSalary: true, salaryType: 'monthly', salaryAmount: 45000,
    hasAccount: false, permissions: {},
    advances: [],
    absences: [{ id: 'abs-2', date: d(-35), description: 'Congé maladie non couvert', cost: 3500 }],
    payments: [{ id: 'wp-8', date: m(-1, 28), amount: 41500, description: 'Salaire mensuel' }],
    active: true,
  },
  {
    id: 'wrk-5', name: 'Omar Ghali', birthDate: '1983-08-30', cin: '160883830',
    phone: '0662 90 90 90', role: 'Agent d\'entretien', startDate: m(-11, 20),
    hasSalary: true, salaryType: 'daily', salaryAmount: 2200,
    hasAccount: false, permissions: {},
    advances: [],
    absences: [],
    payments: [{ id: 'wp-9', date: m(-1, 28), amount: 57200, description: 'Salaire journalier × 26' }],
    active: true,
  },
  {
    id: 'wrk-6', name: 'Sami Redjem', birthDate: '1992-05-14', cin: '160592514',
    phone: '0779 22 22 22', role: 'Agent commercial', startDate: m(-18, 5),
    hasSalary: false,
    hasAccount: false, permissions: {},
    advances: [], absences: [], payments: [],
    active: false,
  },
];

const roles: string[] = [
  'Directeur d\'agence',
  'Chargée de location',
  'Agent commercial',
  'Secrétaire',
  'Agent d\'entretien',
];

// ─── Catégories de dépenses ─────────────────────────────────────────────────

const expenseCategories: ExpenseCategory[] = [
  { id: 'exc-1', name: 'Loyer & charges' },
  { id: 'exc-2', name: 'Électricité & eau' },
  { id: 'exc-3', name: 'Publicité & marketing' },
  { id: 'exc-4', name: 'Fournitures de bureau' },
  { id: 'exc-5', name: 'Transport & carburant' },
  { id: 'exc-6', name: 'Frais administratifs' },
  { id: 'exc-7', name: 'Internet & téléphone' },
];

// ─── Dépenses ───────────────────────────────────────────────────────────────

const expenses: Expense[] = [
  { id: 'exp-1', name: 'Loyer du local — agence', categoryId: 'exc-1', amount: 85000, date: m(-3, 2), description: 'Loyer mensuel du siège' },
  { id: 'exp-2', name: 'Facture Sonelgaz', categoryId: 'exc-2', amount: 14500, date: m(-3, 9), description: 'Bimestriel' },
  { id: 'exp-3', name: 'Panneaux publicitaires', categoryId: 'exc-3', amount: 45000, date: m(-3, 17), description: 'Campagne affichage Alger Centre' },
  { id: 'exp-4', name: 'Loyer du local — agence', categoryId: 'exc-1', amount: 85000, date: m(-2, 2) },
  { id: 'exp-5', name: 'Cartouches & papeterie', categoryId: 'exc-4', amount: 12800, date: m(-2, 11), description: 'Toner + ramettes A4' },
  { id: 'exp-6', name: 'Carburant véhicule agence', categoryId: 'exc-5', amount: 18000, date: m(-2, 21) },
  { id: 'exp-7', name: 'Abonnement fibre + ligne fixe', categoryId: 'exc-7', amount: 9600, date: m(-2, 25), description: 'Algérie Télécom' },
  { id: 'exp-8', name: 'Loyer du local — agence', categoryId: 'exc-1', amount: 85000, date: m(-1, 2) },
  { id: 'exp-9', name: 'Publicité Facebook & Instagram', categoryId: 'exc-3', amount: 27000, date: m(-1, 8), description: 'Sponsoring annonces' },
  { id: 'exp-10', name: 'Timbres & frais notariés', categoryId: 'exc-6', amount: 32000, date: m(-1, 14), description: 'Dossier VEN-003' },
  { id: 'exp-11', name: 'Facture Sonelgaz', categoryId: 'exc-2', amount: 13200, date: m(-1, 19) },
  { id: 'exp-12', name: 'Loyer du local — agence', categoryId: 'exc-1', amount: 85000, date: m(0, 2) },
  { id: 'exp-13', name: 'Carburant véhicule agence', categoryId: 'exc-5', amount: 16500, date: d(-8) },
  { id: 'exp-14', name: 'Impression flyers', categoryId: 'exc-3', amount: 11000, date: d(-5), description: '2 000 flyers A5 couleur' },
  { id: 'exp-15', name: 'Fournitures de bureau', categoryId: 'exc-4', amount: 7400, date: d(-2) },
];

// ─── Maintenances ───────────────────────────────────────────────────────────

const maintenances: Maintenance[] = [
  { id: 'mnt-1', roomId: 'apt-6', name: 'Réfection salle de bain', cost: 120000, date: d(-6), description: 'Plomberie + faïence complète' },
  { id: 'mnt-2', roomId: 'apt-1', name: 'Peinture intérieure', cost: 45000, date: m(-1, 12), description: 'Deux couches, murs et plafonds' },
  { id: 'mnt-3', roomId: 'apt-3', name: 'Remplacement chauffe-eau', cost: 38000, date: m(-2, 7) },
  { id: 'mnt-4', roomId: 'apt-7', name: 'Réparation volets roulants', cost: 15000, date: m(-2, 23), description: 'Trois fenêtres' },
  { id: 'mnt-5', roomId: 'apt-4', name: 'Entretien climatisation', cost: 22000, date: d(-16), description: 'Nettoyage et recharge gaz, 3 splits' },
  { id: 'mnt-6', roomId: 'apt-10', name: 'Serrurerie — porte blindée', cost: 28000, date: m(-3, 14) },
];

// ─── Caisse (mouvements manuels) ────────────────────────────────────────────

const cashTransactions: CashTransaction[] = [
  { id: 'csh-1', type: 'deposit', amount: 500000, description: 'Apport initial de trésorerie', date: m(-5, 1) },
  { id: 'csh-2', type: 'withdrawal', amount: 120000, description: 'Retrait pour dépôt bancaire', date: m(-3, 27) },
  { id: 'csh-3', type: 'deposit', amount: 200000, description: 'Remboursement caution propriétaire', date: m(-2, 16) },
  { id: 'csh-4', type: 'withdrawal', amount: 75000, description: 'Achat mobilier de bureau', date: m(-1, 6) },
  { id: 'csh-5', type: 'deposit', amount: 150000, description: 'Commission apport d\'affaires externe', date: d(-11) },
  { id: 'csh-6', type: 'withdrawal', amount: 40000, description: 'Frais de déplacement Oran', date: d(-3) },
];

// ─── Export ─────────────────────────────────────────────────────────────────

export interface DemoDataset {
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

/** Copie fraîche du jeu de données de démonstration. */
export function createDemoData(): DemoDataset {
  return structuredClone({
    clients,
    floors,
    categories,
    rooms,
    services,
    reservations,
    workers,
    expenses,
    expenseCategories,
    maintenances,
    cashTransactions,
    mediators,
    sales,
    purchases,
    roles,
  });
}
