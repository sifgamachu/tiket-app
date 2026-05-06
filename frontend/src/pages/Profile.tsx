import { useState } from 'react';
import { User as UserIcon, Phone, Globe, Smartphone, LogOut, ChevronRight, Languages, CreditCard, Send } from 'lucide-react';
import { useAppStore } from '@/store/AppStore';
import { TeletStripe } from '@/components/TeletStripe';
import { lsClearAll } from '@/lib/storage';
import type { PaymentMethod } from '@/types';
import { useToast } from '@/components/Toast';
import { haptic } from '@/lib/telegram';

export function Profile() {
  const { state, setUser, setLanguage } = useAppStore();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(state.user?.name ?? '');
  const [phone, setPhone] = useState(state.user?.phone ?? '');
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [pref] = useState<PaymentMethod>(state.user?.preferredPayment ?? 'telebirr');

  const onSave = () => {
    setUser({
      id: state.user?.id ?? `user-${Date.now()}`,
      name, phone, email,
      preferredPayment: pref,
      language: state.language,
      telegramUserId: state.user?.telegramUserId,
    });
    haptic.success();
    toast.success('Profile saved');
    setEditing(false);
  };

  const onLogout = () => {
    if (confirm('Sign out and clear all locally stored tickets?')) {
      lsClearAll();
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-tiket-cream min-h-screen pb-6">
      <TeletStripe />
      <div className="px-4 pt-4 pb-3">
        <div className="text-2xl font-black text-ink-900">Account</div>
        <div className="text-xs text-ink-500 font-ethiopic">አካውንት</div>
      </div>

      {/* Profile card */}
      <div className="px-4">
        <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm">
          {!editing && state.user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-tiket-green text-white font-black text-lg flex items-center justify-center">
                  {state.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink-900 truncate">{state.user.name}</div>
                  <div className="text-[11px] text-ink-500 truncate">{state.user.phone || 'No phone set'}</div>
                </div>
                <button
                  onClick={() => { haptic.selection(); setEditing(true); }}
                  className="text-[11px] font-bold text-tiket-green"
                >
                  Edit
                </button>
              </div>
              {state.user.telegramUserId && (
                <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-white" style={{ background: '#3390EC' }}>
                    <Send size={13} fill="white" />
                  </div>
                  <div className="flex-1 text-[10px]">
                    <div className="font-bold text-ink-900">Connected via Telegram</div>
                    <div className="text-ink-500">Your tickets sync automatically · ID {state.user.telegramUserId}</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                {state.user ? 'Edit profile' : 'Set up profile'}
              </div>
              <Field icon={<UserIcon size={14} />} value={name} onChange={setName} placeholder="Full name" />
              <Field icon={<Phone size={14} />} value={phone} onChange={setPhone} placeholder="Phone (e.g., +251 911 234 567)" />
              <Field icon={<Globe size={14} />} value={email} onChange={setEmail} placeholder="Email (optional)" />
              <div className="flex gap-2 pt-1">
                {state.user && <button onClick={() => setEditing(false)} className="flex-1 rounded-xl py-2 text-xs font-bold bg-tiket-warm-cream text-ink-900">Cancel</button>}
                <button onClick={onSave} disabled={!name || !phone} className="flex-1 rounded-xl py-2 text-xs font-bold bg-tiket-green text-white disabled:opacity-50">
                  {state.user ? 'Save' : 'Continue'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings list */}
      <div className="px-4 mt-4 space-y-2">
        <SettingRow
          icon={<Languages size={16} />}
          label="Language"
          right={
            <div className="flex gap-1">
              {(['en', 'am'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => { haptic.selection(); setLanguage(l); }}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold ${state.language === l ? 'bg-tiket-green text-white' : 'bg-tiket-warm-cream text-ink-900'}`}
                >
                  {l === 'en' ? 'EN' : 'አማ'}
                </button>
              ))}
            </div>
          }
        />

        <SettingRow
          icon={<CreditCard size={16} />}
          label="Preferred payment"
          right={
            <div className="text-[11px] font-bold text-ink-900 capitalize">
              {state.user?.preferredPayment ?? 'Not set'}
            </div>
          }
        />

        {state.user && (
          <button onClick={onLogout} className="w-full flex items-center gap-3 rounded-xl bg-white border border-ink-100 px-3 py-2.5">
            <div className="w-8 h-8 rounded-md bg-red-50 text-err flex items-center justify-center"><LogOut size={14} /></div>
            <div className="text-xs font-bold text-err">Sign out · Clear data</div>
            <ChevronRight size={14} className="ml-auto text-ink-500" />
          </button>
        )}
      </div>

      {/* Support */}
      <div className="px-4 mt-5 mb-6">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">Support</div>
        <div className="bg-white rounded-2xl border border-ink-100 p-3 space-y-2 text-[11px] text-ink-900">
          <div className="flex items-start gap-2">
            <Smartphone size={12} className="text-tiket-green mt-0.5 flex-shrink-0" />
            <div>Telegram: <span className="font-mono text-tiket-green">@TiketEthiopia</span></div>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={12} className="text-tiket-green mt-0.5 flex-shrink-0" />
            <div>Hotline: 8800 (free)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, value, onChange, placeholder }: { icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">{icon}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900"
      />
    </div>
  );
}

function SettingRow({ icon, label, right }: { icon: React.ReactNode; label: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white border border-ink-100 px-3 py-2.5">
      <div className="w-8 h-8 rounded-md bg-tiket-warm-cream text-ink-500 flex items-center justify-center">{icon}</div>
      <div className="text-xs font-bold text-ink-900 flex-1">{label}</div>
      {right}
    </div>
  );
}
