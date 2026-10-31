import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;
  const { data } = await supabaseAdmin
    .from('wishlist_items')
    .select('*, products(*)')
    .eq('user_id', user.id);
  return NextResponse.json(data || []);
}
