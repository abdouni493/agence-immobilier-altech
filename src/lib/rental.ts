import type { Reservation, RentalPeriod, Room } from '@/types';
import { formatMonths, monthsBetween, nightsBetween } from './utils';

/** Un appartement sans périodicité explicite est loué à la journée. */
export function rentalPeriodOf(room: Pick<Room, 'rentalPeriod'> | undefined): RentalPeriod {
  return room?.rentalPeriod === 'month' ? 'month' : 'day';
}

/** Nombre d'unités facturées pour cet appartement sur la plage donnée. */
export function rentalUnits(period: RentalPeriod, checkIn: string, checkOut: string): number {
  return period === 'month' ? monthsBetween(checkIn, checkOut) : nightsBetween(checkIn, checkOut);
}

/** Coût d'un appartement sur la plage, selon sa périodicité. */
export function roomRentalCost(room: Room, checkIn: string, checkOut: string): number {
  const units = rentalUnits(rentalPeriodOf(room), checkIn, checkOut);
  return Math.round(room.pricePerNight * units);
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** « / nuit » ou « / mois » — suffixe de prix unitaire. */
export function periodUnitLabel(period: RentalPeriod, t: Translate): string {
  return period === 'month' ? t('common.month').toLowerCase() : t('common.night');
}

/** « 3 nuits » / « 2,5 mois » — durée lisible d'une plage. */
export function durationLabel(period: RentalPeriod, checkIn: string, checkOut: string, t: Translate): string {
  if (period === 'month') {
    const months = monthsBetween(checkIn, checkOut);
    return `${formatMonths(months)} ${months > 1 ? t('common.months') : t('common.monthUnit')}`;
  }
  const n = nightsBetween(checkIn, checkOut);
  return `${n} ${n > 1 ? t('common.nights') : t('common.night')}`;
}

/** Durée déjà enregistrée sur une location (utilise `months` si présent). */
export function reservationDurationLabel(r: Reservation, t: Translate): string {
  if (r.rentalPeriod === 'month') {
    const months = r.months ?? monthsBetween(r.checkIn, r.checkOut);
    return `${formatMonths(months)} ${months > 1 ? t('common.months') : t('common.monthUnit')}`;
  }
  return `${r.nights} ${r.nights > 1 ? t('common.nights') : t('common.night')}`;
}
