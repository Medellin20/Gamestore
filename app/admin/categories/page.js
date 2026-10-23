'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { EditIcon, TrashIcon } from '@/components/ui/Icons';
import { slugify } from '@/utils/format';

const EMPTY = { id: null, name: '', slug: '', description: '' };

export default function AdminCategories() {
  const sb = supabaseBrowser();
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const [cats, setCats] = useState(null);
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb.from('categories').select('*, products(count)').order('name');
    if (error) toast.error(error.message);
    setCats(data || []);
  }, [sb, toast]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const row = { name: f.name.trim(), slug: slugify(f.slug || f.name), description: f.description || null };
    const { error } = f.id ? await sb.from('categories').update(row).eq('id', f.id) : await sb.from('categories').insert(row);
    setBusy(false);
    if (error) return toast.error(error.code === '23505' ? 'Ce slug existe déjà' : error.message);
    toast.success(f.id ? 'Catégorie mise à jour' : 'Catégorie créée');
    setF(EMPTY); load();
  }
  async function remove(c) {
    if (!(await confirm({ message: `Supprimer la catégorie « ${c.name} » ? Ses produits resteront, sans catégorie.` }))) return;
    const { error } = await sb.from('categories').delete().eq('id', c.id);
    if (error) return toast.error(error.message);
    toast.success('Catégorie supprimée'); load();
  }

  return (
    <div className="space-y-6">
      {dialog}
      <h1 className="text-3xl font-semibold tracking-tight">Catégories</h1>
      <form onSubmit={submit} className="card grid gap-3 p-5 sm:grid-cols-4">
        <div><label className="label">Nom *</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) })} /></div>
        <div><label className="label">Slug</label><input className="input" value={f.slug} onChange={(e) => setF({ ...f, slug: slugify(e.target.value) })} /></div>
        <div className="sm:col-span-2"><label className="label">Description</label><input className="input" value={f.description || ''} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="flex gap-2 sm:col-span-4">
          <button className="btn-primary" disabled={busy}>{f.id ? 'Mettre à jour' : 'Ajouter la catégorie'}</button>
          {f.id && <button type="button" className="btn-ghost" onClick={() => setF(EMPTY)}>Annuler</button>}
        </div>
      </form>
      {!cats ? <div className="h-40 animate-pulse rounded-3xl bg-black/5" /> : (
        <div className="card divide-y divide-black/5">
          {cats.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1"><p className="font-medium">{c.name} <span className="text-xs font-normal text-black/40">/{c.slug}</span></p><p className="truncate text-sm text-black/50">{c.description}</p></div>
              <span className="text-sm text-black/50">{c.products?.[0]?.count ?? 0} produit(s)</span>
              <button className="rounded-xl p-2.5 hover:bg-black/5" onClick={() => setF(c)} aria-label="Modifier"><EditIcon className="h-4 w-4" /></button>
              <button className="rounded-xl p-2.5 text-red-600 hover:bg-red-50" onClick={() => remove(c)} aria-label="Supprimer"><TrashIcon className="h-4 w-4" /></button>
            </div>
          ))}
          {!cats.length && <p className="p-8 text-center text-black/50">Aucune catégorie.</p>}
        </div>
      )}
    </div>
  );
}
