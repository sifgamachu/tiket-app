import { Outlet, NavLink } from 'react-router-dom';
import { Home, Ticket, User } from 'lucide-react';
import { LanguagePicker } from './LanguagePicker';
import { isInTelegram } from '@/lib/telegram';
import { useLocation } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────
// App shell for buyer pages. Renders:
//   - the active route via <Outlet />
//   - a fixed bottom nav (Home / Tickets / Account) on most pages,
//     hidden on full-screen flow steps and inside Telegram
//   - a floating language picker top-right that's accessible from
//     every page. Lives outside any overflow:hidden container so
//     its dropdown is never clipped by a hero or modal.
//
// The teleta (green/yellow/red) stripe was removed; the picker and
// hero illustrations carry the brand identity instead.
// ─────────────────────────────────────────────────────────────────

export function Layout() {
  const location = useLocation();

  const onFlowStep = /^\/(bus\/seats|bus\/checkout|rail\/seats|rail\/checkout|events\/[^/]+\/checkout|tickets\/[^/]+)/.test(location.pathname);
  const hideBottomNav = onFlowStep || isInTelegram();

  return (
    <div className="min-h-screen flex flex-col bg-tiket-cream">
      {/* Floating language picker — appears on every page, never
          clipped because it lives at the layout root rather than
          inside a page-level container. */}
      <div className="fixed top-3 right-3 z-50">
        <LanguagePicker variant="solid" />
      </div>

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
