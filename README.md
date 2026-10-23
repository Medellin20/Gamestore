# GameStore — e-commerce iPhone / PS5 / gaming

Next.js 14 (App Router) · React · Tailwind CSS · JavaScript · Supabase (DB, Auth, Storage)

## 1. Installation
```bash
npm install
cp .env.example .env.local     # puis renseigner les 3 clés Supabase
```

## 2. Supabase
1. Créer un projet sur supabase.com.
2. **SQL Editor** → coller et exécuter `supabase/schema.sql` (tables, RLS, bucket `product-images`, fonction `create_order`, catégories de départ).
3. **Authentication > Users > Add user** : créer l'administrateur (email + mot de passe, « Auto confirm user »).
4. Le déclarer admin dans le SQL Editor :
   ```sql
   insert into public.admin_users (user_id) select id from auth.users where email = 'admin@exemple.com';
   ```
5. **Project Settings > API** : copier `URL`, `anon key` et `service_role key` dans `.env.local`.

## 3. Lancer
```bash
npm run dev      # http://localhost:3000
npm run build && npm start
```
Admin : http://localhost:3000/admin/login

## 4. Variables d'environnement
| Variable | Rôle | Exposée au navigateur |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | URL du projet | oui |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | clé publique (limitée par les RLS) | oui |
| SUPABASE_SERVICE_ROLE_KEY | création des commandes (API serveur) | **non, jamais** |
| NEXT_PUBLIC_SITE_URL | URL publique (sitemap, SEO) | oui |
| NEXT_PUBLIC_CURRENCY | EUR, XOF, USD… | oui |
| PAYMENT_PROVIDER | cash_on_delivery (défaut) / stripe / paypal / sumup | non |

## 5. Déploiement Vercel
1. Pousser le projet sur GitHub.
2. vercel.com > New Project > importer le dépôt (Next.js détecté automatiquement).
3. Ajouter les variables ci-dessus (Settings > Environment Variables), avec `NEXT_PUBLIC_SITE_URL` = domaine final.
4. Deploy. Puis dans Supabase > Authentication > URL Configuration, ajouter l'URL du site.

Netlify : même principe (plugin Next.js officiel détecté automatiquement), mêmes variables.

## 6. Architecture
- `app/(shop)` boutique publique · `app/admin` espace admin · `app/api/orders` création de commande (service role)
- `middleware.js` + `app/admin/layout.js` : double protection de l'admin (session + table `admin_users`)
- `lib/supabase/*` clients navigateur / serveur / service role (`server-only`)
- `services/` accès données · `services/payments.js` abstraction paiement (Stripe/PayPal/SumUp à brancher ici)
- `components/` · `utils/`

## 7. Sécurité
- RLS activées sur toutes les tables : le public ne peut lire que les produits actifs, catégories, images, variantes.
- `customers`, `orders`, `order_items` : aucun accès anonyme. Les commandes passent par `create_order()` (exécutable uniquement par `service_role`) qui recalcule les prix et décrémente le stock de façon atomique.
- Écritures admin et Storage : uniquement si `is_admin()`.

## 8. Brancher un paiement plus tard
Implémenter `createCheckout` / `handleWebhook` du prestataire dans `services/payments.js`, mettre `PAYMENT_PROVIDER`, et faire pointer le webhook du prestataire vers `/api/webhooks/<provider>`. Les colonnes `orders.payment_status` et `payment_ref` sont déjà prévues.
