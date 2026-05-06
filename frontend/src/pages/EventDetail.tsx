import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, Clock, Users, Trophy, Music, Film, Drama, Building } from 'lucide-react';
import type { EventItem } from '@/types';
import { getEventApi } from '@/lib/api';
import { fmtBr, fmtDateLong, fmtTimeFromIso } from '@/lib/format';
import { Loading } from '@/components/ui/Loading';
import { TeletStripe } from '@/components/TeletStripe';
import { useTelegramBackButton } from '@/lib/telegram';

const CAT_ICONS = { sports: Trophy, concert: Music, cinema: Film, theatre: Drama, community: Users } as const;

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  useTelegramBackButton(() => navigate('/events'));
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    getEventApi(eventId).then(e => {
      setEvent(e);
      if (e?.tiers[0]) setSelectedTier(e.tiers[0].id);
    }).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <Loading />;
  if (!event) return <div className="p-8 text-center text-sm text-ink-500">Event not found</div>;

  const Icon = CAT_ICONS[event.category];
  const tier = event.tiers.find(t => t.id === selectedTier);
  const subtotal = tier ? tier.price * quantity : 0;
  const fee = Math.round(subtotal * 0.025);
  const total = subtotal + fee;

  const gradient = {
    sports:    'linear-gradient(135deg, #1A6B3A 0%, #0F4D27 100%)',
    concert:   'linear-gradient(135deg, #9F1239 0%, #581C87 100%)',
    cinema:    'linear-gradient(135deg, #1E40AF 0%, #0E1B45 100%)',
    theatre:   'linear-gradient(135deg, #7C2D12 0%, #431407 100%)',
    community: 'linear-gradient(135deg, #0E7490 0%, #155E75 100%)',
  }[event.category];

  return (
    <div className="bg-tiket-cream min-h-screen pb-32">
      <TeletStripe />

      {/* Hero */}
      <div className="relative h-48" style={{ background: gradient }}>
        <svg viewBox="0 0 360 192" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-20">
          <circle cx="320" cy="50" r="30" fill="white" />
          <circle cx="50" cy="120" r="25" fill="white" />
          <path d="M0 140 Q 90 110, 180 130 T 360 140" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-[9px] font-bold flex items-center gap-1">
          <Icon size={10} /> {event.category.toUpperCase()}
        </div>
        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="text-xl font-black leading-tight">{event.title}</div>
          {event.amh && <div className="text-xs opacity-90 mt-0.5 font-ethiopic">{event.amh}</div>}
        </div>
      </div>

      {/* Quick facts */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-3 space-y-2">
          <Fact icon={<Calendar size={14} />} primary={fmtDateLong(event.date)} secondary={fmtTimeFromIso(event.date)} />
          <Fact icon={<MapPin size={14} />} primary={event.venue} secondary={event.city} />
          <Fact icon={<Building size={14} />} primary="Organized by" secondary={event.organizer} />
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="px-4 mt-3">
          <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5 text-ink-500">About</div>
          <p className="text-xs text-ink-900 leading-relaxed">{event.description}</p>
        </div>
      )}

      {/* Tiers */}
      <div className="px-4 mt-4">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2 text-ink-500">Choose Tier · ደረጃ ምረጥ</div>
        <div className="space-y-1.5">
          {event.tiers.map(t => {
            const selected = t.id === selectedTier;
            const soldOut = t.available === 0;
            return (
              <button
                key={t.id}
                onClick={() => !soldOut && setSelectedTier(t.id)}
                disabled={soldOut}
                className="w-full rounded-xl p-3 transition border-2 disabled:opacity-50 text-left"
                style={{
                  background: selected ? (t.color ?? '#1A6B3A') : 'white',
                  borderColor: selected ? (t.color ?? '#1A6B3A') : '#E5E7EB',
                  color: selected ? 'white' : '#0E1411',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      {t.name}
                      {t.amh && <span className="text-[10px] opacity-80 font-ethiopic">· {t.amh}</span>}
                    </div>
                    {t.description && <div className="text-[10px] opacity-80 mt-0.5">{t.description}</div>}
                    <div className="text-[10px] mt-1 opacity-80">
                      {soldOut ? 'Sold out' : `${t.available.toLocaleString()} of ${t.capacity.toLocaleString()} left`}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-base font-black tabular">{fmtBr(t.price)}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      {tier && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-xl border border-ink-100 p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-500">Quantity</div>
              <div className="text-xs font-bold text-ink-900">{quantity} {quantity === 1 ? 'ticket' : 'tickets'}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-full bg-tiket-warm-cream border border-ink-100 text-ink-900 font-bold">−</button>
              <div className="w-7 text-center text-sm font-bold text-ink-900 tabular">{quantity}</div>
              <button onClick={() => setQuantity(q => Math.min(8, q + 1))} className="w-7 h-7 rounded-full bg-tiket-warm-cream border border-ink-100 text-ink-900 font-bold">+</button>
            </div>
          </div>
        </div>
      )}

      {/* Action bar */}
      {tier && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-100 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-500">{quantity} × {tier.name}</div>
              <div className="text-base font-black text-ink-900 tabular">{fmtBr(total)}</div>
              <div className="text-[10px] text-ink-500">incl. {fmtBr(fee)} fee</div>
            </div>
            <button
              onClick={() => navigate(`/events/${event.id}/checkout?tier=${tier.id}&qty=${quantity}`)}
              className="rounded-xl bg-tiket-green text-white px-5 py-2.5 text-sm font-bold flex items-center gap-2"
            >
              <Clock size={14} />
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ icon, primary, secondary }: { icon: React.ReactNode; primary: string; secondary: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-md bg-tiket-warm-cream flex items-center justify-center text-ink-500 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-ink-900 truncate">{primary}</div>
        <div className="text-[10px] text-ink-500 truncate">{secondary}</div>
      </div>
    </div>
  );
}
