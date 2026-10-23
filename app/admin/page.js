'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { STATUS_STYLE, formatPrice, stockOf } from '@/utils/format';

const PENDING = ['Nouvelle', 'Confirmée', 'En préparation'];

function Stat({ label, value, tone = '' }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-black/50">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${tone}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    const sb = supabaseBrowser();
    Promise.all([
      sb.from('products').select('id,active,stock,variants:product_variants(stock,active)'),
      sb.from('orders').select('id,order_number,status,total,created_at,customer:customers(full_name)').order('created_at', { ascending: false }).limit(1000),
    ]).then(([p, o]) => setD({ products: p.data || [], orders: o.data || [], error: p.error || o.error }));
  }, []);

  if (!d) return <div className="h-64 animate-pulse rounded-3xl bg-black/5" />;
  const active = d.products.filter((p) => p.active);
  const orders = d.orders;
  const revenue = orders.filter((o) => o.status !== 'Annulée').reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>
      {d.error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Erreur de chargement : {d.error.message}</p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Produits" value={d.products.length} />
        <Stat label="En stock" value={active.filter((p) => stockOf(p) > 0).length} tone="text-emerald-600" />
        <Stat label="Ruptures de stock" value={active.filter((p) => stockOf(p) <= 0).length} tone="text-red-600" />
        <Stat label="Chiffre d’affaires" value={formatPrice(revenue)} />
        <Stat label="Commandes reçues" value={orders.length} />
        <Stat label="En attente" value={orders.filter((o) => PENDING.includes(o.status)).length} tone="text-amber-600" />
        <Stat label="Terminées" value={orders.filter((o) => o.status === 'Livrée').length} />
        <Stat label="Annulées" value={orders.filter((o) => o.status === 'Annulée').length} />
      </div>
      <p className="-mt-4 text-xs text-black/40">Chiffre d’affaires : commandes non annulées.</p>
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between p-5"><h2 className="font-semibold">Dernières commandes</h2><Link href="/admin/commandes" className="text-sm text-brand-600 hover:underline">Tout voir</Link></div>
        {orders.length === 0 ? <p className="p-8 pt-0 text-sm text-black/50">Aucune commande pour le moment.</p> : (
          <ul className="divide-y divide-black/5">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <span className="font-medium">#{o.order_number} <span className="font-normal text-black/50">· {o.customer?.full_name || '—'}</span></span>
                <span className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLE[o.status]}`}>{o.status}</span><span className="w-24 text-right font-medium">{formatPrice(o.total)}</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
