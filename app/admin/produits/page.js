'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { supabaseBrowser } from '@/lib/supabase/client';
import { deleteProduct } from '@/services/admin';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/ui/Icons';
import ProductForm from '@/components/admin/ProductForm';
import { formatPrice, stockOf } from '@/utils/format';

const SELECT = '*, category:categories(name), images:product_images(*), variants:product_variants(*)';

export default function AdminProducts() {
  const sb = supabaseBrowser();
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      sb.from('products').select(SELECT).order('created_at', { ascending: false }),
      sb.from('categories').select('*').order('name'),
    ]);
    if (p.error) toast.error(p.error.message);
    setProducts(p.data || []); setCategories(c.data || []);
  }, [sb, toast]);
  useEffect(() => { load(); }, [load]);

  async function toggle(p) {
    const { error } = await sb.from('products').update({ active: !p.active }).eq('id', p.id);
    if (error) return toast.error(error.message);
    setProducts(products.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x)));
    toast.success(p.active ? 'Produit désactivé' : 'Produit activé');
  }
  async function remove(p) {
    if (!(await confirm({ message: `Supprimer « ${p.name} » et ses photos ? Cette action est définitive.` }))) return;
    try { await deleteProduct(sb, p.id); toast.success('Produit supprimé'); load(); } catch (e) { toast.error(e.message); }
  }

  if (editing) {
    return <ProductForm product={editing === 'new' ? null : editing} categories={categories}
      onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />;
  }
  const list = (products || []).filter((p) => `${p.name} ${p.brand || ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      {dialog}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Produits</h1>
        <button className="btn-primary" onClick={() => setEditing('new')}><PlusIcon className="h-4 w-4" />Ajouter un produit</button>
      </div>
      <input className="input max-w-sm" placeholder="Rechercher un produit" value={q} onChange={(e) => setQ(e.target.value)} />
      {!products ? <div className="h-64 animate-pulse rounded-3xl bg-black/5" /> : !list.length ? (
        <div className="card p-12 text-center text-black/55">Aucun produit. Cliquez sur « Ajouter un produit » pour commencer.</div>
      ) : (
        <div className="card divide-y divide-black/5 overflow-hidden">
          {list.map((p) => {
            const img = [...p.images].sort((a, b) => b.is_primary - a.is_primary)[0];
            const stock = stockOf(p);
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">{img && <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />}</div>
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-black/50">{p.category?.name || 'Sans catégorie'}{p.featured && ' · Mis en avant'}</p>
                </div>
                <div className="w-24 text-sm font-medium">{formatPrice(p.price)}</div>
                <div className={`w-20 text-sm ${stock <= 0 ? 'font-medium text-red-600' : ''}`}>{stock <= 0 ? 'Rupture' : `${stock} en stock`}</div>
                <button onClick={() => toggle(p)} role="switch" aria-checked={p.active} aria-label="Actif"
                  className={`relative h-6 w-11 rounded-full transition ${p.active ? 'bg-emerald-500' : 'bg-black/20'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.active ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
                <div className="flex gap-1">
                  <button className="rounded-xl p-2.5 hover:bg-black/5" onClick={() => setEditing(p)} aria-label="Modifier"><EditIcon className="h-4 w-4" /></button>
                  <button className="rounded-xl p-2.5 text-red-600 hover:bg-red-50" onClick={() => remove(p)} aria-label="Supprimer"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
