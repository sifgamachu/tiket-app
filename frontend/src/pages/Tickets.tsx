import { Link } from 'react-router-dom';
import { Bus, Train, Ticket as TicketIcon, ChevronRight, Clock, CheckCircle2, Heart } from 'lucide-react';
import type { Ticket } from '@/types';
import { useAppStore } from '@/store/AppStore';
import { useT } from '@/lib/i18n';
import { EmptyState } from '@/components/ui/EmptyState';
import { fmtBr, fmtDate, fmtRelative, fmtTime } from '@/lib/format';
import { getCity } from '@/data/cities';
import { getStation, getRailClass } from '@/data/rail';
import { getEvent } from '@/data/events';
import { getBusOperator } from '@/data/operators';

export function Tickets() {
  const { state } = useAppStore();
  const { t } = useT();
  const tickets = state.tickets;

  const upcoming = tickets.filter(t => t.status === 'locked' || t.status === 'active');
  const past = tickets.filter(t => t.status === 'used' || t.status === 'expired' || t.status === 'refunded');

  return (
    <div className="bg-tiket-cream min-h-screen">
      <div className="px-4 pt-4 pb-3">
        <div className="text-2xl font-black text-ink-900">{t('my_tickets')}</div>
      </div>

      {tickets.length === 0 && (
        <EmptyState
          icon={<TicketIcon size={24} />}
          title={t('tickets_empty')}
          message="Buses, trains, and events you book will appear here."
          action={
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-xl bg-tiket-green text-white px-4 py-2 text-sm font-bold">
              Browse <ChevronRight size={14} />
            </Link>
          }
        />
      )}

      {upcoming.length > 0 && (
        <div className="px-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">{t('tickets_active')}</div>
          <div className="space-y-2">
            {upcoming.map(t => <TicketRow key={t.id} ticket={t} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="px-4 mt-5 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">{t('tickets_past')}</div>
          <div className="space-y-2 opacity-70">
            {past.map(t => <TicketRow key={t.id} ticket={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const ModeIcon = ticket.mode === 'bus' ? Bus : ticket.mode === 'rail' ? Train : TicketIcon;

  let title = '', subtitle = '', whenIso = ticket.purchasedAt;
  let badgeColor = '#1A6B3A';

  if (ticket.mode === 'bus') {
    const op = getBusOperator(ticket.operatorId);
    const fromCity = getCity(ticket.from)?.name ?? ticket.from;
    const toCity = getCity(ticket.to)?.name ?? ticket.to;
    title = `${fromCity} → ${toCity}`;
    subtitle = `${op?.name ?? 'Bus'} · ${fmtTime(ticket.depHHMM)} · Seat${ticket.seatLabels.length > 1 ? 's' : ''} ${ticket.seatLabels.join(', ')}`;
    whenIso = ticket.date;
    badgeColor = op?.color ?? '#1A6B3A';
  } else if (ticket.mode === 'rail') {
    const fromSt = getStation(ticket.from)?.name ?? ticket.from;
    const toSt = getStation(ticket.to)?.name ?? ticket.to;
    const cls = getRailClass(ticket.classId);
    title = `${fromSt} → ${toSt}`;
    subtitle = `EDR · ${cls?.name ?? ticket.classId} · ${ticket.seatLabels.join(', ')}`;
    badgeColor = cls?.color ?? '#1E3A8A';
  } else {
    const ev = getEvent(ticket.eventId);
    title = ev?.title ?? 'Event';
    subtitle = `${ticket.tierName} · ${ticket.quantity} ticket${ticket.quantity > 1 ? 's' : ''}`;
    whenIso = ev?.date ?? ticket.purchasedAt;
    badgeColor = '#9F1239';
  }

  return (
    <Link to={`/tickets/${ticket.id}`} className="block bg-white rounded-xl p-3 border border-ink-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: badgeColor }}>
          <ModeIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-ink-900 truncate flex items-center gap-1.5">
            <span className="truncate">{title}</span>
            {ticket.isDiaspora && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-50 text-rose-700 flex-shrink-0"
                title={ticket.senderName ? `Sent by ${ticket.senderName}` : 'Sent from abroad'}
              >
                <Heart size={8} fill="currentColor" /> Diaspora
              </span>
            )}
          </div>
          <div className="text-[11px] text-ink-500 truncate">{subtitle}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-ink-500 flex items-center gap-1">
              {ticket.status === 'used' ? <CheckCircle2 size={10} className="text-ok" /> : <Clock size={10} />}
              {fmtRelative(whenIso)} · {fmtDate(whenIso)}
            </span>
            <StatusPill status={ticket.status} />
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-ink-900 tabular">{fmtBr(ticket.totalPaid)}</div>
          <ChevronRight size={14} className="text-ink-500 ml-auto mt-0.5" />
        </div>
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: Ticket['status'] }) {
  const map = {
    locked:   { color: '#F59E0B', bg: '#FEF3C7', label: 'Locked' },
    active:   { color: '#10B981', bg: '#D1FAE5', label: 'Ready' },
    used:     { color: '#6B7280', bg: '#F3F4F6', label: 'Used' },
    expired:  { color: '#6B7280', bg: '#F3F4F6', label: 'Expired' },
    refunded: { color: '#6B7280', bg: '#F3F4F6', label: 'Refunded' },
  } as const;
  const s = map[status];
  return (
    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}
