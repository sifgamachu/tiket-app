// Helpers for the Telegram Bot API
// https://core.telegram.org/bots/api

const BOT_API = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;

export async function sendMessage(chatId: number, text: string, opts: Record<string, unknown> = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
  const res = await fetch(BOT_API(token, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...opts }),
  });
  return res.json();
}

// Send an invoice for Telegram Stars payment
// https://core.telegram.org/bots/payments-stars
export interface StarsInvoice {
  chat_id: number;
  title: string;
  description: string;
  payload: string; // your internal cart reference
  amount_stars: number; // 1 USD ≈ 50 stars (varies)
}

export async function sendStarsInvoice(p: StarsInvoice) {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
  return fetch(BOT_API(token, 'sendInvoice'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: p.chat_id,
      title: p.title,
      description: p.description,
      payload: p.payload,
      currency: 'XTR',
      prices: [{ label: p.title, amount: p.amount_stars }],
      provider_token: '', // empty for Stars
    }),
  }).then(r => r.json());
}

export async function answerPreCheckoutQuery(queryId: string, ok: boolean, errorMessage?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
  return fetch(BOT_API(token, 'answerPreCheckoutQuery'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pre_checkout_query_id: queryId, ok, error_message: errorMessage }),
  }).then(r => r.json());
}
