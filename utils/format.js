export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const formatPrice = (n) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: CURRENCY === 'XOF' ? 0 : 2,
  }).format(Number(n) || 0);

export const slugify = (s = '') =>
  s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Stock total : somme des variantes actives, sinon stock du produit. */
export const stockOf = (p) =>
  p.variants?.length ? p.variants.reduce((s, v) => s + (v.active === false ? 0 : v.stock), 0) : p.stock;

export const discountPct = (p) =>
  p.old_price && Number(p.old_price) > Number(p.price) ? Math.round((1 - p.price / p.old_price) * 100) : 0;

export const ORDER_STATUSES = ['Nouvelle', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'];
export const CONDITIONS = { neuf: 'Neuf', reconditionne: 'Reconditionné', occasion: 'Occasion' };
export const STATUS_STYLE = {
  'Nouvelle': 'bg-blue-100 text-blue-700',
  'Confirmée': 'bg-indigo-100 text-indigo-700',
  'En préparation': 'bg-amber-100 text-amber-700',
  'Expédiée': 'bg-cyan-100 text-cyan-700',
  'Livrée': 'bg-emerald-100 text-emerald-700',
  'Annulée': 'bg-red-100 text-red-700',
};
