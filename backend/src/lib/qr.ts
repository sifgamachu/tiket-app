import crypto from 'crypto';

// Ed25519 signed ticket payloads.
// The scanner verifies signatures offline using the embedded public key
// (pinned at scanner install time). This is what makes scanning work
// even with no internet at remote bus stations / rail platforms.

interface TicketClaims {
  tid: string;       // ticket id
  exp: number;       // expiry (ms epoch)
  scope?: string;    // e.g. 'BUS', 'EDR', 'EVT'
}

export function signTicket(claims: TicketClaims): string {
  const privateKey = loadPrivateKey();
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'TKT' })));
  const body = base64url(Buffer.from(JSON.stringify(claims)));
  const message = Buffer.from(`${header}.${body}`);
  const signature = crypto.sign(null, message, privateKey);
  return `${header}.${body}.${base64url(signature)}`;
}

export function verifyTicket(token: string): TicketClaims | null {
  try {
    const [h, b, s] = token.split('.');
    if (!h || !b || !s) return null;
    const publicKey = loadPublicKey();
    const message = Buffer.from(`${h}.${b}`);
    const ok = crypto.verify(null, message, publicKey, base64urlDecode(s));
    if (!ok) return null;
    const claims = JSON.parse(base64urlDecode(b).toString('utf8')) as TicketClaims;
    if (Date.now() > claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}

function loadPrivateKey(): crypto.KeyObject {
  const der = process.env.ED25519_PRIVATE_KEY;
  if (!der) throw new Error('ED25519_PRIVATE_KEY not set');
  return crypto.createPrivateKey({ key: Buffer.from(der, 'base64'), format: 'der', type: 'pkcs8' });
}

function loadPublicKey(): crypto.KeyObject {
  const der = process.env.ED25519_PUBLIC_KEY;
  if (!der) throw new Error('ED25519_PUBLIC_KEY not set');
  return crypto.createPublicKey({ key: Buffer.from(der, 'base64'), format: 'der', type: 'spki' });
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64urlDecode(s: string): Buffer {
  const padded = s.replaceAll('-', '+').replaceAll('_', '/').padEnd(s.length + ((4 - s.length % 4) % 4), '=');
  return Buffer.from(padded, 'base64');
}
