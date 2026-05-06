import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Globe, Train as TrainIcon, ChevronRight } from 'lucide-react';
import type { Train } from '@/types';
import { searchTrains, computeRailFare } from '@/lib/api';
import { getStation, RAIL_CLASSES, RAIL_OPERATOR } from '@/data/rail';
import { fmtBr, fmtTime, fmtDuration, fmtDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrainCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTelegramBackButton } from '@/lib/telegram';

export function RailResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useTelegramBackButton(() => navigate('/rail'));
  const from = params.get('from') ?? 'AAL';
  const to = params.get('to') ?? 'NGD';
  const date = params.get('date') ?? new Date().toISOString().slice(0, 10);
  const pax = Number(params.get('pax') ?? 1);

  const [trains, setTrains] = useState<Train[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchTrains({ from, to, date }).then(setTrains).finally(() => setLoading(false));
  }, [from, to, date]);

  const fromSt = getStation(from);
  const toSt = getStation(to);
  const fromKm = fromSt?.km ?? 0;
  const toKm = toSt?.km ?? 752;
  const isInternational = fromSt?.country !== toSt?.country;

  return (
    <div className="bg-tiket-cream min-h-screen">
      <PageHeader
        title={`${fromSt?.name} → ${toSt?.name}`}
        subtitle={`${fmtDate(date)} · ${pax} ${pax === 1 ? 'passenger' : 'passengers'}`}
        onBack={() => navigate('/rail')}
      />

      {loading && (
        <div className="px-4 py-4 space-y-4" aria-busy="true" aria-label="Searching trains">
          <TrainCardSkeleton />
          <TrainCardSkeleton />
        </div>
      )}

      {!loading && (!trains || trains.length === 0) && (
        <EmptyState
          icon={<TrainIcon size={24} />}
          title="No trains on this date"
          message="EDR runs on Tuesdays and Saturdays only."
        />
      )}

      {!loading && trains && trains.length > 0 && (
        <div className="px-4 py-4 space-y-4">
          {trains.map(train => (
            <div key={train.id} className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
              <div className="px-3 py-2.5 flex items-center gap-2.5"
                style={{ background: `linear-gradient(135deg, ${RAIL_OPERATOR.color}, #0E1B45)` }}>
                <div className="w-9 h-9 rounded-md bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                  <TrainIcon size={16} />
                </div>
                <div className="flex-1 text-white">
                  <div className="text-[10px] tracking-wider uppercase opacity-80">{RAIL_OPERATOR.short} · {train.number}</div>
                  <div className="text-sm font-bold">{train.name}</div>
                </div>
                {isInternational && <Globe size={14} className="text-tiket-gold" />}
              </div>

              <div className="px-3 py-3 flex items-center gap-3">
                <div className="text-center">
                  <div className="text-base font-black text-ink-900 tabular leading-none">{fmtTime(train.depHHMM)}</div>
                  <div className="text-[9px] text-ink-500 mt-0.5">{from}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-[9px] text-ink-500">{fmtDuration(train.durationHr)}</div>
                  <div className="relative my-1 h-1">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-ink-100" />
                    <ArrowRight size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-500" />
                  </div>
                  <div className="text-[9px] text-ink-500">{Math.abs(toKm - fromKm)} km</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-black text-ink-900 tabular leading-none">{fmtTime(train.depHHMM + train.durationHr)}</div>
                  <div className="text-[9px] text-ink-500 mt-0.5">{to}</div>
                </div>
              </div>

              <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
                {RAIL_CLASSES.map(cls => {
                  const carriage = train.carriages.find(c => c.classId === cls.id);
                  const available = carriage ? carriage.seatStates.filter(s => s === 0).length : 0;
                  const fare = computeRailFare(cls.id, fromKm, toKm);
                  const soldOut = available === 0;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => !soldOut && navigate(`/rail/seats/${encodeURIComponent(train.id)}/${cls.id}?from=${from}&to=${to}&pax=${pax}`)}
                      disabled={soldOut}
                      className="rounded-lg p-2 text-left border-2 transition disabled:opacity-50"
                      style={{
                        borderColor: soldOut ? '#E5E7EB' : cls.color,
                        background: soldOut ? '#F9FAFB' : 'white',
                      }}
                    >
                      <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cls.color }}>{cls.name.split(' ')[0]}</div>
                      <div className="text-sm font-black mt-0.5 tabular text-ink-900">{fmtBr(fare)}</div>
                      <div className={`text-[9px] mt-0.5 ${available < 5 ? 'text-warn' : 'text-ok'}`}>
                        {soldOut ? 'Sold out' : `${available} left`}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-3 py-2 border-t border-ink-100 flex items-center justify-between text-[10px] text-ink-500">
                <span>Tap a class to choose seats</span>
                <ChevronRight size={11} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
