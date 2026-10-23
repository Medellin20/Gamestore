import { slugify } from '@/utils/format';

const BUCKET = 'product-images';
const num = (v) => (v === '' || v == null ? null : Number(v));

export async function uploadImage(sb, productId, file) {
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000', upsert: false, contentType: file.type || 'image/jpeg',
  });
  if (error) throw error;
  return { path, url: sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

export async function saveProduct(sb, { product, variants, removedVariantIds, images, removedImages }) {
  const payload = {
    name: product.name.trim(),
    slug: slugify(product.slug || product.name),
    description: product.description || null,
    specs: product.specs || {},
    brand: product.brand?.trim() || null,
    category_id: product.category_id || null,
    price: Number(product.price),
    old_price: num(product.old_price),
    stock: Number(product.stock) || 0,
    condition: product.condition,
    featured: !!product.featured,
    active: !!product.active,
  };
  let id = product.id;
  if (id) {
    const { error } = await sb.from('products').update(payload).eq('id', id);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from('products').insert(payload).select('id').single();
    if (error) throw error;
    id = data.id;
  }

  // Variantes
  if (removedVariantIds.length) {
    const { error } = await sb.from('product_variants').delete().in('id', removedVariantIds);
    if (error) throw error;
  }
  const toRow = (v) => ({
    product_id: id,
    name: v.name?.trim() || [v.color, v.capacity, v.model].filter(Boolean).join(' · ') || 'Standard',
    color: v.color || null, capacity: v.capacity || null, model: v.model || null,
    condition: v.condition || null, price: num(v.price), stock: Number(v.stock) || 0,
    sku: v.sku || null, active: v.active !== false,
  });
  const existing = variants.filter((v) => v.id).map((v) => ({ id: v.id, ...toRow(v) }));
  const fresh = variants.filter((v) => !v.id).map(toRow);
  if (existing.length) { const { error } = await sb.from('product_variants').upsert(existing); if (error) throw error; }
  if (fresh.length) { const { error } = await sb.from('product_variants').insert(fresh); if (error) throw error; }

  // Images : suppression, upload, ordre, image principale
  if (removedImages.length) {
    const paths = removedImages.map((i) => i.path).filter(Boolean);
    if (paths.length) await sb.storage.from(BUCKET).remove(paths);
    const ids = removedImages.map((i) => i.id).filter(Boolean);
    if (ids.length) { const { error } = await sb.from('product_images').delete().in('id', ids); if (error) throw error; }
  }
  const saved = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (img.file) {
      const up = await uploadImage(sb, id, img.file);
      const { data, error } = await sb.from('product_images')
        .insert({ product_id: id, url: up.url, path: up.path, position: i, is_primary: false })
        .select('id').single();
      if (error) throw error;
      saved.push({ id: data.id, primary: img.primary });
    } else {
      await sb.from('product_images').update({ position: i }).eq('id', img.id);
      saved.push({ id: img.id, primary: img.primary });
    }
  }
  if (saved.length) {
    const main = saved.find((s) => s.primary) || saved[0];
    await sb.from('product_images').update({ is_primary: false }).eq('product_id', id);
    await sb.from('product_images').update({ is_primary: true }).eq('id', main.id);
  }
  return id;
}

export async function deleteProduct(sb, id) {
  const { data: imgs } = await sb.from('product_images').select('path').eq('product_id', id);
  const paths = (imgs || []).map((i) => i.path).filter(Boolean);
  if (paths.length) await sb.storage.from(BUCKET).remove(paths);
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) throw error;
}

/** Réduit les grosses photos de téléphone (max 1800 px, JPEG 85 %). */
export async function resizeImage(file, max = 1800) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bmp = await createImageBitmap(file);
    const ratio = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (ratio === 1 && file.size < 1.5e6) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * ratio);
    canvas.height = Math.round(bmp.height * ratio);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  } catch { return file; }
}
