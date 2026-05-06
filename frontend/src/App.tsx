import { Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
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
    </Routes>
  );
}
