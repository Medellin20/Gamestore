import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/services/payments';

/** Point d'entrée des webhooks de paiement (Stripe, PayPal, SumUp). À compléter dans services/payments.js. */
export async function POST(req, { params }) {
  try {
    const result = await getPaymentProvider(params.provider).handleWebhook(req);
    return NextResponse.json(result ?? { received: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 501 });
  }
}
