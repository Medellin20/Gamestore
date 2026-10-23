import Link from 'next/link';

export default function Footer({ settings, categories }) {
  return (
    <footer className="mt-24 border-t border-black/5 bg-white">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">{settings.store_name}</p>
          <p className="mt-2 max-w-xs text-sm text-black/55">iPhone, PlayStation, consoles, manettes et accessoires. Produits vérifiés, stock réel, livraison suivie.</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Catalogue</p>
          <ul className="mt-3 space-y-2 text-sm text-black/60">
            {categories.map((c) => <li key={c.id}><Link href={`/produits?categorie=${c.slug}`} className="hover:text-black">{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-black/60">
            {settings.contact_phone && <li>{settings.contact_phone}</li>}
            {settings.contact_email && <li>{settings.contact_email}</li>}
            <li><Link href="/panier" className="hover:text-black">Mon panier</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 py-5 text-center text-xs text-black/40">© {new Date().getFullYear()} {settings.store_name}</div>
    </footer>
  );
}
