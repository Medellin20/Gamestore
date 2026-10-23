'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { useToast } from './ui/Toast';
import { MinusIcon, PlusIcon } from './ui/Icons';
import { CONDITIONS, discountPct, formatPrice } from '@/utils/format';

const ATTRS = [['color', 'Couleur'], ['capacity', 'Capacité'], ['model', 'Modèle'], ['condition', 'État']];
const attrsOf = (v) => Object.fromEntries(ATTRS.map(([a]) => [a, v[a] || null]));

export default function ProductPurchase({ product: p }) {
  const { add } = useCart();
  const toast = useToast();
  const vs = p.variants;
  const [sel, setSel] = useState(() => (vs[0] ? attrsOf(vs[0]) : {}));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = vs.length ? vs.find((v) => ATTRS.every(([a]) => (v[a] || null) === (sel[a] || null))) : null;
  const price = variant?.price ?? p.price;
  const stock = vs.length ? variant?.stock ?? 0 : p.stock;
  const pct = discountPct({ price, old_price: variant ? null : p.old_price });
  const label = (a, val) => (a === 'condition' ? CONDITIONS[val] : val);

  const pick = (attr, val) => {
    const cands = vs.filter((v) => v[attr] === val);
    const best = cands.find((v) => ATTRS.every(([a]) => a === attr || !sel[a] || v[a] === sel[a])) || cands[0];
    setSel(attrsOf(best)); setQty(1);
  };
  const addToCart = () => {
    add({
      key: `${p.id}:${variant?.id || ''}`, product_id: p.id, variant_id: variant?.id || null, slug: p.slug,
      name: p.name, label: variant?.name || null, price: Number(price), image: p.image, max: stock,
    }, qty);
    toast.success('Ajouté au panier');
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold tracking-tight">{formatPrice(price)}</span>
        {!variant && pct > 0 && (<><span className="text-lg text-black/40 line-through">{formatPrice(p.old_price)}</span><span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">−{pct}%</span></>)}
      </div>

      {ATTRS.map(([a, title]) => {
        const values = [...new Set(vs.map((v) => v[a]).filter(Boolean))];
        if (!values.length) return null;
        return (
          <div key={a}>
            <p className="mb-2 text-sm font-medium">{title} : <span className="text-black/55">{label(a, sel[a])}</span></p>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => (
                <button key={val} onClick={() => pick(a, val)} aria-pressed={sel[a] === val}
                  className={`rounded-full border px-4 py-2 text-sm transition ${sel[a] === val ? 'border-brand-600 bg-brand-600/5 font-medium text-brand-700 ring-2 ring-brand-600/20' : 'border-black/10 bg-white hover:border-black/30'}`}>
                  {label(a, val)}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <p className={`text-sm font-medium ${stock > 0 ? (stock <= 3 ? 'text-amber-600' : 'text-emerald-600') : 'text-red-600'}`}>
        {stock > 0 ? (stock <= 3 ? `Dernières pièces : ${stock} en stock` : 'En stock') : 'Rupture de stock'}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-black/10 bg-white">
          <button className="p-3 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty(qty - 1)} aria-label="Moins"><MinusIcon className="h-4 w-4" /></button>
          <span className="w-8 text-center text-sm font-medium">{qty}</span>
          <button className="p-3 disabled:opacity-30" disabled={qty >= stock} onClick={() => setQty(qty + 1)} aria-label="Plus"><PlusIcon className="h-4 w-4" /></button>
        </div>
        <button className="btn-primary flex-1 py-3.5 sm:flex-none sm:px-10" disabled={stock <= 0} onClick={addToCart}>
          {added ? 'Ajouté ✓' : 'Ajouter au panier'}
        </button>
      </div>
      <Link href="/panier" className="inline-block text-sm text-brand-600 hover:underline">Voir mon panier</Link>
    </div>
  );
}
