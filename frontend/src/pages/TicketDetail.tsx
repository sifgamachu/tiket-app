import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle2, Clock, Bus, Train, Ticket as TicketIcon, Calendar, MapPin, User as UserIcon, Phone, Share2, Heart } from 'lucide-react';
import { useAppStore } from '@/store/AppStore';
import { FakeQR } from '@/components/FakeQR';
import { fmtBr, fmtDateLong, fmtTime, fmtTimeFromIso, fmtUSD } from '@/lib/format';
import { getCity } from '@/data/cities';
import { getBusOperator } from '@/data/operators';
import { getStation, getRailClass, RAIL_OPERATOR } from '@/data/rail';
import { getEvent } from '@/data/events';
import { RailRouteMap } from './RailSearch';
import { useToast } from '@/components/Toast';
import { useTelegramBackButton, haptic, getTg } from '@/lib/telegram';
import type { Ticket } from '@/types';

export function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { state, updateTicket } = useAppStore();
  const ticket = state.tickets.find(t => t.id === ticketId);
  const toast = useToast();

  // Live ticking clock for unlock countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const unlockMs = ticket ? new Date(ticket.unlockAt).getTime() : Infinity;
  const isUnlocked = !!ticket && (ticket.status === 'active' || ticket.status === 'used' || now >= unlockMs);
  const isUsed = ticket?.status === 'used';

  // Auto-promote to active when unlock time passes
  useEffect(() => {
    if (ticket && ticket.status === 'locked' && isUnlocked && !isUsed) {
      updateTicket(ticket.id, { status: 'active' });
    }
  }, [ticket, isUnlocked, isUsed, updateTicket]);

  useTelegramBackButton(() => navigate('/tickets'));

  if (!ticket) {
    return (
      <div className="bg-tiket-cream min-h-screen p-8 text-center">
        <div className="text-sm text-ink-500 mb-3">Ticket not found</div>
        <Link to="/tickets" className="inline-flex items-center gap-1.5 rounded-xl bg-tiket-green text-white px-4 py-2 text-sm font-bold">
          ← Back to tickets
        </Link>
      </div>
    );
  }

  const msUntilUnlock = Math.max(0, unlockMs - now);

  const onShare = async () => {
    haptic.light();
    const shareText = formatShareText(ticket);
    const shareUrl = `${window.location.origin}/tickets/${ticket.id}`;
    const tg = getTg();
    // Inside Telegram: prefer the native share-to-chat picker
    if (tg && 'switchInlineQuery' in tg) {
      // openTelegramLink with t.me/share works reliably across clients
      tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
      return;
    }
    // Web Share API on mobile, clipboard fallback on desktop
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Tikēt ticket', text: shareText, url: shareUrl });
        return;
      } catch { /* user cancelled */ return; }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Sharing not supported on this device');
    }
  };

  const headerColor = ticket.mode === 'bus' ? '#1A6B3A' : ticket.mode === 'rail' ? '#1E3A8A' : '#9F1239';

  return (
    <div className="bg-tiket-cream min-h-screen pb-6">

      {/* Header */}
      <div className="relative" style={{ background: headerColor }}>
        <button onClick={() => navigate('/tickets')}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center"
          aria-label="Back to tickets">
          <ArrowLeft size={16} />
        </button>
        <button onClick={onShare}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center"
          aria-label="Share ticket">
          <Share2 size={16} />
        </button>
        <div className="px-4 py-4 pt-3 text-white text-center">
          <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-tiket-gold">Tikēt</div>
          <div className="text-[11px] font-mono mt-1 opacity-80 tabular">{ticket.id}</div>
          {ticket.isDiaspora && (
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-white/15 text-[9px] font-bold">
              <Heart size={9} fill="currentColor" /> Sent from {ticket.senderName ?? 'abroad'}
            </div>
          )}
        </div>
      </div>

      {/* QR / locked block */}
      <div className="px-4 -mt-2 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-ink-100">
          {isUsed ? (
            <UsedView ticket={ticket} />
          ) : isUnlocked ? (
            <UnlockedView ticket={ticket} />
          ) : (
            <LockedView ticket={ticket} msLeft={msUntilUnlock} />
          )}
        </div>
      </div>

      {/* Ticket details */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-3 border border-ink-100 space-y-2">
          {ticket.mode === 'bus' && <BusDetails ticket={ticket as Extract<Ticket, { mode: 'bus' }>} />}
          {ticket.mode === 'rail' && <RailDetails ticket={ticket as Extract<Ticket, { mode: 'rail' }>} />}
          {ticket.mode === 'event' && <EventDetails ticket={ticket as Extract<Ticket, { mode: 'event' }>} />}

          <div className="border-t border-ink-100 my-2 pt-2 space-y-1.5">
            <Row icon={<UserIcon size={11} />} label={ticket.isDiaspora ? 'Passenger' : 'Buyer'} value={ticket.buyerName} />
            <Row icon={<Phone size={11} />} label="Phone" value={ticket.buyerPhone} />
            <Row label="Paid" value={ticket.isDiaspora && ticket.paidAmount ? fmtUSD(ticket.paidAmount) : fmtBr(ticket.totalPaid)} />
            <Row label="Method" value={ticket.paymentMethod} className="capitalize" />
            {ticket.isDiaspora && ticket.senderName && (
              <Row icon={<Heart size={11} />} label="Sent by" value={`${ticket.senderName} (${ticket.senderPhone ?? '—'})`} />
            )}
          </div>
        </div>
      </div>

      {/* Rail route map */}
      {ticket.mode === 'rail' && (
        <div className="px-4 mt-3">
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2 text-ink-500">Your Journey</div>
          <div className="rounded-2xl bg-white border border-ink-100 p-3">
            <RailRouteMap from={(ticket as Extract<Ticket, { mode: 'rail' }>).from} to={(ticket as Extract<Ticket, { mode: 'rail' }>).to} />
          </div>
        </div>
      )}

      {/* Share button (web fallback when Telegram chrome doesn't show share elsewhere) */}
      <div className="px-4 mt-3">
        <button
          onClick={onShare}
          className="w-full rounded-xl py-2.5 text-sm font-bold bg-white border border-ink-100 text-ink-900 flex items-center justify-center gap-2"
        >
          <Share2 size={14} /> Share ticket
        </button>
      </div>
    </div>
  );
}

