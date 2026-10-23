'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { ORDER_STATUSES, STATUS_STYLE, formatPrice } from '@/utils/format';

export default function AdminOrders() {
  const sb = supabaseBrowser();
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await sb.from('orders').select('*, customer:customers(*), items:order_items(*)')
      .order('created_at', { ascending: false }).limit(300);
    if (error) toast.error(error.message);
    setOrders(data || []);
  }, [sb, toast]);
  useEffect(() => { load(); }, [load]);

  async function setStatus(o, status) {
    const { error } = await sb.from('orders').update({ status }).eq('id', o.id);
    if (error) return toast.error(error.message);
    setOrders(orders.map((x) => (x.id === o.id ? { ...x, status } : x)));
    toast.success(`Commande #${o.order_number} : ${status}`);
  }
  const list = (orders || []).filter((o) => !filter || o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Commandes</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous les statuts</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {!orders ? <div className="h-64 animate-pulse rounded-3xl bg-black/5" /> : !list.length ? (
        <div className="card p-12 text-center text-black/55">Aucune commande.</div>
      ) : (
        <div className="space-y-3">
          {list.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button className="min-w-0 flex-1 basis-48 text-left" onClick={() => setOpen(open === o.id ? null : o.id)}>
                  <p className="font-semibold">#{o.order_number} <span className="font-normal text-black/50">· {o.customer?.full_name || '—'}</span></p>
                  <p className="text-xs text-black/45">{new Date(o.created_at).toLocaleString('fr-FR')} · {o.items.length} article(s)</p>
                </button>
                <span className="font-semibold">{formatPrice(o.total)}</span>
                <select className={`rounded-full border-0 px-3 py-2 text-sm font-medium ${STATUS_STYLE[o.status]}`} value={o.status} onChange={(e) => setStatus(o, e.target.value)} aria-label="Statut">
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {open === o.id && (
                <div className="grid animate-pop gap-6 border-t border-black/5 bg-black/[.02] p-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="mb-2 font-semibold">Client</p>
                    <p>{o.customer?.full_name}</p>
                    <p className="text-black/60">{o.customer?.email} · {o.customer?.phone}</p>
                    <p className="text-black/60">{o.customer?.address}, {o.customer?.postal_code} {o.customer?.city}</p>
                    {o.notes && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-amber-800">Note : {o.notes}</p>}
                    <p className="mt-2 text-xs text-black/45">Paiement : {o.payment_method} ({o.payment_status})</p>
                  </div>
                  <div>
                    <p className="mb-2 font-semibold">Articles</p>
                    <ul className="space-y-1.5">
                      {o.items.map((i) => (
                        <li key={i.id} className="flex justify-between gap-3"><span>{i.quantity} × {i.product_name}{i.variant_label && <span className="text-black/50"> ({i.variant_label})</span>}</span><span>{formatPrice(i.unit_price * i.quantity)}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
