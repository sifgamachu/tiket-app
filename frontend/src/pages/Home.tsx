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

      {/* Hero — Ethiopian highlands at dawn. Layered atmospheric scene
          with a soft glowing sun, scattered stars, layered ridges, and
          a winding gold path with a small bus heading toward the
          horizon. Designed for both mobile (deep portrait) and wide
          desktop (the upper sky crops gracefully, leaving sun + ridges
          + road as the focal composition). */}
      <div className="relative overflow-hidden h-48 sm:h-56 md:h-60" style={{
        background: 'linear-gradient(180deg, #1E1B4B 0%, #4C1D24 26%, #9A3412 46%, #D97706 60%, #1A6B3A 82%, #0E1411 100%)',
      }}>
        {/* Stars in the upper sky — only visible where the gradient
            is dark enough; tiny so they read as stars, not glitches. */}
        <div className="absolute top-[10%] left-[8%]  w-[2px] h-[2px] rounded-full bg-white/70" />
        <div className="absolute top-[6%]  left-[26%] w-[3px] h-[3px] rounded-full bg-white/85" />
        <div className="absolute top-[22%] left-[16%] w-[2px] h-[2px] rounded-full bg-white/50" />
        <div className="absolute top-[12%] left-[42%] w-[3px] h-[3px] rounded-full bg-white/75" />
        <div className="absolute top-[8%]  left-[58%] w-[2px] h-[2px] rounded-full bg-white/55" />
        <div className="absolute top-[18%] left-[70%] w-[2px] h-[2px] rounded-full bg-white/65" />
        <div className="absolute top-[5%]  left-[82%] w-[3px] h-[3px] rounded-full bg-white/75" />
        <div className="absolute top-[24%] left-[88%] w-[2px] h-[2px] rounded-full bg-white/45" />

        {/* Sun — CSS radial gradient so it stays perfectly circular at
            every viewport size. Sized as a fraction of the viewport so
            it scales gracefully on mobile vs desktop. */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 'clamp(120px, 32%, 220px)',
            height: 'clamp(120px, 32%, 220px)',
            top: '18%',
            right: '14%',
            background: 'radial-gradient(circle, #FEF3C7 0%, #FEF3C7 16%, rgba(252,211,77,0.55) 34%, rgba(245,158,11,0.18) 58%, rgba(245,158,11,0) 78%)',
          }}
        />

        {/* Layered mountain silhouettes. preserveAspectRatio="none"
            lets the Bezier ridges stretch smoothly across any width
            without looking distorted — the curves still read as
            highlands. */}
        <svg viewBox="0 0 800 320" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="haze" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#FBBF24" stopOpacity="0"    />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {/* Farthest ridge — palest, blends into the sun's haze */}
          <path
            d="M0 195 Q 90 170 180 188 Q 280 208 370 182 Q 460 160 550 190 Q 650 215 720 188 Q 770 180 800 188 L 800 320 L 0 320 Z"
            fill="#FCD34D"
            opacity="0.20"
          />

          {/* Atmospheric haze rising from the horizon — warms the
              valley between the ridges so the eye reads depth. */}
          <rect x="0" y="170" width="800" height="80" fill="url(#haze)" />

          {/* Middle ridge — warmer, more saturated */}
          <path
            d="M0 235 Q 70 210 150 222 Q 240 240 330 212 Q 420 188 510 218 Q 600 245 680 224 Q 740 212 800 226 L 800 320 L 0 320 Z"
            fill="#7C2D12"
            opacity="0.55"
          />

          {/* Near ridge — darker, more silhouette-like */}
          <path
            d="M0 270 Q 80 250 170 262 Q 270 278 360 258 Q 460 240 560 264 Q 660 285 800 258 L 800 320 L 0 320 Z"
            fill="#1F1B1A"
            opacity="0.88"
          />

          {/* Foreground hills — near-black, anchors the composition */}
          <path
            d="M0 300 Q 100 288 200 296 Q 300 304 400 290 Q 500 280 600 294 Q 700 304 800 290 L 800 320 L 0 320 Z"
            fill="#0B1410"
          />

          {/* Winding gold road — soft glow underlay + dashed line on
              top, curving from the lower-left up toward the horizon.
              Reads as the journey across the highlands. */}
          <path
            d="M -20 312 Q 180 296 360 294 Q 460 293 530 280 Q 590 270 620 252 Q 640 240 655 222"
            stroke="#D4A33B"
            strokeWidth="4"
            fill="none"
            opacity="0.20"
          />
          <path
            d="M -20 312 Q 180 296 360 294 Q 460 293 530 280 Q 590 270 620 252 Q 640 240 655 222"
            stroke="#FCD34D"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="6 5"
            opacity="0.85"
          />

          {/* Tiny bus on the road — far enough away to be a silhouette
              with windows and tiny headlights, reads as a journey
              vignette without dominating. */}
          <g transform="translate(345 285) scale(1.3)" opacity="0.95">
            <rect x="0"   y="0"   width="14"  height="6"   rx="1.3" fill="#FEF9E7" />
            <rect x="0.8" y="1.4" width="2.2" height="1.6" fill="#0B1410" />
            <rect x="3.8" y="1.4" width="2.2" height="1.6" fill="#0B1410" />
            <rect x="6.8" y="1.4" width="2.2" height="1.6" fill="#0B1410" />
            <rect x="9.8" y="1.4" width="2.2" height="1.6" fill="#0B1410" />
            <circle cx="3"    cy="6.6" r="1" fill="#0B1410" />
            <circle cx="10.5" cy="6.6" r="1" fill="#0B1410" />
            <circle cx="14.3" cy="2"   r="0.55" fill="#FBBF24" />
            <circle cx="14.3" cy="3.7" r="0.55" fill="#FBBF24" />
          </g>
        </svg>

        {/* Top-right: language picker + Telegram indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {inTelegram && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Telegram
            </div>
          )}
          <LanguagePicker variant="ghost" />
        </div>

        {/* Headline content. Drop-shadow keeps "Selam, Gammachu" legible
            against the busier background without needing a dark overlay. */}
        <div className="absolute inset-x-4 bottom-4 text-white z-10" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.6)' }}>
          <div className="text-[10px] tracking-[0.22em] uppercase font-semibold text-tiket-gold">Tikēt · ቲኬት</div>
          <div className="text-2xl sm:text-3xl font-black mt-1 leading-tight">
            {state.user
              ? t('hero_greeting_named', { name: state.user.name.split(' ')[0] })
              : t('hero_greeting_visitor')}
          </div>
          <div className="text-xs sm:text-sm opacity-90 mt-1">{t('hero_subtitle')}</div>
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
