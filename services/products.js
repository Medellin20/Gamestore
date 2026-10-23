import { supabaseServer } from '@/lib/supabase/server';
import { stockOf } from '@/utils/format';
import { DEFAULT_SETTINGS } from '@/services/settings';

const SELECT =
  '*, category:categories(id,name,slug), images:product_images(id,url,is_primary,position), variants:product_variants(*)';

function normalize(p) {
  const images = [...(p.images || [])].sort((a, b) => (b.is_primary - a.is_primary) || (a.position - b.position));
  const variants = [...(p.variants || [])].filter((v) => v.active).sort((a, b) => a.name.localeCompare(b.name));
  return { ...p, images, variants, image: images[0]?.url || null };
}

export async function getProducts(f = {}) {
  const sb = supabaseServer();
  let q = sb.from('products').select(SELECT).eq('active', true);
  if (f.q) {
    const t = f.q.replace(/[%,()*]/g, ' ').trim();
    if (t) q = q.or(`name.ilike.%${t}%,brand.ilike.%${t}%,description.ilike.%${t}%`);
  }
  if (f.category) {
    const { data: c } = await sb.from('categories').select('id').eq('slug', f.category).maybeSingle();
    if (!c) return [];
    q = q.eq('category_id', c.id);
  }
  if (f.brand) q = q.eq('brand', f.brand);
  if (f.min) q = q.gte('price', f.min);
  if (f.max) q = q.lte('price', f.max);
  if (f.featured) q = q.eq('featured', true);
  if (f.exclude) q = q.neq('id', f.exclude);
  if (f.sort === 'price_asc') q = q.order('price', { ascending: true });
  else if (f.sort === 'price_desc') q = q.order('price', { ascending: false });
  else q = q.order('created_at', { ascending: false });
  if (f.limit && !f.inStock && !f.promo) q = q.limit(f.limit);

  const { data, error } = await q;
  if (error) { console.error('getProducts', error.message); return []; }
  let list = data.map(normalize);
  if (f.inStock) list = list.filter((p) => stockOf(p) > 0);
  if (f.promo) list = list.filter((p) => p.old_price && Number(p.old_price) > Number(p.price));
  return f.limit ? list.slice(0, f.limit) : list;
}

export async function getProduct(slug) {
  const { data, error } = await supabaseServer().from('products').select(SELECT)
    .eq('slug', slug).eq('active', true).maybeSingle();
  if (error) console.error('getProduct', error.message);
  return data ? normalize(data) : null;
}

export const getSimilarProducts = (p) =>
  getProducts({ category: p.category?.slug, exclude: p.id, limit: 4 });

export async function getCategories() {
  const { data } = await supabaseServer().from('categories').select('*').order('name');
  return data || [];
}

export async function getBrands() {
  const { data } = await supabaseServer().from('products').select('brand').eq('active', true).not('brand', 'is', null);
  return [...new Set((data || []).map((d) => d.brand).filter(Boolean))].sort();
}

export async function getSettings() {
  const { data } = await supabaseServer().from('store_settings').select('value').eq('key', 'general').maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data?.value || {}) };
}
