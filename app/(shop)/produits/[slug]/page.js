import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/ProductGallery';
import ProductPurchase from '@/components/ProductPurchase';
import ProductCard from '@/components/ProductCard';
import { getProduct, getSimilarProducts } from '@/services/products';
import { SITE_URL, stockOf, CURRENCY } from '@/utils/format';

export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug);
  if (!p) return { title: 'Produit introuvable' };
  const description = (p.description || `${p.name} chez GameStore`).replace(/\s+/g, ' ').slice(0, 160);
  return {
    title: p.name, description,
    alternates: { canonical: `/produits/${p.slug}` },
    openGraph: { title: p.name, description, images: p.image ? [p.image] : [] },
    twitter: { card: 'summary_large_image', title: p.name, description, images: p.image ? [p.image] : [] },
  };
}

export default async function ProductPage({ params }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();
  const similar = await getSimilarProducts(p);
  const specs = Object.entries(p.specs || {});
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description,
    image: p.images.map((i) => i.url), brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    offers: {
      '@type': 'Offer', priceCurrency: CURRENCY, price: p.price, url: `${SITE_URL}/produits/${p.slug}`,
      availability: stockOf(p) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
  return (
    <div className="container-x py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-sm text-black/50">
        <Link href="/produits" className="hover:text-black">Catalogue</Link>
        {p.category && <> / <Link href={`/produits?categorie=${p.category.slug}`} className="hover:text-black">{p.category.name}</Link></>}
      </nav>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={p.images} name={p.name} />
        <div>
          {p.brand && <p className="text-sm text-black/50">{p.brand}</p>}
          <h1 className="mb-5 mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{p.name}</h1>
          <ProductPurchase product={p} />
          {p.description && (
            <div className="mt-10">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-black/70">{p.description}</p>
            </div>
          )}
          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-semibold">Caractéristiques</h2>
              <dl className="card divide-y divide-black/5 text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-4 px-4 py-3"><dt className="text-black/50">{k}</dt><dd className="col-span-2">{String(v)}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Produits similaires</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{similar.map((s) => <ProductCard key={s.id} product={s} />)}</div>
        </section>
      )}
    </div>
  );
}
