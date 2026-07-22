/**
 * Calcul de la zakat commerciale (zakat des biens d'affaires) d'une agence
 * immobilière en Algérie.
 *
 * Règles appliquées :
 *   Total des actifs   = banque + caisse + commissions à encaisser
 *                        + biens détenus pour la revente + stocks + autres actifs
 *   Patrimoine net     = total des actifs − dettes exigibles à court terme
 *   Si patrimoine net < nisab  → aucune zakat n'est due
 *   Sinon                      → zakat = patrimoine net × 2,5 %
 *
 * Le nisab peut être saisi manuellement (2 295 000 DA par défaut) ou déduit du
 * cours de l'or : nisab = prix du gramme × 85 g.
 *
 * Ce module est volontairement pur (aucune dépendance UI) afin de rester
 * testable et réutilisable.
 */

/** Taux légal de la zakat sur les biens d'affaires. */
export const ZAKAT_RATE = 0.025;

/** Nisab par défaut en DZD (équivalent de 85 g d'or). */
export const DEFAULT_NISAB_DZD = 2_295_000;

/** Masse d'or (en grammes) définissant le nisab. */
export const NISAB_GOLD_GRAMS = 85;

/** Montants saisis par l'utilisateur, en DZD. */
export interface ZakatInput {
  bankCash: number;
  cashOnHand: number;
  receivableCommissions: number;
  propertiesForSale: number;
  tradeInventory: number;
  otherAssets: number;
  liabilities: number;
  /** Nisab saisi manuellement. Ignoré si `goldPricePerGram` est renseigné. */
  nisab: number;
  /** Optionnel : cours du gramme d'or, qui prend le pas sur `nisab`. */
  goldPricePerGram?: number;
}

export interface ZakatResult {
  totalAssets: number;
  totalLiabilities: number;
  netWealth: number;
  /** Nisab effectivement retenu pour la comparaison. */
  nisab: number;
  /** Origine du nisab retenu. */
  nisabSource: 'gold' | 'manual';
  nisabReached: boolean;
  /** `true` seulement si le nisab est atteint ET le patrimoine net positif. */
  zakatDue: boolean;
  /** Montant de la zakat en DZD (0 si non due). */
  zakat: number;
}

/** Champs numériques devant tous être des nombres positifs ou nuls. */
const NUMERIC_FIELDS: (keyof ZakatInput)[] = [
  'bankCash',
  'cashOnHand',
  'receivableCommissions',
  'propertiesForSale',
  'tradeInventory',
  'otherAssets',
  'liabilities',
  'nisab',
  'goldPricePerGram',
];

/** Retourne la liste des champs invalides (NaN ou négatifs). */
export function invalidZakatFields(input: Partial<ZakatInput>): (keyof ZakatInput)[] {
  return NUMERIC_FIELDS.filter((field) => {
    const value = input[field];
    if (value === undefined || value === null) return false; // champ optionnel non saisi
    return !Number.isFinite(value) || (value as number) < 0;
  });
}

export function isValidZakatInput(input: Partial<ZakatInput>): boolean {
  return invalidZakatFields(input).length === 0;
}

/** Nisab déduit du cours de l'or : 85 g × prix du gramme. */
export function nisabFromGold(goldPricePerGram: number): number {
  return goldPricePerGram * NISAB_GOLD_GRAMS;
}

/** Applique les règles ci-dessus et renvoie le détail complet du calcul. */
export function computeZakat(input: ZakatInput): ZakatResult {
  const totalAssets =
    input.bankCash +
    input.cashOnHand +
    input.receivableCommissions +
    input.propertiesForSale +
    input.tradeInventory +
    input.otherAssets;

  const totalLiabilities = input.liabilities;
  const netWealth = totalAssets - totalLiabilities;

  // Le cours de l'or, quand il est fourni, prime sur le nisab saisi.
  const useGold = !!input.goldPricePerGram && input.goldPricePerGram > 0;
  const nisab = useGold ? nisabFromGold(input.goldPricePerGram!) : input.nisab;

  const nisabReached = netWealth >= nisab;
  const zakatDue = nisabReached && netWealth > 0;

  return {
    totalAssets,
    totalLiabilities,
    netWealth,
    nisab,
    nisabSource: useGold ? 'gold' : 'manual',
    nisabReached,
    zakatDue,
    zakat: zakatDue ? netWealth * ZAKAT_RATE : 0,
  };
}

/**
 * Jeu de données de vérification (énoncé de référence) :
 *   Total des actifs   = 4 000 000,00 DA
 *   Patrimoine net     = 3 500 000,00 DA
 *   Nisab              = 2 295 000,00 DA
 *   Zakat due          =    87 500,00 DA
 */
export const SAMPLE_ZAKAT_INPUT: ZakatInput = {
  bankCash: 3_000_000,
  cashOnHand: 200_000,
  receivableCommissions: 700_000,
  propertiesForSale: 0,
  tradeInventory: 0,
  otherAssets: 100_000,
  liabilities: 500_000,
  nisab: DEFAULT_NISAB_DZD,
};

export const SAMPLE_ZAKAT_EXPECTED = {
  totalAssets: 4_000_000,
  netWealth: 3_500_000,
  nisab: DEFAULT_NISAB_DZD,
  zakat: 87_500,
};
