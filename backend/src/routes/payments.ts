import express, { Router } from 'express';
import { query } from '../db.js';
import { verifyChapaSignature } from '../lib/chapa.js';

export const paymentsRouter = Router();

// POST /api/payments/init — creates a payment intent
// In production, this calls Chapa's Initialize Transaction API or Telebirr's payment SDK.
paymentsRouter.post('/init', async (req, res, next) => {
  try {
    const { amount_cents, currency, reference, mode, payload } = req.body;
    // TODO: call Chapa: https://api.chapa.co/v1/transaction/initialize
    // For now, return a stub so the frontend can continue the flow in dev.
    await query(
      `INSERT INTO payments (provider_ref, mode, amount_cents, currency, status, payload, created_at)
       VALUES ($1, $2, $3, $4, 'pending', $5::jsonb, NOW())`,
      [reference, mode, amount_cents, currency ?? 'ETB', JSON.stringify(payload ?? {})]
    );
    res.json({ checkout_url: `https://checkout.chapa.co/checkout/payment/${reference}`, reference });
  } catch (e) { next(e); }
});

// POST /api/payments/chapa/webhook
// Chapa hits this when a payment succeeds. Verify the signature, then
// fulfill the order (create the ticket).
//
// Note: this route uses raw body parsing so the HMAC can be computed over
// the exact bytes Chapa sent. Mounted explicitly with express.raw().
paymentsRouter.post(
  '/chapa/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const sig = req.header('Chapa-Signature') ?? '';
      const isValid = verifyChapaSignature(req.body as Buffer, sig, process.env.CHAPA_WEBHOOK_SECRET ?? '');
      if (!isValid) return res.status(401).json({ error: 'invalid_signature' });

      const event = JSON.parse((req.body as Buffer).toString('utf8'));
      if (event.status === 'success') {
        await query(
          `UPDATE payments SET status = 'succeeded', completed_at = NOW() WHERE provider_ref = $1`,
          [event.tx_ref]
        );
        // TODO: kick off ticket creation by emitting an internal event
        // and inserting into tickets table from the original cart payload.
      }
      res.json({ ok: true });
    } catch (e) { next(e); }
  }
);
