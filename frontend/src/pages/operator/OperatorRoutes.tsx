import { useState } from 'react';
import { ArrowRight, MapPin, Edit2, Check, X, Info, Shield, Tag } from 'lucide-react';
import { getCity } from '@/data/cities';
import { fmtBr } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────
// Routes & Fares — operator-side standing fares per route.
//
// Real-world fit: in Ethiopian intercity bus operations, fares are
// set at the route level and often constrained by federal/regional
// transport authorities. The dispatcher doesn't price each
// departure individually; they pick from a route's pre-published
// fare tiers. This screen is what the "Add Departure" form points
// to when it says "Fares are set on Routes & Fares, not per
// departure."
//
// Demo scope:
// - 8 routes Gadaa actually operates (western Oromia + corridor)
// - Each shows current fare, service tier, regulated flag, cap
// - Click "Edit" to inline-edit the fare; "Cap exceeded" warning
//   fires when the entered fare exceeds the regulated ceiling
// - Status pill: Live (published) / Draft (changes unsaved)
//
// What this screen deliberately does NOT do (yet, for the demo):
// - Multi-tier fare structures (Standard / Express / VIP each as
//   their own row per route)
// - Promotional discount campaigns
// - Bulk import / export
// These are all Gadaa-meeting conversation prompts.
// ─────────────────────────────────────────────────────────────────

const GADAA_COLOR = '#9A3412';

interface Route {
  from: string;
  to: string;
  km: number;
  tier: 'Standard' | 'Express' | 'VIP';
  fare: number;        // ETB per seat
  fareCap?: number;    // if regulated, the authority cap
  dailyDepartures: number;
  status: 'live' | 'draft';
  lastUpdated: string;
}

// Seed data matches what Add Departure thinks Gadaa operates.
const INITIAL_ROUTES: Route[] = [
  { from: 'AA', to: 'JM', km: 350, tier: 'Standard', fare: 750,  fareCap: 800,  dailyDepartures: 4, status: 'live',  lastUpdated: '2026-04-22' },
  { from: 'AA', to: 'JM', km: 350, tier: 'VIP',      fare: 1100,                dailyDepartures: 1, status: 'live',  lastUpdated: '2026-04-22' },
  { from: 'AA', to: 'NK', km: 331, tier: 'Standard', fare: 710,  fareCap: 750,  dailyDepartures: 3, status: 'live',  lastUpdated: '2026-04-22' },
  { from: 'AA', to: 'AB', km: 110, tier: 'Standard', fare: 290,                 dailyDepartures: 6, status: 'live',  lastUpdated: '2026-04-15' },
  { from: 'AA', to: 'BE', km: 480, tier: 'Standard', fare: 920,                 dailyDepartures: 2, status: 'live',  lastUpdated: '2026-04-22' },
  { from: 'AA', to: 'MT', km: 600, tier: 'Standard', fare: 1160,                dailyDepartures: 2, status: 'live',  lastUpdated: '2026-04-22' },
  { from: 'AA', to: 'AD', km: 100, tier: 'Standard', fare: 290,  fareCap: 300,  dailyDepartures: 8, status: 'draft', lastUpdated: '2026-05-08' },
  { from: 'AA', to: 'BS', km: 47,  tier: 'Standard', fare: 150,                 dailyDepartures: 10, status: 'live', lastUpdated: '2026-03-30' },
];

