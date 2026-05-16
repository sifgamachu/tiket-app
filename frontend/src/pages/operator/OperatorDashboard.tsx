import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, ArrowRight, Plus, TrendingUp, Users, DollarSign, Clock, Phone, MoreVertical, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDepartures, getTodayStats, type OperatorDeparture } from '@/data/operatorMock';
import { getCity } from '@/data/cities';
import { fmtBr, fmtTime } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────
// Dashboard — the screen the dispatcher opens at 5am.
//
// Layout principles:
// - Most important info top-left: today's departure count + fill rate
// - Then a list of today's departures, sorted by departure time
// - Tomorrow's departures collapsed below ("see what's coming")
// - Add departure button is always reachable (top-right + sidebar)
//
// What this screen deliberately doesn't do:
// - Charts (need real data first)
// - Per-passenger drill-down (sales report does that)
// - Driver communication (next iteration)
// ─────────────────────────────────────────────────────────────────

const GADAA_COLOR = '#9A3412';

export function OperatorDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'today' | 'tomorrow' | 'later'>('today');
  const departures = getDepartures();
  const stats = getTodayStats();

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const visible = useMemo(() => {
    if (tab === 'today') return departures.filter(d => d.date === today);
    if (tab === 'tomorrow') return departures.filter(d => d.date === tomorrow);
    return departures.filter(d => d.date > tomorrow);
  }, [departures, tab, today, tomorrow]);

  return (
    <div className="px-4 lg:px-6 py-4 lg:py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black">Today's operations</h1>
          <p className="text-[11px] lg:text-xs text-ink-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/operator/add-departure')}
          className="rounded-xl px-3 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
          style={{ background: GADAA_COLOR }}
        >
          <Plus size={14} /> Add departure
        </button>
      </div>

      {/* Operations alerts — surfaces the things a dispatcher would
          actually want to know without having to dig. Each alert maps
          to a real-world Ethiopian intercity bus operations concern:
          - Driver scheduling conflicts (double-booking the same driver
            across two overlapping runs)
          - Routes running unusually empty (so the dispatcher can pull
            a coach or merge passengers)
          - Regulated routes hitting their authority-set fare ceiling
          - Buses overdue for routine service. */}
      <div className="space-y-2 mb-5">
        <AlertRow
          tone="warn"
          icon={<AlertCircle size={13} />}
          title="Driver conflict"
          message="Tolosa Bekele assigned to GAD-114 (06:00 AA→JM) and GAD-128 (07:30 AA→NK). One needs reassignment."
          action="Reassign"
        />
        <AlertRow
          tone="info"
          icon={<Users size={13} />}
          title="AA → Bedele is running 23% fill"
          message="Below your usual 60% threshold. Consider folding into the 09:00 AA→Mettu run."
          action="Review"
        />
        <AlertRow
          tone="muted"
          icon={<Bus size={13} />}
          title="GAD-121 due for 30,000 km service"
          message="Last serviced 28,400 km ago. Schedule before assigning to long-haul."
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
        <StatCard
          icon={<Bus size={14} />}
          label="Departures today"
          value={String(stats.departures)}
          sub={`${departures.filter(d => d.date === today && d.status === 'scheduled').length} scheduled`}
        />
        <StatCard
          icon={<Users size={14} />}
          label="Seats sold"
          value={`${stats.seatsSold} / ${stats.totalSeats}`}
          sub={`${stats.fillRate}% fill rate`}
        />
        <StatCard
          icon={<DollarSign size={14} />}
          label="Net payout · T+5"
          value={fmtBr(Math.round(stats.revenue * 0.925))}
          sub={`After 7.5% Tikēt fee · ${fmtBr(stats.revenue)} gross`}
          accent={stats.revenue > 50000}
        />
        <StatCard
          icon={<TrendingUp size={14} />}
          label="Best route"
          value="AA → JM"
          sub="92% fill · regulated fare"
        />
      </div>

      {/* Day tabs */}
      <div className="flex items-center gap-1 mb-3 border-b border-ink-100">
        <DayTab label="Today" sub={today.slice(5)} count={departures.filter(d => d.date === today).length} active={tab === 'today'} onClick={() => setTab('today')} />
        <DayTab label="Tomorrow" sub={tomorrow.slice(5)} count={departures.filter(d => d.date === tomorrow).length} active={tab === 'tomorrow'} onClick={() => setTab('tomorrow')} />
        <DayTab label="Later" sub="upcoming" count={departures.filter(d => d.date > tomorrow).length} active={tab === 'later'} onClick={() => setTab('later')} />
      </div>

      {/* Departures table (desktop) / card list (mobile) */}
      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink-100 p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-tiket-warm-cream flex items-center justify-center text-ink-500 mb-2">
            <Bus size={20} />
          </div>
          <div className="text-sm font-bold">No departures scheduled</div>
          <div className="text-[11px] text-ink-500 mt-0.5">Tap "Add departure" to create one.</div>
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-ink-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-tiket-warm-cream text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  <th className="text-left px-4 py-2.5">Bus</th>
                  <th className="text-left px-4 py-2.5">Route</th>
                  <th className="text-left px-4 py-2.5">Departure</th>
                  <th className="text-left px-4 py-2.5">Driver</th>
                  <th className="text-left px-4 py-2.5">Seats</th>
                  <th className="text-left px-4 py-2.5">Revenue</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(d => <DepartureRow key={d.id} departure={d} />)}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="lg:hidden space-y-2">
            {visible.map(d => <DepartureCard key={d.id} departure={d} />)}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub: string; accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500 mb-1">
        <span style={accent ? { color: GADAA_COLOR } : undefined}>{icon}</span>
        {label}
      </div>
      <div className="text-base lg:text-lg font-black tabular" style={accent ? { color: GADAA_COLOR } : undefined}>{value}</div>
      <div className="text-[10px] text-ink-500 mt-0.5">{sub}</div>
    </div>
  );
}

