import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coins, Calculator, RotateCcw, Printer, Wallet, Landmark, Handshake, Building2,
  Package, PlusCircle, MinusCircle, Scale, CheckCircle2, XCircle, Sparkles, Gem,
  TrendingUp, TrendingDown, CalendarRange, Download,
} from 'lucide-react';
import { useApp, useCurrentPermissions, can } from '@/store/appStore';
import { useAppData } from '@/store/hooks';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/Misc';
import { GradientButton } from '@/components/ui/GradientButton';
import { SectionCard } from '@/components/ui/GradientCard';
import { TextField, SelectField } from '@/components/ui/Field';
import { AnimatedNumber } from '@/components/ui/AnimatedCounter';
import {
  caisseBalance, mediatorStats, saleRemaining, yearlyZakat, zakatYears,
} from '@/store/selectors';
import {
  computeZakat, invalidZakatFields, nisabFromGold, DEFAULT_NISAB_DZD, NISAB_GOLD_GRAMS,
  SAMPLE_ZAKAT_INPUT, ZAKAT_RATE, type ZakatInput, type ZakatResult,
} from '@/lib/zakat';
import { buildZakatReportHTML, printHTML, type ZakatPrintStep } from '@/lib/print';
import { formatDA2, cn } from '@/lib/utils';
import { useToday } from '@/lib/useToday';

/** Champs du formulaire, conservés en texte pour ne pas gêner la saisie. */
type FormState = Record<FormField, string>;
type FormField =
  | 'bankCash' | 'cashOnHand' | 'receivableCommissions' | 'propertiesForSale'
  | 'tradeInventory' | 'otherAssets' | 'liabilities' | 'nisab' | 'goldPricePerGram';

const EMPTY_FORM: FormState = {
  bankCash: '',
  cashOnHand: '',
  receivableCommissions: '',
  propertiesForSale: '',
  tradeInventory: '',
  otherAssets: '',
  liabilities: '',
  nisab: String(DEFAULT_NISAB_DZD),
  goldPricePerGram: '',
};

/** '' → 0 ; '12,5' et '12.5' → 12.5 ; texte invalide → NaN (rejeté à la validation). */
function toNumber(raw: string): number {
  const trimmed = raw.trim().replace(',', '.');
  if (trimmed === '') return 0;
  return Number(trimmed);
}

function toInput(form: FormState): ZakatInput {
  const gold = toNumber(form.goldPricePerGram);
  return {
    bankCash: toNumber(form.bankCash),
    cashOnHand: toNumber(form.cashOnHand),
    receivableCommissions: toNumber(form.receivableCommissions),
    propertiesForSale: toNumber(form.propertiesForSale),
    tradeInventory: toNumber(form.tradeInventory),
    otherAssets: toNumber(form.otherAssets),
    liabilities: toNumber(form.liabilities),
    nisab: form.nisab.trim() === '' ? DEFAULT_NISAB_DZD : toNumber(form.nisab),
    goldPricePerGram: form.goldPricePerGram.trim() === '' ? undefined : gold,
  };
}

