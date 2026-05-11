import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, Search, Trophy, Music, Film, Drama, Users } from 'lucide-react';
import type { EventItem } from '@/types';
import { listEvents } from '@/lib/api';
import { EVENT_CATEGORIES } from '@/data/events';
import { fmtDateLong, fmtBr } from '@/lib/format';
import { EventCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTelegramBackButton } from '@/lib/telegram';

const CAT_ICONS = {
  sports: Trophy,
  concert: Music,
  cinema: Film,
  theatre: Drama,
  community: Users,
} as const;

export function Events() {
  const navigate = useNavigate();
  useTelegramBackButton(() => navigate('/'));
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    listEvents(category ?? undefined).then(setEvents).finally(() => setLoading(false));
  }, [category]);

  const filtered = events?.filter(e =>
    !q || e.title.toLowerCase().includes(q.toLowerCase()) || e.venue.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="bg-tiket-cream min-h-screen">

      <div className="relative overflow-hidden h-32" style={{
        background: 'linear-gradient(135deg, #9F1239 0%, #581C87 100%)',
      }}>
        <svg viewBox="0 0 360 130" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-25">
          <circle cx="60" cy="40" r="20" fill="#FBBF24" />
          <circle cx="300" cy="80" r="30" fill="#FBBF24" />
          <path d="M0 90 Q 90 70, 180 80 T 360 90" stroke="#FBBF24" strokeWidth="1" fill="none" />
        </svg>
        <button
          onClick={() => navigate('/')}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="absolute inset-x-4 bottom-3 text-white">
          <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-tiket-gold">Events · ክስተቶች</div>
          <div className="text-xl font-black mt-0.5">What's happening?</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search events, venues..."
            className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-white border border-ink-100 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4 mt-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
          <CatChip active={category === null} onClick={() => setCategory(null)} label="All" />
          {EVENT_CATEGORIES.map(cat => {
            const Icon = CAT_ICONS[cat.id];
            return (
              <CatChip
                key={cat.id}
                active={category === cat.id}
                onClick={() => setCategory(cat.id)}
                label={cat.name}
                icon={<Icon size={11} />}
              />
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="px-4 py-4 space-y-3" aria-busy="true" aria-label="Loading events">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      )}

      {!loading && filtered && filtered.length === 0 && (
        <EmptyState icon={<Calendar size={24} />} title="No events found" message="Try a different category." />
      )}

      {!loading && filtered && filtered.length > 0 && (
        <div className="px-4 py-4 space-y-3">
          {filtered.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}

function CatChip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 transition ${
        active ? 'bg-tiket-green text-white' : 'bg-white border border-ink-100 text-ink-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const Icon = CAT_ICONS[event.category];
  const cheapest = event.tiers.reduce((m, t) => Math.min(m, t.price), Infinity);
  const totalAvailable = event.tiers.reduce((s, t) => s + t.available, 0);
  const filledPct = Math.round((event.sold / event.capacity) * 100);

  // Category-specific gradient
  const gradient = {
    sports:    'linear-gradient(135deg, #1A6B3A 0%, #0F4D27 100%)',
    concert:   'linear-gradient(135deg, #9F1239 0%, #581C87 100%)',
    cinema:    'linear-gradient(135deg, #1E40AF 0%, #0E1B45 100%)',
    theatre:   'linear-gradient(135deg, #7C2D12 0%, #431407 100%)',
    community: 'linear-gradient(135deg, #0E7490 0%, #155E75 100%)',
  }[event.category];

  return (
    <Link to={`/events/${event.id}`} className="block rounded-2xl bg-white border border-ink-100 shadow-sm overflow-hidden">
      <div className="h-24 relative" style={{ background: gradient }}>
        <svg viewBox="0 0 360 96" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-20">
          <circle cx="320" cy="30" r="20" fill="white" />
          <path d="M0 70 Q 90 55, 180 65 T 360 70" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-[9px] font-bold flex items-center gap-1">
          <Icon size={9} />
          {event.category.toUpperCase()}
        </div>
        <div className="absolute inset-x-3 bottom-2 text-white">
          <div className="text-base font-black leading-tight line-clamp-2">{event.title}</div>
          {event.amh && <div className="text-[10px] opacity-90 font-ethiopic">{event.amh}</div>}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-3 text-[10px] text-ink-500 mb-2">
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            {fmtDateLong(event.date)}
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={11} />
            {event.venue}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] text-ink-500 uppercase tracking-wider">From</div>
            <div className="text-sm font-black text-ink-900 tabular">{fmtBr(cheapest)}</div>
          </div>
          <div className="flex-1 mx-3">
            <div className="text-[9px] text-ink-500 mb-0.5 flex justify-between">
              <span>{filledPct}% sold</span>
              <span>{totalAvailable.toLocaleString()} left</span>
            </div>
            <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
              <div className="h-full bg-tiket-green rounded-full" style={{ width: `${filledPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
