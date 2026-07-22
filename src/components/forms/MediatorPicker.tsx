import { useMemo, useRef, useState, useEffect } from 'react';
import { Search, X, Check, UserPlus, Handshake, HardHat } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { useAppData } from '@/store/hooks';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import { GradientButton } from '@/components/ui/GradientButton';
import { TextField } from '@/components/ui/Field';
import {
  filterMediatorOptions, mediatorDraftFromWorker, mediatorOptions, splitFullName,
  type MediatorOption,
} from '@/lib/mediators';
import { cn } from '@/lib/utils';

/**
 * Sélecteur de médiateur avec recherche.
 *
 * La recherche porte à la fois sur les fiches médiateurs et sur les employés
 * ayant le rôle « Médiateur » : choisir un employé crée sa fiche médiateur à
 * la volée (et la réutilise ensuite).
 */
export function MediatorPicker({
  value,
  onChange,
  allowCreate = true,
}: {
  /** id de la fiche médiateur sélectionnée. */
  value: string;
  onChange: (mediatorId: string) => void;
  allowCreate?: boolean;
}) {
  const { t } = useI18n();
  const toast = useToast();
  const data = useAppData();
  const addMediator = useApp((s) => s.addMediator);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => mediatorOptions(data), [data]);
  const results = useMemo(() => filterMediatorOptions(options, query).slice(0, 8), [options, query]);
  const selected = data.mediators.find((m) => m.id === value) ?? null;

  // Close the dropdown when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  /** Un employé n'a pas encore de fiche médiateur : on la crée à la volée. */
  const pick = async (o: MediatorOption) => {
    if (o.source === 'mediator') {
      onChange(o.id);
    } else if (o.worker) {
      const created = await addMediator(mediatorDraftFromWorker(o.worker));
      onChange(created.id);
      toast.success(t('toast.created'));
    }
    setQuery('');
    setOpen(false);
  };

  const createMediator = async () => {
    if (!newName.trim() || !newPhone.trim()) return toast.error(t('login.required'));
    const { firstName, lastName } = splitFullName(newName);
    const m = await addMediator({
      firstName, lastName, phone: newPhone.trim(),
      phone2: '', email: '', address: '', city: '', cin: '', notes: '',
    });
    onChange(m.id);
    setCreating(false);
    setNewName('');
    setNewPhone('');
    toast.success(t('toast.created'));
  };

  return (
    <div>
      <p className="text-xs font-semibold text-ink-secondary mb-1.5">{t('apt.mediator')}</p>
      <p className="text-[11px] text-ink-muted mb-2">{t('apt.mediatorSearchHint')}</p>

      {selected ? (
        <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3.5 py-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-grad-teal text-white shrink-0">
            <Handshake size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink-primary truncate">{selected.firstName} {selected.lastName}</p>
            <p className="text-xs text-ink-muted truncate">
              {selected.phone}
              {selected.workerId ? ` · ${t('apt.mediatorWorkerTag')}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            title={t('apt.clearMediator')}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-ink-secondary hover:text-rose-600 hover:border-rose-300 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div ref={wrapRef} className="relative">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute inset-y-0 start-3.5 my-auto text-ink-muted pointer-events-none" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={t('apt.mediatorSearch')}
                className="w-full h-11 rounded-xl bg-slate-100/70 border border-slate-200 ps-10 pe-4 text-sm text-ink-primary outline-none transition-all focus:border-brand-400/60 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            {allowCreate && !creating && (
              <GradientButton variant="glass" icon={<UserPlus size={16} />} onClick={() => setCreating(true)}>
                {t('apt.newMediator')}
              </GradientButton>
            )}
          </div>

          {open && (
            <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {results.length === 0 ? (
                <p className="px-4 py-3 text-sm text-ink-muted">{t('apt.mediatorNoResult')}</p>
              ) : (
                <ul className="max-h-64 overflow-y-auto">
                  {results.map((o) => (
                    <li key={`${o.source}-${o.id}`}>
                      <button
                        type="button"
                        onClick={() => pick(o)}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-start hover:bg-brand-50 transition-colors"
                      >
                        <span className={cn(
                          'grid h-8 w-8 place-items-center rounded-lg text-white shrink-0',
                          o.source === 'worker' ? 'bg-grad-gold' : 'bg-grad-teal',
                        )}>
                          {o.source === 'worker' ? <HardHat size={15} /> : <Handshake size={15} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink-primary truncate">{o.name}</span>
                          <span className="block text-xs text-ink-muted truncate">
                            {o.phone}{o.hint ? ` · ${o.hint}` : ''}
                          </span>
                        </span>
                        {o.source === 'worker' && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            {t('apt.mediatorWorkerTag')}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {creating && !selected && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label={t('apt.ownerName')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('apt.mediatorNamePlaceholder')}
              autoFocus
            />
            <TextField
              label={t('common.phone')}
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="06 00 00 00 00"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setCreating(false); setNewName(''); setNewPhone(''); }}
              className="grid h-9 w-9 place-items-center rounded-lg glass text-ink-secondary"
            >
              <X size={16} />
            </button>
            <GradientButton size="sm" icon={<Check size={16} />} onClick={createMediator}>
              {t('common.create')}
            </GradientButton>
          </div>
        </div>
      )}
    </div>
  );
}
