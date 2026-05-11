import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Lang, LANG_LIST, translate, StringKey } from './strings';

// ─────────────────────────────────────────────────────────────────
// React context for the active language. Persists choice to
// localStorage so the user's pick survives reloads. Defaults to
// English if nothing is stored.
//
// Usage:
//   const { t, lang, setLang } = useT();
//   <h1>{t('hero_greeting_visitor')}</h1>
//
// With variable substitution:
//   <h1>{t('hero_greeting_named', { name: 'Selam' })}</h1>
// ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tiket-lang';

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function loadInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && LANG_LIST.includes(stored)) return stored;
  } catch {
    // localStorage may throw in private mode / SSR; fall through
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {/* ignore */}
    // Set document lang attribute so screen readers + browser
    // language hints pick up the change.
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useT() must be used inside an <I18nProvider>');
  }
  return ctx;
}

// Re-export language types so consumers don't have to import from
// two places.
export { LANG_LIST, type Lang } from './strings';
export { LANG_META } from './strings';
