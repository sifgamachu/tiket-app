import { useMemo, useState } from 'react';
import { Search, Filter, Download, Smartphone, Star, CreditCard, Banknote, ChevronDown } from 'lucide-react';
import { getTickets, getDepartures, type OperatorTicket } from '@/data/operatorMock';
import { getCity } from '@/data/cities';
import { fmtBr } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────
// Sales report — every ticket sold, filterable by date and route.
//
// Three filters:
// - Date range (today / last 7 days / last 30 days)
// - Route (any / specific city pair)
// - Channel (any / app / agent / walk-in)
//
// Plus a search bar that matches buyer name or ticket ID.
//
// Bottom of the screen shows totals: total revenue, ticket count,
// breakdown by payment method.
// ─────────────────────────────────────────────────────────────────

const GADAA_COLOR = '#9A3412';

type DateRange = 'today' | '7d' | '30d' | 'all';
type ChannelFilter = 'any' | 'app' | 'agent' | 'walkin';

export function OperatorSalesReport() {
  const allTickets = getTickets();
  const departures = getDepartures();

  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('any');
  const [search, setSearch] = useState('');

  // Build the unique list of routes from departures, for the filter dropdown
  const routes = useMemo(() => {
    const seen = new Set<string>();
    return departures
      .filter(d => {
        const k = `${d.from}-${d.to}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .map(d => ({ key: `${d.from}-${d.to}`, label: `${getCity(d.from)?.name} → ${getCity(d.to)?.name}` }));
  }, [departures]);

  // Apply filters
  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = dateRange === 'today' ? new Date().setHours(0, 0, 0, 0)
      : dateRange === '7d'  ? now - 7 * 86_400_000
      : dateRange === '30d' ? now - 30 * 86_400_000
      : 0;

    return allTickets.filter(t => {
      const dep = departures.find(d => d.id === t.departureId);
      if (!dep) return false;
      if (new Date(t.purchasedAt).getTime() < cutoff) return false;
      if (routeFilter !== 'all' && `${dep.from}-${dep.to}` !== routeFilter) return false;
      if (channelFilter !== 'any' && t.channel !== channelFilter) return false;
      if (search && !t.buyerName.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTickets, departures, dateRange, routeFilter, channelFilter, search]);

  // Stats for the totals row
  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, t) => s + t.amount, 0);
    const byMethod = filtered.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] ?? 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    return { count: filtered.length, revenue, byMethod };
  }, [filtered]);

  return (
    <div className="px-4 lg:px-6 py-4 lg:py-6 max-w-6xl">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black">Sales report</h1>
          <p className="text-[11px] lg:text-xs text-ink-500 mt-0.5">Gabaasa gurgurtaa · {totals.count} tickets · {fmtBr(totals.revenue)} revenue</p>
        </div>
        <button className="rounded-xl px-3 py-2 text-xs font-bold bg-white border border-ink-100 inline-flex items-center gap-1.5">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-ink-100 p-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <FilterSelect
            label="Date range"
            value={dateRange}
            onChange={v => setDateRange(v as DateRange)}
            options={[
              { value: 'today', label: 'Today' },
              { value: '7d',    label: 'Last 7 days' },
              { value: '30d',   label: 'Last 30 days' },
              { value: 'all',   label: 'All time' },
            ]}
          />
          <FilterSelect
            label="Route"
            value={routeFilter}
            onChange={setRouteFilter}
            options={[
              { value: 'all', label: 'All routes' },
              ...routes.map(r => ({ value: r.key, label: r.label })),
            ]}
          />
          <FilterSelect
            label="Channel"
            value={channelFilter}
            onChange={v => setChannelFilter(v as ChannelFilter)}
            options={[
              { value: 'any',    label: 'All channels' },
              { value: 'app',    label: 'Tikēt app' },
              { value: 'agent',  label: 'Agent' },
              { value: 'walkin', label: 'Walk-in' },
            ]}
          />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-ink-500">Search</div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buyer name or ticket ID"
                className="w-full text-xs rounded-lg pl-7 pr-2 py-2 bg-tiket-warm-cream border border-ink-100 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Totals row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        <TotalCard label="Tickets" value={String(totals.count)} sub="in selected range" />
        <TotalCard label="Revenue" value={fmtBr(totals.revenue)} sub="gross" accent />
        <TotalCard label="Telebirr" value={fmtBr(totals.byMethod.telebirr ?? 0)} sub={`${pct(totals.byMethod.telebirr ?? 0, totals.revenue)}%`} />
        <TotalCard label="Cash" value={fmtBr(totals.byMethod.cash ?? 0)} sub={`${pct(totals.byMethod.cash ?? 0, totals.revenue)}%`} />
      </div>

      {/* Tickets table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink-100 p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-tiket-warm-cream flex items-center justify-center text-ink-500 mb-2">
            <Filter size={18} />
          </div>
          <div className="text-sm font-bold">No tickets match the filters</div>
          <div className="text-[11px] text-ink-500 mt-0.5">Try widening the date range or clearing the route filter.</div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-ink-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-tiket-warm-cream text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  <th className="text-left px-4 py-2.5">Ticket ID</th>
                  <th className="text-left px-4 py-2.5">Buyer</th>
                  <th className="text-left px-4 py-2.5">Route</th>
                  <th className="text-left px-4 py-2.5">Seat</th>
                  <th className="text-left px-4 py-2.5">Channel</th>
                  <th className="text-left px-4 py-2.5">Payment</th>
                  <th className="text-left px-4 py-2.5">Amount</th>
                  <th className="text-left px-4 py-2.5">Purchased</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map(t => <TicketRow key={t.id} ticket={t} departures={departures} />)}
              </tbody>
            </table>
            {filtered.length > 50 && (
              <div className="px-4 py-2.5 text-[11px] text-ink-500 border-t border-ink-100">
                Showing 50 of {filtered.length} tickets · widen filters or export CSV for full list
              </div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-2">
            {filtered.slice(0, 30).map(t => <TicketCard key={t.id} ticket={t} departures={departures} />)}
            {filtered.length > 30 && (
              <div className="text-[11px] text-center text-ink-500 py-2">
                Showing 30 of {filtered.length} · use desktop or filter further
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function pct(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 100);
}

function TotalCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500 mb-1">{label}</div>
      <div className="text-base lg:text-lg font-black tabular" style={accent ? { color: GADAA_COLOR } : undefined}>{value}</div>
      <div className="text-[10px] text-ink-500 mt-0.5">{sub}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-ink-500">{label}</div>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full text-xs rounded-lg pl-2.5 pr-7 py-2 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900 appearance-none"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
      </div>
    </div>
  );
}

function TicketRow({ ticket, departures }: { ticket: OperatorTicket; departures: ReturnType<typeof getDepartures> }) {
  const dep = departures.find(d => d.id === ticket.departureId);
  const fromName = dep ? getCity(dep.from)?.name : '—';
  const toName = dep ? getCity(dep.to)?.name : '—';
  return (
    <tr className="border-t border-ink-100 hover:bg-tiket-warm-cream/40">
      <td className="px-4 py-2 font-mono text-[11px] tabular">{ticket.id}</td>
      <td className="px-4 py-2">
        <div className="text-[12px] font-semibold">{ticket.buyerName}</div>
        <div className="text-[10px] text-ink-500">{ticket.buyerPhone}</div>
      </td>
      <td className="px-4 py-2 text-[11px]">
        {fromName} → {toName}
      </td>
      <td className="px-4 py-2 text-[11px] tabular">{ticket.seatLabels.join(', ')}</td>
      <td className="px-4 py-2"><ChannelPill channel={ticket.channel} /></td>
      <td className="px-4 py-2"><PaymentPill method={ticket.paymentMethod} /></td>
      <td className="px-4 py-2 text-[12px] font-bold tabular">{fmtBr(ticket.amount)}</td>
      <td className="px-4 py-2 text-[10px] text-ink-500">{new Date(ticket.purchasedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    </tr>
  );
}

function TicketCard({ ticket, departures }: { ticket: OperatorTicket; departures: ReturnType<typeof getDepartures> }) {
  const dep = departures.find(d => d.id === ticket.departureId);
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-3">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <div className="text-[12px] font-bold">{ticket.buyerName}</div>
          <div className="text-[10px] text-ink-500 font-mono">{ticket.id}</div>
        </div>
        <div className="text-right">
          <div className="text-[12px] font-bold tabular">{fmtBr(ticket.amount)}</div>
          <div className="text-[9px] text-ink-500 tabular">Seat {ticket.seatLabels.join(', ')}</div>
        </div>
      </div>
      <div className="text-[11px] text-ink-500 mb-2">
        {dep ? `${getCity(dep.from)?.name} → ${getCity(dep.to)?.name}` : 'Unknown route'}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <ChannelPill channel={ticket.channel} />
        <PaymentPill method={ticket.paymentMethod} />
      </div>
    </div>
  );
}

function ChannelPill({ channel }: { channel: OperatorTicket['channel'] }) {
  const map = {
    app:    { label: 'Tikēt app', bg: '#D1FAE5', fg: '#065F46' },
    agent:  { label: 'Agent',     bg: '#DBEAFE', fg: '#1E40AF' },
    walkin: { label: 'Walk-in',   bg: '#E5E7EB', fg: '#374151' },
  } as const;
  const m = map[channel];
  return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: m.bg, color: m.fg }}>{m.label}</span>;
}

function PaymentPill({ method }: { method: OperatorTicket['paymentMethod'] }) {
  const map = {
    telebirr: { icon: <Smartphone size={9} />,    label: 'Telebirr', bg: '#DBEAFE', fg: '#1B3A8C' },
    stars:    { icon: <Star size={9} />,          label: 'Stars',    bg: '#E0F2FE', fg: '#0369A1' },
    card:     { icon: <CreditCard size={9} />,    label: 'Card',     bg: '#F3E8FF', fg: '#6B21A8' },
    cash:     { icon: <Banknote size={9} />,      label: 'Cash',     bg: '#FEF3C7', fg: '#92400E' },
  } as const;
  const m = map[method];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: m.bg, color: m.fg }}>
      {m.icon} {m.label}
    </span>
  );
}
