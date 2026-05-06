import { Router } from 'express';

export const telegramRouter = Router();

// POST /api/telegram/webhook
// Receives bot updates: messages, callback queries, payments, mini-app initData.
telegramRouter.post('/webhook', async (req, res) => {
  const update = req.body as TelegramUpdate;

  // Telegram Stars payments arrive as `pre_checkout_query` and `successful_payment`.
  if (update.pre_checkout_query) {
    // TODO: call answerPreCheckoutQuery to confirm or reject
  }

  if (update.message?.successful_payment) {
    // TODO: fulfill ticket — payment.invoice_payload should encode the cart reference
  }

  // Standard message handling
  if (update.message?.text === '/start') {
    // TODO: send welcome + Mini App button (web_app inline keyboard)
  }

  res.json({ ok: true });
});

// Minimal Telegram update shape
interface TelegramUpdate {
  update_id?: number;
  message?: {
    text?: string;
    chat: { id: number };
    from?: { id: number; first_name: string };
    successful_payment?: { invoice_payload: string; total_amount: number; currency: string };
  };
  pre_checkout_query?: { id: string; invoice_payload: string };
  callback_query?: { id: string; data: string };
}
