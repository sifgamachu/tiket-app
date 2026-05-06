import crypto from 'crypto';

// Chapa signs webhook payloads with HMAC-SHA256 of the body using your webhook secret.
// https://developer.chapa.co/docs/webhooks
export function verifyChapaSignature(rawBody: Buffer, signature: string, secret: string): boolean {
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  // Constant-time compare
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// Initialize a Chapa transaction. Returns checkout_url.
export interface InitTxParams {
  amount: number;
  currency: 'ETB' | 'USD';
  email?: string;
  first_name: string;
  last_name?: string;
  phone_number?: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
}

export async function initChapaTransaction(p: InitTxParams) {
  const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(p),
  });
  if (!res.ok) throw new Error(`Chapa init failed: ${res.status}`);
  const data = await res.json() as { status: string; data: { checkout_url: string } };
  return data.data;
}
