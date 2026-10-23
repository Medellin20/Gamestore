import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { getCategories, getProducts } from '@/services/products';

export const metadata = { title: { absolute: 'GameStore — iPhone, PS5, consoles et accessoires' } };

function Section({ title, href, children }) {
  return (
    <section className="container-x mt-20">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {href && <Link href={href} className="text-sm text-brand-600 hover:underline">Tout voir</Link>}
      </div>
      {children}
    </section>
  );
}
const Grid = ({ items }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
);

export default async function Home() {
  const [categories, featured, promos, latest] = await Promise.all([
    getCategories(), getProducts({ featured: true, limit: 4 }), getProducts({ promo: true, limit: 4 }), getProducts({ limit: 8 }),
  ]);
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <Image
          src="/hero-iphone-pro.png"
          alt=""
          width={593}
          height={215}
          priority
          sizes="(max-width: 640px) 100vw, 780px"
          className="absolute right-0 top-1/2 z-0 h-auto w-full max-w-[593px] -translate-y-1/2 object-contain object-right opacity-30 sm:max-w-[780px] sm:w-[68%] sm:opacity-55"
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/40" />
        <div className="pointer-events-none absolute -right-24 -top-24 z-20 h-[28rem] w-[28rem] animate-glow rounded-full bg-brand-500/50 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 z-20 h-80 w-80 animate-glow rounded-full bg-cyan-400/20 blur-[110px]" />
        <div className="container-x relative z-30 py-20 sm:py-28 lg:py-36">
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            iPhone, PS5 et tout ce qui va avec.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/65">
            Neuf ou reconditionné, chaque produit est testé et le stock affiché est le stock réel.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/produits" className="btn-light px-7 py-3.5">Voir le catalogue</Link>
            <Link href="/produits?promo=1" className="btn border border-white/20 px-7 py-3.5 text-white hover:bg-white/10">Promotions</Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-x -mt-8 relative">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link key={c.id} href={`/produits?categorie=${c.slug}`}
                className="card px-5 py-5 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-lg">
                {c.name}
                <span className="mt-1 line-clamp-1 block text-xs font-normal text-black/45">{c.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && <Section title="Sélection du moment" href="/produits"><Grid items={featured} /></Section>}
      {promos.length > 0 && <Section title="Promotions" href="/produits?promo=1"><Grid items={promos} /></Section>}
      <Section title="Derniers arrivages" href="/produits">
        {latest.length ? <Grid items={latest} /> : (
          <div className="card p-10 text-center text-black/55">Aucun produit pour le moment. Ajoutez-en depuis l’espace admin.</div>
        )}
      </Section>
    </>
  );
}
