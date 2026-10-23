'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

const NAV = [
  ['/admin', 'Tableau de bord'], ['/admin/produits', 'Produits'], ['/admin/commandes', 'Commandes'],
  ['/admin/categories', 'Catégories'], ['/admin/parametres', 'Paramètres'],
];

export default function AdminShell({ email, children }) {
  const path = usePathname();
  const router = useRouter();
  const logout = async () => { await supabaseBrowser().auth.signOut(); router.replace('/admin/login'); router.refresh(); };
  const active = (href) => (href === '/admin' ? path === href : path.startsWith(href));
  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="border-b border-black/5 bg-ink text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-0">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
          <Link href="/admin" className="text-lg font-semibold">Admin</Link>
          <p className="hidden truncate text-xs text-white/45 lg:mt-1 lg:block">{email}</p>
          <button onClick={logout} className="text-sm text-white/60 hover:text-white lg:hidden">Déconnexion</button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm transition ${active(href) ? 'bg-white text-ink font-medium' : 'text-white/70 hover:bg-white/10'}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 hidden space-y-1 px-3 text-sm lg:block">
          <Link href="/" target="_blank" className="block rounded-xl px-3.5 py-2.5 text-white/60 hover:bg-white/10">Voir la boutique</Link>
          <button onClick={logout} className="w-full rounded-xl px-3.5 py-2.5 text-left text-white/60 hover:bg-white/10">Déconnexion</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