function formatShareText(t: Ticket): string {
  if (t.mode === 'bus') {
    const op = getBusOperator(t.operatorId);
    return `${op?.name ?? 'Bus'} from ${t.from} to ${t.to} on ${fmtDateLong(t.date)} · Seat ${t.seatLabels.join(', ')} · Tikēt`;
  }
  if (t.mode === 'rail') {
    return `EDR train from ${t.from} to ${t.to} · Seat ${t.seatLabels.join(', ')} · Tikēt`;
  }
  const ev = getEvent(t.eventId);
  return `${ev?.title ?? 'Event'} · ${t.tierName} × ${t.quantity} · Tikēt`;
}

function LockedView({ ticket, msLeft }: { ticket: Ticket; msLeft: number }) {
  const days = Math.floor(msLeft / 86_400_000);
  const hours = Math.floor((msLeft % 86_400_000) / 3_600_000);
  const minutes = Math.floor((msLeft % 3_600_000) / 60_000);
  const seconds = Math.floor((msLeft % 60_000) / 1000);

  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-3">
        <Lock size={28} />
      </div>
      <div className="text-base font-black text-ink-900">QR locked until departure</div>
      <div className="text-[11px] text-ink-500 mt-0.5">
        Unlocks at {fmtTimeFromIso(ticket.unlockAt)} on {fmtDateLong(ticket.unlockAt).split(',')[1]?.trim()}
      </div>
      <div className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-tiket-warm-cream tabular text-ink-900">
        {days > 0 && <Slot label="d" value={days} />}
        <Slot label="h" value={hours} />
        <Slot label="m" value={minutes} />
        <Slot label="s" value={seconds} />
      </div>
      <div className="mt-3 text-[10px] text-ink-500 max-w-xs mx-auto">
        🔒 Time-locking prevents resold or screenshotted tickets from being scanned before they're valid.
      </div>
    </div>
  );
}

