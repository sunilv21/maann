import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;
  const { qty, variant } = await req.json();
  const query = supabaseAdmin.from('cart_items').update({ qty }).eq('user_id', user.id).eq('product_id', params.productId);
  if (variant) {
    query.eq('variant', variant);
  } else {
    query.is('variant', null);
  }
  await query;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;
  const { variant } = await req.json();
  const query = supabaseAdmin.from('cart_items').delete().eq('user_id', user.id).eq('product_id', params.productId);
  if (variant) {
    query.eq('variant', variant);
  } else {
    query.is('variant', null);
  }
  await query;
  return NextResponse.json({ ok: true });
}
