import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { getBrands, getCategories, getProducts } from '@/services/products';

export async function generateMetadata({ searchParams }) {
  const cats = await getCategories();
  const c = cats.find((x) => x.slug === searchParams.categorie);
  return {
    title: c ? c.name : searchParams.q ? `Recherche : ${searchParams.q}` : 'Catalogue',
    description: c?.description || 'Tous nos iPhone, consoles, manettes et accessoires.',
    alternates: { canonical: c ? `/produits?categorie=${c.slug}` : '/produits' },
  };
}

export default async function ProductsPage({ searchParams: s }) {
  const [categories, brands, products] = await Promise.all([
    getCategories(), getBrands(),
    getProducts({
      q: s.q, category: s.categorie, brand: s.marque, sort: s.tri,
      min: Number(s.min) || undefined, max: Number(s.max) || undefined,
      inStock: s.stock === '1', promo: s.promo === '1',
    }),
  ]);
  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Catalogue</h1>
      <div className="mt-6"><ProductFilters categories={categories} brands={brands} /></div>
      <p className="mb-4 mt-6 text-sm text-black/50">{products.length} produit{products.length > 1 ? 's' : ''}</p>
      {products.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="font-semibold">Aucun produit ne correspond à votre recherche</p>
          <p className="mt-1 text-sm text-black/55">Essayez d’enlever un filtre ou de chercher un autre terme.</p>
        </div>
      )}
    </div>
  );
}