export function OperatorRoutes() {
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editFare, setEditFare] = useState<string>('');

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditFare(String(routes[idx].fare));
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setEditFare('');
  };

  const saveEdit = (idx: number) => {
    const newFare = Number(editFare);
    if (!Number.isFinite(newFare) || newFare <= 0) return;
    setRoutes(rs => rs.map((r, i) => i === idx
      ? { ...r, fare: newFare, status: 'draft' as const, lastUpdated: new Date().toISOString().slice(0, 10) }
      : r
    ));
    setEditingIdx(null);
  };

  const publish = (idx: number) => {
    setRoutes(rs => rs.map((r, i) => i === idx ? { ...r, status: 'live' as const } : r));
  };

  return (
    <div className="px-4 lg:px-6 py-4 lg:py-6 max-w-6xl">
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-black">Routes & Fares</h1>
        <p className="text-[11px] lg:text-xs text-ink-500 mt-0.5">
          Karaa fi Gatii · Standing fares per route. Used automatically when scheduling departures.
        </p>
      </div>

      {/* Regulatory primer — visible signal that we understand
          authority-set fares are part of this market. */}
      <div className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-[11px] bg-purple-50 border border-purple-200 mb-5">
        <Shield size={14} className="text-purple-700 flex-shrink-0 mt-0.5" />
        <div className="text-purple-900 leading-snug">
          <span className="font-bold">Regulated routes</span> show a fare cap set by the Federal Transport Authority. Fares above the cap can't be published; you'll be prompted to adjust or request a tariff revision.
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-ink-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-tiket-warm-cream text-[10px] font-bold uppercase tracking-wider text-ink-500">
              <th className="text-left px-4 py-2.5">Route</th>
              <th className="text-left px-3 py-2.5">Tier</th>
              <th className="text-right px-3 py-2.5">Fare (ETB)</th>
              <th className="text-right px-3 py-2.5">Cap</th>
              <th className="text-right px-3 py-2.5">Daily runs</th>
              <th className="text-left px-3 py-2.5">Status</th>
              <th className="text-right px-3 py-2.5">Updated</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r, idx) => (
              <RouteRowDesktop
                key={`${r.from}-${r.to}-${r.tier}`}
                route={r}
                editing={editingIdx === idx}
                editFare={editFare}
                setEditFare={setEditFare}
                onStartEdit={() => startEdit(idx)}
                onCancelEdit={cancelEdit}
                onSaveEdit={() => saveEdit(idx)}
                onPublish={() => publish(idx)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-2">
        {routes.map((r, idx) => (
          <RouteCardMobile
            key={`${r.from}-${r.to}-${r.tier}`}
            route={r}
            editing={editingIdx === idx}
            editFare={editFare}
            setEditFare={setEditFare}
            onStartEdit={() => startEdit(idx)}
            onCancelEdit={cancelEdit}
            onSaveEdit={() => saveEdit(idx)}
            onPublish={() => publish(idx)}
          />
        ))}
      </div>

      <div className="text-[10px] text-ink-500 mt-4 leading-snug">
        Demo prototype — fares persist within this session only. The real version would sync to the Federal Transport Authority's tariff registry and Tikēt's price index used by the buyer app.
      </div>
    </div>
  );
}

