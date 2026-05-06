// Typed localStorage helpers. Keys are namespaced under 'tiket:' to avoid collisions.

const PREFIX = 'tiket:';

export function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or disabled — silently ignore
  }
}

export function lsRemove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch { /* ignore */ }
}

export function lsClearAll(): void {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

// Common keys
export const STORAGE_KEYS = {
  TICKETS: 'tickets',
  USER: 'user',
  RECENT_SEARCHES: 'recent-searches',
  ONBOARDED: 'onboarded',
} as const;
