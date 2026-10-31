import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { data: existing } = await supabaseAdmin
    .from('wishlist_items')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('product_id', params.productId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', params.productId);
    return NextResponse.json({ wishlisted: false });
  } else {
    await supabaseAdmin.from('wishlist_items').insert({ user_id: user.id, product_id: params.productId });
    return NextResponse.json({ wishlisted: true });
  }
}
