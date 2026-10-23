'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'gamestore-cart-v1';
const Ctx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
    setReady(true);
    const sync = (e) => { if (e.key === KEY) { try { setItems(JSON.parse(e.newValue || '[]')); } catch {} } };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  const value = useMemo(() => ({
    items, ready,
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) => s + i.quantity * i.price, 0),
    add: (item, qty = 1) => setItems((list) => {
      const i = list.findIndex((x) => x.key === item.key);
      if (i >= 0) {
        const c = [...list];
        c[i] = { ...c[i], ...item, quantity: Math.min(c[i].quantity + qty, item.max) };
        return c;
      }
      return [...list, { ...item, quantity: Math.min(qty, item.max) }];
    }),
    setQty: (key, q) => setItems((l) => l.map((x) => (x.key === key ? { ...x, quantity: Math.max(1, Math.min(q, x.max)) } : x))),
    remove: (key) => setItems((l) => l.filter((x) => x.key !== key)),
    clear: () => setItems([]),
  }), [items, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);