function Slot({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className="text-base font-black text-ink-900 tabular">{String(value).padStart(2, '0')}</span>
      <span className="text-[9px] text-ink-500">{label}</span>
    </div>
  );
}

function UnlockedView({ ticket }: { ticket: Ticket }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tiket-green text-white text-[10px] font-bold mb-2">
        <CheckCircle2 size={11} /> Ready to scan
      </div>
      <div className="bg-white p-3 rounded-xl inline-block">
        <FakeQR id={ticket.qrPayload} size={180} />
      </div>
      <div className="text-[10px] text-ink-500 mt-2">
        Show this QR at the {ticket.mode === 'bus' ? 'bus terminal' : ticket.mode === 'rail' ? 'station gate' : 'venue entrance'}
      </div>
      <div className="text-[9px] font-mono mt-1 text-ink-500 tabular">{ticket.id}</div>
    </div>
  );
}

function UsedView({ ticket }: { ticket: Ticket }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-ok/10 flex items-center justify-center text-ok mb-3">
        <CheckCircle2 size={28} />
      </div>
      <div className="text-base font-black text-ink-900">Ticket used</div>
      <div className="text-[11px] text-ink-500 mt-0.5">Scanned and validated</div>
      <div className="text-[9px] font-mono mt-2 text-ink-500 tabular">{ticket.id}</div>
    </div>
  );
}

function Row({ icon, label, value, className = '' }: { icon?: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-ink-500 flex items-center gap-1">{icon}{label}</span>
      <span className={`font-bold text-ink-900 ${className}`}>{value}</span>
    </div>
  );
}

function BusDetails({ ticket }: { ticket: Extract<Ticket, { mode: 'bus' }> }) {
  const op = getBusOperator(ticket.operatorId);
  const fromC = getCity(ticket.from);
  const toC = getCity(ticket.to);
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Bus size={14} className="text-tiket-green" />
        <span className="text-xs font-bold text-ink-900">{op?.name}</span>
        <span className="text-[10px] text-ink-500">{ticket.seatLabels.length} seat{ticket.seatLabels.length > 1 ? 's' : ''}</span>
      </div>
      <Row icon={<MapPin size={11} />} label="From" value={fromC?.name ?? ticket.from} />
      <Row icon={<MapPin size={11} />} label="To" value={toC?.name ?? ticket.to} />
      <Row icon={<Calendar size={11} />} label="Date" value={fmtDateLong(ticket.date)} />
      <Row icon={<Clock size={11} />} label="Departure" value={fmtTime(ticket.depHHMM)} />
      <Row label="Seats" value={ticket.seatLabels.join(', ')} />
    </>
  );
}

function RailDetails({ ticket }: { ticket: Extract<Ticket, { mode: 'rail' }> }) {
  const fromSt = getStation(ticket.from);
  const toSt = getStation(ticket.to);
  const cls = getRailClass(ticket.classId);
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Train size={14} style={{ color: RAIL_OPERATOR.color }} />
        <span className="text-xs font-bold text-ink-900">{RAIL_OPERATOR.name}</span>
        <span className="text-[10px] text-ink-500">{cls?.name}</span>
      </div>
      <Row icon={<MapPin size={11} />} label="From" value={fromSt?.name ?? ticket.from} />
      <Row icon={<MapPin size={11} />} label="To" value={toSt?.name ?? ticket.to} />
      <Row label="Seats" value={ticket.seatLabels.join(', ')} />
      {ticket.passportNumber && <Row label="Passport" value={ticket.passportNumber} className="tabular" />}
    </>
  );
}

function EventDetails({ ticket }: { ticket: Extract<Ticket, { mode: 'event' }> }) {
  const ev = getEvent(ticket.eventId);
  if (!ev) return null;
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <TicketIcon size={14} className="text-rose-700" />
        <span className="text-xs font-bold text-ink-900 truncate">{ev.title}</span>
      </div>
      <Row icon={<Calendar size={11} />} label="When" value={fmtDateLong(ev.date)} />
      <Row icon={<MapPin size={11} />} label="Where" value={ev.venue} />
      <Row label="Tier" value={ticket.tierName} />
      <Row label="Quantity" value={`${ticket.quantity} ticket${ticket.quantity > 1 ? 's' : ''}`} />
    </>
  );
}
