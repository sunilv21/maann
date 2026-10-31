-- Enable UUID
create extension if not exists "uuid-ossp";

-- Profiles (auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  phone text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Products (public read)
create table if not exists public.products (
  id serial primary key,
  name text not null,
  category text not null check (category in ('necklace','earring','bracelet')),
  price integer not null,
  sale_price integer check (sale_price is null or (sale_price > 0 and sale_price < price)),
  description text,
  material text,
  svg_key text,
  image_url text,
  stock integer default 50,
  created_at timestamptz default now()
);
alter table public.products enable row level security;
create policy "Anyone can read products" on public.products for select using (true);

-- Product variants
create table if not exists public.product_variants (
  id serial primary key,
  product_id integer references public.products(id) on delete cascade,
  label text not null,
  value text not null
);
alter table public.product_variants enable row level security;
create policy "Anyone can read variants" on public.product_variants for select using (true);

-- Addresses
create table if not exists public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pin text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);
alter table public.addresses enable row level security;
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- Cart
create table if not exists public.cart_items (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id integer references public.products(id),
  qty integer default 1 check (qty > 0),
  variant text
);
create unique index if not exists cart_items_unique_idx
  on public.cart_items (user_id, product_id, coalesce(variant, ''));
alter table public.cart_items enable row level security;
create policy "Users manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- Wishlist
create table if not exists public.wishlist_items (
  user_id uuid references auth.users(id) on delete cascade,
  product_id integer references public.products(id),
  primary key(user_id, product_id)
);
alter table public.wishlist_items enable row level security;
create policy "Users manage own wishlist" on public.wishlist_items for all using (auth.uid() = user_id);

-- Orders
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  address_snapshot jsonb not null,
  payment_method text not null,
  payment_id text,
  razorpay_order_id text,
  status text default 'confirmed',
  total integer not null,
  shipping integer default 0,
  created_at timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users insert own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Users update own orders" on public.orders for update using (auth.uid() = user_id);

-- Order items
create table if not exists public.order_items (
  id serial primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id integer,
  product_name text not null,
  price integer not null,
  qty integer not null,
  variant text
);
alter table public.order_items enable row level security;
create policy "Users view own order items" on public.order_items for select
  using (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));
create policy "Users insert own order items" on public.order_items for insert
  with check (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));

-- Return requests
create table if not exists public.return_requests (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) unique,
  user_id uuid references auth.users(id),
  type text not null,
  reason text not null,
  items jsonb not null,
  bank_name text,
  account_number text,
  ifsc text,
  status text default 'requested',
  created_at timestamptz default now()
);
alter table public.return_requests enable row level security;
create policy "Users manage own returns" on public.return_requests for all using (auth.uid() = user_id);

-- Reviews
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id integer references public.products(id),
  user_id uuid references auth.users(id),
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  verified boolean default false,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.reviews enable row level security;
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Users manage own reviews" on public.reviews for all using (auth.uid() = user_id);

-- Admin support
alter table public.profiles add column if not exists is_admin boolean default false;

create policy "Admins can read all profiles" on public.profiles
  for select using (
    auth.uid() = id or
    exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin = true)
  );

-- To make a user admin, run in SQL Editor:
-- update public.profiles set is_admin = true where id = '<user-uuid>';
-- Or by email:
-- update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'your@email.com');
