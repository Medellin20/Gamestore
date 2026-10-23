import Link from 'next/link';
import ProductImage from './ProductImage';
import { CONDITIONS, discountPct, formatPrice, stockOf } from '@/utils/format';

export default function ProductCard({ product: p }) {
  const stock = stockOf(p);
  const pct = discountPct(p);
  return (
    <Link href={`/produits/${p.slug}`} className="group card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <ProductImage src={p.image} alt={p.name} className="transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {pct > 0 && <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">−{pct}%</span>}
          {p.condition !== 'neuf' && !p.variants.length && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium backdrop-blur">{CONDITIONS[p.condition]}</span>
          )}
        </div>
        {stock <= 0 && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold backdrop-blur-[2px]">Rupture de stock</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-black/50">{p.brand || p.category?.name}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug">{p.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold">{formatPrice(p.price)}</span>
          {pct > 0 && <span className="text-sm text-black/40 line-through">{formatPrice(p.old_price)}</span>}
        </div>
        {stock > 0 && stock <= 3 && <p className="mt-1 text-xs font-medium text-amber-600">Plus que {stock} en stock</p>}
      </div>
    </Link>
  );
}
