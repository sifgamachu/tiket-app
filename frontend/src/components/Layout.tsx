import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Ticket, User } from 'lucide-react';
import { TeletStripe } from './TeletStripe';
import { isInTelegram } from '@/lib/telegram';

export function Layout() {
  const location = useLocation();

  // Hide bottom nav on full-screen flow steps (seat select, checkout, ticket detail).
  // Also hide entirely when running inside Telegram — its chrome already provides
  // app-level navigation, and stacking ours on top eats viewport real estate.
  const onFlowStep = /^\/(bus\/seats|bus\/checkout|rail\/seats|rail\/checkout|events\/[^/]+\/checkout|tickets\/[^/]+)/.test(location.pathname);
  const hideBottomNav = onFlowStep || isInTelegram();

  return (
    <div className="min-h-screen flex flex-col bg-tiket-cream">
      <main className={`flex-1 ${hideBottomNav ? '' : 'pb-16'}`}>
        <Outlet />
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-100 safe-bottom">
      <TeletStripe height={2} />
      <div className="flex items-center justify-around h-14">
        <NavLink to="/" end className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-4 py-2 ${isActive ? 'text-tiket-green' : 'text-ink-500'}`
        }>
          <Home size={20} />
          <span className="text-[10px] font-semibold">Home</span>
        </NavLink>
        <NavLink to="/tickets" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-4 py-2 ${isActive ? 'text-tiket-green' : 'text-ink-500'}`
        }>
          <Ticket size={20} />
          <span className="text-[10px] font-semibold">Tickets</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-4 py-2 ${isActive ? 'text-tiket-green' : 'text-ink-500'}`
        }>
          <User size={20} />
          <span className="text-[10px] font-semibold">Account</span>
        </NavLink>
      </div>
    </nav>
  );
}
