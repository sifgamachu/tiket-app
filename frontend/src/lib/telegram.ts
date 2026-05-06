// ─────────────────────────────────────────────────────────────────
// Telegram WebApp SDK integration
// https://core.telegram.org/bots/webapps
//
// When the buyer app runs inside Telegram (as a Mini App), we get
// MainButton, BackButton, haptic feedback, theme colors, and the
// authenticated user identity for free. This module exposes a small
// React-friendly API over those primitives.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';

// Minimal type for the parts of the SDK we use
export interface TgWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initDataUnsafe?: {
    user?: { id: number; first_name: string; last_name?: string; username?: string; language_code?: string };
    start_param?: string;
  };
  themeParams: Record<string, string>;
  colorScheme: 'light' | 'dark';
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  MainButton: {
    text: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    color: string;
    textColor: string;
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    enable: () => void;
    disable: () => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  showAlert: (msg: string, cb?: () => void) => void;
  showConfirm: (msg: string, cb?: (ok: boolean) => void) => void;
  shareToStory?: (mediaUrl: string, params?: { text?: string }) => void;
  switchInlineQuery?: (q: string, types?: string[]) => void;
  openTelegramLink: (url: string) => void;
}

export function getTg(): TgWebApp | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp ?? null;
}

export function isInTelegram(): boolean {
  const tg = getTg();
  return !!tg && !!tg.initDataUnsafe?.user;
}

// ── Hooks ────────────────────────────────────────────────────────

/**
 * Wire Telegram's MainButton to a primary call-to-action. Falls back
 * silently to a no-op when not running inside Telegram.
 *
 * The button auto-shows on mount, hides on unmount, and updates text
 * + disabled state reactively.
 */
export function useTelegramMainButton({
  text, onClick, disabled = false, loading = false, color,
}: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
}) {
  const handlerRef = useRef(onClick);
  handlerRef.current = onClick;

  useEffect(() => {
    const tg = getTg();
    if (!tg) return;
    const cb = () => handlerRef.current();
    tg.MainButton.setParams({
      text, color: color ?? '#1A6B3A', text_color: '#FFFFFF',
      is_active: !disabled && !loading, is_visible: true,
    });
    if (loading) tg.MainButton.showProgress(false); else tg.MainButton.hideProgress();
    tg.MainButton.onClick(cb);
    return () => {
      tg.MainButton.offClick(cb);
      tg.MainButton.hide();
      tg.MainButton.hideProgress();
    };
  }, [text, disabled, loading, color]);
}

/**
 * Wire Telegram's BackButton to a callback. Fires on the native swipe
 * gesture on Android and the back arrow in the Telegram header.
 */
export function useTelegramBackButton(onBack: () => void, enabled = true) {
  const handlerRef = useRef(onBack);
  handlerRef.current = onBack;

  useEffect(() => {
    const tg = getTg();
    if (!tg || !enabled) return;
    const cb = () => handlerRef.current();
    tg.BackButton.show();
    tg.BackButton.onClick(cb);
    return () => {
      tg.BackButton.offClick(cb);
      tg.BackButton.hide();
    };
  }, [enabled]);
}

// ── Haptic feedback helpers ──────────────────────────────────────

export const haptic = {
  light:    () => getTg()?.HapticFeedback.impactOccurred('light'),
  medium:   () => getTg()?.HapticFeedback.impactOccurred('medium'),
  heavy:    () => getTg()?.HapticFeedback.impactOccurred('heavy'),
  selection:() => getTg()?.HapticFeedback.selectionChanged(),
  success:  () => getTg()?.HapticFeedback.notificationOccurred('success'),
  warning:  () => getTg()?.HapticFeedback.notificationOccurred('warning'),
  error:    () => getTg()?.HapticFeedback.notificationOccurred('error'),
};
