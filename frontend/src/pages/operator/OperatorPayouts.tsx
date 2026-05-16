import { useState } from 'react';
import { ArrowDownToLine, Calendar, TrendingUp, DollarSign, Info, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { fmtBr } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────
// Payouts — operator settlement view.
//
// Strategic role: this screen is where the Tikēt commercial story
// becomes concrete. Gadaa needs to understand:
//   1. How much they get paid
//   2. When they get paid
//   3. How the 7.5% Tikēt fee shows up
//   4. What happens to refunds and chargebacks
//
// The "T+5 day payouts at NBE T-bill ~14%" is part of Tikēt's
// business model (float income on the 5-day hold). For operators
// this needs to feel reasonable, not extractive — the comparison
// point is card processors charging 3-4% with T+2-30 settlement,
// and informal cash with same-day but enormous reconciliation
// pain. T+5 at 7.5% with full reconciliation is competitive.
//
// Demo scope:
// - Top: pending payout amount + next payout date
// - Middle: last 4 settled payouts with breakdown
// - Right: take rate breakdown panel (where the 7.5% goes)
// - Bottom: per-route fee summary for the current period
// ─────────────────────────────────────────────────────────────────

const GADAA_COLOR = '#9A3412';

interface Payout {
  period: string;        // human-readable
  periodStart: string;   // ISO
  periodEnd: string;     // ISO
  gross: number;
  fee: number;
  net: number;
  settledAt?: string;
  status: 'pending' | 'in-transit' | 'settled';
  bankRef?: string;
}

const PAYOUTS: Payout[] = [
  {
    period: 'May 6 – May 10, 2026', periodStart: '2026-05-06', periodEnd: '2026-05-10',
    gross: 218400, fee: 16380, net: 202020,
    status: 'pending',
  },
  {
    period: 'May 1 – May 5, 2026', periodStart: '2026-05-01', periodEnd: '2026-05-05',
    gross: 244850, fee: 18364, net: 226486,
    status: 'in-transit',
  },
  {
    period: 'Apr 26 – Apr 30, 2026', periodStart: '2026-04-26', periodEnd: '2026-04-30',
    gross: 198300, fee: 14873, net: 183427,
    status: 'settled', settledAt: '2026-05-05', bankRef: 'CBE-2026050511287',
  },
  {
    period: 'Apr 21 – Apr 25, 2026', periodStart: '2026-04-21', periodEnd: '2026-04-25',
    gross: 211600, fee: 15870, net: 195730,
    status: 'settled', settledAt: '2026-04-30', bankRef: 'CBE-2026043098142',
  },
  {
    period: 'Apr 16 – Apr 20, 2026', periodStart: '2026-04-16', periodEnd: '2026-04-20',
    gross: 187400, fee: 14055, net: 173345,
    status: 'settled', settledAt: '2026-04-25', bankRef: 'CBE-2026042587003',
  },
];

const ROUTE_BREAKDOWN: Array<{ route: string; tickets: number; gross: number; fee: number; net: number }> = [
  { route: 'AA → Jimma',   tickets: 184, gross: 138000, fee: 10350, net: 127650 },
  { route: 'AA → Nekemte', tickets: 102, gross: 72420,  fee: 5432,  net: 66988  },
  { route: 'AA → Bedele',  tickets: 38,  gross: 34960,  fee: 2622,  net: 32338  },
  { route: 'AA → Ambo',    tickets: 67,  gross: 19430,  fee: 1457,  net: 17973  },
  { route: 'AA → Mettu',   tickets: 14,  gross: 16240,  fee: 1218,  net: 15022  },
  { route: 'AA → Adama',   tickets: 56,  gross: 16240,  fee: 1218,  net: 15022  },
];

export function OperatorPayouts() {
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const pending = PAYOUTS.find(p => p.status === 'pending');
  const inTransit = PAYOUTS.find(p => p.status === 'in-transit');
  const totalSettled = PAYOUTS.filter(p => p.status === 'settled').reduce((s, p) => s + p.net, 0);

  return (
    <div className="px-4 lg:px-6 py-4 lg:py-6 max-w-6xl">
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-black">Payouts</h1>
        <p className="text-[11px] lg:text-xs text-ink-500 mt-0.5">
          Kafaltii · Daily ticket revenue settles to your CBE account every 5 days, after the 7.5% Tikēt fee.
        </p>
      </div>

      {/* Top row — pending, in-transit, settled-to-date */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <PayoutCard
          tone="primary"
          icon={<Clock size={14} />}
          label="Pending"
          period={pending?.period ?? '—'}
          amount={pending?.net ?? 0}
          gross={pending?.gross ?? 0}
          fee={pending?.fee ?? 0}
          footer="Closes today · transfers May 15"
        />
        <PayoutCard
          tone="info"
          icon={<ArrowDownToLine size={14} />}
          label="In transit"
          period={inTransit?.period ?? '—'}
          amount={inTransit?.net ?? 0}
          gross={inTransit?.gross ?? 0}
          fee={inTransit?.fee ?? 0}
          footer="Arriving at CBE within 24h"
        />
        <PayoutCard
          tone="muted"
          icon={<CheckCircle2 size={14} />}
          label="Settled · last 30 days"
          period="3 transfers complete"
          amount={totalSettled}
          gross={0}
          fee={0}
          footer={`Avg ${fmtBr(Math.round(totalSettled / 3))} per payout`}
          hideBreakdown
        />
      </div>

      {/* Two-column: payouts list + take-rate breakdown panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-tiket-warm-cream border-b border-ink-100 flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Settlement history</div>
              <Calendar size={11} className="text-ink-500" />
            </div>
            <div className="divide-y divide-ink-100">
              {PAYOUTS.map(p => (
                <PayoutRow key={p.periodStart} payout={p} onClick={() => setSelectedPayout(p)} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl border border-ink-100 p-4 mb-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">Take rate breakdown</div>
            <div className="text-[10px] text-ink-500 mb-3 leading-snug">
              Out of every <span className="font-bold text-ink-900">100 ETB</span> in ticket sales, here's where it goes:
            </div>
            <FeeBar label="Operator" pct={92.5} amount="92.50 ETB" color={GADAA_COLOR} bold />
            <FeeBar label="Payment processing" pct={2.5} amount="2.50 ETB" color="#475569" />
            <FeeBar label="Tikēt platform" pct={3.5} amount="3.50 ETB" color="#475569" />
            <FeeBar label="Reserve · refund pool" pct={1.5} amount="1.50 ETB" color="#475569" />
            <div className="mt-3 pt-3 border-t border-ink-100 text-[10px] text-ink-500 leading-snug">
              Reserve pool covers buyer-initiated refunds within 24h of cancellation. Unused reserve refunds quarterly.
            </div>
          </div>

          <div className="bg-tiket-warm-cream rounded-2xl p-4">
            <div className="flex items-start gap-2 mb-2">
              <Info size={12} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] font-bold text-ink-900">Why T+5?</div>
            </div>
            <div className="text-[10px] text-ink-500 leading-snug">
              5-day hold lets us absorb buyer-initiated refunds and chargebacks before settling. Faster payout schedules (T+2, T+1) are available at higher fee tiers.
            </div>
          </div>
        </div>
      </div>

      {/* Per-route fee summary */}
      <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
        <div className="px-4 py-2.5 bg-tiket-warm-cream border-b border-ink-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500">This period · per-route breakdown</div>
        </div>
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
              <th className="text-left px-4 py-2.5">Route</th>
              <th className="text-right px-3 py-2.5">Tickets</th>
              <th className="text-right px-3 py-2.5">Gross</th>
              <th className="text-right px-3 py-2.5">Tikēt fee</th>
              <th className="text-right px-4 py-2.5">Net</th>
            </tr>
          </thead>
          <tbody>
            {ROUTE_BREAKDOWN.map(r => (
              <tr key={r.route} className="border-t border-ink-100">
                <td className="px-4 py-2.5 text-[12px] font-bold">{r.route}</td>
                <td className="px-3 py-2.5 text-right text-[12px] tabular">{r.tickets}</td>
                <td className="px-3 py-2.5 text-right text-[12px] tabular">{fmtBr(r.gross)}</td>
                <td className="px-3 py-2.5 text-right text-[12px] tabular text-ink-500">−{fmtBr(r.fee)}</td>
                <td className="px-4 py-2.5 text-right text-[13px] font-bold tabular">{fmtBr(r.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile: stacked cards */}
        <div className="md:hidden divide-y divide-ink-100">
          {ROUTE_BREAKDOWN.map(r => (
            <div key={r.route} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[12px] font-bold">{r.route}</div>
                <div className="text-[10px] text-ink-500 tabular">{r.tickets} tickets</div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-ink-500">
                <span>Gross <span className="tabular text-ink-900">{fmtBr(r.gross)}</span></span>
                <span>Fee <span className="tabular">−{fmtBr(r.fee)}</span></span>
                <span className="font-bold text-ink-900">Net <span className="tabular">{fmtBr(r.net)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal-ish detail */}
      {selectedPayout && <PayoutDetail payout={selectedPayout} onClose={() => setSelectedPayout(null)} />}
    </div>
  );
}

interface PayoutCardProps {
  tone: 'primary' | 'info' | 'muted';
  icon: React.ReactNode;
  label: string;
  period: string;
  amount: number;
  gross: number;
  fee: number;
  footer: string;
  hideBreakdown?: boolean;
}

function PayoutCard({ tone, icon, label, period, amount, gross, fee, footer, hideBreakdown }: PayoutCardProps) {
  const styles = {
    primary: { bg: GADAA_COLOR, fg: 'white',     ringBg: 'rgba(255,255,255,0.18)' },
    info:    { bg: '#1E3A8A',   fg: 'white',     ringBg: 'rgba(255,255,255,0.18)' },
    muted:   { bg: '#F3F4F6',   fg: '#0E1411',   ringBg: 'rgba(0,0,0,0.06)' },
  }[tone];

  return (
    <div className="rounded-2xl p-4" style={{ background: styles.bg, color: styles.fg }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: styles.ringBg }}>
          {icon}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</div>
          <div className="text-[10px] opacity-70">{period}</div>
        </div>
      </div>
      <div className="text-2xl font-black tabular mt-1">{fmtBr(amount)}</div>
      {!hideBreakdown && gross > 0 && (
        <div className="text-[10px] opacity-75 tabular mt-0.5">
          Gross {fmtBr(gross)} − fee {fmtBr(fee)}
        </div>
      )}
      <div className="text-[10px] opacity-75 mt-2 pt-2 border-t" style={{ borderColor: styles.ringBg }}>{footer}</div>
    </div>
  );
}

function PayoutRow({ payout, onClick }: { payout: Payout; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-tiket-warm-cream/40">
      <PayoutStatusPill status={payout.status} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold">{payout.period}</div>
        <div className="text-[10px] text-ink-500 tabular mt-0.5">
          {payout.settledAt ? `Settled ${payout.settledAt}` : payout.status === 'in-transit' ? 'Transferring' : 'Closes today'}
          {payout.bankRef && <> · CBE ref {payout.bankRef.slice(-7)}</>}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[13px] font-bold tabular">{fmtBr(payout.net)}</div>
        <div className="text-[10px] text-ink-500 tabular">Gross {fmtBr(payout.gross)}</div>
      </div>
      <ChevronRight size={13} className="text-ink-500 flex-shrink-0" />
    </button>
  );
}

function PayoutStatusPill({ status }: { status: Payout['status'] }) {
  const map = {
    pending:     { bg: '#FEF3C7', fg: '#92400E', label: 'Pending' },
    'in-transit':{ bg: '#DBEAFE', fg: '#1E40AF', label: 'In transit' },
    settled:     { bg: '#D1FAE5', fg: '#065F46', label: 'Settled' },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}

function FeeBar({ label, pct, amount, color, bold }: { label: string; pct: number; amount: string; color: string; bold?: boolean }) {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-[10px] mb-0.5">
        <span className={bold ? 'font-bold text-ink-900' : 'text-ink-500'}>{label}</span>
        <span className="tabular text-ink-900">{amount}</span>
      </div>
      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function PayoutDetail({ payout, onClose }: { payout: Payout; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end lg:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-ink-100 p-5 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Payout detail</div>
            <div className="text-base font-black mt-0.5">{payout.period}</div>
          </div>
          <PayoutStatusPill status={payout.status} />
        </div>

        <div className="space-y-2 text-[12px]">
          <Row label="Gross ticket sales"  value={fmtBr(payout.gross)} />
          <Row label="Payment processing"  value={`−${fmtBr(Math.round(payout.gross * 0.025))}`} mute />
          <Row label="Tikēt platform fee"  value={`−${fmtBr(Math.round(payout.gross * 0.035))}`} mute />
          <Row label="Reserve · refund pool" value={`−${fmtBr(Math.round(payout.gross * 0.015))}`} mute />
          <div className="pt-2 border-t border-ink-100">
            <Row label="Net payout"        value={fmtBr(payout.net)} bold />
          </div>
        </div>

        {payout.bankRef && (
          <div className="mt-4 pt-3 border-t border-ink-100">
            <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">Bank reference</div>
            <div className="text-[11px] font-mono">{payout.bankRef}</div>
          </div>
        )}

        <button onClick={onClose} className="w-full mt-4 rounded-xl px-4 py-2 text-sm font-bold border border-ink-100 hover:bg-tiket-warm-cream">
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, mute, bold }: { label: string; value: string; mute?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={mute ? 'text-ink-500' : bold ? 'font-bold' : ''}>{label}</span>
      <span className={`tabular ${bold ? 'font-bold text-base' : mute ? 'text-ink-500' : ''}`}>{value}</span>
    </div>
  );
}
