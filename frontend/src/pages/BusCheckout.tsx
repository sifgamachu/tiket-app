import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Phone, User as UserIcon, AlertTriangle, Smartphone, Star, CreditCard } from 'lucide-react';
import type { Bus, PaymentMethod } from '@/types';
import { getBus, checkoutBus, seatLabelForBus } from '@/lib/api';
import { getBusOperator } from '@/data/operators';
import { fmtBr, fmtBrToUSD, fmtTime, fmtUSD, ETB_PER_USD } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { Loading } from '@/components/ui/Loading';
import { useAppStore } from '@/store/AppStore';
import { TeletStripe } from '@/components/TeletStripe';
import { DiasporaToggle, RecipientFields, useDiaspora } from '@/components/DiasporaToggle';
import { useToast } from '@/components/Toast';
import { useTelegramMainButton, useTelegramBackButton, haptic, isInTelegram } from '@/lib/telegram';

export function BusCheckout() {
  const { busId } = useParams<{ busId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, addTicket, setUser } = useAppStore();
  const toast = useToast();
  const seatIdxs = (params.get('seats') ?? '').split(',').filter(Boolean).map(Number);

  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [name, setName] = useState(state.user?.name ?? '');
  const [phone, setPhone] = useState(state.user?.phone ?? '');

  const dp = useDiaspora();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(state.user?.preferredPayment ?? 'telebirr');

  // Diaspora purchases settle in USD → only the card path works.
  useEffect(() => { if (dp.enabled) setPaymentMethod('card'); }, [dp.enabled]);

  useEffect(() => {
    if (!busId) return;
    setLoading(true);
    getBus(decodeURIComponent(busId)).then(setBus).finally(() => setLoading(false));
  }, [busId]);

  useTelegramBackButton(() => navigate(-1));

  const op = bus ? getBusOperator(bus.operatorId) : null;
  const subtotal = bus ? bus.basePrice * seatIdxs.length : 0;
  const fee = Math.round(subtotal * 0.025);
  const total = subtotal + fee;

  const ticketName = dp.enabled ? dp.recipientName : name;
  const ticketPhone = dp.enabled ? dp.recipientPhone : phone;
  const canPay = !!(bus && name && phone && ticketName && ticketPhone && seatIdxs.length > 0);

  const onPay = async () => {
    if (!canPay || paying || !bus) return;
    haptic.medium();
    setPaying(true);
    try {
      const ticket = await checkoutBus({
        bus, selectedSeats: seatIdxs,
        buyerName: ticketName, buyerPhone: ticketPhone,
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
    onClick: onPay,
    disabled: !canPay,
    loading: paying,
  });

  if (loading) return (<><PageHeader title="Loading..." /><Loading /></>);
  if (!bus || !op) return (<><PageHeader title="Bus not found" /></>);

  return (
    <div className="bg-tiket-cream min-h-screen pb-32">
      <PageHeader title="Checkout" subtitle="Passenger details and payment" />

      <div className="px-4 py-3 space-y-3">
        {/* Trip summary */}
        <div className="rounded-xl p-3 bg-white border border-ink-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: op.color }}>
              {op.id.slice(0, 3).toUpperCase()}
            </div>
            <div className="flex-1 text-xs font-bold text-ink-900">{op.name} · {bus.busNumber}</div>
            <div className="text-[10px] font-bold text-ink-500 tabular">{fmtTime(bus.depHHMM)}</div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-ink-500">
            <span>{bus.from} → {bus.to}</span>
            <span className="mx-1">·</span>
            <span className="flex flex-wrap gap-1">
              {seatIdxs.map(i => (
                <span key={i} className="px-1.5 py-0.5 rounded font-bold text-white bg-tiket-green text-[9px]">
                  {seatLabelForBus(i)}
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
            value={name} onChange={setName} placeholder={dp.enabled ? 'Your name' : 'Selamawit Tesfaye'} />
          <Field icon={<Phone size={14} />} label={dp.enabled ? 'Your phone (any country)' : 'Phone · ስልክ'}
            value={phone} onChange={setPhone} placeholder={dp.enabled ? '+1 202 555 0000' : '+251 911 234 567'} />

          {!dp.enabled && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <AlertTriangle size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-amber-900">
                <span className="font-bold">Boarding closes 15 min before departure.</span> Lamberet bus terminal, near Megenagna.
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
              <span>Tickets ({seatIdxs.length} × {fmtBr(bus.basePrice)})</span>
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
          <TeletStripe height={2} className="-mx-4 mb-2" />
          <button
            onClick={onPay}
            disabled={!canPay || paying}
            className="w-full rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 relative overflow-hidden text-white disabled:opacity-50"
            style={{
              background: paymentMethod === 'telebirr' ? 'linear-gradient(135deg, #1B3A8C 0%, #2563EB 100%)' :
                          paymentMethod === 'stars' ? '#3390EC' : '#0E1411',
            }}
          >
            {!paying && (
              <span className="absolute inset-0 animate-tk-shine"
                style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)' }} />
            )}
            {paying ? (
              <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : <>Pay {dp.enabled ? fmtUSD(total / ETB_PER_USD) : fmtBr(total)}</>}
          </button>
          <div className="text-[10px] text-center mt-2 text-ink-500">
            🔒 Free cancellation up to 24h before departure
          </div>
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

function PayOpt({ label, sub, color, icon, selected, onSelect }: {
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
