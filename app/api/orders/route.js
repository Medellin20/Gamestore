import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getPaymentProvider } from '@/services/payments';

export const dynamic = 'force-dynamic';
const str = (v, max = 300) => String(v ?? '').trim().slice(0, max);

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Requête invalide' }, { status: 400 }); }

  const c = body.customer || {};
  const customer = {
    full_name: str(c.full_name, 120), email: str(c.email, 160).toLowerCase(), phone: str(c.phone, 40),
    address: str(c.address, 250), city: str(c.city, 100), postal_code: str(c.postal_code, 20),
  };
  if (!customer.full_name || !/^\S+@\S+\.\S+$/.test(customer.email) || !customer.phone || !customer.address || !customer.city) {
    return NextResponse.json({ error: 'Veuillez remplir tous les champs obligatoires.' }, { status: 400 });
  }
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 50).map((i) => ({
    product_id: str(i.product_id, 40), variant_id: i.variant_id ? str(i.variant_id, 40) : null, quantity: Math.floor(Number(i.quantity)),
  }));
  if (!items.length || items.some((i) => !i.product_id || !(i.quantity >= 1))) {
    return NextResponse.json({ error: 'Panier invalide' }, { status: 400 });
  }

  try {
    const method = 'cash_on_delivery'; // remplacé par le prestataire choisi quand le paiement en ligne sera activé
    const { data, error } = await supabaseAdmin().rpc('create_order', {
      p_customer: customer, p_items: items, p_notes: str(body.notes, 500) || null, p_payment_method: method,
    });
    if (error) {
      const userError = error.code === 'P0001';
      if (!userError) console.error('create_order', error);
      return NextResponse.json({ error: userError ? error.message : 'Impossible d’enregistrer la commande' }, { status: userError ? 409 : 500 });
    }
    const checkout = await getPaymentProvider(method).createCheckout({ order: data, customer });
    return NextResponse.json({ order: data, redirectUrl: checkout.redirectUrl });
  } catch (e) {
    console.error('POST /api/orders', e);
    return NextResponse.json({ error: 'Erreur serveur, réessayez dans un instant.' }, { status: 500 });
  }
}
