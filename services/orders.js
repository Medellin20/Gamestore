/** Envoi d'une commande à l'API serveur (qui utilise la clé service role). */
export async function placeOrder({ customer, items, notes, payment_method }) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer, notes, payment_method, items: items.map((i) => ({
      product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity,
    })) }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Impossible d’enregistrer la commande');
  return json;
}
