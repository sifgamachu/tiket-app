import { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, AlertCircle, Search, Clock, User, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { fmtTime } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────
// Scanner — driver/conductor boarding view.
//
// Real-world fit: at boarding, a Gadaa conductor walks down the aisle
// and verifies tickets. On most Ethiopian intercity lines today this
// is a manual cross-check against a paper manifest. Replacing that
// with a phone-based QR scan that works offline is one of the more
// impactful pieces of an operator partnership.
//
// Demo scope:
// - A camera viewfinder mock (not actually opening the camera —
//   that needs WebRTC permissions we don't want to prompt for in
//   a meeting demo)
// - "Simulate scan" button cycles through three pre-staged scan
//   results so the demo flow always works
// - Offline indicator: this is critical — Ethiopian intercity runs
//   often have no signal between cities, so the scanner has to
//   work without a network and reconcile later
// - Recent scans list shows the last ~5 boardings
//
// Real implementation note: scan_events table in the schema already
// has a `lamport_clock` column to support offline ordering for
// reconciliation. That's the spec; this screen demonstrates it.
// ─────────────────────────────────────────────────────────────────

const GADAA_COLOR = '#9A3412';

type ScanResult = {
  kind: 'success' | 'wrong-route' | 'already-used';
  ticketId: string;
  buyerName: string;
  seat: string;
  route: string;
  timestamp: string;
};

const FAKE_RESULTS: ScanResult[] = [
  { kind: 'success',      ticketId: 'TKT-04891', buyerName: 'Selamawit Tesfaye', seat: '12A', route: 'AA → JM', timestamp: '06:42' },
  { kind: 'wrong-route',  ticketId: 'TKT-05012', buyerName: 'Tigist Hailu',     seat: '08C', route: 'AA → NK', timestamp: '06:43' },
  { kind: 'already-used', ticketId: 'TKT-04778', buyerName: 'Yonas Mekuria',    seat: '03B', route: 'AA → JM', timestamp: '06:38' },
];

// Pre-populate with a few prior scans so the list isn't empty.
const INITIAL_SCANS: ScanResult[] = [
  { kind: 'success', ticketId: 'TKT-04612', buyerName: 'Mulugeta Alemu',  seat: '05A', route: 'AA → JM', timestamp: '05:58' },
  { kind: 'success', ticketId: 'TKT-04619', buyerName: 'Hanna Bekele',    seat: '07D', route: 'AA → JM', timestamp: '06:01' },
  { kind: 'success', ticketId: 'TKT-04634', buyerName: 'Eden Tadesse',    seat: '11B', route: 'AA → JM', timestamp: '06:14' },
  { kind: 'success', ticketId: 'TKT-04652', buyerName: 'Dawit Asfaw',     seat: '04C', route: 'AA → JM', timestamp: '06:23' },
];

export function OperatorScanner() {
  const [scans, setScans] = useState<ScanResult[]>(INITIAL_SCANS);
  const [latest, setLatest] = useState<ScanResult | null>(null);
  const [scanIdx, setScanIdx] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [offline, setOffline] = useState(false);

  // Briefly flash the "scanning" state for realism
  const onScan = () => {
    setScanning(true);
    setTimeout(() => {
      const result = FAKE_RESULTS[scanIdx % FAKE_RESULTS.length];
      const stamped = { ...result, timestamp: fmtTime(new Date().getHours() + new Date().getMinutes() / 60) };
      setLatest(stamped);
      if (result.kind === 'success') {
        setScans(s => [stamped, ...s].slice(0, 8));
      }
      setScanIdx(i => i + 1);
      setScanning(false);
    }, 700);
  };

  // Auto-clear the latest after 4s so the viewfinder returns to ready
  useEffect(() => {
    if (!latest) return;
    const t = setTimeout(() => setLatest(null), 4000);
    return () => clearTimeout(t);
  }, [latest]);

  return (
    <div className="px-4 lg:px-6 py-4 lg:py-6 max-w-5xl">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black">Scanner</h1>
          <p className="text-[11px] lg:text-xs text-ink-500 mt-0.5">
            Sakatta'a · Boarding verification for GAD-114 · AA → Jimma · 06:00
          </p>
        </div>
        <button
          onClick={() => setOffline(o => !o)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold border"
          style={{
            borderColor: offline ? '#FCA5A5' : '#86EFAC',
            background: offline ? '#FEF2F2' : '#F0FDF4',
            color: offline ? '#991B1B' : '#065F46',
          }}
        >
          {offline ? <WifiOff size={11} /> : <Wifi size={11} />}
          {offline ? 'Offline mode' : 'Online'}
        </button>
      </div>

      {offline && (
        <div className="rounded-xl px-3 py-2.5 flex items-start gap-2.5 text-[11px] bg-amber-50 border border-amber-200 mb-4">
          <AlertCircle size={13} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-amber-900 leading-snug">
            <span className="font-bold">No signal — that's fine.</span> Scans are queued on the device and reconciled when the bus reaches a tower. Each scan carries a lamport clock so duplicates and late arrivals are resolved correctly.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Viewfinder + scan action */}
        <div>
          <div className="relative aspect-square max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0E1411] to-[#1F1B1A] border border-ink-100">
            {/* Corner brackets */}
            <CornerBrackets />

            {/* Center icon when idle */}
            {!scanning && !latest && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                <QrCode size={64} strokeWidth={1} />
                <div className="text-[11px] mt-3 font-semibold">Point camera at ticket QR</div>
              </div>
            )}

            {/* Scanning animation */}
            {scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-44 h-44 border-2 border-amber-400 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-amber-400 shadow-[0_0_12px_2px_rgba(252,191,36,0.8)] animate-pulse" style={{ top: '50%' }} />
                </div>
                <div className="text-[11px] mt-3 font-semibold text-amber-300">Scanning…</div>
              </div>
            )}

            {/* Result overlay */}
            {latest && !scanning && <ResultOverlay result={latest} />}
          </div>

          <button
            onClick={onScan}
            disabled={scanning}
            className="w-full max-w-sm mx-auto lg:mx-0 mt-4 rounded-xl px-4 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: GADAA_COLOR }}
          >
            <QrCode size={16} />
            {scanning ? 'Scanning…' : 'Simulate scan'}
          </button>

          <div className="mt-3 text-[10px] text-ink-500 leading-snug max-w-sm mx-auto lg:mx-0">
            Demo: real version opens the device camera. Tap simulate to cycle through ticket scenarios.
          </div>
        </div>

        {/* Recent scans + manifest summary */}
        <div>
          <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-tiket-warm-cream flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Boarding manifest</div>
              <span className="text-[10px] text-ink-500 tabular">{scans.length} / 49</span>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${(scans.length / 49) * 100}%`, background: GADAA_COLOR }} />
                </div>
              </div>
              <span className="text-[11px] font-bold tabular">{Math.round((scans.length / 49) * 100)}%</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-tiket-warm-cream border-b border-ink-100 flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Recent scans</div>
              <Search size={11} className="text-ink-500" />
            </div>
            <div>
              {scans.length === 0 ? (
                <div className="px-4 py-6 text-center text-[11px] text-ink-500">No boardings yet.</div>
              ) : (
                scans.map(s => <ScanRow key={s.ticketId} scan={s} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerBrackets() {
  return (
    <>
      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-white/60 rounded-tl-md" />
      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-white/60 rounded-tr-md" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-white/60 rounded-bl-md" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-white/60 rounded-br-md" />
    </>
  );
}

function ResultOverlay({ result }: { result: ScanResult }) {
  if (result.kind === 'success') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-600/95 text-white p-4">
        <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mb-3">
          <CheckCircle2 size={32} strokeWidth={2.5} />
        </div>
        <div className="text-base font-black">Boarded</div>
        <div className="text-[12px] mt-1 font-bold">{result.buyerName}</div>
        <div className="text-[11px] mt-0.5 opacity-90">Seat {result.seat} · {result.route}</div>
        <div className="text-[10px] mt-2 opacity-75 tabular">{result.ticketId}</div>
      </div>
    );
  }
  if (result.kind === 'wrong-route') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-600/95 text-white p-4">
        <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mb-3">
          <AlertCircle size={32} strokeWidth={2.5} />
        </div>
        <div className="text-base font-black">Wrong route</div>
        <div className="text-[12px] mt-1 font-bold">{result.buyerName}</div>
        <div className="text-[11px] mt-0.5 opacity-90">Ticket is for {result.route}, not AA → JM</div>
        <div className="text-[10px] mt-2 opacity-75 tabular">{result.ticketId}</div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/95 text-white p-4">
      <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mb-3">
        <AlertCircle size={32} strokeWidth={2.5} />
      </div>
      <div className="text-base font-black">Already used</div>
      <div className="text-[12px] mt-1 font-bold">{result.buyerName}</div>
      <div className="text-[11px] mt-0.5 opacity-90">Scanned earlier at {result.timestamp}</div>
      <div className="text-[10px] mt-2 opacity-75 tabular">{result.ticketId}</div>
    </div>
  );
}

function ScanRow({ scan }: { scan: ScanResult }) {
  return (
    <div className="px-4 py-2.5 border-b border-ink-100 last:border-b-0 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold truncate flex items-center gap-1">
          <User size={10} className="text-ink-500" />
          {scan.buyerName}
        </div>
        <div className="text-[10px] text-ink-500 flex items-center gap-2 tabular">
          <span>Seat {scan.seat}</span>
          <span>·</span>
          <span>{scan.ticketId}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-ink-500 flex items-center gap-1 tabular">
          <Clock size={9} />
          {scan.timestamp}
        </div>
        <div className="text-[9px] text-ink-500 flex items-center gap-0.5 mt-0.5 justify-end">
          <Smartphone size={8} /> Telegram
        </div>
      </div>
    </div>
  );
}
