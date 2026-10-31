import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { data } = await supabaseAdmin.from('products').select('*, product_variants(*)').eq('id', params.id).single();
  return NextResponse.json(data);
}

export async function PATCH(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { variants, salePrice, ...fields } = await req.json();
  if (salePrice !== undefined && fields.sale_price === undefined) fields.sale_price = salePrice;
  if (Object.hasOwn(fields, 'price') || Object.hasOwn(fields, 'sale_price')) {
    const regularPrice = Number(fields.price);
    const discountedPrice = fields.sale_price === '' || fields.sale_price == null ? null : Number(fields.sale_price);
    if (!Number.isInteger(regularPrice) || regularPrice <= 0) {
      return NextResponse.json({ error: 'A valid regular price is required' }, { status: 400 });
    }
    if (discountedPrice !== null && (!Number.isInteger(discountedPrice) || discountedPrice <= 0 || discountedPrice >= regularPrice)) {
      return NextResponse.json({ error: 'Sale price must be a positive whole number lower than the regular price' }, { status: 400 });
    }
    fields.price = regularPrice;
    fields.sale_price = discountedPrice;
  }

  const { data, error } = await supabaseAdmin.from('products').update(fields).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (variants) {
    await supabaseAdmin.from('product_variants').delete().eq('product_id', params.id);
    if (variants.length) {
      await supabaseAdmin.from('product_variants').insert(variants.map(v => ({ product_id: parseInt(params.id), label: v.label, value: v.value })));
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(req, { params }) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  await supabaseAdmin.from('products').delete().eq('id', params.id);
  return NextResponse.json({ ok: true });
}
