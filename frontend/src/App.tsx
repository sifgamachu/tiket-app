import { Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from '@/lib/i18n';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { BusSearch } from '@/pages/BusSearch';
import { BusResults } from '@/pages/BusResults';
import { BusSeats } from '@/pages/BusSeats';
import { BusCheckout } from '@/pages/BusCheckout';
import { RailSearch } from '@/pages/RailSearch';
import { RailResults } from '@/pages/RailResults';
import { RailSeats } from '@/pages/RailSeats';
import { RailCheckout } from '@/pages/RailCheckout';
import { Events } from '@/pages/Events';
import { EventDetail } from '@/pages/EventDetail';
import { EventCheckout } from '@/pages/EventCheckout';
import { Tickets } from '@/pages/Tickets';
import { TicketDetail } from '@/pages/TicketDetail';
import { Profile } from '@/pages/Profile';
import { OperatorLayout } from '@/pages/operator/OperatorLayout';
import { OperatorLogin } from '@/pages/operator/OperatorLogin';
import { OperatorDashboard } from '@/pages/operator/OperatorDashboard';
import { OperatorAddDeparture } from '@/pages/operator/OperatorAddDeparture';
import { OperatorSalesReport } from '@/pages/operator/OperatorSalesReport';
import { OperatorRoutes } from '@/pages/operator/OperatorRoutes';
import { OperatorScanner } from '@/pages/operator/OperatorScanner';
import { OperatorPayouts } from '@/pages/operator/OperatorPayouts';

export default function App() {
  return (
    <I18nProvider>
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* Bus */}
        <Route path="/bus" element={<BusSearch />} />
        <Route path="/bus/results" element={<BusResults />} />
        <Route path="/bus/seats/:busId" element={<BusSeats />} />
        <Route path="/bus/checkout/:busId" element={<BusCheckout />} />

        {/* Rail */}
        <Route path="/rail" element={<RailSearch />} />
        <Route path="/rail/results" element={<RailResults />} />
        <Route path="/rail/seats/:trainId/:classId" element={<RailSeats />} />
        <Route path="/rail/checkout/:trainId/:classId" element={<RailCheckout />} />

        {/* Events */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/events/:eventId/checkout" element={<EventCheckout />} />

        {/* Wallet */}
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:ticketId" element={<TicketDetail />} />

        {/* Account */}
        <Route path="/profile" element={<Profile />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Operator console — separate layout, separate auth gate.
          Demo prototype; real version would live at operator.tiket.app. */}
      <Route path="/operator/login" element={<OperatorLogin />} />
      <Route path="/operator" element={<OperatorLayout />}>
        <Route index element={<Navigate to="/operator/dashboard" replace />} />
        <Route path="dashboard" element={<OperatorDashboard />} />
        <Route path="add-departure" element={<OperatorAddDeparture />} />
        <Route path="scanner" element={<OperatorScanner />} />
        <Route path="sales" element={<OperatorSalesReport />} />
        <Route path="routes" element={<OperatorRoutes />} />
        <Route path="payouts" element={<OperatorPayouts />} />
      </Route>
    </Routes>
    </I18nProvider>
  );
}
