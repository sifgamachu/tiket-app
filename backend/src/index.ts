import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { eventsRouter } from './routes/events.js';
import { busRouter } from './routes/bus.js';
import { railRouter } from './routes/rail.js';
import { ticketsRouter } from './routes/tickets.js';
import { paymentsRouter } from './routes/payments.js';
import { telegramRouter } from './routes/telegram.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Domain routes
app.use('/api/events', eventsRouter);
app.use('/api/buses', busRouter);
app.use('/api/trains', railRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/telegram', telegramRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'internal_error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Tikēt API listening on :${PORT}`);
});
