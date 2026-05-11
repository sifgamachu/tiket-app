import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useT, LANG_LIST, LANG_META, type Lang } from '@/lib/i18n';
import { haptic } from '@/lib/telegram';

// ─────────────────────────────────────────────────────────────────
// Floating language picker. A small globe button that opens a
// dropdown of all 5 supported languages, each rendered in its
// native script. Used in the hero corner of the home page; can
// be dropped into any page.
//
// Variants:
//   - `variant="ghost"` — for placement on a colored hero
//     background (transparent button, white icon).
//   - `variant="solid"` — for use on neutral backgrounds.
// ─────────────────────────────────────────────────────────────────

interface Props {
  variant?: 'ghost' | 'solid';
}

export function LanguagePicker({ variant = 'ghost' }: Props) {
  const { lang, setLang, t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const onPick = (l: Lang) => {
    haptic.selection();
    setLang(l);
    setOpen(false);
  };

  const buttonClass = variant === 'ghost'
    ? 'bg-white/15 backdrop-blur-sm text-white hover:bg-white/25'
    : 'bg-white text-ink-900 border border-ink-100 hover:bg-tiket-warm-cream';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition ${buttonClass}`}
        aria-label={t('language')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={11} />
        <span className={LANG_META[lang].script === 'ethiopic' ? 'font-ethiopic' : ''}>
          {LANG_META[lang].native}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('language')}
          className="absolute right-0 top-full mt-2 z-30 min-w-[180px] bg-white rounded-xl border border-ink-100 shadow-lg overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-ink-100">
            <div className="text-[9px] font-bold uppercase tracking-wider text-ink-500">
              {t('language')}
            </div>
          </div>
          {LANG_LIST.map(l => {
            const meta = LANG_META[l];
            const active = l === lang;
            return (
              <button
                key={l}
                role="option"
                aria-selected={active}
                onClick={() => onPick(l)}
                className={`w-full px-3 py-2.5 flex items-center gap-2 text-left hover:bg-tiket-warm-cream ${
                  active ? 'bg-tiket-warm-cream/60' : ''
                }`}
              >
                <span className="flex-1 leading-tight">
                  <span className={`block text-[13px] font-semibold text-ink-900 ${meta.script === 'ethiopic' ? 'font-ethiopic' : ''}`}>
                    {meta.native}
                  </span>
                  <span className="block text-[10px] text-ink-500">{meta.name}</span>
                </span>
                {active && <Check size={14} className="text-tiket-green" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
