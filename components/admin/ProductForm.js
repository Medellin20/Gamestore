'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { saveProduct } from '@/services/admin';
import { useToast } from '@/components/ui/Toast';
import { BackIcon, PlusIcon, TrashIcon } from '@/components/ui/Icons';
import ImageManager from './ImageManager';
import { CONDITIONS, slugify } from '@/utils/format';

const Field = ({ label, children, className = '' }) => (
  <div className={className}><label className="label">{label}</label>{children}</div>
);

export default function ProductForm({ product, categories, onClose, onSaved }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [f, setF] = useState({
    name: product?.name || '', slug: product?.slug || '', brand: product?.brand || '', category_id: product?.category_id || '',
    price: product?.price ?? '', old_price: product?.old_price ?? '', stock: product?.stock ?? 0,
    condition: product?.condition || 'neuf', description: product?.description || '',
    featured: product?.featured || false, active: product?.active ?? true,
  });
  const [specs, setSpecs] = useState(Object.entries(product?.specs || {}).map(([k, v]) => ({ k, v })));
  const [variants, setVariants] = useState(product?.variants || []);
  const [removedVariantIds, setRemovedVariantIds] = useState([]);
  const [images, setImages] = useState(() =>
    [...(product?.images || [])].sort((a, b) => a.position - b.position)
      .map((i) => ({ key: i.id, id: i.id, url: i.url, path: i.path, primary: i.is_primary })));
  const [removedImages, setRemovedImages] = useState([]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setName = (e) => setF({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) });
  const upVariant = (i, k, v) => setVariants(variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  async function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return toast.error('Le nom est obligatoire');
    if (f.price === '' || Number(f.price) < 0) return toast.error('Prix invalide');
    if (f.old_price !== '' && Number(f.old_price) <= Number(f.price)) toast.info('L’ancien prix doit être supérieur au prix pour afficher une promotion');
    setBusy(true);
    try {
      await saveProduct(supabaseBrowser(), {
        product: { ...f, id: product?.id, specs: Object.fromEntries(specs.filter((s) => s.k.trim()).map((s) => [s.k.trim(), s.v])) },
        variants, removedVariantIds, images, removedImages,
      });
      toast.success(product ? 'Produit mis à jour' : 'Produit créé');
      onSaved();
    } catch (err) {
      toast.error(err.code === '23505' ? 'Ce slug existe déjà, modifiez-le' : err.message || 'Enregistrement impossible');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onClose} className="btn-ghost p-2.5" aria-label="Retour"><BackIcon className="h-4 w-4" /></button>
        <h1 className="text-2xl font-semibold tracking-tight">{product ? 'Modifier le produit' : 'Nouveau produit'}</h1>
      </div>

      <section className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Nom *" className="sm:col-span-2"><input className="input" required value={f.name} onChange={setName} /></Field>
        <Field label="Slug (URL)"><input className="input" value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} /></Field>
        <Field label="Marque"><input className="input" value={f.brand} onChange={set('brand')} placeholder="Apple, Sony…" /></Field>
        <Field label="Catégorie">
          <select className="input" value={f.category_id} onChange={set('category_id')}>
            <option value="">— Aucune —</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="État">
          <select className="input" value={f.condition} onChange={set('condition')}>{Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </Field>
        <Field label="Prix *"><input className="input" type="number" step="0.01" min="0" required value={f.price} onChange={set('price')} /></Field>
        <Field label="Ancien prix (promotion)"><input className="input" type="number" step="0.01" min="0" value={f.old_price} onChange={set('old_price')} /></Field>
        <Field label={variants.length ? 'Stock (ignoré : géré par les variantes)' : 'Stock'}><input className="input" type="number" min="0" disabled={variants.length > 0} value={f.stock} onChange={set('stock')} /></Field>
        <div className="flex items-end gap-6 pb-2.5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.active} onChange={set('active')} /> Actif (visible)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={set('featured')} /> Mis en avant</label>
        </div>
        <Field label="Description" className="sm:col-span-2"><textarea className="input" rows={5} value={f.description} onChange={set('description')} /></Field>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-1 font-semibold">Photos</h2>
        <p className="mb-4 text-sm text-black/50">L’image principale s’affiche sur les cartes produit.</p>
        <ImageManager images={images} setImages={setImages} removed={removedImages} setRemoved={setRemovedImages} />
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="font-semibold">Variantes</h2><p className="text-sm text-black/50">Couleur, capacité, modèle, état. Chaque variante a son stock et peut avoir son prix.</p></div>
          <button type="button" className="btn-ghost" onClick={() => setVariants([...variants, { color: '', capacity: '', model: '', condition: 'neuf', price: '', stock: 0, sku: '', active: true }])}><PlusIcon className="h-4 w-4" />Ajouter</button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={v.id || i} className="grid grid-cols-2 gap-3 rounded-2xl border border-black/10 p-3 md:grid-cols-4 lg:grid-cols-8">
              <input className="input" placeholder="Couleur" value={v.color || ''} onChange={(e) => upVariant(i, 'color', e.target.value)} />
              <input className="input" placeholder="Capacité" value={v.capacity || ''} onChange={(e) => upVariant(i, 'capacity', e.target.value)} />
              <input className="input" placeholder="Modèle" value={v.model || ''} onChange={(e) => upVariant(i, 'model', e.target.value)} />
              <select className="input" value={v.condition || ''} onChange={(e) => upVariant(i, 'condition', e.target.value)}>
                <option value="">État</option>{Object.entries(CONDITIONS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <input className="input" type="number" step="0.01" min="0" placeholder="Prix (opt.)" value={v.price ?? ''} onChange={(e) => upVariant(i, 'price', e.target.value)} />
              <input className="input" type="number" min="0" placeholder="Stock" value={v.stock} onChange={(e) => upVariant(i, 'stock', e.target.value)} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.active !== false} onChange={(e) => upVariant(i, 'active', e.target.checked)} />Active</label>
              <button type="button" className="btn-ghost text-red-600" onClick={() => { if (v.id) setRemovedVariantIds([...removedVariantIds, v.id]); setVariants(variants.filter((_, j) => j !== i)); }}><TrashIcon className="h-4 w-4" /></button>
            </div>
          ))}
          {!variants.length && <p className="text-sm text-black/45">Aucune variante : le produit utilise son prix et son stock.</p>}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Caractéristiques</h2>
          <button type="button" className="btn-ghost" onClick={() => setSpecs([...specs, { k: '', v: '' }])}><PlusIcon className="h-4 w-4" />Ajouter</button>
        </div>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" placeholder="Ex : Écran" value={s.k} onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} />
              <input className="input" placeholder="Ex : 6,1 pouces OLED" value={s.v} onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} />
              <button type="button" className="p-2 text-red-600" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} aria-label="Supprimer"><TrashIcon className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-end gap-2 border-t border-black/5 bg-white/90 p-4 backdrop-blur lg:left-64">
        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
        <button className="btn-primary px-8" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}