interface RowProps {
  route: Route;
  editing: boolean;
  editFare: string;
  setEditFare: (s: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onPublish: () => void;
}

function RouteRowDesktop({ route, editing, editFare, setEditFare, onStartEdit, onCancelEdit, onSaveEdit, onPublish }: RowProps) {
  const fromCity = getCity(route.from);
  const toCity = getCity(route.to);
  const overCap = route.fareCap !== undefined && Number(editFare) > route.fareCap;

  return (
    <tr className="border-t border-ink-100 hover:bg-tiket-warm-cream/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-[13px] font-bold">
          <MapPin size={11} className="text-ink-500" />
          {fromCity?.name} <ArrowRight size={10} className="text-ink-500" /> {toCity?.name}
        </div>
        <div className="text-[10px] text-ink-500 mt-0.5">~{route.km} km</div>
      </td>
      <td className="px-3 py-3">
        <TierBadge tier={route.tier} />
      </td>
      <td className="px-3 py-3 text-right">
        {editing ? (
          <div className="flex items-center justify-end gap-1">
            <input
              type="number"
              value={editFare}
              onChange={e => setEditFare(e.target.value)}
              className="w-24 text-right text-sm rounded-md px-2 py-1 bg-white border border-ink-100 tabular outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />
          </div>
        ) : (
          <span className="text-sm font-bold tabular">{fmtBr(route.fare)}</span>
        )}
        {editing && overCap && (
          <div className="text-[9px] text-red-700 font-bold mt-0.5">Above cap</div>
        )}
      </td>
      <td className="px-3 py-3 text-right">
        {route.fareCap ? (
          <span className="text-[11px] tabular text-purple-700">{fmtBr(route.fareCap)}</span>
        ) : (
          <span className="text-[11px] text-ink-500">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-right text-[11px] tabular">{route.dailyDepartures}</td>
      <td className="px-3 py-3">
        <StatusPill status={route.status} />
      </td>
      <td className="px-3 py-3 text-right text-[10px] text-ink-500 tabular">{route.lastUpdated}</td>
      <td className="px-3 py-3 text-right">
        {editing ? (
          <div className="inline-flex gap-1">
            <button onClick={onCancelEdit} className="p-1.5 rounded-md border border-ink-100 hover:bg-tiket-warm-cream text-ink-500">
              <X size={12} />
            </button>
            <button
              onClick={onSaveEdit}
              disabled={overCap}
              className="p-1.5 rounded-md text-white disabled:opacity-40"
              style={{ background: GADAA_COLOR }}
            >
              <Check size={12} />
            </button>
          </div>
        ) : (
          <div className="inline-flex gap-1">
            {route.status === 'draft' && (
              <button onClick={onPublish} className="text-[10px] font-bold rounded-md px-2 py-1 text-white" style={{ background: GADAA_COLOR }}>
                Publish
              </button>
            )}
            <button onClick={onStartEdit} className="p-1.5 rounded-md border border-ink-100 hover:bg-tiket-warm-cream text-ink-500">
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function RouteCardMobile({ route, editing, editFare, setEditFare, onStartEdit, onCancelEdit, onSaveEdit, onPublish }: RowProps) {
  const fromCity = getCity(route.from);
  const toCity = getCity(route.to);
  const overCap = route.fareCap !== undefined && Number(editFare) > route.fareCap;

  return (
    <div className="bg-white rounded-xl border border-ink-100 p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <MapPin size={11} className="text-ink-500" />
            {fromCity?.name} <ArrowRight size={10} className="text-ink-500" /> {toCity?.name}
          </div>
          <div className="text-[10px] text-ink-500 mt-0.5 flex items-center gap-2">
            <span>~{route.km} km</span>
            <span>·</span>
            <span>{route.dailyDepartures} runs/day</span>
          </div>
        </div>
        <StatusPill status={route.status} />
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <TierBadge tier={route.tier} />
          <div>
            <div className="text-[9px] uppercase tracking-wider text-ink-500">Fare</div>
            {editing ? (
              <input
                type="number"
                value={editFare}
                onChange={e => setEditFare(e.target.value)}
                className="w-20 text-sm rounded-md px-2 py-1 bg-white border border-ink-100 tabular outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
            ) : (
              <span className="text-sm font-bold tabular">{fmtBr(route.fare)}</span>
            )}
            {route.fareCap && !editing && (
              <span className="text-[9px] text-purple-700 ml-1">/ cap {fmtBr(route.fareCap)}</span>
            )}
            {editing && overCap && (
              <div className="text-[9px] text-red-700 font-bold">Above cap</div>
            )}
          </div>
        </div>

        {editing ? (
          <div className="inline-flex gap-1">
            <button onClick={onCancelEdit} className="p-2 rounded-md border border-ink-100 text-ink-500">
              <X size={12} />
            </button>
            <button
              onClick={onSaveEdit}
              disabled={overCap}
              className="p-2 rounded-md text-white disabled:opacity-40"
              style={{ background: GADAA_COLOR }}
            >
              <Check size={12} />
            </button>
          </div>
        ) : (
          <div className="inline-flex gap-1">
            {route.status === 'draft' && (
              <button onClick={onPublish} className="text-[10px] font-bold rounded-md px-2 py-1 text-white" style={{ background: GADAA_COLOR }}>
                Publish
              </button>
            )}
            <button onClick={onStartEdit} className="p-2 rounded-md border border-ink-100 text-ink-500">
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: Route['tier'] }) {
  const map = {
    Standard: { bg: '#E5E7EB', fg: '#374151' },
    Express:  { bg: '#FEF3C7', fg: '#92400E' },
    VIP:      { bg: '#DBEAFE', fg: '#1E40AF' },
  } as const;
  const s = map[tier];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: s.bg, color: s.fg }}>
      <Tag size={8} /> {tier}
    </span>
  );
}

function StatusPill({ status }: { status: Route['status'] }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
      <Info size={8} /> Draft
    </span>
  );
}
