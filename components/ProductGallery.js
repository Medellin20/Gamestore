'use client';
import { useState } from 'react';
import ProductImage from './ProductImage';

export default function ProductGallery({ images, name }) {
  const [i, setI] = useState(0);
  const list = images.length ? images : [{ url: null }];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-100">
        <ProductImage key={list[i].url} src={list[i].url} alt={name} priority sizes="(max-width:1024px) 100vw, 50vw" className="animate-pop" />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {list.map((img, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`Image ${idx + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 sm:h-20 sm:w-20 ${idx === i ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <ProductImage src={img.url} alt="" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
