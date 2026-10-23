'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { placeOrder } from '@/services/orders';
import { formatPrice } from '@/utils/format';

const EMPTY = { full_name: '', email: '', phone: '', address: '', city: '', postal_code: '' };

export default function CheckoutPage() {
  const { items, ready, total, clear } = useCart();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await placeOrder({ customer: form, items, notes, payment_method: 'cash_on_delivery' });
      if (res.redirectUrl) { window.location.href = res.redirectUrl; return; }
      clear(); setDone(res.order);
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="container-x animate-pop py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-600">✓</div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Commande n°{done.number} enregistrée</h1>
        <p className="mx-auto mt-2 max-w-md text-black/60">Merci ! Nous vous contactons très vite pour confirmer la livraison. Total : {formatPrice(done.total)}.</p>
        <Link href="/produits" className="btn-primary mt-8">Continuer mes achats</Link>
      </div>
    );
  }
  if (!ready) return <div className="container-x py-16"><div className="h-40 animate-pulse rounded-3xl bg-black/5" /></div>;
  if (!items.length) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Votre panier est vide</h1>
        <Link href="/produits" className="btn-primary mt-8">Voir le catalogue</Link>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="container-x grid gap-8 py-10 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <h1 className="text-3xl font-semibold tracking-tight">Commande</h1>
        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">Vos informations</h2>
          <div className="sm:col-span-2"><label className="label">Nom complet</label><input className="input" required autoComplete="name" {...f('full_name')} /></div>
          <div><label className="label">Email</label><input className="input" type="email" required autoComplete="email" {...f('email')} /></div>
          <div><label className="label">Téléphone</label><input className="input" type="tel" required autoComplete="tel" {...f('phone')} /></div>
          <div className="sm:col-span-2"><label className="label">Adresse de livraison</label><input className="input" required autoComplete="street-address" {...f('address')} /></div>
          <div><label className="label">Ville</label><input className="input" required autoComplete="address-level2" {...f('city')} /></div>
          <div><label className="label">Code postal (optionnel)</label><input className="input" autoComplete="postal-code" {...f('postal_code')} /></div>
          <div className="sm:col-span-2"><label className="label">Note pour la livraison (optionnel)</label><textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </section>
        <section className="card p-6">
          <h2 className="font-semibold">Paiement</h2>
          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-600 bg-brand-600/5 p-4 text-sm">
            <input type="radio" checked readOnly /> Paiement à la livraison
          </label>
          <p className="mt-3 text-xs text-black/45">Le paiement par carte (Stripe, PayPal, SumUp) pourra être activé plus tard sans changer cette page.</p>
        </section>
      </div>
      <aside className="card h-fit p-6 lg:sticky lg:top-28">
        <h2 className="font-semibold">Récapitulatif</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3">
              <span className="min-w-0"><span className="line-clamp-1">{i.quantity} × {i.name}</span>{i.label && <span className="block text-xs text-black/45">{i.label}</span>}</span>
              <span className="shrink-0">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-black/5 pt-4 text-base font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
        <button className="btn-primary mt-6 w-full py-3.5" disabled={busy}>{busy ? 'Envoi…' : 'Confirmer la commande'}</button>
        <p className="mt-3 text-center text-xs text-black/45">Les prix et le stock sont revérifiés à la validation.</p>
      </aside>
    </form>
  );
}
