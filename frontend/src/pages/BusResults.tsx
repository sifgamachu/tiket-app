import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Wifi, Snowflake, Coffee, Droplet, Zap } from 'lucide-react';
import type { Bus } from '@/types';
import { searchBuses } from '@/lib/api';
import { getCity } from '@/data/cities';
import { getBusOperator } from '@/data/operators';
import { fmtBr, fmtTime, fmtDuration } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { BusCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTelegramBackButton } from '@/lib/telegram';

export function BusResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const from = params.get('from') ?? 'AA';
  const to = params.get('to') ?? 'BD';
  const date = params.get('date') ?? new Date().toISOString().slice(0, 10);
  const pax = Number(params.get('pax') ?? 1);

  const [results, setResults] = useState<Bus[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchBuses({ from, to, date })
      .then(setResults)
      .finally(() => setLoading(false));
  }, [from, to, date]);

  const fromCity = getCity(from);
  const toCity = getCity(to);

  return (
    <div className="bg-tiket-cream min-h-screen">
      <PageHeader
        title={`${fromCity?.name} → ${toCity?.name}`}
        subtitle={`${date} · ${pax} ${pax === 1 ? 'passenger' : 'passengers'}`}
        onBack={() => navigate('/bus')}
      />

      {loading && (
        <div className="px-4 py-4 space-y-3" aria-busy="true" aria-label="Searching buses">
          <BusCardSkeleton />
          <BusCardSkeleton />
          <BusCardSkeleton />
        </div>
      )}

      {!loading && results && results.length === 0 && (
        <EmptyState
          icon={<span className="text-2xl">🚌</span>}
          title="No buses found"
          message="Try a different date or route."
        />
      )}

      {!loading && results && results.length > 0 && (
        <div className="px-4 py-4 space-y-2.5">
          {results.map(bus => (
            <BusCard key={bus.id} bus={bus} pax={pax} />
          ))}
        </div>
      )}
    </div>
  );
}

function BusCard({ bus, pax }: { bus: Bus; pax: number }) {
  const op = getBusOperator(bus.operatorId)!;
  const sold = bus.seatStates.filter(s => s === 1).length;
  const available = bus.totalSeats - sold;
  const arrival = bus.depHHMM + bus.durationHr;

  return (
    <Link
      to={`/bus/seats/${encodeURIComponent(bus.id)}?pax=${pax}`}
      className="block bg-white rounded-2xl p-3 border border-ink-100 shadow-sm relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${op.color}, ${op.accent})` }}
      />

      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="rounded-md flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
          style={{ width: 36, height: 36, background: op.color }}
        >
          {op.id.slice(0, 3).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-ink-900 truncate">{op.name}</span>
            <span className="text-[9px] text-ink-500 flex items-center gap-0.5">
              <Star size={8} fill="#D4A33B" stroke="none" /> {op.rating.toFixed(1)}
            </span>
          </div>
          <div className="text-[10px] text-ink-500 truncate">
            {bus.busNumber} · {op.tier === 'premium' ? 'Premium' : 'Standard'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-ink-900 tabular">{fmtBr(bus.basePrice)}</div>
          <div className="text-[9px] text-ink-500">per seat · indicative</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="text-center">
          <div className="text-base font-black text-ink-900 tabular leading-none">{fmtTime(bus.depHHMM)}</div>
          <div className="text-[9px] text-ink-500 mt-0.5">{bus.from}</div>
        </div>
        <div className="flex-1 px-2">
          <div className="text-[9px] text-center text-ink-500">{fmtDuration(bus.durationHr)}</div>
          <div className="relative h-2 my-1">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-ink-100" />
            <ArrowRight size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-500" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-base font-black text-ink-900 tabular leading-none">{fmtTime(arrival)}</div>
          <div className="text-[9px] text-ink-500 mt-0.5">{bus.to}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-ink-100">
        <div className="flex items-center gap-1 text-ink-500">
          {bus.amenities.includes('wifi') && <Wifi size={11} />}
          {bus.amenities.includes('ac') && <Snowflake size={11} />}
          {bus.amenities.includes('snack') && <Coffee size={11} />}
          {bus.amenities.includes('water') && <Droplet size={11} />}
          {bus.amenities.includes('usb') && <Zap size={11} />}
        </div>
        <div className={`text-[10px] font-bold ${available < 8 ? 'text-warn' : 'text-ok'}`}>
          {available <= 0 ? 'Sold out' : `${available} seats left`}
        </div>
      </div>
    </Link>
  );
}
