import { Link, useNavigate } from 'react-router-dom';
import { Bus, Train, Ticket, ChevronRight, Shield, Clock, ArrowRight, History } from 'lucide-react';
import { TeletStripe } from '@/components/TeletStripe';
import { LanguagePicker } from '@/components/LanguagePicker';
import { useAppStore } from '@/store/AppStore';
import { useT } from '@/lib/i18n';
import { fmtRelative } from '@/lib/format';
import { getCity } from '@/data/cities';
import { getStation } from '@/data/rail';
import { isInTelegram, haptic } from '@/lib/telegram';

export function Home() {
  const { state } = useAppStore();
  const { t } = useT();
  const navigate = useNavigate();
  const upcomingTickets = state.tickets.filter(t => t.status === 'locked' || t.status === 'active').slice(0, 3);
  const recentSearches = state.recentSearches.slice(0, 4);
  const inTelegram = isInTelegram();

  const onRecentClick = (s: { from: string; to: string; mode: 'bus' | 'rail' }) => {
    haptic.selection();
    const today = new Date().toISOString().slice(0, 10);
    if (s.mode === 'bus') {
      navigate(`/bus/results?from=${s.from}&to=${s.to}&date=${today}&pax=1`);
    } else {
      navigate(`/rail/results?from=${s.from}&to=${s.to}&date=${today}&pax=1`);
    }
  };

  return (
    <div className="bg-tiket-cream">
      <TeletStripe />

      {/* Hero */}
      <div className="relative overflow-hidden h-44" style={{
        background: 'linear-gradient(160deg, #1A6B3A 0%, #0F4D27 50%, #0E1411 100%)',
      }}>
        <svg viewBox="0 0 360 180" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <path d="M0 130 L60 105 L120 115 L180 95 L240 110 L300 100 L360 115 L360 180 L0 180 Z" fill="#0B0F14" />
          <path d="M0 100 L40 70 L80 90 L130 50 L180 80 L240 60 L300 85 L360 55 L360 180 L0 180 Z" fill="#0B0F14" opacity="0.6" />
          <circle cx="290" cy="55" r="16" fill="#FCD34D" opacity="0.6" />
          <path d="M-10 145 Q 100 130, 180 138 T 380 132" stroke="#D4A33B" strokeWidth="1" fill="none" strokeDasharray="4 3" opacity="0.5" />
        </svg>
        {/* Top-right corner: language picker + Telegram indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {inTelegram && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Telegram
            </div>
          )}
          <LanguagePicker variant="ghost" />
        </div>
        <div className="absolute inset-x-4 bottom-4 text-white">
          <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-tiket-gold">Tikēt · ቲኬት</div>
          <div className="text-2xl font-black mt-1 leading-tight">
            {state.user
              ? t('hero_greeting_named', { name: state.user.name.split(' ')[0] })
              : t('hero_greeting_visitor')}
          </div>
          <div className="text-xs opacity-80">{t('hero_subtitle')}</div>
        </div>
      </div>

      {/* Mode picker */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1 text-white">
          {t('choose_how_you_travel')}
        </div>
        <div className="space-y-2.5">
          <ModeCard to="/bus" kind="bus" title={t('mode_bus')}
            sub={t('mode_bus_sub')}
            stats="120+ daily departures · 47 routes" icon={<Bus size={28} />} />
          <ModeCard to="/rail" kind="rail" title={t('mode_rail')}
            sub={t('mode_rail_sub')}
            stats="752km · ~12hr · Standard / Business / Sleeper" icon={<Train size={28} />} />
          <ModeCard to="/events" kind="event" title={t('mode_events')}
            sub={t('mode_events_sub')}
            stats="Sheger Derby · Teddy Afro · Edna Cinema" icon={<Ticket size={28} />} />
        </div>
      </div>

      {/* Recent searches — shown when the user has at least one */}
      {recentSearches.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <History size={11} className="text-ink-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">{t('recent_searches')}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {recentSearches.map((s, i) => {
              const fromName = s.mode === 'bus' ? getCity(s.from)?.name ?? s.from : getStation(s.from)?.name ?? s.from;
              const toName = s.mode === 'bus' ? getCity(s.to)?.name ?? s.to : getStation(s.to)?.name ?? s.to;
              const ModeIcon = s.mode === 'bus' ? Bus : Train;
              return (
                <button
                  key={`${s.mode}-${s.from}-${s.to}-${i}`}
                  onClick={() => onRecentClick(s)}
                  className="flex-shrink-0 rounded-xl bg-white border border-ink-100 px-3 py-2 text-left flex items-center gap-2 min-w-[180px]"
                >
                  <div className="w-7 h-7 rounded-md bg-tiket-warm-cream flex items-center justify-center text-tiket-green flex-shrink-0">
                    <ModeIcon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-ink-900 truncate flex items-center gap-1">
                      <span className="truncate">{fromName}</span>
                      <ArrowRight size={9} className="text-ink-500 flex-shrink-0" />
                      <span className="truncate">{toName}</span>
                    </div>
                    <div className="text-[9px] text-ink-500 capitalize">{s.mode} · {fmtRelative(new Date(s.ts).toISOString())}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming tickets */}
      {upcomingTickets.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">{t('upcoming_tickets')}</span>
            <Link to="/tickets" className="text-[11px] font-bold text-tiket-green flex items-center gap-1">
              {t('view_all')} <ChevronRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingTickets.map(t => (
              <Link key={t.id} to={`/tickets/${t.id}`} className="block bg-white rounded-xl p-3 border border-ink-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-tiket-warm-cream flex items-center justify-center text-tiket-green flex-shrink-0">
                    {t.mode === 'bus' && <Bus size={16} />}
                    {t.mode === 'rail' && <Train size={16} />}
                    {t.mode === 'event' && <Ticket size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-ink-900 truncate">
                      {t.mode === 'bus' && `${t.from} → ${t.to}`}
                      {t.mode === 'rail' && `${t.from} → ${t.to}`}
                      {t.mode === 'event' && t.tierName}
                    </div>
                    <div className="text-[10px] text-ink-500 flex items-center gap-1">
                      <Clock size={9} />
                      {t.mode === 'bus' && fmtRelative(t.date)}
                      {t.mode === 'rail' && fmtRelative(t.purchasedAt)}
                      {t.mode === 'event' && fmtRelative(t.purchasedAt)}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-ink-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trust banner */}
      <div className="px-4 mt-5 mb-6">
        <div className="bg-white rounded-xl p-3 border border-ink-100 flex items-start gap-2.5">
          <Shield size={14} className="text-tiket-green mt-0.5 flex-shrink-0" />
          <div className="text-[10px] text-ink-500">
            <span className="font-bold text-ink-900">One Tikēt for everything.</span>{' '}
            Your account, payment methods, and ticket history work across buses, trains, and events. Telebirr, Telegram Stars, and card supported.
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModeCardProps {
  to: string; kind: 'bus' | 'rail' | 'event';
  title: string; sub: string; stats: string;
  icon: React.ReactNode;
}

function ModeCard({ to, kind, title, sub, stats, icon }: ModeCardProps) {
  const gradient = kind === 'bus'
    ? 'linear-gradient(135deg, #1A6B3A 0%, #0F4D27 100%)'
    : kind === 'rail'
    ? 'linear-gradient(135deg, #1E3A8A 0%, #0E1B45 100%)'
    : 'linear-gradient(135deg, #9F1239 0%, #581C87 100%)';

  return (
    <Link to={to} className="block bg-white rounded-2xl p-3 border border-ink-100 shadow-sm">
      <div className="flex items-stretch gap-3">
        <div className="flex-shrink-0 rounded-xl flex items-center justify-center text-white"
          style={{ width: 64, height: 64, background: gradient }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-black text-ink-900">{title}</span>
            <ChevronRight size={14} className="text-ink-500" />
          </div>
          <div className="text-[10px] mt-1 text-ink-900 truncate">{sub}</div>
          <div className="text-[9px] text-ink-500 mt-0.5">{stats}</div>
        </div>
      </div>
    </Link>
  );
}
