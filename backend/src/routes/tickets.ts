import { Router } from 'express';
import { query } from '../db.js';
import { z } from 'zod';
import { signTicket } from '../lib/qr.js';
import { randomUUID } from 'crypto';

export const ticketsRouter = Router();

const CreateTicketSchema = z.object({
  buyer_id: z.string(),
  mode: z.enum(['bus', 'rail', 'event']),
  payload: z.record(z.unknown()),
  total_paid_cents: z.number().int().positive(),
  payment_method: z.enum(['telebirr', 'stars', 'card', 'cbe']),
  unlock_at: z.string(),
  expires_at: z.string(),
});

// POST /api/tickets
// Creates a new ticket once payment is confirmed by the payments webhook.
ticketsRouter.post('/', async (req, res, next) => {
  try {
    const data = CreateTicketSchema.parse(req.body);
    const id = randomUUID();
    const qrPayload = signTicket({ tid: id, exp: new Date(data.expires_at).getTime() });

    await query(
      `INSERT INTO tickets (id, buyer_id, mode, payload, total_paid_cents, payment_method,
                            status, unlock_at, expires_at, qr_payload, created_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, 'locked', $7, $8, $9, NOW())`,
      [id, data.buyer_id, data.mode, JSON.stringify(data.payload), data.total_paid_cents,
       data.payment_method, data.unlock_at, data.expires_at, qrPayload]
    );
    res.status(201).json({ id, qr_payload: qrPayload });
  } catch (e) { next(e); }
});

// GET /api/tickets?buyer_id=...
ticketsRouter.get('/', async (req, res, next) => {
  try {
    const buyerId = String(req.query.buyer_id ?? '');
    if (!buyerId) return res.status(400).json({ error: 'missing_buyer_id' });
    const rows = await query(
      `SELECT * FROM tickets WHERE buyer_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [buyerId]
    );
    res.json({ results: rows, count: rows.length });
  } catch (e) { next(e); }
});

// GET /api/tickets/:id
ticketsRouter.get('/:id', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM tickets WHERE id = $1 LIMIT 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// POST /api/tickets/:id/scan — called by the scanner app
const ScanSchema = z.object({
  scanner_id: z.string(),
  gate_id: z.string().optional(),
});
ticketsRouter.post('/:id/scan', async (req, res, next) => {
  try {
    const data = ScanSchema.parse(req.body);
    // Idempotent scan with optimistic locking via a constraint on scan_events.
    await query(
      `INSERT INTO scan_events (ticket_id, scanner_id, gate_id, scanned_at)
       VALUES ($1, $2, $3, NOW())`,
      [req.params.id, data.scanner_id, data.gate_id ?? null]
    );
    await query(`UPDATE tickets SET status = 'used', used_at = NOW() WHERE id = $1 AND status != 'used'`,
      [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
