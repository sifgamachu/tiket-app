import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, FileText, LogOut, Bell, ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Operator dashboard layout. Desktop-first (sidebar navigation,
// wider tables) but degrades gracefully to mobile (collapses sidebar
// to a top bar, tables become cards). Branded for Gadaa Transport
// — burnt orange (#9A3412), Afaan Oromoo signaling.
// ─────────────────────────────────────────────────────────────────

const GADAA_COLOR = '#9A3412';
const GADAA_ACCENT = '#FED7AA';

export function OperatorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Gate: if not in demo mode, kick back to home.
  // In a real build this would check auth instead.
  const isDemo = new URLSearchParams(location.search).get('demo') === 'gadaa' ||
                 sessionStorage.getItem('tiket-operator-demo') === 'gadaa';

  if (!isDemo) {
    navigate('/operator/login', { replace: true });
    return null;
  }

  const onSignOut = () => {
    sessionStorage.removeItem('tiket-operator-demo');
    navigate('/operator/login');
  };

  return (
    <div className="min-h-screen bg-tiket-cream text-ink-900">

      {/* Top bar */}
      <header className="bg-white border-b border-ink-100 sticky top-0 z-20">
        <div className="px-4 lg:px-6 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-white font-black text-xs"
              style={{ background: GADAA_COLOR }}
            >
              GAD
            </div>
            <div className="leading-tight">
              <div className="text-xs font-black">Gadaa Transport</div>
              <div className="text-[9px] text-ink-500">Dispatcher · Lamberet Terminal</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative w-8 h-8 rounded-full hover:bg-tiket-warm-cream flex items-center justify-center text-ink-500" aria-label="Notifications">
              <Bell size={14} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-err" />
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-tiket-warm-cream">
              <div className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: GADAA_COLOR }}>
                D
              </div>
              <span className="text-[11px] font-semibold hidden sm:inline">Dispatcher</span>
              <ChevronDown size={11} className="text-ink-500" />
            </button>
          </div>
        </div>

        {/* Mobile + tablet nav row */}
        <nav className="lg:hidden px-2 pb-2 flex gap-1 overflow-x-auto no-scrollbar">
          <MobileNavLink to="/operator/dashboard" label="Dashboard" icon={<LayoutDashboard size={13} />} />
          <MobileNavLink to="/operator/add-departure" label="Add" icon={<Plus size={13} />} />
          <MobileNavLink to="/operator/sales" label="Sales" icon={<FileText size={13} />} />
        </nav>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-44px)] bg-white border-r border-ink-100 px-3 py-4 sticky top-[44px]">
          <div className="text-[9px] font-bold uppercase tracking-wider text-ink-500 px-2 mb-2">Operations</div>
          <SidebarLink to="/operator/dashboard" label="Dashboard" amh="Today's departures" icon={<LayoutDashboard size={14} />} />
          <SidebarLink to="/operator/add-departure" label="Add departure" amh="Idileessuu" icon={<Plus size={14} />} />
          <SidebarLink to="/operator/sales" label="Sales report" amh="Gabaasa gurgurtaa" icon={<FileText size={14} />} />

          <div className="mt-auto pt-4 border-t border-ink-100">
            <div className="rounded-lg p-2.5 mb-3" style={{ background: GADAA_ACCENT }}>
              <div className="text-[10px] font-bold" style={{ color: GADAA_COLOR }}>Demo mode</div>
              <div className="text-[9px] text-ink-900 mt-0.5">
                You're viewing a prototype. Data resets on reload.
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-semibold text-ink-500 hover:bg-tiket-warm-cream"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, label, amh, icon }: { to: string; label: string; amh: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-start gap-2.5 px-2.5 py-2 rounded-md mb-0.5 ${
          isActive ? 'bg-tiket-warm-cream' : 'hover:bg-tiket-warm-cream/60'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? '' : 'text-ink-500'} style={isActive ? { color: GADAA_COLOR } : undefined}>{icon}</span>
          <span className="flex-1 leading-tight">
            <span className="text-[12px] font-semibold block" style={isActive ? { color: GADAA_COLOR } : undefined}>{label}</span>
            <span className="text-[10px] text-ink-500">{amh}</span>
          </span>
        </>
      )}
    </NavLink>
  );
}

function MobileNavLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold border ${
          isActive ? 'text-white' : 'border-ink-100 text-ink-900 bg-white'
        }`
      }
      style={({ isActive }) => isActive ? { background: GADAA_COLOR, borderColor: GADAA_COLOR } : undefined}
    >
      {icon}
      {label}
    </NavLink>
  );
}
