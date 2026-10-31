import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { data } = await supabaseAdmin
    .from('cart_items')
    .select('*, product:products(*)')
    .eq('user_id', user.id);

  return NextResponse.json({ items: data || [] });
}

export async function POST(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { productId, qty = 1, variant } = await req.json();

  const { data: existing } = await supabaseAdmin
    .from('cart_items')
    .select('id, qty')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('variant', variant || '')
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from('cart_items')
      .update({ qty: existing.qty + qty })
      .eq('id', existing.id);
  } else {
    await supabaseAdmin
      .from('cart_items')
      .insert({ user_id: user.id, product_id: productId, qty, variant: variant || null });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id);
  return NextResponse.json({ ok: true });
}
