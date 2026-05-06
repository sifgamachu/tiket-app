import { Globe2, Heart, ChevronDown, ChevronUp, Phone, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { ETB_PER_USD, fmtBr, fmtUSD } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────
// Diaspora flow — "DC cousin buys mom's ticket"
//
// One of the strongest competitive moats: Ethiopians abroad regularly
// send money home for travel, but no platform lets them buy the ticket
// directly. Pay in USD, ticket is delivered to a local recipient's
// phone via SMS + Telegram, with transparent FX baked in.
// ─────────────────────────────────────────────────────────────────

interface DiasporaToggleProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  totalEtb: number;
}

export function DiasporaToggle({ enabled, onToggle, totalEtb }: DiasporaToggleProps) {
  const usdAmount = totalEtb / ETB_PER_USD;

  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
      className="w-full rounded-xl border-2 transition text-left"
      style={{
        background: enabled ? 'linear-gradient(135deg, #1A6B3A 0%, #0F4D27 100%)' : 'white',
        borderColor: enabled ? '#1A6B3A' : '#E5E7EB',
        color: enabled ? 'white' : '#0E1411',
      }}
    >
      <div className="flex items-center gap-2.5 p-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: enabled ? 'rgba(255,255,255,0.2)' : '#F4F1EA' }}
        >
          {enabled ? <Heart size={16} fill="currentColor" /> : <Globe2 size={16} className="text-tiket-green" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold flex items-center gap-1.5">
            Buy from abroad
            {enabled && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 uppercase tracking-wider">Active</span>}
          </div>
          <div className="text-[10px] opacity-90 mt-0.5">
            {enabled ? `Paying ${fmtUSD(usdAmount)} via international card` : 'Pay in USD, send the ticket to family in Ethiopia'}
          </div>
        </div>
        {enabled ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {enabled && (
        <div className="px-3 pb-3 text-[10px] space-y-1 opacity-90 border-t border-white/15 pt-2">
          <Row label="Ticket cost" value={fmtBr(totalEtb)} />
          <Row label="Exchange rate" value={`1 USD ≈ ${ETB_PER_USD} ETB`} />
          <Row label="You pay" value={fmtUSD(usdAmount)} bold />
          <div className="text-[9px] opacity-80 mt-1.5">
            🇪🇹 No hidden fees. Recipient gets the same ticket they would have bought locally.
          </div>
        </div>
      )}
    </button>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      <span className={`tabular ${bold ? 'font-black text-sm' : ''}`}>{value}</span>
    </div>
  );
}

// ── Recipient fields — shown when diaspora mode is on ────────────

interface RecipientFieldsProps {
  recipientName: string;
  recipientPhone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}

export function RecipientFields({ recipientName, recipientPhone, onNameChange, onPhoneChange }: RecipientFieldsProps) {
  return (
    <div className="rounded-xl bg-white border border-ink-100 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <Heart size={14} className="text-tiket-green mt-0.5 flex-shrink-0" />
        <div className="text-[11px] text-ink-900">
          <span className="font-bold">Who's traveling?</span>
          <span className="text-ink-500"> The ticket will be sent to this person via SMS + Telegram.</span>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block text-ink-500">Recipient's name</label>
        <div className="relative">
          <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={recipientName}
            onChange={e => onNameChange(e.target.value)}
            placeholder="Their name as on ID"
            className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block text-ink-500">Recipient's phone (Ethiopia)</label>
        <div className="relative">
          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={recipientPhone}
            onChange={e => onPhoneChange(e.target.value)}
            placeholder="+251 911 234 567"
            className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900"
          />
        </div>
      </div>
    </div>
  );
}

// Custom hook to bundle the diaspora state
export function useDiaspora() {
  const [enabled, setEnabled] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  return { enabled, setEnabled, recipientName, setRecipientName, recipientPhone, setRecipientPhone };
}