function DayTab({ label, sub, count, active, onClick }: {
  label: string; sub: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 -mb-px border-b-2"
      style={{ borderColor: active ? GADAA_COLOR : 'transparent', color: active ? GADAA_COLOR : '#0E1411' }}
    >
      <div className="text-[12px] font-bold flex items-center gap-1.5">
        {label}
        <span className="px-1.5 py-0.5 rounded text-[9px] tabular" style={{ background: active ? GADAA_COLOR : '#E5E7EB', color: active ? 'white' : '#6B7280' }}>
          {count}
        </span>
      </div>
      <div className="text-[9px] text-ink-500">{sub}</div>
    </button>
  );
}

function DepartureRow({ departure }: { departure: OperatorDeparture }) {
  const fromCity = getCity(departure.from);
  const toCity = getCity(departure.to);
  const fillPct = Math.round((departure.seatsSold / departure.totalSeats) * 100);
  const revenue = departure.seatsSold * departure.pricePerSeat;

  return (
    <tr className="border-t border-ink-100 hover:bg-tiket-warm-cream/40">
      <td className="px-4 py-2.5">
        <div className="text-[12px] font-bold tabular">{departure.busNumber}</div>
        <div className="text-[10px] text-ink-500">{departure.totalSeats} seats</div>
      </td>
      <td className="px-4 py-2.5">
        <div className="text-[12px] font-semibold flex items-center gap-1.5">
          {fromCity?.id} <ArrowRight size={10} className="text-ink-500" /> {toCity?.id}
        </div>
        <div className="text-[10px] text-ink-500">{fromCity?.name} → {toCity?.name}</div>
      </td>
      <td className="px-4 py-2.5">
        <div className="text-[12px] font-semibold tabular">{fmtTime(departure.depHHMM)}</div>
        <div className="text-[10px] text-ink-500 flex items-center gap-1"><Clock size={9} />{Math.round(departure.durationHr)}h</div>
      </td>
      <td className="px-4 py-2.5">
        <div className="text-[12px]">{departure.driverName}</div>
        <div className="text-[10px] text-ink-500 flex items-center gap-1"><Phone size={9} />{departure.driverPhone}</div>
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="text-[12px] font-bold tabular">{departure.seatsSold} / {departure.totalSeats}</div>
        </div>
        <div className="mt-1 h-1.5 w-24 bg-ink-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? '#10B981' : fillPct >= 50 ? GADAA_COLOR : '#F59E0B' }} />
        </div>
      </td>
      <td className="px-4 py-2.5">
        <div className="text-[12px] font-bold tabular">{fmtBr(revenue)}</div>
        <div className="text-[10px] text-ink-500">@ {fmtBr(departure.pricePerSeat)}</div>
      </td>
      <td className="px-4 py-2.5">
        <StatusBadge status={departure.status} />
      </td>
      <td className="px-4 py-2.5 text-right">
        <button className="text-ink-500 hover:text-ink-900 p-1" aria-label="Actions">
          <MoreVertical size={14} />
        </button>
      </td>
    </tr>
  );
}

