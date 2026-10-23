'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductFilters({ categories, brands }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(sp.get('q') || '');
  const [min, setMin] = useState(sp.get('min') || '');
  const [max, setMax] = useState(sp.get('max') || '');
  useEffect(() => { setQ(sp.get('q') || ''); setMin(sp.get('min') || ''); setMax(sp.get('max') || ''); }, [sp]);

  const set = (patch) => {
    const n = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    router.push(`${path}?${n.toString()}`, { scroll: false });
  };
  const cat = sp.get('categorie') || '';
  const pill = (active) => `rounded-full px-3.5 py-1.5 text-sm transition ${active ? 'bg-ink text-white' : 'bg-white border border-black/10 hover:bg-black/5'}`;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <form className="flex-1" onSubmit={(e) => { e.preventDefault(); set({ q: q.trim() }); }}>
          <input className="input" placeholder="Rechercher (nom, marque…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Recherche" />
        </form>
        <button className="btn-ghost lg:hidden" onClick={() => setOpen(!open)}>Filtres</button>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button className={pill(!cat)} onClick={() => set({ categorie: '' })}>Tout</button>
        {categories.map((c) => <button key={c.id} className={pill(cat === c.slug)} onClick={() => set({ categorie: c.slug })}>{c.name}</button>)}
      </div>
      <div className={`${open ? 'grid' : 'hidden'} animate-pop gap-3 rounded-3xl border border-black/5 bg-white p-4 sm:grid-cols-2 lg:grid lg:grid-cols-6`}>
        <div>
          <label className="label">Marque</label>
          <select className="input" value={sp.get('marque') || ''} onChange={(e) => set({ marque: e.target.value })}>
            <option value="">Toutes</option>{brands.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Prix min</label>
          <input className="input" type="number" min="0" value={min} onChange={(e) => setMin(e.target.value)} onBlur={() => set({ min })} onKeyDown={(e) => e.key === 'Enter' && set({ min })} />
        </div>
        <div>
          <label className="label">Prix max</label>
          <input className="input" type="number" min="0" value={max} onChange={(e) => setMax(e.target.value)} onBlur={() => set({ max })} onKeyDown={(e) => e.key === 'Enter' && set({ max })} />
        </div>
        <div>
          <label className="label">Trier par</label>
          <select className="input" value={sp.get('tri') || ''} onChange={(e) => set({ tri: e.target.value })}>
            <option value="">Nouveautés</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm"><input type="checkbox" checked={sp.get('stock') === '1'} onChange={(e) => set({ stock: e.target.checked ? '1' : '' })} /> En stock</label>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm"><input type="checkbox" checked={sp.get('promo') === '1'} onChange={(e) => set({ promo: e.target.checked ? '1' : '' })} /> En promotion</label>
      </div>
    </div>
  );
}
