import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CITIES, getCity } from '@/data/cities';
import { addDeparture } from '@/data/operatorMock';
import { fmtBr } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────
// Add Departure form. Single screen, no multi-step wizard.
// Dispatchers don't have time for wizards.
//
// Fields, in priority order:
// 1. Route (from / to)
// 2. Date + departure time
// 3. Bus number + driver
// 4. Price per seat
//
// Submit creates a new departure and routes back to dashboard.
// In a real build, submit would POST /api/operator/departures.
// ─────────────────────────────────────────────────────────────────

const GADAA_COLOR = '#9A3412';

const today = () => new Date().toISOString().slice(0, 10);

export function OperatorAddDeparture() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pre-fill with sensible Gadaa defaults
  const [from, setFrom] = useState('AA');
  const [to, setTo] = useState('JM');
  const [date, setDate] = useState(today());
  const [depTime, setDepTime] = useState('06:00');
  const [busNumber, setBusNumber] = useState('GAD-');
  const [pricePerSeat, setPricePerSeat] = useState('900');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+251 9');

  const fromCity = getCity(from);
  const toCity = getCity(to);

  // Estimate journey based on rough km figures (placeholder for real distance lookup)
  const ROUTE_KM: Record<string, number> = {
    'AA-JM': 350, 'AA-NK': 331, 'AA-AB': 110, 'AA-BE': 480,
    'AA-MT': 600, 'AA-AD': 100, 'AA-BS': 47,  'AA-BD': 565,
    'AA-HW': 275, 'AA-MK': 783, 'AA-GD': 727, 'AA-DD': 515,
    'AA-DS': 401, 'AA-AM': 510, 'AA-HR': 526, 'AA-DB': 130,
  };
  const km = ROUTE_KM[`${from}-${to}`] ?? ROUTE_KM[`${to}-${from}`] ?? 350;
  const durationHr = +(km / 60).toFixed(1);
  const arrivalTime = (() => {
    const [h, m] = depTime.split(':').map(Number);
    const totalMin = h * 60 + m + Math.round(durationHr * 60);
    const ah = Math.floor(totalMin / 60) % 24;
    const am = totalMin % 60;
    return `${String(ah).padStart(2, '0')}:${String(am).padStart(2, '0')}`;
  })();

  const canSubmit = from !== to && busNumber.length >= 5 && driverName.length > 1 && driverPhone.length >= 8 && Number(pricePerSeat) > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const [h, m] = depTime.split(':').map(Number);
    addDeparture({
      busNumber,
      from,
      to,
      date,
      depHHMM: h + m / 60,
      durationHr,
      totalSeats: 49,
      pricePerSeat: Number(pricePerSeat),
      driverName,
      driverPhone,
    });

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate('/operator/dashboard'), 1100);
    }, 600);
  };

  if (success) {
    return (
      <div className="px-4 lg:px-6 py-12 max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-lg font-black">Departure created</h1>
        <p className="text-[12px] text-ink-500 mt-1">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-4 lg:py-6 max-w-2xl">
      <button
        onClick={() => navigate('/operator/dashboard')}
        className="text-[11px] font-semibold text-ink-500 hover:text-ink-900 inline-flex items-center gap-1 mb-3"
      >
        <ArrowLeft size={12} /> Back to dashboard
      </button>

      <h1 className="text-xl lg:text-2xl font-black mb-1">Add departure</h1>
      <p className="text-[11px] text-ink-500 mb-5">Idileessuu · New scheduled bus</p>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Route */}
        <Section title="Route" sub="Karaa">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField icon={<MapPin size={14} />} label="From" value={from} onChange={setFrom}
              options={CITIES.map(c => ({ value: c.id, label: `${c.name} (${c.id})` }))} />
            <SelectField icon={<MapPin size={14} />} label="To" value={to} onChange={setTo}
              options={CITIES.filter(c => c.id !== from).map(c => ({ value: c.id, label: `${c.name} (${c.id})` }))} />
          </div>
          {fromCity && toCity && from !== to && (
            <div className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2 text-[11px] bg-blue-50 border border-blue-100">
              <span className="text-blue-900">
                {fromCity.name} → {toCity.name} · ~{km} km · estimated {durationHr}h journey
              </span>
            </div>
          )}
          {from === to && (
            <div className="mt-2 px-3 py-2 rounded-lg text-[11px] bg-amber-50 border border-amber-200 text-amber-900">
              Pick two different cities.
            </div>
          )}
        </Section>

        {/* Schedule */}
        <Section title="Schedule" sub="Yeroo">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DateField icon={<Calendar size={14} />} label="Date" value={date} onChange={setDate} />
            <TimeField icon={<Clock size={14} />} label="Departure time" value={depTime} onChange={setDepTime} />
          </div>
          {from !== to && (
            <div className="mt-2 text-[11px] text-ink-500">
              Estimated arrival: <span className="font-bold tabular">{arrivalTime}</span>
              {' · '}
              {durationHr}h
            </div>
          )}
        </Section>

        {/* Bus + driver */}
        <Section title="Bus & Driver" sub="Konkolaataa fi Konkolaachisaa">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField icon={<span className="text-[10px] font-black">#</span>} label="Bus number" value={busNumber} onChange={setBusNumber} placeholder="GAD-107" />
            <TextField icon={<User size={14} />} label="Driver name" value={driverName} onChange={setDriverName} placeholder="e.g. Tolosa Bekele" />
          </div>
          <div className="mt-3">
            <TextField icon={<Phone size={14} />} label="Driver phone" value={driverPhone} onChange={setDriverPhone} placeholder="+251 911 234 567" />
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing" sub="Gatii">
          <NumberField icon={<DollarSign size={14} />} label="Price per seat (ETB)" value={pricePerSeat} onChange={setPricePerSeat} placeholder="900" />
          {Number(pricePerSeat) > 0 && (
            <div className="mt-2 text-[11px] text-ink-500">
              Full bus: <span className="font-bold tabular">{fmtBr(Number(pricePerSeat) * 49)}</span> at 49 seats
            </div>
          )}
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/operator/dashboard')}
            className="flex-1 sm:flex-initial rounded-xl px-4 py-2.5 text-sm font-bold bg-white border border-ink-100 text-ink-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: GADAA_COLOR }}
          >
            {submitting ? (
              <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Create departure <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Field components ────────────────────────────────────────────

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-4">
      <div className="mb-3">
        <div className="text-[12px] font-bold">{title}</div>
        <div className="text-[10px] text-ink-500">{sub}</div>
      </div>
      {children}
    </div>
  );
}

function FieldShell({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block text-ink-500">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function TextField({ icon, label, value, onChange, placeholder }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <FieldShell icon={icon} label={label}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900"
      />
    </FieldShell>
  );
}

function NumberField({ icon, label, value, onChange, placeholder }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <FieldShell icon={icon} label={label}>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900 tabular"
      />
    </FieldShell>
  );
}

function DateField({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <FieldShell icon={icon} label={label}>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900 tabular"
      />
    </FieldShell>
  );
}

function TimeField({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <FieldShell icon={icon} label={label}>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900 tabular"
      />
    </FieldShell>
  );
}

function SelectField({ icon, label, value, onChange, options }: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <FieldShell icon={icon} label={label}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900 appearance-none"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  );
}