function DepartureCard({ departure }: { departure: OperatorDeparture }) {
  const fromCity = getCity(departure.from);
  const toCity = getCity(departure.to);
  const fillPct = Math.round((departure.seatsSold / departure.totalSeats) * 100);
  const revenue = departure.seatsSold * departure.pricePerSeat;

  return (
    <div className="bg-white rounded-xl border border-ink-100 p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-[11px] font-bold tabular">{departure.busNumber}</div>
          <div className="text-[13px] font-bold mt-0.5 flex items-center gap-1">
            {fromCity?.name} <ArrowRight size={11} className="text-ink-500" /> {toCity?.name}
          </div>
        </div>
        <StatusBadge status={departure.status} />
      </div>

      <div className="flex items-center gap-3 text-[11px] text-ink-500 mb-2">
        <span className="flex items-center gap-1"><Clock size={10} />{fmtTime(departure.depHHMM)}</span>
        <span>·</span>
        <span>{departure.driverName}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-ink-100">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500">Seats</div>
          <div className="text-[13px] font-bold tabular">{departure.seatsSold}/{departure.totalSeats}</div>
        </div>
        <div className="flex-1 mx-3">
          <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? '#10B981' : fillPct >= 50 ? GADAA_COLOR : '#F59E0B' }} />
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-ink-500">Revenue</div>
          <div className="text-[13px] font-bold tabular">{fmtBr(revenue)}</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OperatorDeparture['status'] }) {
  const map = {
    scheduled: { bg: '#E5E7EB', fg: '#374151', label: 'Scheduled', icon: <Clock size={9} /> },
    boarding:  { bg: '#FEF3C7', fg: '#92400E', label: 'Boarding',  icon: <Users size={9} /> },
    departed:  { bg: '#DBEAFE', fg: '#1E40AF', label: 'Departed',  icon: <ArrowRight size={9} /> },
    arrived:   { bg: '#D1FAE5', fg: '#065F46', label: 'Arrived',   icon: <CheckCircle2 size={9} /> },
    cancelled: { bg: '#FEE2E2', fg: '#991B1B', label: 'Cancelled', icon: <AlertCircle size={9} /> },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: s.bg, color: s.fg }}>
      {s.icon} {s.label}
    </span>
  );
}

interface AlertRowProps {
  tone: 'warn' | 'info' | 'muted';
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: string;
}

function AlertRow({ tone, icon, title, message, action }: AlertRowProps) {
  const tones = {
    warn:  { bg: '#FEF2F2', border: '#FECACA', iconBg: '#FEE2E2', iconFg: '#991B1B', titleFg: '#7F1D1D' },
    info:  { bg: '#FEFCE8', border: '#FEF08A', iconBg: '#FEF9C3', iconFg: '#854D0E', titleFg: '#713F12' },
    muted: { bg: '#F9FAFB', border: '#E5E7EB', iconBg: '#F3F4F6', iconFg: '#374151', titleFg: '#1F2937' },
  } as const;
  const t = tones[tone];
  return (
    <div className="rounded-xl px-3 py-2.5 flex items-start gap-2.5 border" style={{ background: t.bg, borderColor: t.border }}>
      <div className="rounded-md w-6 h-6 flex items-center justify-center flex-shrink-0" style={{ background: t.iconBg, color: t.iconFg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold leading-tight" style={{ color: t.titleFg }}>{title}</div>
        <div className="text-[10px] text-ink-500 mt-0.5 leading-snug">{message}</div>
      </div>
      {action && (
        <button className="text-[10px] font-bold rounded-md px-2 py-1 flex-shrink-0 bg-white border border-ink-100 hover:bg-tiket-warm-cream">
          {action}
        </button>
      )}
    </div>
  );
}

