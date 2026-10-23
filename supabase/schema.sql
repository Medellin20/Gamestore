-- =====================================================================
--  GameStore — schéma Supabase complet (tables, RLS, storage, fonctions)
--  À exécuter dans Supabase > SQL Editor. Script ré-exécutable.
-- =====================================================================
create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- ---------- TABLES ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  specs jsonb not null default '{}'::jsonb,
  brand text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(10,2) not null check (price >= 0),
  old_price numeric(10,2) check (old_price is null or old_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  condition text not null default 'neuf' check (condition in ('neuf','reconditionne','occasion')),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  path text,                                   -- chemin dans le bucket product-images
  is_primary boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  color text,
  capacity text,
  model text,
  condition text check (condition in ('neuf','reconditionne','occasion')),
  price numeric(10,2) check (price is null or price >= 0),   -- null = prix du produit
  stock integer not null default 0 check (stock >= 0),
  sku text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  address text,
  city text,
  postal_code text,
  country text default 'Bénin',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'Nouvelle'
    check (status in ('Nouvelle','Confirmée','En préparation','Expédiée','Livrée','Annulée')),
  total numeric(12,2) not null default 0,
  notes text,
  payment_method text not null default 'cash_on_delivery',   -- stripe | paypal | sumup plus tard
  payment_status text not null default 'pending',            -- pending | paid | failed | refunded
  payment_ref text,                                          -- id de transaction du prestataire
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_label text,
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(active, featured);
create index if not exists idx_images_product on public.product_images(product_id);
create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_orders_status on public.orders(status, created_at desc);
create index if not exists idx_items_order on public.order_items(order_id);

-- ---------- ADMIN CHECK ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------- RLS ----------
do $$
declare t text;
begin
  foreach t in array array['categories','products','product_images','product_variants',
                           'customers','orders','order_items','store_settings','admin_users'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
  foreach t in array array['categories','products','product_images','product_variants',
                           'customers','orders','order_items','store_settings'] loop
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated
                    using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Lecture publique (catalogue)
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (active);
drop policy if exists "public read images" on public.product_images;
create policy "public read images" on public.product_images for select using (true);
drop policy if exists "public read variants" on public.product_variants;
create policy "public read variants" on public.product_variants for select using (active);
drop policy if exists "public read settings" on public.store_settings;
create policy "public read settings" on public.store_settings for select using (true);

-- Un utilisateur ne peut lire que sa propre ligne admin (utilisé par le middleware)
drop policy if exists "read own admin row" on public.admin_users;
create policy "read own admin row" on public.admin_users for select to authenticated using (user_id = auth.uid());

-- customers / orders / order_items : AUCUN accès anonyme.
-- Les commandes sont créées uniquement via la fonction create_order() (service_role, côté serveur).

-- ---------- STORAGE ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760,
        array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------- CRÉATION DE COMMANDE (atomique, prix et stock vérifiés en base) ----------
create or replace function public.create_order(p_customer jsonb, p_items jsonb, p_notes text default null,
                                               p_payment_method text default 'cash_on_delivery')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_customer uuid; v_order uuid; v_num bigint; v_total numeric := 0;
  it jsonb; p public.products%rowtype; v public.product_variants%rowtype;
  v_qty int; v_price numeric; v_label text;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Panier vide'; end if;

  insert into customers (full_name, email, phone, address, city, postal_code, country)
  values (p_customer->>'full_name', lower(p_customer->>'email'), p_customer->>'phone', p_customer->>'address',
          p_customer->>'city', p_customer->>'postal_code', coalesce(p_customer->>'country', 'Bénin'))
  on conflict (email) do update set full_name = excluded.full_name, phone = excluded.phone,
    address = excluded.address, city = excluded.city, postal_code = excluded.postal_code, country = excluded.country
  returning id into v_customer;

  insert into orders (customer_id, notes, payment_method) values (v_customer, p_notes, p_payment_method)
  returning id, order_number into v_order, v_num;

  for it in select * from jsonb_array_elements(p_items) loop
    v_qty := (it->>'quantity')::int;
    if v_qty is null or v_qty < 1 or v_qty > 20 then raise exception 'Quantité invalide'; end if;

    select * into p from products where id = (it->>'product_id')::uuid and active for update;
    if not found then raise exception 'Un produit du panier n''est plus disponible'; end if;
    v_price := p.price; v_label := null;

    if nullif(it->>'variant_id', '') is not null then
      select * into v from product_variants
        where id = (it->>'variant_id')::uuid and product_id = p.id and active for update;
      if not found then raise exception 'Une variante du panier n''est plus disponible'; end if;
      if v.stock < v_qty then raise exception 'Stock insuffisant pour % (%)', p.name, v.name; end if;
      update product_variants set stock = stock - v_qty where id = v.id;
      v_price := coalesce(v.price, p.price); v_label := v.name;
    else
      if exists (select 1 from product_variants where product_id = p.id and active) then
        raise exception 'Choisissez une variante pour %', p.name;
      end if;
      if p.stock < v_qty then raise exception 'Stock insuffisant pour %', p.name; end if;
      update products set stock = stock - v_qty where id = p.id;
    end if;

    insert into order_items (order_id, product_id, variant_id, product_name, variant_label, unit_price, quantity)
    values (v_order, p.id, case when v_label is null then null else v.id end, p.name, v_label, v_price, v_qty);
    v_total := v_total + v_price * v_qty;
  end loop;

  update orders set total = v_total where id = v_order;
  return jsonb_build_object('id', v_order, 'number', v_num, 'total', v_total);
end $$;

revoke all on function public.create_order(jsonb, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb, text, text) to service_role;

-- ---------- STOCK : annulation / réactivation d'une commande ----------
create or replace function public.sync_stock_on_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'Annulée' and old.status <> 'Annulée' then
    update product_variants v set stock = v.stock + i.quantity
      from order_items i where i.order_id = new.id and i.variant_id = v.id;
    update products p set stock = p.stock + i.quantity
      from order_items i where i.order_id = new.id and i.variant_id is null and i.product_id = p.id;
  elsif old.status = 'Annulée' and new.status <> 'Annulée' then
    update product_variants v set stock = greatest(v.stock - i.quantity, 0)
      from order_items i where i.order_id = new.id and i.variant_id = v.id;
    update products p set stock = greatest(p.stock - i.quantity, 0)
      from order_items i where i.order_id = new.id and i.variant_id is null and i.product_id = p.id;
  end if;
  return new;
end $$;
drop trigger if exists trg_orders_stock on public.orders;
create trigger trg_orders_stock after update of status on public.orders
  for each row when (old.status is distinct from new.status) execute function public.sync_stock_on_status();

-- ---------- DONNÉES INITIALES ----------
insert into public.categories (name, slug, description) values
  ('iPhone', 'iphone', 'Les derniers iPhone, neufs et reconditionnés'),
  ('PlayStation 5', 'ps5', 'Consoles PS5 et jeux'),
  ('Consoles', 'consoles', 'Xbox, Nintendo Switch et autres consoles'),
  ('Manettes', 'manettes', 'Manettes sans fil et pro'),
  ('Accessoires', 'accessoires', 'Casques, chargeurs, coques, câbles')
on conflict (slug) do nothing;

insert into public.store_settings (key, value) values
  ('general', '{"store_name":"GameStore","contact_email":"","contact_phone":"","announcement":"Livraison rapide · Paiement à la livraison"}')
on conflict (key) do nothing;

-- ---------- CRÉER LE PREMIER ADMIN ----------
-- 1) Supabase > Authentication > Users > Add user (email + mot de passe, "Auto confirm")
-- 2) Puis exécuter (en remplaçant l'email) :
--    insert into public.admin_users (user_id) select id from auth.users where email = 'admin@exemple.com';
