import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Building2 } from 'lucide-react';
import { TeletStripe } from '@/components/TeletStripe';

// ─────────────────────────────────────────────────────────────────
// Operator login. Visual only — no real auth. Submit drops a flag
// in sessionStorage and routes to the dashboard. The real version
// would hit /api/operator/login with email + password and store a
// JWT.
//
// For demo purposes, ANY non-empty credentials work, but we hint at
// the real Gadaa flow with placeholder text.
// ─────────────────────────────────────────────────────────────────

const GADAA_COLOR = '#9A3412';

export function OperatorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('dispatcher@gadaa.et');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    // Pretend we're authenticating
    setTimeout(() => {
      sessionStorage.setItem('tiket-operator-demo', 'gadaa');
      navigate('/operator/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-tiket-cream flex flex-col">
      <TeletStripe height={3} />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Brand block */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-black"
              style={{ background: GADAA_COLOR }}
            >
              GAD
            </div>
            <div>
              <div className="text-base font-black">Gadaa Transport</div>
              <div className="text-[11px] text-ink-500">Dispatcher Console · powered by Tikēt</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5">
            <div className="mb-4">
              <h1 className="text-lg font-black text-ink-900">Sign in</h1>
              <p className="text-[11px] text-ink-500 mt-0.5">Galchi · Enter your dispatcher credentials</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <Field
                icon={<Mail size={14} />}
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="dispatcher@gadaa.et"
              />
              <Field
                icon={<Lock size={14} />}
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter password"
              />

              <button
                type="submit"
                disabled={!email || !password || submitting}
                className="w-full rounded-xl py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition"
                style={{ background: GADAA_COLOR }}
              >
                {submitting ? (
                  <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-ink-100 flex items-start gap-2">
              <Building2 size={12} className="text-ink-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-ink-500">
                Operator accounts are provisioned by Tikēt. Contact{' '}
                <span className="font-mono text-tiket-green">@TiketEthiopia</span> to onboard your transport company.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center text-[10px] text-ink-500">
            Demo prototype · Any password works · Tikēt v0.1
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon, label, type, value, onChange, placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  type: 'email' | 'password' | 'text';
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block text-ink-500">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 bg-tiket-warm-cream border border-ink-100 outline-none text-ink-900"
        />
      </div>
    </div>
  );
}
