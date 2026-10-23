'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import ProductImage from '@/components/ProductImage';
import { MinusIcon, PlusIcon, TrashIcon } from '@/components/ui/Icons';
import { formatPrice } from '@/utils/format';

export default function CartPage() {
  const { items, ready, total, count, setQty, remove } = useCart();
  if (!ready) return <div className="container-x py-16"><div className="h-40 animate-pulse rounded-3xl bg-black/5" /></div>;
  if (!items.length) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Votre panier est vide</h1>
        <p className="mt-2 text-black/55">Ajoutez un produit pour commencer.</p>
        <Link href="/produits" className="btn-primary mt-8">Voir le catalogue</Link>
      </div>
    );
  }
  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Panier <span className="text-black/40">({count})</span></h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-3 lg:col-span-2">
          {items.map((i) => (
            <li key={i.key} className="card flex gap-4 p-3 sm:p-4">
              <Link href={`/produits/${i.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                <ProductImage src={i.image} alt={i.name} sizes="96px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/produits/${i.slug}`} className="line-clamp-2 font-medium hover:underline">{i.name}</Link>
                {i.label && <p className="text-sm text-black/50">{i.label}</p>}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-full border border-black/10">
                    <button className="p-2.5 disabled:opacity-30" disabled={i.quantity <= 1} onClick={() => setQty(i.key, i.quantity - 1)} aria-label="Moins"><MinusIcon className="h-4 w-4" /></button>
                    <span className="w-7 text-center text-sm">{i.quantity}</span>
                    <button className="p-2.5 disabled:opacity-30" disabled={i.quantity >= i.max} onClick={() => setQty(i.key, i.quantity + 1)} aria-label="Plus"><PlusIcon className="h-4 w-4" /></button>
                  </div>
                  <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
                </div>
              </div>
              <button onClick={() => remove(i.key)} className="self-start p-2 text-black/40 hover:text-red-600" aria-label="Retirer"><TrashIcon /></button>
            </li>
          ))}
        </ul>
        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="font-semibold">Récapitulatif</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-black/55">Sous-total</dt><dd>{formatPrice(total)}</dd></div>
            <div className="flex justify-between"><dt className="text-black/55">Livraison</dt><dd>Calculée à la confirmation</dd></div>
            <div className="flex justify-between border-t border-black/5 pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
          <Link href="/commande" className="btn-primary mt-6 w-full py-3.5">Passer la commande</Link>
        </aside>
      </div>
    </div>
  );
}
