import { supabaseServer } from '@/lib/supabase/server';
import { SITE_URL } from '@/utils/format';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const sb = supabaseServer();
  const [{ data: products }, { data: cats }] = await Promise.all([
    sb.from('products').select('slug,updated_at').eq('active', true),
    sb.from('categories').select('slug'),
  ]);
  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/produits`, changeFrequency: 'daily', priority: 0.9 },
    ...(cats || []).map((c) => ({ url: `${SITE_URL}/produits?categorie=${c.slug}`, changeFrequency: 'weekly', priority: 0.7 })),
    ...(products || []).map((p) => ({ url: `${SITE_URL}/produits/${p.slug}`, lastModified: p.updated_at, changeFrequency: 'weekly', priority: 0.8 })),
  ];
}
