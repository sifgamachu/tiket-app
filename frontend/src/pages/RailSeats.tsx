import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, BedDouble, Briefcase, Armchair } from 'lucide-react';
import type { Train, RailClass } from '@/types';
import { getTrain, computeRailFare } from '@/lib/api';
import { getStation, getRailClass, railSeatLabel } from '@/data/rail';
import { fmtBr } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loading } from '@/components/ui/Loading';
import { useTelegramBackButton } from '@/lib/telegram';

export function RailSeats() {
  const { trainId, classId } = useParams<{ trainId: string; classId: RailClass['id'] }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useTelegramBackButton(() => navigate(-1));
  const from = params.get('from') ?? 'AAL';
  const to = params.get('to') ?? 'NGD';
  const pax = Number(params.get('pax') ?? 1);

  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!trainId) return;
    setLoading(true);
    getTrain(decodeURIComponent(trainId)).then(setTrain).finally(() => setLoading(false));
  }, [trainId]);

  if (loading) return (<><PageHeader title="Loading..." /><Loading /></>);
  if (!train || !classId) return (<><PageHeader title="Train not found" /></>);

  const cls = getRailClass(classId)!;
  const carriage = train.carriages.find(c => c.classId === classId);
  if (!carriage) return (<><PageHeader title="Class not available" /></>);

  const fromKm = getStation(from)?.km ?? 0;
  const toKm = getStation(to)?.km ?? 752;
  const farePerSeat = computeRailFare(classId, fromKm, toKm);
  const subtotal = farePerSeat * selectedSeats.length;

  const toggleSeat = (idx: number) => {
    setSelectedSeats(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      if (prev.length >= pax) return prev;
      return [...prev, idx];
    });
  };

  const ClassIcon = cls.id === 'sleeper' ? BedDouble : cls.id === 'business' ? Briefcase : Armchair;

  return (
    <div className="bg-tiket-cream min-h-screen pb-32">
      <PageHeader title={`${cls.name}`} subtitle={`Choose ${pax === 1 ? 'a seat' : `${pax} seats`} (${selectedSeats.length}/${pax})`} />

      <div className="px-4 py-3">
        <div className="rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2.5 text-white" style={{ background: cls.color }}>
          <ClassIcon size={18} />
          <div className="flex-1">
            <div className="text-xs font-bold">{cls.name}</div>
            <div className="text-[10px] opacity-90">{cls.desc}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black tabular">{fmtBr(farePerSeat)}</div>
            <div className="text-[9px] opacity-90">per seat</div>
          </div>
        </div>

        {cls.id === 'sleeper' ? (
          <SleeperLayout carriage={carriage} selectedSeats={selectedSeats} onToggle={toggleSeat} pax={pax} cls={cls} />
        ) : (
          <CoachLayout carriage={carriage} selectedSeats={selectedSeats} onToggle={toggleSeat} pax={pax} cls={cls} />
        )}

        <div className="mt-3 flex items-center gap-2.5 flex-wrap text-[9px] text-ink-500">
          <Legend color="white" border="#6B7280" label="Available" />
          <Legend color={cls.color} border={cls.color} label="Selected" />
          <Legend color="#F59E0B" border="#F59E0B" label="Held" />
          <Legend color="#94A3B8" border="#94A3B8" label="Sold" />
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-100 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-500">
                Seats: {selectedSeats.map(i => railSeatLabel(i, classId)).join(', ')}
              </div>
              <div className="text-base font-black text-ink-900 tabular">{fmtBr(subtotal)}</div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/rail/checkout/${trainId}/${classId}?from=${from}&to=${to}&seats=${selectedSeats.join(',')}`)}
            disabled={selectedSeats.length < pax}
            className="w-full rounded-xl text-white py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: cls.color }}
          >
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function CoachLayout({ carriage, selectedSeats, onToggle, pax, cls }: {
  carriage: { seatStates: number[] }; selectedSeats: number[]; onToggle: (i: number) => void; pax: number; cls: RailClass;
}) {
  // rows × 4 (2+2)
  const rows: number[][] = [];
  for (let r = 0; r < cls.rows; r++) {
    const start = r * cls.cols;
    rows.push(Array.from({ length: cls.cols }, (_, c) => start + c));
  }

  return (
    <div className="rounded-2xl py-3 px-3 bg-tiket-warm-cream border border-dashed border-ink-500/40">
      <div className="flex items-center justify-between mb-2 px-1 pb-2 border-b border-dashed border-ink-500/40">
        <div className="text-[9px] font-bold uppercase tracking-wider text-ink-500">↑ Front of carriage</div>
        <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cls.color }}>
          {cls.totalSeats} seats · 2+2
        </div>
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex items-center justify-center gap-1 mb-1">
          <div className="text-[9px] font-bold w-4 flex-shrink-0 text-right text-ink-500">{ri + 1}</div>
          <SeatBtn idx={row[0]} cls={cls} carriage={carriage} selectedSeats={selectedSeats} onToggle={onToggle} pax={pax} />
          <SeatBtn idx={row[1]} cls={cls} carriage={carriage} selectedSeats={selectedSeats} onToggle={onToggle} pax={pax} />
          <div className="w-3 text-center text-[8px] text-ink-500/60">|</div>
          <SeatBtn idx={row[2]} cls={cls} carriage={carriage} selectedSeats={selectedSeats} onToggle={onToggle} pax={pax} />
          <SeatBtn idx={row[3]} cls={cls} carriage={carriage} selectedSeats={selectedSeats} onToggle={onToggle} pax={pax} />
        </div>
      ))}
    </div>
  );
}

function SleeperLayout({ carriage, selectedSeats, onToggle, pax, cls }: {
  carriage: { seatStates: number[] }; selectedSeats: number[]; onToggle: (i: number) => void; pax: number; cls: RailClass;
}) {
  // 8 cabins × 4 berths
  const cabins = Array.from({ length: 8 }, (_, c) => Array.from({ length: 4 }, (_, b) => c * 4 + b));

  return (
    <div className="space-y-2">
      {cabins.map((cabin, ci) => (
        <div key={ci} className="rounded-xl p-2.5 bg-white border border-ink-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-ink-900">Cabin {ci + 1}</span>
            <span className="text-[9px] text-ink-500">4 berths · private door</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { idx: cabin[0], lbl: 'Lower-L', upper: false },
              { idx: cabin[1], lbl: 'Lower-R', upper: false },
              { idx: cabin[2], lbl: 'Upper-L', upper: true },
              { idx: cabin[3], lbl: 'Upper-R', upper: true },
            ].map(({ idx, lbl, upper }) => {
              const state = carriage.seatStates[idx];
              const isSold = state === 1;
              const isHeld = state === 2;
              const selected = selectedSeats.includes(idx);
              const disabled = isSold || isHeld || (!selected && selectedSeats.length >= pax);
              let bg = 'white', fg = '#0E1411', border = '#E5E7EB';
              if (selected) { bg = cls.color; fg = 'white'; border = cls.color; }
              else if (isSold) { bg = '#94A3B8'; fg = 'white'; border = '#94A3B8'; }
              else if (isHeld) { bg = '#F59E0B'; fg = '#0E1411'; border = '#F59E0B'; }
              return (
                <button
                  key={idx}
                  onClick={() => onToggle(idx)}
                  disabled={disabled}
                  className="rounded-md py-1.5 px-2 text-left transition"
                  style={{ background: bg, color: fg, border: `1.5px solid ${border}`, opacity: disabled && !selected ? 0.7 : 1 }}
                >
                  <div className="text-[8px] uppercase tracking-wider opacity-80">{lbl}</div>
                  <div className="text-[10px] font-bold tabular flex items-center gap-1">
                    {railSeatLabel(idx, cls.id)}
                    {upper && <BedDouble size={9} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SeatBtn({ idx, cls, carriage, selectedSeats, onToggle, pax }: {
  idx: number; cls: RailClass; carriage: { seatStates: number[] }; selectedSeats: number[]; onToggle: (i: number) => void; pax: number;
}) {
  const state = carriage.seatStates[idx];
  const isSold = state === 1;
  const isHeld = state === 2;
  const selected = selectedSeats.includes(idx);
  const disabled = isSold || isHeld || (!selected && selectedSeats.length >= pax);

  let bg = 'white', fg = '#0E1411', border = '#6B7280';
  if (selected) { bg = cls.color; fg = 'white'; border = cls.color; }
  else if (isSold) { bg = '#94A3B8'; fg = 'white'; border = '#94A3B8'; }
  else if (isHeld) { bg = '#F59E0B'; fg = '#0E1411'; border = '#F59E0B'; }

  return (
    <button
      onClick={() => onToggle(idx)}
      disabled={disabled}
      className="rounded-md text-[9px] font-bold flex-shrink-0 transition tabular"
      style={{ width: 32, height: 32, background: bg, color: fg, border: `1.5px solid ${border}`, opacity: disabled && !selected ? 0.7 : 1 }}
    >
      {railSeatLabel(idx, cls.id)}
    </button>
  );
}

function Legend({ color, border, label }: { color: string; border: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-3 h-3 rounded" style={{ background: color, border: `1.5px solid ${border}` }} />
      <span>{label}</span>
    </div>
  );
}
