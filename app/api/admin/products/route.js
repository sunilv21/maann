import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetchAllRows';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { data, error } = await fetchAllRows(
    supabaseAdmin.from('products').select('*, product_variants(*)').order('id')
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { name, category, price, salePrice, sale_price, description, material, svgKey, stock, variants } = await req.json();
  const regularPrice = Number(price);
  const rawSalePrice = salePrice ?? sale_price;
  const discountedPrice = rawSalePrice === '' || rawSalePrice == null ? null : Number(rawSalePrice);
  if (!name || !category || !Number.isInteger(regularPrice) || regularPrice <= 0) {
    return NextResponse.json({ error: 'Name, category and a valid regular price are required' }, { status: 400 });
  }
  if (discountedPrice !== null && (!Number.isInteger(discountedPrice) || discountedPrice <= 0 || discountedPrice >= regularPrice)) {
    return NextResponse.json({ error: 'Sale price must be a positive whole number lower than the regular price' }, { status: 400 });
  }

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({ name, category, price: regularPrice, sale_price: discountedPrice, description, material, svg_key: svgKey || category[0] + '1', stock: parseInt(stock) || 50 })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (variants?.length) {
    await supabaseAdmin.from('product_variants').insert(variants.map(v => ({ product_id: product.id, label: v.label, value: v.value })));
  }

  return NextResponse.json(product, { status: 201 });
}
