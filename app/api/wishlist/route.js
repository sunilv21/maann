import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { data: wishlistItems } = await supabaseAdmin
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', user.id);

  if (!wishlistItems?.length) return NextResponse.json([]);

  const productIds = wishlistItems.map(i => i.product_id);
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .in('id', productIds);

  return NextResponse.json(products || []);
}
