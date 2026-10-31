import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { data } = await supabaseAdmin
    .from('return_requests')
    .select('*, orders(id, total, created_at, order_items(*))')
    .order('created_at', { ascending: false });
  return NextResponse.json(data || []);
}
