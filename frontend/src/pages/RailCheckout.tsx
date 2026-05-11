import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Phone, User as UserIcon, BookOpen, Smartphone, Star, CreditCard, Globe } from 'lucide-react';
import type { Train, RailClass, PaymentMethod } from '@/types';
import { getTrain, computeRailFare, checkoutRail } from '@/lib/api';
import { getStation, getRailClass, railSeatLabel } from '@/data/rail';
import { fmtBr, fmtBrToUSD, fmtUSD, ETB_PER_USD } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loading } from '@/components/ui/Loading';
import { useAppStore } from '@/store/AppStore';
import { DiasporaToggle, RecipientFields, useDiaspora } from '@/components/DiasporaToggle';
import { useToast } from '@/components/Toast';
import { useTelegramMainButton, useTelegramBackButton, haptic, isInTelegram } from '@/lib/telegram';

export function RailCheckout() {
  const { trainId, classId } = useParams<{ trainId: string; classId: RailClass['id'] }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, addTicket, setUser } = useAppStore();
  const toast = useToast();

  const from = params.get('from') ?? 'AAL';
  const to = params.get('to') ?? 'NGD';
  const seatIdxs = (params.get('seats') ?? '').split(',').filter(Boolean).map(Number);

  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [name, setName] = useState(state.user?.name ?? '');
  const [phone, setPhone] = useState(state.user?.phone ?? '');
  const [passport, setPassport] = useState('');
  const dp = useDiaspora();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(state.user?.preferredPayment ?? 'telebirr');

  useEffect(() => { if (dp.enabled) setPaymentMethod('card'); }, [dp.enabled]);

  useEffect(() => {
    if (!trainId) return;
    setLoading(true);
    getTrain(decodeURIComponent(trainId)).then(setTrain).finally(() => setLoading(false));
  }, [trainId]);

  useTelegramBackButton(() => navigate(-1));

  const cls = classId ? getRailClass(classId) : null;
  const fromSt = getStation(from);
  const toSt = getStation(to);
  const isInternational = fromSt?.country !== toSt?.country;
  const fromKm = fromSt?.km ?? 0;
  const toKm = toSt?.km ?? 752;
  const farePerSeat = classId ? computeRailFare(classId, fromKm, toKm) : 0;
  const subtotal = farePerSeat * seatIdxs.length;
  const fee = Math.round(subtotal * 0.025);
  const total = subtotal + fee;

  const ticketName = dp.enabled ? dp.recipientName : name;
  const ticketPhone = dp.enabled ? dp.recipientPhone : phone;
  const canPay = !!(train && classId && name && phone && ticketName && ticketPhone &&
                    (!isInternational || passport) && seatIdxs.length > 0);

  const onPay = async () => {
    if (!canPay || paying || !train || !classId) return;
    haptic.medium();
    setPaying(true);
    try {
      const ticket = await checkoutRail({
        train, classId, selectedSeats: seatIdxs,
        fromStation: from, toStation: to,
        buyerName: ticketName, buyerPhone: ticketPhone,
        passportNumber: passport || undefined,
        paymentMethod,
        ...(dp.enabled && { isDiaspora: true, senderName: name, senderPhone: phone }),
      });
      addTicket(ticket);
      if (!state.user) {
        setUser({ id: `user-${Date.now()}`, name, phone, preferredPayment: paymentMethod, language: state.language });
      }
      haptic.success();
      toast.success(dp.enabled ? `Sent to ${dp.recipientName}!` : 'Ticket purchased!');
      navigate(`/tickets/${ticket.id}`, { replace: true });
    } catch (e) {
      console.error(e);
      haptic.error();
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  useTelegramMainButton({
    text: paying ? 'Processing...' : `Pay ${dp.enabled ? fmtUSD(total / ETB_PER_USD) : fmtBr(total)}`,
    onClick: onPay, disabled: !canPay, loading: paying,
    color: cls?.color,
  });

  if (loading) return (<><PageHeader title="Loading..." /><Loading /></>);
  if (!train || !cls) return (<><PageHeader title="Train not found" /></>);

  return (
    <div className="bg-tiket-cream min-h-screen pb-32">
      <PageHeader title="Checkout" subtitle={`${cls.name} · ${fromSt?.name} → ${toSt?.name}`} />

      <div className="px-4 py-3 space-y-3">
        <div className="rounded-xl p-3 text-white" style={{ background: cls.color }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-80">EDR · {train.number}</div>
              <div className="text-sm font-bold">{train.name}</div>
            </div>
            {isInternational && <Globe size={16} className="text-tiket-gold" />}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] opacity-90">
            <span>{fromSt?.name} → {toSt?.name}</span>
            <span>·</span>
            <span className="flex flex-wrap gap-1">
              {seatIdxs.map(i => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-bold tabular">
                  {classId && railSeatLabel(i, classId)}
                </span>
              ))}
            </span>
          </div>
        </div>

        <DiasporaToggle enabled={dp.enabled} onToggle={(v) => { haptic.selection(); dp.setEnabled(v); }} totalEtb={total} />

        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            {dp.enabled ? 'Your contact info (sender)' : 'Passenger details'}
          </div>
          <Field icon={<UserIcon size={14} />} label={dp.enabled ? 'Your name' : 'Full Name · ሙሉ ስም'}
            value={name} onChange={setName} placeholder={dp.enabled ? 'Your name' : 'Your name as on ID'} />
          <Field icon={<Phone size={14} />} label={dp.enabled ? 'Your phone (any country)' : 'Phone · ስልክ'}
            value={phone} onChange={setPhone} placeholder={dp.enabled ? '+1 202 555 0000' : '+251 911 234 567'} />

          {isInternational && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block text-ink-500">
                Passenger Passport · የፓስፖርት ቁጥር <span className="text-err">*</span>
              </label>
              <div className="relative">
                <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input value={passport} onChange={e => setPassport(e.target.value.toUpperCase())} placeholder="EP1234567"
                  className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-white border border-ink-100 outline-none text-ink-900 tabular" />
              </div>
              <div className="text-[9px] text-ink-500 mt-1">
                {dp.enabled
                  ? "The passenger's passport — they'll need it at the border."
                  : 'Required for cross-border travel. Bring physical passport for boarding.'}
              </div>
            </div>
          )}
        </div>

        {dp.enabled && (
          <RecipientFields
            recipientName={dp.recipientName} recipientPhone={dp.recipientPhone}
            onNameChange={dp.setRecipientName} onPhoneChange={dp.setRecipientPhone}
          />
        )}

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-ink-500">Pay with</div>
          <div className="space-y-1.5">
            {!dp.enabled && (
              <>
                <PayOpt color="#1B3A8C" icon={<Smartphone size={16} />} label="Telebirr" sub="PIN sent to your phone"
                  selected={paymentMethod === 'telebirr'} onSelect={() => { haptic.selection(); setPaymentMethod('telebirr'); }} />
                <PayOpt color="#3390EC" icon={<Star size={16} fill="white" />} label="Telegram Stars" sub={`${Math.ceil(total / 7)} ⭐`}
                  selected={paymentMethod === 'stars'} onSelect={() => { haptic.selection(); setPaymentMethod('stars'); }} />
              </>
            )}
            <PayOpt color="#0E1411" icon={<CreditCard size={16} />}
              label={dp.enabled ? 'International card via Chapa' : 'Card via Chapa'}
              sub={dp.enabled ? 'Visa, Mastercard · USD billing' : 'Visa, Mastercard · USD or ETB'}
              selected={paymentMethod === 'card'} onSelect={() => { haptic.selection(); setPaymentMethod('card'); }} />
          </div>
        </div>

        <div className="rounded-xl p-3 bg-white border border-ink-100">
          <div className="text-xs space-y-1.5 text-ink-900">
            <div className="flex justify-between">
              <span>Tickets ({seatIdxs.length} × {fmtBr(farePerSeat)})</span>
              <span className="tabular">{fmtBr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-500">
              <span>Service fee (2.5%)</span>
              <span className="tabular">{fmtBr(fee)}</span>
            </div>
            <div className="flex justify-between pt-1.5 mt-1.5 border-t border-ink-100">
              <span className="font-bold">Total · ጠቅላላ</span>
              <span className="font-black text-base tabular">{dp.enabled ? fmtUSD(total / ETB_PER_USD) : fmtBr(total)}</span>
            </div>
            <div className="text-right text-[10px] text-ink-500">
              {dp.enabled ? `≈ ${fmtBr(total)} delivered` : `≈ ${fmtBrToUSD(total)}`}
            </div>
          </div>
        </div>
      </div>

      {!isInTelegram() && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-100 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <button onClick={onPay} disabled={!canPay || paying}
            className="w-full rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 text-white disabled:opacity-50"
            style={{
              background: paymentMethod === 'telebirr' ? 'linear-gradient(135deg, #1B3A8C 0%, #2563EB 100%)' :
                          paymentMethod === 'stars' ? '#3390EC' : '#0E1411',
            }}>
            {paying ? <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <>Pay {dp.enabled ? fmtUSD(total / ETB_PER_USD) : fmtBr(total)}</>}
          </button>
          <div className="text-[10px] text-center mt-2 text-ink-500">🔒 QR unlocks 1 hour before departure</div>
        </div>
      )}
    </div>
  );
}

function Field({ icon, label, value, onChange, placeholder }: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block text-ink-500">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">{icon}</span>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-white border border-ink-100 outline-none text-ink-900" />
      </div>
    </div>
  );
}

function PayOpt({ color, icon, label, sub, selected, onSelect }: {
  color: string; icon: React.ReactNode; label: string; sub: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button onClick={onSelect} className="w-full flex items-center gap-2.5 rounded-xl p-2.5 transition border"
      style={{ background: selected ? color : 'white', borderColor: selected ? color : '#E5E7EB', color: selected ? 'white' : '#0E1411' }}>
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: selected ? 'rgba(255,255,255,0.2)' : '#F4F1EA', color: selected ? 'white' : color }}>{icon}</div>
      <div className="flex-1 text-left">
        <div className="text-xs font-bold">{label}</div>
        <div className="text-[10px] opacity-80">{sub}</div>
      </div>
      <div className="w-4 h-4 rounded-full"
        style={{ border: `2px solid ${selected ? 'white' : '#6B7280'}`, background: selected ? 'white' : 'transparent' }} />
    </button>
  );
}
