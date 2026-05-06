import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Bus } from '@/types';
import { getBus, seatLabelForBus } from '@/lib/api';
import { getBusOperator } from '@/data/operators';
import { fmtBr } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loading } from '@/components/ui/Loading';
import { useTelegramBackButton } from '@/lib/telegram';

export function BusSeats() {
  const { busId } = useParams<{ busId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useTelegramBackButton(() => navigate(-1));
  const pax = Number(params.get('pax') ?? 1);

  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!busId) return;
    setLoading(true);
    getBus(decodeURIComponent(busId))
      .then(setBus)
      .finally(() => setLoading(false));
  }, [busId]);

  const toggleSeat = (idx: number) => {
    setSelectedSeats(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx);
      if (prev.length >= pax) return prev;
      return [...prev, idx];
    });
  };

  if (loading) return (<><PageHeader title="Loading..." /><Loading /></>);
  if (!bus) return (<><PageHeader title="Bus not found" /></>);

  const op = getBusOperator(bus.operatorId)!;
  const subtotal = bus.basePrice * selectedSeats.length;

  // 49-seat layout: 11 rows of 4 (2+2) plus a back row of 5
  // Indices 0-43 are the front rows, 44-48 are the back row.
  const rows: number[][] = [];
  for (let r = 0; r < 11; r++) {
    const startIdx = r * 4;
    rows.push([startIdx, startIdx + 1, startIdx + 2, startIdx + 3]);
  }
  const backRow = [44, 45, 46, 47, 48];

  return (
    <div className="bg-tiket-cream min-h-screen pb-24">
      <PageHeader
        title={`${op.name} · ${bus.busNumber}`}
        subtitle={`Choose ${pax === 1 ? 'a seat' : `${pax} seats`} (${selectedSeats.length}/${pax})`}
      />

      <div className="px-4 py-4">
        <div className="rounded-2xl py-3 px-3 bg-tiket-warm-cream border border-dashed border-ink-500/40">
          <div className="flex items-center justify-between mb-3 px-1 pb-2 border-b border-dashed border-ink-500/40">
            <div className="text-[9px] font-bold uppercase tracking-wider text-ink-500">↑ Front · Driver</div>
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: op.color }}>
              49 seats · 2+2
            </div>
          </div>

          {rows.map((rowSeats, ri) => (
            <div key={ri} className="flex items-center justify-center gap-1 mb-1">
              <div className="text-[9px] font-bold w-4 flex-shrink-0 text-right text-ink-500">{ri + 1}</div>
              <SeatButton idx={rowSeats[0]} bus={bus} selected={selectedSeats.includes(rowSeats[0])} onClick={() => toggleSeat(rowSeats[0])} disabled={!selectedSeats.includes(rowSeats[0]) && selectedSeats.length >= pax} />
              <SeatButton idx={rowSeats[1]} bus={bus} selected={selectedSeats.includes(rowSeats[1])} onClick={() => toggleSeat(rowSeats[1])} disabled={!selectedSeats.includes(rowSeats[1]) && selectedSeats.length >= pax} />
              <div className="w-4 text-center text-[8px] text-ink-500/40 select-none">·</div>
              <SeatButton idx={rowSeats[2]} bus={bus} selected={selectedSeats.includes(rowSeats[2])} onClick={() => toggleSeat(rowSeats[2])} disabled={!selectedSeats.includes(rowSeats[2]) && selectedSeats.length >= pax} />
              <SeatButton idx={rowSeats[3]} bus={bus} selected={selectedSeats.includes(rowSeats[3])} onClick={() => toggleSeat(rowSeats[3])} disabled={!selectedSeats.includes(rowSeats[3]) && selectedSeats.length >= pax} />
            </div>
          ))}

          {/* Back row of 5 — full bench, no aisle */}
          <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-dashed border-ink-500/40">
            <div className="text-[9px] font-bold w-4 flex-shrink-0 text-right text-ink-500">12</div>
            {backRow.map(seatIdx => (
              <SeatButton
                key={seatIdx}
                idx={seatIdx}
                bus={bus}
                selected={selectedSeats.includes(seatIdx)}
                onClick={() => toggleSeat(seatIdx)}
                disabled={!selectedSeats.includes(seatIdx) && selectedSeats.length >= pax}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-2.5 flex-wrap text-[9px] text-ink-500">
          <Legend color="white" border="#6B7280" label="Available" />
          <Legend color="#1A6B3A" border="#1A6B3A" label="Selected" />
          <Legend color="#F59E0B" border="#F59E0B" label="Held" />
          <Legend color="#94A3B8" border="#94A3B8" label="Sold" />
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-100 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-500">
                Seats: {selectedSeats.map(seatLabelForBus).join(', ')}
              </div>
              <div className="text-base font-black text-ink-900 tabular">{fmtBr(subtotal)}</div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/bus/checkout/${busId}?seats=${selectedSeats.join(',')}`)}
            disabled={selectedSeats.length < pax}
            className="w-full rounded-xl bg-tiket-green text-white py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function SeatButton({ idx, bus, selected, onClick, disabled }: { idx: number; bus: Bus; selected: boolean; onClick: () => void; disabled: boolean }) {
  const state = bus.seatStates[idx];
  const isSold = state === 1;
  const isHeld = state === 2;
  const finalDisabled = isSold || isHeld || disabled;

  let bg = 'white', fg = '#0E1411', border = '#6B7280';
  if (selected) { bg = '#1A6B3A'; fg = 'white'; border = '#1A6B3A'; }
  else if (isSold) { bg = '#94A3B8'; fg = 'white'; border = '#94A3B8'; }
  else if (isHeld) { bg = '#F59E0B'; fg = '#0E1411'; border = '#F59E0B'; }

  return (
    <button
      onClick={onClick}
      disabled={finalDisabled}
      className="rounded-md text-[9px] font-bold flex-shrink-0 transition"
      style={{
        width: 32, height: 32,
        background: bg, color: fg, border: `1.5px solid ${border}`,
        cursor: finalDisabled ? 'not-allowed' : 'pointer',
        opacity: finalDisabled && !selected ? 0.7 : 1,
      }}
    >
      {seatLabelForBus(idx)}
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