export default function Zakat() {
  const { t } = useI18n();
  const toast = useToast();
  const data = useAppData();
  const perms = useCurrentPermissions();
  const storeInfo = useApp((s) => s.storeInfo);
  const today = useToday();

  // ── Zakat automatique (année civile) ──────────────────────────────────────
  const years = useMemo(() => zakatYears(data, today), [data, today]);
  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const auto = useMemo(() => yearlyZakat(data, year), [data, year]);

  // ── Calculateur détaillé ──────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [result, setResult] = useState<ZakatResult | null>(null);

  const set = (field: FormField, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setResult(null); // toute modification invalide le résultat affiché
  };

  const goldNisab = useMemo(() => {
    const gold = toNumber(form.goldPricePerGram);
    return form.goldPricePerGram.trim() !== '' && Number.isFinite(gold) && gold > 0
      ? nisabFromGold(gold)
      : null;
  }, [form.goldPricePerGram]);

  const calculate = () => {
    const input = toInput(form);
    if (invalidZakatFields(input).length > 0) return toast.error(t('zakat.invalid'));
    setResult(computeZakat(input));
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setResult(null);
  };

  const loadSample = () => {
    setForm({
      bankCash: String(SAMPLE_ZAKAT_INPUT.bankCash),
      cashOnHand: String(SAMPLE_ZAKAT_INPUT.cashOnHand),
      receivableCommissions: String(SAMPLE_ZAKAT_INPUT.receivableCommissions),
      propertiesForSale: String(SAMPLE_ZAKAT_INPUT.propertiesForSale),
      tradeInventory: String(SAMPLE_ZAKAT_INPUT.tradeInventory),
      otherAssets: String(SAMPLE_ZAKAT_INPUT.otherAssets),
      liabilities: String(SAMPLE_ZAKAT_INPUT.liabilities),
      nisab: String(SAMPLE_ZAKAT_INPUT.nisab),
      goldPricePerGram: '',
    });
    setResult(null);
  };

  /** Pré-remplit les actifs à partir des données réelles de l'agence. */
  const loadFromAgency = () => {
    const cash = Math.max(0, caisseBalance(data));
    const commissionsOwedToAgency = data.sales.reduce((s, sale) => s + saleRemaining(sale), 0);
    const mediatorCommissionsOwed = data.mediators.reduce(
      (s, m) => s + mediatorStats(m, data.sales).remaining,
      0,
    );
    const stock = data.rooms
      .filter((r) => (r.propertyType ?? 'rental') === 'sale')
      .reduce((s, r) => s + (r.salePrice ?? 0), 0);

    setForm((f) => ({
      ...f,
      bankCash: String(Math.round(cash)),
      cashOnHand: '0',
      receivableCommissions: String(Math.round(commissionsOwedToAgency)),
      propertiesForSale: String(Math.round(stock)),
      liabilities: String(Math.round(mediatorCommissionsOwed)),
    }));
    setResult(null);
    toast.success(t('toast.updated'));
  };

  /** Reporte les gains nets de l'année dans le calculateur. */
  const useAutoInCalculator = () => {
    setForm((f) => ({ ...f, bankCash: String(Math.round(auto.netGains)) }));
    setResult(null);
    toast.success(t('toast.updated'));
  };

  const steps: ZakatPrintStep[] = result
    ? [
        { label: t('zakat.bankCash'), value: formatDA2(toNumber(form.bankCash)) },
        { label: t('zakat.cashOnHand'), value: formatDA2(toNumber(form.cashOnHand)) },
        { label: t('zakat.receivableCommissions'), value: formatDA2(toNumber(form.receivableCommissions)) },
        { label: t('zakat.propertiesForSale'), value: formatDA2(toNumber(form.propertiesForSale)) },
        { label: t('zakat.tradeInventory'), value: formatDA2(toNumber(form.tradeInventory)) },
        { label: t('zakat.otherAssets'), value: formatDA2(toNumber(form.otherAssets)) },
        { label: t('zakat.totalAssets'), value: formatDA2(result.totalAssets), strong: true },
        { label: t('zakat.totalLiabilities'), value: `− ${formatDA2(result.totalLiabilities)}` },
        { label: t('zakat.netWealth'), value: formatDA2(result.netWealth), strong: true },
        { label: t('zakat.nisabUsed'), value: formatDA2(result.nisab) },
        {
          label: t('zakat.obligatory'),
          value: result.zakatDue ? t('zakat.nisabReached') : t('zakat.nisabNotReached'),
        },
        { label: t('zakat.amount'), value: formatDA2(result.zakat), strong: true },
      ]
    : [];

  const print = () => {
    if (!result) return;
    printHTML(
      'zakat',
      buildZakatReportHTML(
        steps,
        {
          due: result.zakatDue,
          message: result.zakatDue ? t('zakat.dueMessage') : t('zakat.notDue'),
          amount: formatDA2(result.zakat),
        },
        `${t('zakat.rate')} ${(ZAKAT_RATE * 100).toLocaleString('fr-FR')} %`,
        storeInfo,
      ),
    );
  };

  return (
    <div>
      <PageHeader
        icon={<Coins size={24} />}
        title={t('zakat.title')}
        subtitle={t('zakat.subtitle')}
        actions={
          result && can(perms, 'zakat', 'print') && (
            <GradientButton variant="glass" icon={<Printer size={18} />} onClick={print}>
              {t('zakat.print')}
            </GradientButton>
          )
        }
      />

      {/* ── Zakat automatique de l'année civile ── */}
      <SectionCard
        dark
        style={{ background: 'linear-gradient(145deg, #0c1a2e 0%, #0c4a6e 45%, #0284c7 100%)' }}
        className="mb-6"
        title={t('zakat.autoTitle')}
        icon={<CalendarRange size={18} />}
        action={
          <SelectField
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            wrapClassName="w-32"
            className="h-9 bg-white/10 border-white/20 text-white"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </SelectField>
        }
      >
        <p className="mb-4 text-xs text-sky-200/80">{t('zakat.autoHint')}</p>
        <p className="mb-4 text-sm font-semibold text-white">{t('zakat.period', { year })}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <AutoStat icon={<TrendingUp size={16} />} label={t('zakat.totalIn')} value={auto.totalIn} tone="in" />
          <AutoStat icon={<TrendingDown size={16} />} label={t('zakat.totalOut')} value={auto.totalOut} tone="out" />
          <AutoStat icon={<Scale size={16} />} label={t('zakat.netGains')} value={auto.netGains} tone="neutral" />
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/15 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-200">
              <Sparkles size={13} /> {t('zakat.autoAmount')}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-amber-200">
              <AnimatedNumber value={auto.zakat} format={formatDA2} />
            </p>
          </div>
        </div>

        {auto.netGains <= 0 ? (
          <p className="mt-3 text-xs text-sky-200/70">{t('zakat.noGains')}</p>
        ) : (
          <div className="mt-4">
            <GradientButton size="sm" variant="glass" icon={<Download size={15} />} onClick={useAutoInCalculator}>
              {t('zakat.useAuto')}
            </GradientButton>
          </div>
        )}
      </SectionCard>

      {/* ── Calculateur détaillé ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title={t('zakat.calculator')} icon={<Calculator size={18} />}>
            <p className="mb-4 text-xs text-ink-muted">{t('zakat.calculatorHint')}</p>

            {/* Actifs */}
            <FieldGroup icon={<PlusCircle size={14} className="text-emerald-500" />} title={t('zakat.assets')}>
              <MoneyField icon={<Landmark size={16} />} label={t('zakat.bankCash')} value={form.bankCash} onChange={(v) => set('bankCash', v)} />
              <MoneyField icon={<Wallet size={16} />} label={t('zakat.cashOnHand')} value={form.cashOnHand} onChange={(v) => set('cashOnHand', v)} />
              <MoneyField icon={<Handshake size={16} />} label={t('zakat.receivableCommissions')} value={form.receivableCommissions} onChange={(v) => set('receivableCommissions', v)} />
              <MoneyField icon={<Building2 size={16} />} label={t('zakat.propertiesForSale')} value={form.propertiesForSale} onChange={(v) => set('propertiesForSale', v)} />
              <MoneyField icon={<Package size={16} />} label={t('zakat.tradeInventory')} value={form.tradeInventory} onChange={(v) => set('tradeInventory', v)} />
              <MoneyField icon={<Coins size={16} />} label={t('zakat.otherAssets')} value={form.otherAssets} onChange={(v) => set('otherAssets', v)} />
            </FieldGroup>

            {/* Dettes */}
            <FieldGroup icon={<MinusCircle size={14} className="text-rose-500" />} title={t('zakat.liabilitiesSection')}>
              <MoneyField icon={<MinusCircle size={16} />} label={t('zakat.liabilities')} value={form.liabilities} onChange={(v) => set('liabilities', v)} />
            </FieldGroup>

            {/* Nisab */}
            <FieldGroup icon={<Scale size={14} className="text-brand-500" />} title={t('zakat.nisabSection')}>
              <MoneyField icon={<Scale size={16} />} label={t('zakat.nisab')} value={form.nisab} onChange={(v) => set('nisab', v)} hint={t('zakat.nisabHint')} />
              <MoneyField icon={<Gem size={16} />} label={t('zakat.goldPrice')} value={form.goldPricePerGram} onChange={(v) => set('goldPricePerGram', v)} hint={t('zakat.goldPriceHint')} />
            </FieldGroup>

            {goldNisab !== null && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                  <Gem size={15} /> {t('zakat.goldNisab')} ({NISAB_GOLD_GRAMS} g)
                </span>
                <span className="font-extrabold text-amber-700">{formatDA2(goldNisab)}</span>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <GradientButton icon={<Calculator size={17} />} onClick={calculate} glow>
                {t('zakat.calculate')}
              </GradientButton>
              <GradientButton variant="glass" icon={<RotateCcw size={17} />} onClick={reset}>
                {t('common.reset')}
              </GradientButton>
              <GradientButton variant="glass" icon={<Building2 size={17} />} onClick={loadFromAgency}>
                {t('zakat.loadAgency')}
              </GradientButton>
              <GradientButton variant="glass" icon={<Sparkles size={17} />} onClick={loadSample}>
                {t('zakat.loadSample')}
              </GradientButton>
            </div>
          </SectionCard>
        </div>

        {/* Résultat */}
        <div>
          <div className="sticky top-24 space-y-4">
            <SectionCard title={t('zakat.resultTitle')} icon={<Scale size={18} />}>
              {!result ? (
                <p className="py-8 text-center text-sm text-ink-muted">{t('zakat.notCalculated')}</p>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <ResultLine label={t('zakat.totalAssets')} value={result.totalAssets} tone="positive" />
                  <ResultLine label={t('zakat.totalLiabilities')} value={result.totalLiabilities} tone="negative" />
                  <div className="border-t border-slate-200 pt-3">
                    <ResultLine label={t('zakat.netWealth')} value={result.netWealth} strong />
                  </div>
                  <ResultLine label={t('zakat.nisabUsed')} value={result.nisab} />

                  <div className={cn(
                    'flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold',
                    result.nisabReached
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-ink-secondary',
                  )}>
                    {result.nisabReached ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {result.nisabReached ? t('zakat.nisabReached') : t('zakat.nisabNotReached')}
                  </div>

                  <div className={cn(
                    'rounded-2xl border-2 p-4 text-center',
                    result.zakatDue ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50',
                  )}>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{t('zakat.amount')}</p>
                    <p className={cn(
                      'mt-1 text-3xl font-extrabold',
                      result.zakatDue ? 'text-emerald-600' : 'text-ink-secondary',
                    )}>
                      {formatDA2(result.zakat)}
                    </p>
                    <p className="mt-1 text-xs text-ink-secondary">
                      {result.zakatDue ? t('zakat.dueMessage') : t('zakat.notDue')}
                    </p>
                  </div>
                </motion.div>
              )}
            </SectionCard>

            {/* Détail du calcul */}
            {result && (
              <SectionCard title={t('zakat.steps')} icon={<Calculator size={18} />}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-2 text-start text-[11px] font-bold uppercase text-ink-muted">{t('zakat.stepLabel')}</th>
                        <th className="py-2 text-end text-[11px] font-bold uppercase text-ink-muted">{t('zakat.stepValue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {steps.map((s) => (
                        <tr key={s.label} className="border-b border-slate-100 last:border-0">
                          <td className={cn('py-2 pe-2 text-ink-secondary', s.strong && 'font-bold text-ink-primary')}>{s.label}</td>
                          <td className={cn('py-2 text-end text-ink-primary', s.strong && 'font-extrabold')}>{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoStat({
  icon, label, value, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'in' | 'out' | 'neutral';
}) {
  const color = tone === 'in' ? 'text-emerald-300' : tone === 'out' ? 'text-rose-300' : 'text-white';
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-200/80">
        {icon} {label}
      </p>
      <p className={cn('mt-1 text-xl font-extrabold', color)}>
        <AnimatedNumber value={value} format={formatDA2} />
      </p>
    </div>
  );
}

function FieldGroup({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        {icon} {title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function MoneyField({
  icon, label, value, onChange, hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const invalid = value.trim() !== '' && !(Number(value.trim().replace(',', '.')) >= 0);
  return (
    <div>
      <TextField
        icon={icon}
        label={label}
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={invalid ? '≥ 0' : undefined}
      />
      {hint && <p className="mt-1 text-[11px] text-ink-muted">{hint}</p>}
    </div>
  );
}

function ResultLine({
  label, value, tone, strong,
}: {
  label: string;
  value: number;
  tone?: 'positive' | 'negative';
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className={cn('text-ink-secondary', strong && 'font-bold text-ink-primary')}>{label}</span>
      <span className={cn(
        'font-semibold',
        strong && 'text-base font-extrabold',
        tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-rose-600' : 'text-ink-primary',
      )}>
        {tone === 'negative' ? '− ' : ''}{formatDA2(value)}
      </span>
    </div>
  );
}
