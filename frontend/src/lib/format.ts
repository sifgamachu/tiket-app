export const ETB_PER_USD = 145;

export type Currency = 'ETB' | 'USD';

export function fmtBr(amount: number): string {
  return `Br ${Math.round(amount).toLocaleString('en-US')}`;
}

export function fmtUSD(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

export function fmtBrToUSD(etb: number): string {
  return fmtUSD(etb / ETB_PER_USD);
}

// Format an amount in the chosen display currency. Source amount is always
// in ETB; we convert at the reference rate when rendering as USD.
export function fmtAmount(etb: number, currency: Currency = 'ETB'): string {
  return currency === 'USD' ? fmtBrToUSD(etb) : fmtBr(etb);
}

export function fmtTime(hhmm: number): string {
  const h = Math.floor(hhmm);
  const m = Math.round((hhmm - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function fmtTimeMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', weekday: 'short' });
}

export function fmtDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function fmtTimeFromIso(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function fmtDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function fmtRelative(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.round(ms / 86_400_000);
  if (Math.abs(days) < 1) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}
