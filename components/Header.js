'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { CartIcon, MenuIcon, SearchIcon, XIcon } from './ui/Icons';

export default function Header({ storeName, announcement, categories }) {
  const { count } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const search = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/produits?q=${encodeURIComponent(q.trim())}` : '/produits');
    setOpen(false);
  };
  return (
    <header className="sticky top-0 z-40">
      {announcement && <div className="bg-ink px-4 py-2 text-center text-xs text-white/80">{announcement}</div>}
      <div className="border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center gap-4">
          <button className="-ml-2 p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <XIcon /> : <MenuIcon />}
          </button>
          <Link href="/" className="text-lg font-semibold tracking-tight">{storeName}</Link>
          <nav className="ml-6 hidden items-center gap-5 text-sm text-black/70 lg:flex">
            <Link href="/produits" className="hover:text-black">Tout</Link>
            {categories.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/produits?categorie=${c.slug}`} className="hover:text-black">{c.name}</Link>
            ))}
          </nav>
          <form onSubmit={search} className="relative ml-auto hidden w-64 md:block">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit"
              className="input rounded-full bg-black/[.04] pl-9" aria-label="Rechercher" />
          </form>
          <Link href="/panier" className="relative ml-auto p-2 md:ml-0" aria-label="Panier">
            <CartIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">{count}</span>
            )}
          </Link>
        </div>
        {open && (
          <div className="container-x animate-pop space-y-1 pb-4 lg:hidden">
            <form onSubmit={search} className="mb-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit" className="input" aria-label="Rechercher" />
            </form>
            <Link href="/produits" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 hover:bg-black/5">Tous les produits</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/produits?categorie=${c.slug}`} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 hover:bg-black/5">{c.name}</Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
