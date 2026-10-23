'use client';
import { useRef } from 'react';
import { StarIcon, SwapIcon, TrashIcon, UploadIcon } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { resizeImage } from '@/services/admin';

const MAX = 10 * 1024 * 1024;

/** images: [{key,id?,url,path?,file?,primary}] — `removed` collecte les images existantes à supprimer au Enregistrer. */
export default function ImageManager({ images, setImages, removed, setRemoved }) {
  const toast = useToast();
  const input = useRef(null);
  const replaceInput = useRef(null);
  const replaceKey = useRef(null);

  async function prepare(files) {
    const out = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} n’est pas une image`); continue; }
      const file = await resizeImage(f);
      if (file.size > MAX) { toast.error(`${f.name} dépasse 10 Mo`); continue; }
      out.push({ key: crypto.randomUUID(), file, url: URL.createObjectURL(file), primary: false });
    }
    return out;
  }
  async function onAdd(e) {
    const added = await prepare([...e.target.files]);
    e.target.value = '';
    if (!added.length) return;
    const next = [...images, ...added];
    if (!next.some((i) => i.primary)) next[0].primary = true;
    setImages(next);
  }
  async function onReplace(e) {
    const [img] = await prepare([...e.target.files]);
    e.target.value = '';
    if (!img) return;
    const old = images.find((i) => i.key === replaceKey.current);
    if (old?.id) setRemoved([...removed, old]);
    setImages(images.map((i) => (i.key === replaceKey.current ? { ...img, primary: old.primary } : i)));
  }
  const remove = (img) => {
    if (img.id) setRemoved([...removed, img]);
    const next = images.filter((i) => i.key !== img.key);
    if (next.length && !next.some((i) => i.primary)) next[0] = { ...next[0], primary: true };
    setImages(next);
  };
  const setPrimary = (key) => setImages(images.map((i) => ({ ...i, primary: i.key === key })));
  const move = (idx, dir) => {
    const n = [...images]; const j = idx + dir;
    if (j < 0 || j >= n.length) return;
    [n[idx], n[j]] = [n[j], n[idx]]; setImages(n);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, idx) => (
          <div key={img.key} className={`group relative overflow-hidden rounded-2xl border-2 ${img.primary ? 'border-brand-600' : 'border-black/10'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="aspect-square w-full object-cover" />
            {img.primary && <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white">Principale</span>}
            {img.file && <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-medium text-white">Nouvelle</span>}
            <div className="flex items-center justify-between gap-1 bg-white p-1.5">
              <button type="button" title="Définir comme principale" onClick={() => setPrimary(img.key)} className={`rounded-lg p-2 hover:bg-black/5 ${img.primary ? 'text-brand-600' : ''}`}><StarIcon className="h-4 w-4" /></button>
              <button type="button" title="Remplacer" onClick={() => { replaceKey.current = img.key; replaceInput.current.click(); }} className="rounded-lg p-2 hover:bg-black/5"><SwapIcon className="h-4 w-4" /></button>
              <button type="button" title="Déplacer à gauche" onClick={() => move(idx, -1)} className="rounded-lg px-2 py-1 text-sm hover:bg-black/5">‹</button>
              <button type="button" title="Déplacer à droite" onClick={() => move(idx, 1)} className="rounded-lg px-2 py-1 text-sm hover:bg-black/5">›</button>
              <button type="button" title="Supprimer" onClick={() => remove(img)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><TrashIcon className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => input.current.click()}
          className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-black/15 text-sm text-black/50 transition hover:border-brand-500 hover:text-brand-600">
          <span className="flex flex-col items-center gap-2"><UploadIcon className="h-6 w-6" />Ajouter des photos</span>
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={onAdd} />
      <input ref={replaceInput} type="file" accept="image/*" hidden onChange={onReplace} />
      <p className="mt-2 text-xs text-black/45">Depuis un téléphone, choisissez la galerie ou l’appareil photo. Les grandes photos sont réduites automatiquement. 10 Mo max par image.</p>
    </div>
  );
}
