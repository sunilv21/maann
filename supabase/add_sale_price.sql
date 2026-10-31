alter table public.products
  add column if not exists sale_price integer;

alter table public.products
  drop constraint if exists products_sale_price_check;

alter table public.products
  add constraint products_sale_price_check
  check (sale_price is null or (sale_price > 0 and sale_price < price));

notify pgrst, 'reload schema';
