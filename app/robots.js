import { SITE_URL } from '@/utils/format';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/panier', '/commande'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
